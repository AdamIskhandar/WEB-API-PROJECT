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
	if (norm(state.user.role) !== 'lecturer') { location.href = '../public/index.php'; return false; }
	const chip = document.getElementById('userChip');
	if (chip) chip.textContent = (state.user.name || 'Lecturer') + ' · Lecturer';
	const active = document.querySelector(`.nav a[data-nav="${page}"]`);
	if (active) active.classList.add('active');
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
function courseUrl(extra) {
	const id = userId();
	const base = id ? 'courses.php?user_id=' + encodeURIComponent(id) : 'courses.php';
	return extra ? base + '&' + extra : base;
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
function courseCols() {
	return [
		{ label: 'Course ID', keys: ['course_id','Course_ID'] },
		{ label: 'Code', keys: ['course_code','Course_Code'] },
		{ label: 'Course Name', keys: ['course_name','Course_Name'] },
		{ label: 'Credit Hours', keys: ['credit_hours','Credit_Hours'] },
		{ label: 'Faculty ID', keys: ['faculty_id','Faculty_ID'] },
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
function venueCols() {
	return [
		{ label: 'Venue ID', keys: ['Venue_ID','venue_id'] },
		{ label: 'Venue Name', keys: ['Venue_Name','venue_name'] },
		{ label: 'Capacity', keys: ['Capacity','capacity'] },
		{ label: 'Location', keys: ['Location','location'] },
	];
}

// ===== EDIT FORM CONFIG (per entity: form id, endpoint, id field, editable fields) =====
const FORMS = {
	exam: {
		formId: 'examForm', endpoint: 'examinations.php', idField: 'Exam_ID', idKeys: ['Exam_ID','exam_id'],
		fields: [['Course_ID',['Course_ID','course_id']], ['Venue_ID',['Venue_ID','venue_id']], ['Exam_Date',['Exam_Date','exam_date']], ['Start_Time',['Start_Time','start_time']], ['End_Time',['End_Time','end_time']]],
		createMsg: 'Exam schedule created.', updateMsg: 'Exam schedule updated.',
	},
	result: {
		formId: 'resultForm', endpoint: 'results.php', idField: 'result_id', idKeys: ['result_id','Result_ID'],
		fields: [['user_id',['user_id','User_ID']], ['exam_id',['exam_id','Exam_ID']], ['marks_obtained',['marks_obtained','Marks_Obtained']], ['grade',['grade','Grade']], ['published_at',['published_at','Published_At']]],
		createMsg: 'Result published.', updateMsg: 'Result updated.',
	},
	notification: {
		formId: 'notificationForm', endpoint: 'notifications.php', idField: 'notification_id', idKeys: ['notification_id','Notification_ID'],
		fields: [['user_id',['user_id','User_ID']], ['title',['title','Title']], ['message',['message','Message']], ['is_read',['is_read','Is_Read']]],
		createMsg: 'Notification sent.', updateMsg: 'Notification updated.',
	},
};

// ===== PAGE LOADERS =====
async function loadDashboard() {
	try {
		const [courses, exams, results, notifications] = await Promise.all([
			request(courseUrl()),
			request('examinations.php'),
			request('results.php'),
			request('notifications.php'),
		]);
		const data = { courses:rows(courses), exams:rows(exams), results:rows(results), notifications:rows(notifications) };
		document.getElementById('countCourses').textContent = data.courses.length;
		document.getElementById('countExams').textContent = data.exams.length;
		document.getElementById('countResults').textContent = data.results.length;
		document.getElementById('countNotifications').textContent = data.notifications.length;
		renderTable('examTable', data.exams.slice(0,6), examCols());
		renderTable('notificationTable', data.notifications.slice(0,6), notificationCols());
	} catch (error) { showAlert(error.message, 'error'); }
}

async function loadCourses() {
	// lecturer sees only their courses; filter further by name
	const f = getFilterValues('courseFilter');
	let url = courseUrl();
	if (f.course_name) url = courseUrl(`course_name=${encodeURIComponent(f.course_name)}`);
	else if (f.course_code) url = courseUrl(`course_code=${encodeURIComponent(f.course_code)}`);
	try {
		const data = rows(await request(url));
		renderTable('courseTable', data, courseCols());
	} catch (error) { showAlert(error.message, 'error'); }
}

async function loadExams() {
	const f = getFilterValues('examFilter');
	let url = 'examinations.php';
	if (f.Course_ID) url = `examinations.php?Course_ID=${encodeURIComponent(f.Course_ID)}`;
	else if (f.Venue_ID) url = `examinations.php?Venue_ID=${encodeURIComponent(f.Venue_ID)}`;
	else if (f.Exam_Date) url = `examinations.php?Exam_Date=${encodeURIComponent(f.Exam_Date)}`;
	try {
		const [exams, venues] = await Promise.all([request(url), request('venues.php')]);
		state.cache.exam = rows(exams);
		renderTable('examTable', state.cache.exam, examCols(), r =>
			actionButtons('exam', r, 'examinations.php', 'Exam_ID', 'Exam schedule deleted.'));
		renderTable('venueTable', rows(venues), venueCols());
	} catch (error) { showAlert(error.message, 'error'); }
}

async function loadResults() {
	const f = getFilterValues('resultFilter');
	let url = 'results.php';
	if (f.user_id) url = `results.php?user_id=${encodeURIComponent(f.user_id)}`;
	else if (f.exam_id) url = `results.php?exam_id=${encodeURIComponent(f.exam_id)}`;
	else if (f.grade) url = `results.php?grade=${encodeURIComponent(f.grade)}`;
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
	else if (f.title) url = `notifications.php?title=${encodeURIComponent(f.title)}`;
	else if (f.is_read !== undefined && f.is_read !== '') url = `notifications.php?is_read=${encodeURIComponent(f.is_read)}`;
	try {
		const data = rows(await request(url));
		state.cache.notification = data;
		renderTable('notificationTable', data, notificationCols(), r =>
			actionButtons('notification', r, 'notifications.php', 'notification_id', 'Notification deleted.'));
	} catch (error) { showAlert(error.message, 'error'); }
}

function refreshPage() {
	({ dashboard:loadDashboard, courses:loadCourses, exams:loadExams,
		results:loadResults, notifications:loadNotifications }[page] || loadDashboard)();
}

function initForms() {
	bindForm('exam', FORMS.exam, (f, editId) => editId ? f : { ...f, Created_by: userId() });
	bindForm('result', FORMS.result, f => f);
	bindForm('notification', FORMS.notification, f => f);
}

function initFilters() {
	bindFilter('courseFilter', loadCourses);
	bindFilter('examFilter', loadExams);
	bindFilter('resultFilter', loadResults);
	bindFilter('notificationFilter', loadNotifications);
}

if (guard()) {
	setDefaultDates();
	initForms();
	initFilters();
	refreshPage();
}
