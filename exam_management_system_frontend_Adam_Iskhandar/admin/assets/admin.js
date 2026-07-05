const state = { token: '', user: {}, cache: {}, editing: {} };
const API = 'http://localhost/exam_management_system/query/';
const page = document.body.dataset.page || 'dashboard';

function getSession() {
	try { return JSON.parse(localStorage.getItem('examApiSession') || '{}'); }
	catch { return {}; }
}
function norm(r) {
	const v = String(r || '').toLowerCase().trim().replace(/[\s_-]+/g, '');
	return ({ administrator:'admin', administrators:'admin', admins:'admin',
		lecturers:'lecturer', teacher:'lecturer', teachers:'lecturer',
		instructor:'lecturer', instructors:'lecturer', students:'student' }[v] || v);
}
function userId() {
	return state.user.id || state.user.user_id || state.user.User_ID || state.user.uid;
}
function escapeHtml(v) {
	return String(v ?? '').replace(/[&<>"']/g, m =>
		({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' })[m]);
}
function pick(o, keys) {
	for (const k of keys) if (o && o[k] !== undefined && o[k] !== null) return o[k];
	return '';
}
function rows(p) {
	if (Array.isArray(p)) return p;
	if (Array.isArray(p?.data)) return p.data;
	if (p && typeof p === 'object' && Object.keys(p).length) return [p];
	return [];
}
function showAlert(msg, type = 'success') {
	const el = document.getElementById('alert');
	if (!el) return;
	el.textContent = msg;
	el.className = `alert show ${type}`;
	setTimeout(() => (el.className = 'alert'), 3500);
}
function guard() {
	const s = getSession();
	if (!s.token) { location.href = '../public/index.php'; return false; }
	state.token = s.token;
	state.user = s.user || {};
	if (norm(state.user.role) !== 'admin') { location.href = '../public/index.php'; return false; }
	const chip = document.getElementById('userChip');
	if (chip) chip.textContent = (state.user.name || 'Admin') + ' · Admin';
	const active = document.querySelector(`.nav a[data-nav="${page}"]`);
	if (active) active.classList.add('active');
	// hamburger toggle
	const ham = document.getElementById('hamburger');
	const navbar = document.querySelector('.navbar');
	if (ham && navbar) ham.addEventListener('click', () => navbar.classList.toggle('nav-mobile-open'));
	return true;
}
function logout() {
	localStorage.removeItem('examApiSession');
	location.href = '../public/index.php';
}
async function request(endpoint, options = {}) {
	const res = await fetch(API + endpoint, {
		...options,
		headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + state.token, ...(options.headers || {}) },
	});
	const text = await res.text();
	let data = {};
	try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
	if (!res.ok) throw new Error(data.message || 'Request failed');
	return data;
}
function renderTable(id, data, cols, actions) {
	const el = document.getElementById(id);
	if (!el) return;
	if (!data.length) { el.innerHTML = '<div class="empty">No records found.</div>'; return; }
	el.innerHTML = `<div class="table-wrap"><table><thead><tr>${cols.map(c => `<th>${escapeHtml(c.label)}</th>`).join('')}${actions ? '<th>Action</th>' : ''}</tr></thead><tbody>${data.map(row => `<tr>${cols.map(c => `<td>${escapeHtml(pick(row, c.keys))}</td>`).join('')}${actions ? `<td>${actions(row)}</td>` : ''}</tr>`).join('')}</tbody></table></div>`;
}
function makeDeleteButton(endpoint, key, id, msg) {
	if (!id) return '';
	return `<button type="button" class="btn danger small" onclick="deleteRecord('${endpoint}','${key}','${escapeHtml(id)}','${msg}')">Delete</button>`;
}
async function deleteRecord(endpoint, key, id, msg) {
	if (!confirm('Delete this record?')) return;
	try {
		await request(endpoint, { method: 'DELETE', body: JSON.stringify({ [key]: id }) });
		showAlert(msg);
		refreshPage();
	} catch (error) { showAlert(error.message, 'error'); }
}

// ===== EDIT (UPDATE) SUPPORT =====
function makeEditButton(entityKey, row) {
	const cfg = FORMS[entityKey];
	if (!cfg) return '';
	const id = pick(row, cfg.idKeys);
	if (!id) return '';
	return `<button type="button" class="btn secondary small" onclick="startEdit('${entityKey}','${escapeHtml(String(id))}')">Edit</button>`;
}
function actionButtons(entityKey, row, deleteEndpoint, deleteKey, deleteMsg) {
	const id = pick(row, FORMS[entityKey].idKeys);
	return `${makeEditButton(entityKey, row)} ${makeDeleteButton(deleteEndpoint, deleteKey, id, deleteMsg)}`;
}
function setFieldValue(el, value) {
	if (value === undefined || value === null) value = '';
	if (el.type === 'date') value = String(value).slice(0, 10);
	else if (el.type === 'time') value = String(value).slice(0, 5);
	el.value = value;
}
function formChrome(cfg) {
	const form = document.getElementById(cfg.formId);
	if (!form) return null;
	let badge = form.querySelector('.edit-badge');
	if (!badge) {
		badge = document.createElement('div');
		badge.className = 'edit-badge full';
		badge.style.cssText = 'display:none;font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:.05em;';
		form.insertBefore(badge, form.firstChild);
	}
	let cancelBtn = form.querySelector('.cancel-edit-btn');
	if (!cancelBtn) {
		cancelBtn = document.createElement('button');
		cancelBtn.type = 'button';
		cancelBtn.className = 'btn secondary full cancel-edit-btn';
		cancelBtn.style.display = 'none';
		cancelBtn.textContent = 'Cancel edit';
		cancelBtn.addEventListener('click', () => cancelEdit(cfg));
		form.appendChild(cancelBtn);
	}
	const submitBtn = form.querySelector('button[type="submit"]');
	if (submitBtn && !cfg.createLabel) cfg.createLabel = submitBtn.textContent;
	return { form, badge, cancelBtn, submitBtn };
}
function startEdit(entityKey, id) {
	const cfg = FORMS[entityKey];
	if (!cfg) return;
	const row = (state.cache[entityKey] || []).find(r => String(pick(r, cfg.idKeys)) === String(id));
	if (!row) { showAlert('Could not find that record. Reload and try again.', 'error'); return; }
	const chrome = formChrome(cfg);
	if (!chrome) return;
	const { form, badge, cancelBtn, submitBtn } = chrome;
	cfg.fields.forEach(([name, keys]) => {
		const el = form.elements[name];
		if (el) setFieldValue(el, pick(row, keys));
	});
	if (cfg.onEnterEdit) cfg.onEnterEdit(form);
	form.dataset.editId = id;
	state.editing[cfg.formId] = row;
	if (badge) { badge.style.display = 'block'; badge.textContent = `Editing record #${id}`; }
	if (cancelBtn) cancelBtn.style.display = 'inline-flex';
	if (submitBtn) submitBtn.textContent = 'Save changes';
	form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function cancelEdit(cfg) {
	const form = document.getElementById(cfg.formId);
	if (!form) return;
	delete form.dataset.editId;
	delete state.editing[cfg.formId];
	form.reset();
	setDefaultDates();
	if (cfg.onExitEdit) cfg.onExitEdit(form);
	const badge = form.querySelector('.edit-badge');
	if (badge) badge.style.display = 'none';
	const cancelBtn = form.querySelector('.cancel-edit-btn');
	if (cancelBtn) cancelBtn.style.display = 'none';
	const submitBtn = form.querySelector('button[type="submit"]');
	if (submitBtn) submitBtn.textContent = cfg.createLabel || submitBtn.textContent;
}
function bindForm(entityKey, cfg, makeBody) {
	const form = document.getElementById(cfg.formId);
	if (!form) return;
	formChrome(cfg);
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const f = Object.fromEntries(new FormData(e.target));
		const editId = form.dataset.editId;
		const editingRow = state.editing[cfg.formId] || null;
		const body = makeBody(f, editId, editingRow);
		if (editId) body[cfg.idField] = editId;
		try {
			await request(cfg.endpoint, { method: editId ? 'PUT' : 'POST', body: JSON.stringify(body) });
			showAlert(editId ? cfg.updateMsg : cfg.createMsg);
			cancelEdit(cfg);
			refreshPage();
		} catch (error) { showAlert(error.message, 'error'); }
	});
}
function setDefaultDates() {
	const today = new Date().toISOString().slice(0, 10);
	document.querySelectorAll('input[type="date"]').forEach(i => { if (!i.value) i.value = today; });
}

// ===== FILTER HELPERS =====
function getFilterValues(containerId) {
	const c = document.getElementById(containerId);
	if (!c) return {};
	const out = {};
	c.querySelectorAll('[data-filter]').forEach(el => { if (el.value) out[el.dataset.filter] = el.value; });
	return out;
}
function bindFilter(containerId, loadFn) {
	const c = document.getElementById(containerId);
	if (!c) return;
	c.querySelectorAll('[data-filter]').forEach(el => {
		el.addEventListener('input', () => loadFn());
		el.addEventListener('change', () => loadFn());
	});
	const clearBtn = c.querySelector('[data-clear-filter]');
	if (clearBtn) clearBtn.addEventListener('click', () => {
		c.querySelectorAll('[data-filter]').forEach(el => el.value = '');
		loadFn();
	});
}

// ===== COLUMN DEFINITIONS =====
function userCols() {
	return [
		{ label: 'User ID', keys: ['user_id','User_ID'] },
		{ label: 'Name', keys: ['name','Name'] },
		{ label: 'Email', keys: ['email','Email'] },
		{ label: 'Role', keys: ['role','Role'] },
		{ label: 'Faculty ID', keys: ['faculty_id','Faculty_ID'] },
	];
}
function courseCols() {
	return [
		{ label: 'Course ID', keys: ['course_id','Course_ID'] },
		{ label: 'Code', keys: ['course_code','Course_Code'] },
		{ label: 'Name', keys: ['course_name','Course_Name'] },
		{ label: 'Credit', keys: ['credit_hours','Credit_Hours'] },
		{ label: 'Faculty ID', keys: ['faculty_id','Faculty_ID'] },
		{ label: 'Lecturer ID', keys: ['user_id','User_ID'] },
	];
}
function venueCols() {
	return [
		{ label: 'Venue ID', keys: ['Venue_ID','venue_id'] },
		{ label: 'Name', keys: ['Venue_Name','venue_name'] },
		{ label: 'Capacity', keys: ['Capacity','capacity'] },
		{ label: 'Location', keys: ['Location','location'] },
	];
}
function examCols() {
	return [
		{ label: 'Exam ID', keys: ['Exam_ID','exam_id'] },
		{ label: 'Course', keys: ['Course_Code','Course_ID'] },
		{ label: 'Venue', keys: ['Venue_Name','Venue_ID'] },
		{ label: 'Date', keys: ['Exam_Date'] },
		{ label: 'Start', keys: ['Start_Time'] },
		{ label: 'End', keys: ['End_Time'] },
	];
}
function registrationCols() {
	return [
		{ label: 'Registration ID', keys: ['registration_id','Registration_ID'] },
		{ label: 'Student User ID', keys: ['user_id','User_ID'] },
		{ label: 'Course ID', keys: ['course_id','Course_ID'] },
		{ label: 'Date', keys: ['registration_date','Registration_Date'] },
	];
}
function resultCols() {
	return [
		{ label: 'Result ID', keys: ['result_id','Result_ID'] },
		{ label: 'Student User ID', keys: ['user_id','User_ID'] },
		{ label: 'Exam ID', keys: ['exam_id','Exam_ID'] },
		{ label: 'Marks', keys: ['marks_obtained','Marks_Obtained'] },
		{ label: 'Grade', keys: ['grade','Grade'] },
		{ label: 'Published', keys: ['published_at','Published_At'] },
	];
}
function notificationCols() {
	return [
		{ label: 'Notif ID', keys: ['notification_id','Notification_ID'] },
		{ label: 'User ID', keys: ['user_id','User_ID'] },
		{ label: 'Title', keys: ['title','Title'] },
		{ label: 'Message', keys: ['message','Message'] },
		{ label: 'Read', keys: ['is_read','Is_Read'] },
	];
}

// ===== EDIT FORM CONFIG (per entity: form id, endpoint, id field, editable fields) =====
const FORMS = {
	user: {
		formId: 'userForm', endpoint: 'users.php', idField: 'user_id', idKeys: ['user_id','User_ID'],
		fields: [['name',['name','Name']], ['email',['email','Email']], ['role',['role','Role']], ['faculty_id',['faculty_id','Faculty_ID']]],
		createMsg: 'User created.', updateMsg: 'User updated.',
		onEnterEdit(form) { const p = form.elements['password']; if (p) { p.required = false; p.placeholder = 'Leave blank — not changed here'; p.value = ''; } },
		onExitEdit(form) { const p = form.elements['password']; if (p) { p.required = true; p.placeholder = ''; } },
	},
	course: {
		formId: 'courseForm', endpoint: 'courses.php', idField: 'course_id', idKeys: ['course_id','Course_ID'],
		fields: [['course_code',['course_code','Course_Code']], ['credit_hours',['credit_hours','Credit_Hours']], ['course_name',['course_name','Course_Name']], ['faculty_id',['faculty_id','Faculty_ID']], ['user_id',['user_id','User_ID']]],
		createMsg: 'Course created.', updateMsg: 'Course updated.',
	},
	venue: {
		formId: 'venueForm', endpoint: 'venues.php', idField: 'Venue_ID', idKeys: ['Venue_ID','venue_id'],
		fields: [['Venue_Name',['Venue_Name','venue_name']], ['Capacity',['Capacity','capacity']], ['Location',['Location','location']]],
		createMsg: 'Venue created.', updateMsg: 'Venue updated.',
	},
	exam: {
		formId: 'examForm', endpoint: 'examinations.php', idField: 'Exam_ID', idKeys: ['Exam_ID','exam_id'],
		fields: [['Course_ID',['Course_ID','course_id']], ['Venue_ID',['Venue_ID','venue_id']], ['Exam_Date',['Exam_Date','exam_date']], ['Start_Time',['Start_Time','start_time']], ['End_Time',['End_Time','end_time']]],
		createMsg: 'Exam schedule created.', updateMsg: 'Exam schedule updated.',
	},
	registration: {
		formId: 'registrationForm', endpoint: 'registration.php', idField: 'registration_id', idKeys: ['registration_id','Registration_ID'],
		fields: [['user_id',['user_id','User_ID']], ['course_id',['course_id','Course_ID']], ['registration_date',['registration_date','Registration_Date']]],
		createMsg: 'Registration created.', updateMsg: 'Registration updated.',
	},
	result: {
		formId: 'resultForm', endpoint: 'results.php', idField: 'result_id', idKeys: ['result_id','Result_ID'],
		fields: [['user_id',['user_id','User_ID']], ['exam_id',['exam_id','Exam_ID']], ['marks_obtained',['marks_obtained','Marks_Obtained']], ['grade',['grade','Grade']], ['published_at',['published_at','Published_At']]],
		createMsg: 'Result created.', updateMsg: 'Result updated.',
	},
	notification: {
		formId: 'notificationForm', endpoint: 'notifications.php', idField: 'notification_id', idKeys: ['notification_id','Notification_ID'],
		fields: [['user_id',['user_id','User_ID']], ['title',['title','Title']], ['message',['message','Message']], ['is_read',['is_read','Is_Read']]],
		createMsg: 'Notification created.', updateMsg: 'Notification updated.',
	},
};

// ===== PAGE LOADERS =====
async function loadDashboard() {
	try {
		const [users,courses,venues,exams,registrations,results,notifications] = await Promise.all([
			request('users.php'), request('courses.php'), request('venues.php'),
			request('examinations.php'), request('registration.php'),
			request('results.php'), request('notifications.php'),
		]);
		const data = { users:rows(users), courses:rows(courses), venues:rows(venues),
			exams:rows(exams), registrations:rows(registrations), results:rows(results), notifications:rows(notifications) };
		for (const k of Object.keys(data)) {
			const el = document.getElementById('count' + k[0].toUpperCase() + k.slice(1));
			if (el) el.textContent = data[k].length;
		}
		renderTable('examTable', data.exams.slice(0,6), examCols());
		renderTable('notificationTable', data.notifications.slice(0,6), notificationCols());
	} catch (error) { showAlert(error.message, 'error'); }
}

async function loadUsers() {
	const f = getFilterValues('userFilter');
	// Pick the first active filter for the API (priority order)
	let url = 'users.php';
	if (f.user_id) url = `users.php?user_id=${encodeURIComponent(f.user_id)}`;
	else if (f.role) url = `users.php?role=${encodeURIComponent(f.role)}`;
	else if (f.faculty_id) url = `users.php?faculty_id=${encodeURIComponent(f.faculty_id)}`;
	else if (f.name) url = `users.php?name=${encodeURIComponent(f.name)}`;
	try {
		const data = rows(await request(url));
		state.cache.user = data;
		renderTable('userTable', data, userCols(), r =>
			actionButtons('user', r, 'users.php', 'user_id', 'User deleted.'));
	} catch (error) { showAlert(error.message, 'error'); }
}

async function loadCourses() {
	const f = getFilterValues('courseFilter');
	let url = 'courses.php';
	if (f.course_code) url = `courses.php?course_code=${encodeURIComponent(f.course_code)}`;
	else if (f.course_name) url = `courses.php?course_name=${encodeURIComponent(f.course_name)}`;
	else if (f.faculty_id) url = `courses.php?faculty_id=${encodeURIComponent(f.faculty_id)}`;
	else if (f.user_id) url = `courses.php?user_id=${encodeURIComponent(f.user_id)}`;
	try {
		const data = rows(await request(url));
		state.cache.course = data;
		renderTable('courseTable', data, courseCols(), r =>
			actionButtons('course', r, 'courses.php', 'course_id', 'Course deleted.'));
	} catch (error) { showAlert(error.message, 'error'); }
}

async function loadVenues() {
	const f = getFilterValues('venueFilter');
	let url = 'venues.php';
	if (f.Venue_Name) url = `venues.php?Venue_Name=${encodeURIComponent(f.Venue_Name)}`;
	else if (f.Capacity) url = `venues.php?Capacity=${encodeURIComponent(f.Capacity)}`;
	else if (f.Location) url = `venues.php?Location=${encodeURIComponent(f.Location)}`;
	try {
		const data = rows(await request(url));
		state.cache.venue = data;
		renderTable('venueTable', data, venueCols(), r =>
			actionButtons('venue', r, 'venues.php', 'Venue_ID', 'Venue deleted.'));
	} catch (error) { showAlert(error.message, 'error'); }
}

async function loadExams() {
	const f = getFilterValues('examFilter');
	let url = 'examinations.php';
	if (f.Course_ID) url = `examinations.php?Course_ID=${encodeURIComponent(f.Course_ID)}`;
	else if (f.Venue_ID) url = `examinations.php?Venue_ID=${encodeURIComponent(f.Venue_ID)}`;
	else if (f.Exam_Date) url = `examinations.php?Exam_Date=${encodeURIComponent(f.Exam_Date)}`;
	try {
		const data = rows(await request(url));
		state.cache.exam = data;
		renderTable('examTable', data, examCols(), r =>
			actionButtons('exam', r, 'examinations.php', 'Exam_ID', 'Exam schedule deleted.'));
	} catch (error) { showAlert(error.message, 'error'); }
}

async function loadRegistrations() {
	const f = getFilterValues('registrationFilter');
	let url = 'registration.php';
	if (f.user_id) url = `registration.php?user_id=${encodeURIComponent(f.user_id)}`;
	else if (f.course_id) url = `registration.php?course_id=${encodeURIComponent(f.course_id)}`;
	else if (f.registration_date) url = `registration.php?registration_date=${encodeURIComponent(f.registration_date)}`;
	try {
		const data = rows(await request(url));
		state.cache.registration = data;
		renderTable('registrationTable', data, registrationCols(), r =>
			actionButtons('registration', r, 'registration.php', 'registration_id', 'Registration deleted.'));
	} catch (error) { showAlert(error.message, 'error'); }
}

async function loadResults() {
	const f = getFilterValues('resultFilter');
	let url = 'results.php';
	if (f.user_id) url = `results.php?user_id=${encodeURIComponent(f.user_id)}`;
	else if (f.exam_id) url = `results.php?exam_id=${encodeURIComponent(f.exam_id)}`;
	else if (f.grade) url = `results.php?grade=${encodeURIComponent(f.grade)}`;
	else if (f.published_at) url = `results.php?published_at=${encodeURIComponent(f.published_at)}`;
	try {
		const data = rows(await request(url));
		state.cache.result = data;
		renderTable('resultTable', data, resultCols(), r =>
			actionButtons('result', r, 'results.php', 'result_id', 'Result deleted.'));
	} catch (error) { showAlert(error.message, 'error'); }
}

async function loadNotifications() {
	const f = getFilterValues('notificationFilter');
	let url = 'notifications.php';
	if (f.user_id) url = `notifications.php?user_id=${encodeURIComponent(f.user_id)}`;
	else if (f.is_read !== undefined && f.is_read !== '') url = `notifications.php?is_read=${encodeURIComponent(f.is_read)}`;
	else if (f.title) url = `notifications.php?title=${encodeURIComponent(f.title)}`;
	try {
		const data = rows(await request(url));
		state.cache.notification = data;
		renderTable('notificationTable', data, notificationCols(), r =>
			actionButtons('notification', r, 'notifications.php', 'notification_id', 'Notification deleted.'));
	} catch (error) { showAlert(error.message, 'error'); }
}

function refreshPage() {
	({ dashboard:loadDashboard, users:loadUsers, courses:loadCourses, venues:loadVenues,
		exams:loadExams, registrations:loadRegistrations, results:loadResults,
		notifications:loadNotifications }[page] || loadDashboard)();
}

function initForms() {
	bindForm('user', FORMS.user, (f, editId) => editId
		? { name: f.name, email: f.email, role: f.role, faculty_id: f.faculty_id || null }
		: { ...f, faculty_id: f.faculty_id || null });
	bindForm('course', FORMS.course, f => f);
	bindForm('venue', FORMS.venue, f => f);
	bindForm('exam', FORMS.exam, (f, editId) => editId ? f : { ...f, Created_by: userId() });
	bindForm('registration', FORMS.registration, f => f);
	bindForm('result', FORMS.result, f => f);
	bindForm('notification', FORMS.notification, f => f);
}

function initFilters() {
	bindFilter('userFilter', loadUsers);
	bindFilter('courseFilter', loadCourses);
	bindFilter('venueFilter', loadVenues);
	bindFilter('examFilter', loadExams);
	bindFilter('registrationFilter', loadRegistrations);
	bindFilter('resultFilter', loadResults);
	bindFilter('notificationFilter', loadNotifications);
}

if (guard()) {
	setDefaultDates();
	initForms();
	initFilters();
	refreshPage();
}
