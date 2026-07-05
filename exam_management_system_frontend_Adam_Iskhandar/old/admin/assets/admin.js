const state = { token: '', user: {} };
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
	return `<button class="btn danger small" onclick="deleteRecord('${endpoint}','${key}','${escapeHtml(id)}','${msg}')">Delete</button>`;
}
async function deleteRecord(endpoint, key, id, msg) {
	if (!confirm('Delete this record?')) return;
	try {
		await request(endpoint, { method: 'DELETE', body: JSON.stringify({ [key]: id }) });
		showAlert(msg);
		refreshPage();
	} catch (error) { showAlert(error.message, 'error'); }
}
function bind(formId, endpoint, makeBody, success) {
	const form = document.getElementById(formId);
	if (!form) return;
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const f = Object.fromEntries(new FormData(e.target));
		try {
			await request(endpoint, { method: 'POST', body: JSON.stringify(makeBody(f)) });
			e.target.reset();
			setDefaultDates();
			showAlert(success);
			refreshPage();
		} catch (error) { showAlert(error.message, 'error'); }
	});
}
function setDefaultDates() {
	const today = new Date().toISOString().slice(0, 10);
	document.querySelectorAll('input[type="date"]').forEach(i => { if (!i.value) i.value = today; });
}

// ===== FILTER HELPERS =====
function buildFilterUrl(base, params) {
	const q = Object.entries(params).filter(([,v]) => v !== '' && v !== null && v !== undefined);
	if (!q.length) return base;
	return base + '?' + q.map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}
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
		renderTable('userTable', data, userCols(), r =>
			makeDeleteButton('users.php','user_id',pick(r,['user_id','User_ID']),'User deleted.'));
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
		renderTable('courseTable', data, courseCols(), r =>
			makeDeleteButton('courses.php','course_id',pick(r,['course_id','Course_ID']),'Course deleted.'));
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
		renderTable('venueTable', data, venueCols(), r =>
			makeDeleteButton('venues.php','Venue_ID',pick(r,['Venue_ID','venue_id']),'Venue deleted.'));
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
		renderTable('examTable', data, examCols(), r =>
			makeDeleteButton('examinations.php','Exam_ID',pick(r,['Exam_ID','exam_id']),'Exam schedule deleted.'));
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
		renderTable('registrationTable', data, registrationCols(), r =>
			makeDeleteButton('registration.php','registration_id',pick(r,['registration_id','Registration_ID']),'Registration deleted.'));
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
		renderTable('resultTable', data, resultCols(), r =>
			makeDeleteButton('results.php','result_id',pick(r,['result_id','Result_ID']),'Result deleted.'));
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
		renderTable('notificationTable', data, notificationCols(), r =>
			makeDeleteButton('notifications.php','notification_id',pick(r,['notification_id','Notification_ID']),'Notification deleted.'));
	} catch (error) { showAlert(error.message, 'error'); }
}

function refreshPage() {
	({ dashboard:loadDashboard, users:loadUsers, courses:loadCourses, venues:loadVenues,
		exams:loadExams, registrations:loadRegistrations, results:loadResults,
		notifications:loadNotifications }[page] || loadDashboard)();
}

function initForms() {
	bind('userForm', 'users.php', f => ({ ...f, faculty_id: f.faculty_id || null }), 'User created.');
	bind('courseForm', 'courses.php', f => f, 'Course created.');
	bind('venueForm', 'venues.php', f => f, 'Venue created.');
	bind('examForm', 'examinations.php', f => ({ ...f, Created_by: userId() }), 'Exam schedule created.');
	bind('registrationForm', 'registration.php', f => f, 'Registration created.');
	bind('resultForm', 'results.php', f => f, 'Result created.');
	bind('notificationForm', 'notifications.php', f => ({ ...f, is_read: 0 }), 'Notification created.');
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
