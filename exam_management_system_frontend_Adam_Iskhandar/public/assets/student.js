const state = {
	token: '',
	user: {},
	registrations: [],
	courses: [],
	exams: [],
	results: [],
	notices: [],
};

const API = 'http://localhost/exam_management_system/query/';
const API_ROOT = API.replace(/query\/?$/, '');

function userId() {
	return state.user.id || state.user.user_id || state.user.User_ID;
}

function getSession() {
	try {
		return JSON.parse(localStorage.getItem('examApiSession') || '{}');
	} catch {
		return {};
	}
}

function normalizeRole(role) {
	const value = String(role || '')
		.toLowerCase()
		.trim()
		.replace(/[\s_-]+/g, '');
	return (
		{
			administrator: 'admin',
			administrators: 'admin',
			admins: 'admin',
			lecturers: 'lecturer',
			teacher: 'lecturer',
			teachers: 'lecturer',
			instructor: 'lecturer',
			instructors: 'lecturer',
			students: 'student',
		}[value] || value
	);
}

function guard() {
	const session = getSession();

	if (!session.token) {
		location.href = 'index.php';
		return false;
	}

	state.token = session.token;
	state.user = session.user || {};

	if (normalizeRole(state.user.role) !== 'student') {
		location.href = 'index.php';
		return false;
	}

	const userChip = document.getElementById('userChip');
	if (userChip) {
		userChip.textContent = `${state.user.name || 'Student'} · Student`;
	}

	// hamburger toggle (mobile nav)
	const hamburger = document.getElementById('hamburger');
	const navbar = document.querySelector('.navbar');
	if (hamburger && navbar) {
		hamburger.addEventListener('click', () => navbar.classList.toggle('nav-mobile-open'));
	}

	return true;
}

function setActiveNav() {
	const current = location.pathname.split('/').pop() || 'student.html';
	document.querySelectorAll('.nav a').forEach((link) => {
		const target = link.getAttribute('href');
		link.classList.toggle('active', target === current);
	});
}

function logout() {
	localStorage.removeItem('examApiSession');
	location.href = 'index.php';
}

function showAlert(message, type = 'success') {
	const alert = document.getElementById('alert');
	if (!alert) return;
	alert.textContent = message;
	alert.className = `alert show ${type}`;
	setTimeout(() => (alert.className = 'alert'), 3500);
}

async function request(endpoint, options = {}) {
	const response = await fetch(API + endpoint, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + state.token,
			...(options.headers || {}),
		},
	});

	const text = await response.text();
	let data = {};

	try {
		data = text ? JSON.parse(text) : {};
	} catch {
		data = { message: text };
	}

	if (!response.ok) {
		throw new Error(data.message || 'Request failed');
	}

	return data;
}

function rows(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (payload && typeof payload === 'object') return [payload];
	return [];
}

function pick(obj, keys) {
	for (const key of keys) {
		if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
	}
	return '';
}

function escapeHtml(value) {
	return String(value ?? '').replace(
		/[&<>"]/g,
		(match) =>
			({
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
			})[match],
	);
}

function renderTable(target, data, columns, actions) {
	const element = document.getElementById(target);
	if (!element) return;

	if (!data.length) {
		element.innerHTML = '<div class="empty">No records found.</div>';
		return;
	}

	element.innerHTML = `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>${columns.map((column) => `<th>${column.label}</th>`).join('')}${actions ? '<th>Admit Slip</th>' : ''}</tr>
                </thead>
                <tbody>
                    ${data
											.map(
												(row) => `
                        <tr>${columns.map((column) => `<td>${escapeHtml(pick(row, column.keys))}</td>`).join('')}${actions ? `<td>${actions(row)}</td>` : ''}</tr>
                    `,
											)
											.join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ---------------------------------------------------------------------------
// Exam admit slip (QR code) — calls the qr_generate.php endpoint directly
// (it lives at the project root, alongside auth/, api/, query/, search/).
// ---------------------------------------------------------------------------
function ensureAdmitModal() {
	if (document.getElementById('admitModal')) return;
	document.body.insertAdjacentHTML(
		'beforeend',
		`
        <div class="modal-overlay" id="admitModal">
            <div class="modal-box">
                <button class="modal-close" type="button" onclick="closeAdmitSlip()">&times;</button>
                <div class="admit-slip" id="admitSlipContent"></div>
            </div>
        </div>
    `,
	);
	document.getElementById('admitModal').addEventListener('click', (event) => {
		if (event.target.id === 'admitModal') closeAdmitSlip();
	});
}

function closeAdmitSlip() {
	const modal = document.getElementById('admitModal');
	if (modal) modal.classList.remove('show');
}

async function showAdmitSlip(examId, courseCode, examDate) {
	ensureAdmitModal();
	const modal = document.getElementById('admitModal');
	const content = document.getElementById('admitSlipContent');
	content.innerHTML = '<p>Generating your admit slip QR code…</p>';
	modal.classList.add('show');

	try {
		const response = await fetch(API_ROOT + 'qr_generate.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + state.token,
			},
			body: JSON.stringify({
				examId,
				studentId: userId(),
				course: courseCode,
				date: examDate,
			}),
		});

		const text = await response.text();
		let data = {};
		try {
			data = text ? JSON.parse(text) : {};
		} catch {
			data = { message: text };
		}

		if (!response.ok || !data.success) {
			throw new Error(data.message || 'Could not generate the QR code.');
		}

		content.innerHTML = `
            <h3>Exam Admit Slip</h3>
            <p><strong>${escapeHtml(courseCode)}</strong></p>
            <p>${escapeHtml(examDate)}</p>
            <img class="qr-image" src="${data.qr_code_url}" alt="Exam admit slip QR code" />
            <p class="hint">Show this QR code at the exam hall entrance to be scanned in.</p>
        `;
	} catch (error) {
		content.innerHTML = `
            <h3>Exam Admit Slip</h3>
            <p class="error-text">${escapeHtml(error.message)}</p>
        `;
	}
}

function renderNotices() {
	const element = document.getElementById('noticeList');
	if (!element) return;

	if (!state.notices.length) {
		element.innerHTML = '<div class="empty">No notifications yet.</div>';
		return;
	}

	element.innerHTML = state.notices
		.map(
			(notice) => `
        <article class="notice">
            <strong>${escapeHtml(pick(notice, ['title', 'Title']))}</strong>
            <p>${escapeHtml(pick(notice, ['message', 'Message']))}</p>
            <p style="margin-top:8px;font-size:12px">${escapeHtml(pick(notice, ['created_at', 'Created_At']))}</p>
        </article>
    `,
		)
		.join('');
}

function registeredExamList() {
	const registeredCourseIds = new Set(
		state.registrations
			.map((registration) =>
				String(pick(registration, ['course_id', 'Course_ID'])),
			)
			.filter(Boolean),
	);

	if (!registeredCourseIds.size) return state.exams;

	return state.exams.filter((exam) =>
		registeredCourseIds.has(String(pick(exam, ['Course_ID', 'course_id']))),
	);
}

function updateCounts() {
	const exams = registeredExamList();
	const counters = {
		countReg: state.registrations.length,
		countExam: exams.length,
		countResult: state.results.length,
		countNotice: state.notices.length,
	};

	Object.entries(counters).forEach(([id, value]) => {
		const element = document.getElementById(id);
		if (element) element.textContent = value;
	});
}

function renderAll() {
	const exams = registeredExamList();

	updateCounts();

	renderTable(
		'examTable',
		exams,
		[
			{ label: 'Exam ID', keys: ['Exam_ID', 'exam_id'] },
			{ label: 'Course', keys: ['Course_Code', 'course_code', 'Course_ID'] },
			{ label: 'Date', keys: ['Exam_Date', 'exam_date'] },
			{ label: 'Start', keys: ['Start_Time', 'start_time'] },
			{ label: 'End', keys: ['End_Time', 'end_time'] },
			{ label: 'Venue', keys: ['Venue_Name', 'venue_name', 'Venue_ID'] },
		],
		(row) => {
			const examId = pick(row, ['Exam_ID', 'exam_id']);
			const courseCode = pick(row, ['Course_Code', 'course_code', 'Course_ID', 'course_id']);
			const examDate = pick(row, ['Exam_Date', 'exam_date']);
			return `<button type="button" class="btn small" onclick="showAdmitSlip('${examId}', '${escapeHtml(String(courseCode))}', '${examDate}')">Get QR</button>`;
		},
	);

	renderTable('resultTable', state.results, [
		{ label: 'Result ID', keys: ['result_id', 'Result_ID'] },
		{ label: 'Exam ID', keys: ['exam_id', 'Exam_ID'] },
		{ label: 'Marks', keys: ['marks_obtained', 'Marks_Obtained'] },
		{ label: 'Grade', keys: ['grade', 'Grade'] },
		{ label: 'Published', keys: ['published_at', 'Published_At'] },
	]);

	renderTable('registrationTable', state.registrations, [
		{ label: 'Registration ID', keys: ['registration_id', 'Registration_ID'] },
		{ label: 'Course ID', keys: ['course_id', 'Course_ID'] },
		{ label: 'Date', keys: ['registration_date', 'Registration_Date'] },
	]);

	renderTable('courseTable', state.courses, [
		{ label: 'Course ID', keys: ['course_id', 'Course_ID'] },
		{ label: 'Code', keys: ['course_code', 'Course_Code'] },
		{ label: 'Course Name', keys: ['course_name', 'Course_Name'] },
		{ label: 'Credit Hours', keys: ['credit_hours', 'Credit_Hours'] },
	]);

	renderNotices();
}

async function loadAll() {
	try {
		const userId = state.user.id || state.user.user_id || state.user.User_ID;
		const [registrations, courses, exams, results, notices] = await Promise.all(
			[
				request('registration.php?user_id=' + encodeURIComponent(userId)),
				request('courses.php'),
				request('examinations.php'),
				request('results.php?user_id=' + encodeURIComponent(userId)),
				request('notifications.php?user_id=' + encodeURIComponent(userId)),
			],
		);

		state.registrations = rows(registrations);
		state.courses = rows(courses);
		state.exams = rows(exams);
		state.results = rows(results);
		state.notices = rows(notices);

		renderAll();
	} catch (error) {
		showAlert(error.message, 'error');
	}
}

function setupRegistrationForm() {
	const form = document.getElementById('registrationForm');
	if (!form) return;

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		const formData = new FormData(form);

		try {
			await request('registration.php', {
				method: 'POST',
				body: JSON.stringify({
					user_id: state.user.id || state.user.user_id || state.user.User_ID,
					course_id: formData.get('course_id'),
					registration_date: new Date().toISOString().slice(0, 10),
				}),
			});

			form.reset();
			showAlert('Course registration created.');
			loadAll();
		} catch (error) {
			showAlert(error.message, 'error');
		}
	});
}

setActiveNav();
if (guard()) {
	setupRegistrationForm();
	loadAll();
}
