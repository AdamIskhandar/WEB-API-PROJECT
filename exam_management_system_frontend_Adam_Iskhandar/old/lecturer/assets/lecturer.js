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
		renderTable('examTable', rows(exams), examCols(), r =>
			makeDeleteButton('examinations.php','Exam_ID',pick(r,['Exam_ID','exam_id']),'Exam schedule deleted.'));
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
		renderTable('resultTable', data, resultCols(), r =>
			makeDeleteButton('results.php','result_id',pick(r,['result_id','Result_ID']),'Result deleted.'));
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
		renderTable('notificationTable', data, notificationCols());
	} catch (error) { showAlert(error.message, 'error'); }
}

function refreshPage() {
	({ dashboard:loadDashboard, courses:loadCourses, exams:loadExams,
		results:loadResults, notifications:loadNotifications }[page] || loadDashboard)();
}

function initForms() {
	bind('examForm', 'examinations.php', f => ({ ...f, Created_by: userId() }), 'Exam schedule created.');
	bind('resultForm', 'results.php', f => f, 'Result published.');
	bind('notificationForm', 'notifications.php', f => ({ ...f, is_read: 0 }), 'Notification sent.');
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
