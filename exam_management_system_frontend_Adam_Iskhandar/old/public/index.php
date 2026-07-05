<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exam Management Login</title>
    <style>
        :root {
            --bg: #f5f1e8;
            --panel: #ffffff;
            --ink: #111111;
            --muted: #454545;
            --primary: #ff4d3d;
            --accent2: #ffd23f;
            --accent3: #3d5afe;
            --border: #111111;
            --danger: #e63946;
            --success: #1f9d63;
            --shadow: 8px 8px 0 var(--ink);
            --shadow-sm: 5px 5px 0 var(--ink);
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;
            color: var(--ink);
            background: var(--bg);
            display: grid;
            place-items: center;
            padding: 32px;
        }

        .shell {
            width: min(1080px, 100%);
            display: grid;
            grid-template-columns: 1.1fr .9fr;
            gap: 26px;
            align-items: stretch;
        }

        .hero,
        .panel {
            background: var(--panel);
            border: 4px solid var(--ink);
            border-radius: 0;
            box-shadow: var(--shadow);
        }

        .hero {
            padding: 42px;
            overflow: hidden;
            position: relative;
            background: var(--accent2);
        }

        .badge {
            display: inline-flex;
            gap: 8px;
            align-items: center;
            border: 2px solid var(--ink);
            background: #fff;
            color: var(--ink);
            padding: 7px 13px;
            font-weight: 900;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .06em;
        }

        h1 {
            font-size: clamp(34px, 4.8vw, 58px);
            line-height: 1;
            margin: 24px 0 18px;
            letter-spacing: -.5px;
            font-weight: 900;
            text-transform: uppercase;
            color: #111;
        }

        .hero p {
            color: #232323;
            font-size: 16px;
            line-height: 1.6;
            max-width: 560px;
            font-weight: 600;
        }

        .feature-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
            margin-top: 30px;
        }

        .feature {
            padding: 16px;
            background: #fff;
            border: 3px solid var(--ink);
            box-shadow: var(--shadow-sm);
        }

        .feature strong {
            display: block;
            margin-bottom: 6px;
            text-transform: uppercase;
            font-size: 13px;
        }

        .feature span {
            color: var(--muted);
            font-size: 13px;
            line-height: 1.5;
            font-weight: 600;
        }

        .orb {
            position: absolute;
            width: 130px;
            height: 130px;
            border-radius: 0;
            background: var(--accent3);
            border: 3px solid var(--ink);
            bottom: -40px;
            right: -30px;
            transform: rotate(20deg);
        }

        .panel {
            padding: 34px;
            background: #fff;
        }

        .tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            margin-bottom: 24px;
            border: 3px solid var(--ink);
        }

        .tab {
            border: 0;
            padding: 12px;
            font-weight: 900;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: .03em;
            color: var(--ink);
            background: #fff;
            cursor: pointer;
        }

        .tab:first-child { border-right: 3px solid var(--ink); }

        .tab.active {
            background: var(--primary);
            color: #fff;
        }

        .title {
            margin-bottom: 22px;
        }

        .title h2 {
            margin: 0 0 8px;
            font-size: 26px;
            letter-spacing: -.3px;
            font-weight: 900;
            text-transform: uppercase;
        }

        .title p {
            margin: 0;
            color: var(--muted);
            font-weight: 600;
        }

        form {
            display: grid;
            gap: 15px;
        }

        label {
            display: grid;
            gap: 8px;
            color: #111;
            font-size: 12.5px;
            font-weight: 800;
            text-transform: uppercase;
        }

        input,
        select,
        textarea {
            width: 100%;
            border: 3px solid var(--ink);
            background: #fff;
            border-radius: 0;
            padding: 12px 13px;
            font: inherit;
            outline: none;
            transition: box-shadow .1s;
        }

        input:focus,
        select:focus,
        textarea:focus {
            box-shadow: 4px 4px 0 var(--primary);
        }

        .btn {
            border: 3px solid var(--ink);
            border-radius: 0;
            padding: 14px 16px;
            background: var(--primary);
            color: #fff;
            font-weight: 900;
            cursor: pointer;
            box-shadow: var(--shadow-sm);
            text-transform: uppercase;
            letter-spacing: .04em;
            transition: transform .1s, box-shadow .1s;
        }

        .btn:hover {
            transform: translate(-2px, -2px);
            box-shadow: 7px 7px 0 var(--ink);
        }

        .btn:active {
            transform: translate(0, 0);
            box-shadow: 1px 1px 0 var(--ink);
        }

        .btn:disabled {
            opacity: .55;
            cursor: not-allowed;
            transform: none;
        }

        .hidden {
            display: none;
        }

        .message {
            margin-top: 14px;
            min-height: 24px;
            font-weight: 800;
            font-size: 14px;
        }

        .message.error {
            color: var(--danger);
        }

        .message.success {
            color: var(--success);
        }

        .hint {
            margin-top: 20px;
            padding-top: 16px;
            border-top: 3px dashed var(--ink);
            color: var(--muted);
            font-size: 13px;
            line-height: 1.5;
            font-weight: 600;
        }

        @media (max-width: 860px) {
            .shell {
                grid-template-columns: 1fr;
            }

            .hero {
                padding: 30px;
            }

            .feature-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>
    <main class="shell">
        <section class="hero">
            <span class="badge">Secure RESTful Exam API</span>
            <h1>Exam Scheduling & Result Management</h1>
            <p>A simple role-based client for students, lecturers, and administrators to access timetables, registrations, results, schedules, venues, and notifications.</p>
            <div class="feature-grid">
                <div class="feature"><strong>Student</strong><span>View timetable, results, registrations, and notifications.</span></div>
                <div class="feature"><strong>Lecturer</strong><span>Manage exam schedules, publish results, and send notices.</span></div>
                <div class="feature"><strong>Admin</strong><span>Manage users, courses, venues, registrations, exams, and results.</span></div>
                <div class="feature"><strong>Security</strong><span>JWT token saved locally and sent using Bearer authorization.</span></div>
            </div>
            <div class="orb"></div>
        </section>

        <section class="panel">
            <div class="tabs" aria-label="Authentication tabs">
                <button class="tab active" type="button" data-tab="login">Login</button>
                <button class="tab" type="button" data-tab="register">Register</button>
            </div>

            <div id="login-view">
                <div class="title">
                    <h2>Welcome back</h2>
                    <p>Use your email and password. The system redirects based on your role.</p>
                </div>
                <form id="loginForm">
                    <label>Email
                        <input type="email" name="email" placeholder="example@student.edu" required>
                    </label>
                    <label>Password
                        <input type="password" name="password" placeholder="Enter password" required>
                    </label>
                    <button class="btn" type="submit">Login</button>
                </form>
            </div>

            <div id="register-view" class="hidden">
                <div class="title">
                    <h2>Create account</h2>
                    <p>Register a new user, then login from this same page.</p>
                </div>
                <form id="registerForm">
                    <label>Full name
                        <input type="text" name="name" placeholder="Your name" required>
                    </label>
                    <label>Email
                        <input type="email" name="email" placeholder="example@university.edu" required>
                    </label>
                    <label>Password
                        <input type="password" name="password" placeholder="Create password" required minlength="6">
                    </label>
                    <label>Role
                        <select name="role" required>
                            <option value="student">Student</option>
                            <option value="lecturer">Lecturer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </label>
                    <label>Faculty ID <span style="font-weight:600;color:#667085">(optional)</span>
                        <input type="number" name="faculty_id" placeholder="Example: 1">
                    </label>
                    <button class="btn" type="submit">Register</button>
                </form>
            </div>

            <div id="message" class="message"></div>
            <p class="hint">Note: login only asks for email and password. Role is read from the secure token returned by the API.</p>
        </section>
    </main>

    <script>
        const messageBox = document.getElementById('message');
        const tabs = document.querySelectorAll('.tab');
        const views = {
            login: document.getElementById('login-view'),
            register: document.getElementById('register-view')
        };

        tabs.forEach(tab => tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            Object.values(views).forEach(view => view.classList.add('hidden'));
            views[tab.dataset.tab].classList.remove('hidden');
            showMessage('', '');
        }));

        function showMessage(text, type = 'error') {
            messageBox.textContent = text;
            messageBox.className = `message ${type}`;
        }

        function decodeJwt(token) {
            try {
                const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
                return JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
            } catch (error) {
                return null;
            }
        }

        function readValue(source, keys) {
            if (!source || typeof source !== 'object') return '';
            for (const key of keys) {
                if (source[key] !== undefined && source[key] !== null && source[key] !== '') return source[key];
            }
            return '';
        }

        function normalizedRole(role) {
            const value = String(role || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
            const roleMap = {
                student: 'student',
                students: 'student',
                lecturer: 'lecturer',
                lecturers: 'lecturer',
                teacher: 'lecturer',
                teachers: 'lecturer',
                instructor: 'lecturer',
                instructors: 'lecturer',
                admin: 'admin',
                admins: 'admin',
                administrator: 'admin',
                administrators: 'admin'
            };
            return roleMap[value] || value;
        }

        function getRole(result, decoded, user, email) {
            const role = readValue(user, ['role', 'Role', 'user_role', 'User_Role', 'UserRole']) ||
                readValue(result, ['role', 'Role', 'user_role', 'User_Role', 'UserRole']) ||
                readValue(result?.data, ['role', 'Role', 'user_role', 'User_Role', 'UserRole']) ||
                readValue(decoded?.data, ['role', 'Role', 'user_role', 'User_Role', 'UserRole']) ||
                readValue(decoded, ['role', 'Role', 'user_role', 'User_Role', 'UserRole']);

            const safeRole = normalizedRole(role);
            if (safeRole) return safeRole;

            // Last fallback for demo databases that have old login APIs returning no role.
            // The real source should still be the API/database role.
            const emailPrefix = String(email || '').split('@')[0].toLowerCase();
            if (emailPrefix.includes('admin')) return 'admin';
            if (emailPrefix.includes('lecturer')) return 'lecturer';
            if (emailPrefix.includes('student')) return 'student';
            return '';
        }

        function redirectByRole(role) {
            const safeRole = normalizedRole(role);
            if (safeRole === 'student') window.location.href = 'student.html';
            else if (safeRole === 'lecturer') window.location.href = '../lecturer/index.html';
            else if (safeRole === 'admin') window.location.href = '../admin/index.html';
            else showMessage(`Login successful, but user role is missing or unsupported${role ? ': ' + role : ''}.`);
        }

        async function requestJson(url, options = {}) {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });
            const text = await response.text();
            let data = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                data = {
                    message: text
                };
            }
            if (!response.ok) throw new Error(data.message || 'Request failed');
            return data;
        }

        document.getElementById('loginForm').addEventListener('submit', async event => {
            event.preventDefault();
            const button = event.target.querySelector('button');
            button.disabled = true;
            showMessage('Checking credentials...', 'success');

            const form = new FormData(event.target);
            try {
                const result = await requestJson('http://localhost/exam_management_system/auth/login.php', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: form.get('email'),
                        password: form.get('password')
                    })
                });
                const token = result.token || result.jwt || result.access_token || result.accessToken || result.data?.token || result.data?.jwt || '';
                const decoded = decodeJwt(token);
                const user = result.user || result.data?.user || decoded?.data || {};
                const role = getRole(result, decoded, user, form.get('email'));

                if (!token) {
                    throw new Error('Login successful, but the API did not return a token. Please update auth/login.php.');
                }

                const sessionUser = {
                    ...user,
                    id: readValue(user, ['id', 'user_id', 'User_ID', 'UserID']) || readValue(decoded?.data, ['id', 'user_id', 'User_ID', 'UserID']),
                    name: readValue(user, ['name', 'Name', 'full_name', 'Full_Name']) || user.name || user.Name || '',
                    email: readValue(user, ['email', 'Email']) || form.get('email'),
                    role
                };

                localStorage.setItem('examApiSession', JSON.stringify({
                    token,
                    user: sessionUser
                }));
                showMessage('Login successful. Redirecting...', 'success');
                redirectByRole(role);
            } catch (error) {
                showMessage(error.message || 'Unable to login.');
            } finally {
                button.disabled = false;
            }
        });

        document.getElementById('registerForm').addEventListener('submit', async event => {
            event.preventDefault();
            const button = event.target.querySelector('button');
            button.disabled = true;
            showMessage('Creating account...', 'success');

            const form = new FormData(event.target);
            try {
                await requestJson('http://localhost/exam_management_system/auth/register.php', {
                    method: 'POST',
                    body: JSON.stringify({
                        Name: form.get('name'),
                        Email: form.get('email'),
                        Password: form.get('password'),
                        Role: form.get('role'),
                        FacultyID: form.get('faculty_id')
                    })
                });
                event.target.reset();
                document.querySelector('[data-tab="login"]').click();
                showMessage('Registration successful. Please login now.', 'success');
            } catch (error) {
                showMessage(error.message || 'Unable to register.');
            } finally {
                button.disabled = false;
            }
        });
    </script>
</body>

</html>