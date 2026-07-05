const state = {
    token: '',
    user: {},
    registrations: [],
    courses: [],
    exams: [],
    results: [],
    notices: []
};

const API = '../query/';
const SEARCH_API = '../search/search.php';
const QR_API = '../qr_generate.php';

const columns = {
    exams: [
        { label: 'Exam ID', keys: ['Exam_ID', 'exam_id'] },
        { label: 'Course', keys: ['Course_Code', 'course_code', 'Course_ID', 'course_id'] },
        { label: 'Date', keys: ['Exam_Date', 'exam_date'] },
        { label: 'Start', keys: ['Start_Time', 'start_time'] },
        { label: 'End', keys: ['End_Time', 'end_time'] },
        { label: 'Venue', keys: ['Venue_Name', 'venue_name', 'Venue_ID', 'venue_id'] }
    ],
    results: [
        { label: 'Result ID', keys: ['result_id', 'Result_ID'] },
        { label: 'Course Name', keys: ['Course_Name', 'course_name'] },
        { label: 'Exam Date', keys: ['Exam_Date', 'exam_date'] },
        { label: 'Marks', keys: ['marks_obtained', 'Marks_Obtained'] },
        { label: 'Grade', keys: ['grade', 'Grade'] },
        { label: 'Published', keys: ['published_at', 'Published_At'] }
    ],
    registrations: [
        { label: 'Course Code', keys: ['course_code', 'Course_Code'] },
        { label: 'Course Name', keys: ['course_name', 'Course_Name'] },
        { label: 'Date Registered', keys: ['registration_date', 'Registration_Date'] }
    ],
    courses: [
        { label: 'Course ID', keys: ['course_id', 'Course_ID'] },
        { label: 'Code', keys: ['course_code', 'Course_Code'] },
        { label: 'Course Name', keys: ['course_name', 'Course_Name'] },
        { label: 'Credit Hours', keys: ['credit_hours', 'Credit_Hours'] }
    ]
};

function getSession() {
    try {
        return JSON.parse(localStorage.getItem('examApiSession') || '{}');
    } catch {
        return {};
    }
}

function normalizeRole(role) {
    const value = String(role || '').toLowerCase().trim().replace(/[\s_-]+/g, '');
    return ({
        administrator: 'admin',
        administrators: 'admin',
        admins: 'admin',
        lecturers: 'lecturer',
        teacher: 'lecturer',
        teachers: 'lecturer',
        instructor: 'lecturer',
        instructors: 'lecturer',
        students: 'student'
    })[value] || value;
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

    const userMini = document.getElementById('userMini');
    if (userMini) {
        userMini.innerHTML = `
            <strong>${escapeHtml(state.user.name || 'Student')}</strong><br>
            ${escapeHtml(state.user.email || '')}<br>
            <span class="pill">${escapeHtml(state.user.role || 'student')}</span>
        `;
    }

    return true;
}

function setActiveNav() {
    const current = location.pathname.split('/').pop() || 'student.html';
    document.querySelectorAll('.nav a').forEach(link => {
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
    setTimeout(() => alert.className = 'alert', 3500);
}

async function request(endpoint, options = {}) {
    const response = await fetch(API + endpoint, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + state.token,
            ...(options.headers || {})
        }
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

async function searchRequest(module, keyword, limit = 20) {
    const params = new URLSearchParams({
        module,
        q: keyword,
        limit: String(limit)
    });

    const response = await fetch(`${SEARCH_API}?${params.toString()}`, {
        headers: {
            'Authorization': 'Bearer ' + state.token
        }
    });

    const text = await response.text();
    let data = {};

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { message: text };
    }

    if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Search failed');
    }

    return data;
}

async function qrRequest(body) {
    const response = await fetch(QR_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + state.token
        },
        body: JSON.stringify(body)
    });

    const text = await response.text();
    let data = {};

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { message: text };
    }

    if (!response.ok || data.success === false) {
        throw new Error(data.message || 'QR request failed');
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
    return String(value ?? '').replace(/[&<>"]/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
    }[match]));
}

function currentUserId() {
    return pick(state.user, ['id', 'user_id', 'User_ID', 'UserID']);
}

function currentUserOnly(data) {
    const userId = String(currentUserId() || '');
    if (!userId) return data;

    return data.filter(row => String(pick(row, ['user_id', 'User_ID', 'UserID'])) === userId);
}

function sortRegistrationsByRecent(data) {
    return [...data].sort((a, b) => {
        const dateA = new Date(pick(a, ['registration_date', 'Registration_Date']) || 0).getTime();
        const dateB = new Date(pick(b, ['registration_date', 'Registration_Date']) || 0).getTime();
        return dateB - dateA;
    });
}

function renderTable(target, data, tableColumns) {
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
                    <tr>${tableColumns.map(column => `<th>${column.label}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>${tableColumns.map(column => `<td>${escapeHtml(pick(row, column.keys))}</td>`).join('')}</tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}



function examChoiceLabel(row) {
    const id = pick(row, ['Exam_ID', 'exam_id']);
    const course = pick(row, ['Course_Code', 'course_code', 'Course_ID', 'course_id']);
    const date = pick(row, ['Exam_Date', 'exam_date']);
    const start = pick(row, ['Start_Time', 'start_time']);
    const venue = pick(row, ['Venue_Name', 'venue_name', 'Venue_ID', 'venue_id']);
    return `#${id} · ${[course, date, start, venue].filter(Boolean).join(' · ')}`;
}

function renderStudentQrExamDropdown() {
    const select = document.getElementById('studentQrExamSelect');
    if (!select) return;

    const exams = registeredExamList();
    if (!exams.length) {
        select.innerHTML = '<option value="">No registered exams available</option>';
        return;
    }

    const currentValue = select.value;
    select.innerHTML = '<option value="">Select exam schedule</option>' + exams.map(exam => {
        const id = pick(exam, ['Exam_ID', 'exam_id']);
        return id ? `<option value="${escapeHtml(id)}">${escapeHtml(examChoiceLabel(exam))}</option>` : '';
    }).join('');

    if (currentValue && Array.from(select.options).some(option => option.value === currentValue)) {
        select.value = currentValue;
    }
}

function renderQrPreview(payload) {
    const element = document.getElementById('qrPreview');
    if (!element) return;

    const slip = payload.slip || {};
    const img = payload.qr_code_url || payload.qrCodeUrl || '';

    if (!img) {
        element.innerHTML = '<div class="empty">No QR code returned.</div>';
        return;
    }

    const details = [
        ['Student', `${pick(slip, ['student_name'])} (${pick(slip, ['student_id'])})`],
        ['Exam ID', pick(slip, ['exam_id'])],
        ['Course', [pick(slip, ['course_code']), pick(slip, ['course_name'])].filter(Boolean).join(' - ')],
        ['Date', pick(slip, ['exam_date'])],
        ['Time', [pick(slip, ['start_time']), pick(slip, ['end_time'])].filter(Boolean).join(' - ')],
        ['Venue', [pick(slip, ['venue_name']), pick(slip, ['venue_location'])].filter(Boolean).join(' - ')]
    ];

    element.innerHTML = `
        <div class="qr-preview">
            <img class="qr-image" src="${escapeHtml(img)}" alt="Admission Slip QR Code">
            <div class="slip-list">
                ${details.map(([key, value]) => `<div><span>${escapeHtml(key)}</span><strong>${escapeHtml(value || '-')}</strong></div>`).join('')}
            </div>
        </div>
    `;
}

function renderStudentCourseDropdown() {
    const select = document.getElementById('studentCourseSelect');
    if (!select) return;

    if (!state.courses.length) {
        select.innerHTML = '<option value="">No courses available</option>';
        return;
    }

    const currentValue = select.value;
    select.innerHTML = `
        <option value="">Select course</option>
        ${state.courses.map(course => {
            const id = pick(course, ['course_id', 'Course_ID']);
            const code = pick(course, ['course_code', 'Course_Code']);
            const name = pick(course, ['course_name', 'Course_Name']);
            const label = [name, code ? `(${code})` : ''].filter(Boolean).join(' ');
            return `<option value="${escapeHtml(id)}">${escapeHtml(label || `Course ${id}`)}</option>`;
        }).join('')}
    `;

    if (currentValue && Array.from(select.options).some(option => option.value === currentValue)) {
        select.value = currentValue;
    }
}

function renderNotices() {
    const element = document.getElementById('noticeList');
    if (!element) return;

    if (!state.notices.length) {
        element.innerHTML = '<div class="empty">No notifications yet.</div>';
        return;
    }

    element.innerHTML = state.notices.map(notice => `
        <article class="notice">
            <strong>${escapeHtml(pick(notice, ['title', 'Title']))}</strong>
            <p>${escapeHtml(pick(notice, ['message', 'Message']))}</p>
            <p style="margin-top:8px;font-size:12px">${escapeHtml(pick(notice, ['created_at', 'Created_At']))}</p>
        </article>
    `).join('');
}

function registeredExamList(examSource = state.exams) {
    const registeredCourseIds = new Set(
        state.registrations
            .map(registration => String(pick(registration, ['course_id', 'Course_ID'])))
            .filter(Boolean)
    );

    if (!registeredCourseIds.size) return [];

    return examSource.filter(exam =>
        registeredCourseIds.has(String(pick(exam, ['Course_ID', 'course_id'])))
    );
}

function updateCounts() {
    const exams = registeredExamList();
    const counters = {
        countReg: state.registrations.length,
        countExam: exams.length,
        countResult: state.results.length,
        countNotice: state.notices.length
    };

    Object.entries(counters).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function renderAll() {
    const exams = registeredExamList();

    updateCounts();

    renderTable('examTable', exams, columns.exams);
    renderTable('resultTable', state.results, columns.results);
    renderTable('registrationTable', sortRegistrationsByRecent(state.registrations), columns.registrations);
    renderTable('courseTable', state.courses, columns.courses);
    renderStudentCourseDropdown();
    renderStudentQrExamDropdown();

    renderNotices();
}

function renderSearchResult(module, data, keyword) {
    if (module === 'examinations') {
        const exams = registeredExamList(data);
        renderTable('examTable', exams, columns.exams);
        showAlert(`${exams.length} timetable result(s) found for "${keyword}".`);
        return;
    }

    if (module === 'results') {
        const results = currentUserOnly(data);
        renderTable('resultTable', results, columns.results);
        showAlert(`${results.length} result record(s) found for "${keyword}".`);
        return;
    }

    if (module === 'registrations') {
        const registrations = sortRegistrationsByRecent(currentUserOnly(data));
        renderTable('registrationTable', registrations, columns.registrations);
        showAlert(`${registrations.length} registration record(s) found for "${keyword}".`);
    }
}

function setupSearchForms() {
    document.querySelectorAll('[data-search-module]').forEach(form => {
        const input = form.querySelector('input[name="q"]');
        const clearButton = form.querySelector('[data-clear-search]');

        form.addEventListener('submit', async event => {
            event.preventDefault();
            const keyword = (input?.value || '').trim();
            const module = form.dataset.searchModule;

            if (!keyword) {
                renderAll();
                return;
            }

            try {
                const response = await searchRequest(module, keyword);
                const data = rows(response?.results?.[module] ?? []);
                renderSearchResult(module, data, keyword);
            } catch (error) {
                showAlert(error.message, 'error');
            }
        });

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                if (input) input.value = '';
                renderAll();
            });
        }
    });
}

async function loadAll() {
    try {
        const userId = currentUserId();
        const [registrations, courses, exams, results, notices] = await Promise.all([
            request('registration.php?user_id=' + encodeURIComponent(userId)),
            request('courses.php'),
            request('examinations.php'),
            request('results.php?user_id=' + encodeURIComponent(userId)),
            request('notifications.php?user_id=' + encodeURIComponent(userId))
        ]);

        state.registrations = sortRegistrationsByRecent(rows(registrations));
        state.courses = rows(courses);
        state.exams = rows(exams);
        state.results = rows(results);
        state.notices = rows(notices);

        renderAll();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}


function setupStudentQrForm() {
    const form = document.getElementById('studentQrForm');
    if (!form) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const formData = new FormData(form);
        const examId = formData.get('exam_id');

        if (!examId) {
            showAlert('Please choose an exam schedule.', 'error');
            return;
        }

        try {
            const response = await qrRequest({
                exam_id: examId,
                student_id: currentUserId()
            });
            renderQrPreview(response);
            showAlert(response.message || 'Admission-slip QR loaded.');
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });
}

function setupRegistrationForm() {
    const form = document.getElementById('registrationForm');
    if (!form) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const formData = new FormData(form);

        try {
            await request('registration.php', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: currentUserId(),
                    course_id: formData.get('course_id'),
                    registration_date: new Date().toISOString().slice(0, 10)
                })
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
    setupSearchForms();
    setupRegistrationForm();
    setupStudentQrForm();
    loadAll();
}
