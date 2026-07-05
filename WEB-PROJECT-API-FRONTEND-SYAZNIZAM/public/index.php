<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exam Management Login</title>
    <style>
        :root {
            --ink: #0f172a;
            --muted: #64748b;
            --panel: rgba(255, 255, 255, .82);
            --border: rgba(255, 255, 255, .48);
            --primary: #4f46e5;
            --violet: #7c3aed;
            --cyan: #06b6d4;
            --orange: #f97316;
            --danger: #dc2626;
            --success: #15803d;
            --shadow: 0 28px 100px rgba(15, 23, 42, .22);
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: var(--ink);
            display: grid;
            place-items: center;
            padding: 34px;
            background:
                radial-gradient(circle at 12% 14%, rgba(6, 182, 212, .26), transparent 24rem),
                radial-gradient(circle at 84% 18%, rgba(249, 115, 22, .20), transparent 26rem),
                radial-gradient(circle at 52% 100%, rgba(124, 58, 237, .24), transparent 30rem),
                linear-gradient(135deg, #101827 0%, #18223b 44%, #eef2ff 44.2%, #f8fafc 100%);
        }

        body::before,
        body::after {
            content: "";
            position: fixed;
            inset: 0;
            pointer-events: none;
        }

        body::before {
            background-image:
                linear-gradient(120deg, rgba(255, 255, 255, .08) 1px, transparent 1px),
                linear-gradient(30deg, rgba(15, 23, 42, .06) 1px, transparent 1px);
            background-size: 70px 70px;
            mask-image: linear-gradient(to bottom, rgba(0, 0, 0, .62), transparent 76%);
        }

        body::after {
            inset: auto -120px -150px auto;
            width: 420px;
            height: 420px;
            border-radius: 999px;
            background: conic-gradient(from 180deg, rgba(79, 70, 229, .26), rgba(6, 182, 212, .14), rgba(249, 115, 22, .20), rgba(79, 70, 229, .26));
            filter: blur(2px);
        }

        .shell {
            position: relative;
            justify-content: center;
            width: min(1160px, 100%);
            display: inline-flex;
            flex-direction: row;
            gap: 24px;
            align-items: stretch;
        }

        .hero,
        .panel {
            border: 1px solid var(--border);
            border-radius: 38px;
            box-shadow: var(--shadow);
            backdrop-filter: blur(20px);
        }

        .hero {
            position: relative;
            overflow: hidden;
            min-height: 640px;
            padding: 48px;
            color: #fff;
            background:
                radial-gradient(circle at 15% 0%, rgba(255, 255, 255, .20), transparent 25rem),
                radial-gradient(circle at 90% 86%, rgba(6, 182, 212, .22), transparent 24rem),
                linear-gradient(145deg, #101827 0%, #1e1b4b 52%, #312e81 100%);
        }

        .hero::before {
            content: "";
            position: absolute;
            inset: 28px 28px auto auto;
            width: 148px;
            height: 148px;
            border-radius: 42px;
            transform: rotate(18deg);
            border: 1px solid rgba(255, 255, 255, .18);
            background: linear-gradient(135deg, rgba(255, 255, 255, .16), rgba(255, 255, 255, .03));
        }

        .hero::after {
            content: "";
            position: absolute;
            inset: auto -78px -110px auto;
            width: 330px;
            height: 330px;
            border-radius: 72px;
            transform: rotate(23deg);
            background: conic-gradient(from 120deg, rgba(6, 182, 212, .34), rgba(124, 58, 237, .20), rgba(249, 115, 22, .23), rgba(6, 182, 212, .34));
            border: 1px solid rgba(255, 255, 255, .16);
        }

        .badge {
            display: inline-flex;
            gap: 9px;
            align-items: center;
            border: 1px solid rgba(255, 255, 255, .22);
            background: rgba(255, 255, 255, .11);
            color: #fff;
            padding: 10px 15px;
            border-radius: 999px;
            font-weight: 900;
            font-size: 13px;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, .15);
        }

        .badge::before {
            content: "";
            width: 10px;
            height: 10px;
            border-radius: 4px;
            background: #22d3ee;
            transform: rotate(45deg);
            box-shadow: 0 0 0 6px rgba(34, 211, 238, .15);
        }

        h1 {
            max-width: 720px;
            font-size: clamp(42px, 5.2vw, 74px);
            line-height: .92;
            margin: 34px 0 20px;
            letter-spacing: -3px;
        }

        .hero p {
            color: rgba(255, 255, 255, .74);
            font-size: 17px;
            line-height: 1.75;
            max-width: 650px;
        }

        .feature-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 15px;
            margin-top: 38px;
        }

        .feature {
            position: relative;
            overflow: hidden;
            padding: 19px;
            background: rgba(255, 255, 255, .10);
            border: 1px solid rgba(255, 255, 255, .15);
            border-radius: 24px;
        }

        .feature::before {
            content: "";
            position: absolute;
            inset: 0 auto 0 0;
            width: 5px;
            background: linear-gradient(180deg, var(--cyan), var(--orange));
        }

        .feature strong {
            display: block;
            margin-bottom: 7px;
            color: #fff;
            font-size: 15px;
        }

        .feature span {
            color: rgba(255, 255, 255, .70);
            font-size: 13px;
            line-height: 1.5;
        }

        .orb {
            display: none;
        }

        .panel {
            align-self: center;
            padding: 32px;
            background: var(--panel);
        }

        .tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 9px;
            margin-bottom: 25px;
            padding: 8px;
            border-radius: 22px;
            background: rgba(15, 23, 42, .06);
            border: 1px solid rgba(148, 163, 184, .20);
        }

        .tab {
            border: 0;
            padding: 13px;
            border-radius: 16px;
            font-weight: 950;
            color: var(--muted);
            background: transparent;
            cursor: pointer;
            transition: background .16s ease, color .16s ease, box-shadow .16s ease, transform .16s ease;
        }

        .tab.active {
            background: white;
            color: var(--primary);
            box-shadow: 0 14px 30px rgba(15, 23, 42, .10);
            transform: translateY(-1px);
        }

        .title {
            margin-bottom: 22px;
        }

        .title h2 {
            margin: 0 0 8px;
            font-size: 31px;
            letter-spacing: -1.1px;
        }

        .title p {
            margin: 0;
            color: var(--muted);
            line-height: 1.58;
        }

        form {
            display: grid;
            gap: 15px;
        }

        label {
            display: grid;
            gap: 8px;
            color: #334155;
            font-size: 13px;
            font-weight: 900;
        }

        input,
        select,
        textarea {
            width: 100%;
            border: 1px solid rgba(148, 163, 184, .36);
            background: rgba(255, 255, 255, .86);
            border-radius: 18px;
            padding: 14px 15px;
            color: var(--ink);
            font: inherit;
            outline: none;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, .72);
            transition: border .16s, box-shadow .16s, background .16s;
        }

        input:focus,
        select:focus,
        textarea:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 5px rgba(79, 70, 229, .15);
            background: #fff;
        }

        input::placeholder {
            color: #94a3b8;
        }

        .btn {
            border: 0;
            border-radius: 18px;
            padding: 14px 16px;
            background: linear-gradient(135deg, var(--primary), var(--cyan));
            color: white;
            font-weight: 1000;
            cursor: pointer;
            box-shadow: 0 18px 36px rgba(79, 70, 229, .26);
            transition: transform .16s, box-shadow .16s, opacity .16s, filter .16s;
        }

        .btn:hover {
            transform: translateY(-2px);
            filter: saturate(1.08);
            box-shadow: 0 22px 44px rgba(79, 70, 229, .32);
        }

        .btn:disabled {
            opacity: .65;
            cursor: not-allowed;
            transform: none;
        }

        .hidden {
            display: none;
        }

        .message {
            margin-top: 14px;
            min-height: 24px;
            font-weight: 900;
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
            color: var(--muted);
            font-size: 13px;
            line-height: 1.5;
        }

        @media (max-width: 880px) {
            body {
                padding: 18px;
                background: linear-gradient(135deg, #111827, #eef2ff);
            }

            .shell {
                grid-template-columns: 1fr;
            }

            .hero {
                min-height: auto;
                padding: 30px;
            }

            .panel {
                padding: 26px;
            }

            .feature-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 520px) {

            .hero,
            .panel {
                border-radius: 28px;
            }

            h1 {
                letter-spacing: -1.6px;
            }
        }
    </style>
</head>

<body>
    <main class="shell">

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
            <p class="hint">Note: login only asks for email and password. Role is read from the secure token returned by
                the API.</p>
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
            const role = readValue(user, ['role', 'Role', 'user_role', 'User_Role', 'UserRole'])
                || readValue(result, ['role', 'Role', 'user_role', 'User_Role', 'UserRole'])
                || readValue(result?.data, ['role', 'Role', 'user_role', 'User_Role', 'UserRole'])
                || readValue(decoded?.data, ['role', 'Role', 'user_role', 'User_Role', 'UserRole'])
                || readValue(decoded, ['role', 'Role', 'user_role', 'User_Role', 'UserRole']);

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
            try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
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
                const result = await requestJson('../auth/login.php', {
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

                localStorage.setItem('examApiSession', JSON.stringify({ token, user: sessionUser }));
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
                await requestJson('../auth/register.php', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: form.get('name'),
                        email: form.get('email'),
                        password: form.get('password'),
                        role: form.get('role'),
                        faculty_id: form.get('faculty_id') || null
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