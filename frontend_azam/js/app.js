/**
 * app.js — dashboard shell: navigation, lookups, entity configs, views.
 */

// ---------- guard ----------
if (!Auth.isLoggedIn()) {
  window.location.href = "index.html";
}
const ME = Auth.currentUser(); // { id, email, role }

// ---------- lookup caches (id -> row) ----------
const Lookups = { faculties: [], courses: [], venues: [], users: [] };

async function loadLookups() {
  const jobs = [
    Api.list("/query/faculties.php").then((r) => (Lookups.faculties = r || [])).catch(() => {}),
    Api.list("/query/courses.php").then((r) => (Lookups.courses = r || [])).catch(() => {}),
    Api.list("/query/venues.php").then((r) => (Lookups.venues = r || [])).catch(() => {}),
  ];
  if (ME.role === "Administrator" || ME.role === "Lecturer") {
    jobs.push(Api.list("/query/users.php").then((r) => (Lookups.users = r || [])).catch(() => {}));
  }
  await Promise.all(jobs);
}

const nameOf = {
  faculty: (id) => Lookups.faculties.find((f) => String(f.faculty_id) === String(id))?.faculty_name || `#${id}`,
  course: (id) => {
    const c = Lookups.courses.find((c) => String(c.course_id) === String(id));
    return c ? `${c.course_code} — ${c.course_name}` : `#${id}`;
  },
  courseCode: (id) => Lookups.courses.find((c) => String(c.course_id) === String(id))?.course_code || `#${id}`,
  venue: (id) => Lookups.venues.find((v) => String(v.venue_id) === String(id))?.venue_name || `#${id}`,
  user: (id) => Lookups.users.find((u) => String(u.user_id) === String(id))?.name || `#${id}`,
};

function fmtDate(d) {
  if (!d) return "—";
  return d;
}
function fmtTime(t) {
  if (!t) return "—";
  return t.slice(0, 5);
}

// ================================================================
// Entity configs (each returns a config object for renderResourcePanel)
// ================================================================

function usersConfig() {
  return {
    title: "Users",
    endpoint: "/query/users.php",
    idKey: "user_id",
    filters: [
      { name: "name", label: "Search by name" },
      { name: "role", label: "Role (Administrator/Lecturer/Student)" },
    ],
    columns: [
      { key: "user_id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "faculty_id", label: "Faculty", render: (r) => (r.faculty_id ? nameOf.faculty(r.faculty_id) : "—") },
    ],
    fields: [
      { name: "name", label: "Full name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Password", type: "password", hint: "Leave blank to keep unchanged (edit only)" },
      {
        name: "role",
        label: "Role",
        type: "select",
        required: true,
        options: ["Administrator", "Lecturer", "Student"].map((r) => ({ value: r, label: r })),
      },
      {
        name: "faculty_id",
        label: "Faculty",
        type: "select",
        options: [{ value: "", label: "— none —" }, ...Lookups.faculties.map((f) => ({ value: f.faculty_id, label: f.faculty_name }))],
      },
    ],
    toBody: (v, isEdit, row) => {
      if (isEdit) {
        return { user_id: row.user_id, name: v.name, email: v.email, role: v.role, faculty_id: v.faculty_id || null };
      }
      return { name: v.name, email: v.email, password: v.password, role: v.role, faculty_id: v.faculty_id || null };
    },
    toDeleteBody: (row) => ({ user_id: row.user_id }),
  };
}

function facultiesConfig() {
  return {
    title: "Faculties",
    endpoint: "/query/faculties.php",
    idKey: "faculty_id",
    filters: [{ name: "faculty_name", label: "Search by name" }],
    columns: [
      { key: "faculty_id", label: "ID" },
      { key: "faculty_name", label: "Faculty name" },
    ],
    fields: [{ name: "faculty_name", label: "Faculty name", required: true }],
    toBody: (v, isEdit, row) => (isEdit ? { faculty_id: row.faculty_id, faculty_name: v.faculty_name } : { faculty_name: v.faculty_name }),
    toDeleteBody: (row) => ({ faculty_id: row.faculty_id }),
  };
}

function venuesConfig() {
  return {
    title: "Venues",
    endpoint: "/query/venues.php",
    idKey: "venue_id",
    filters: [
      { name: "Venue_Name", label: "Search by name" },
      { name: "Location", label: "Search by location" },
    ],
    columns: [
      { key: "venue_id", label: "ID" },
      { key: "venue_name", label: "Name" },
      { key: "capacity", label: "Capacity" },
      { key: "location", label: "Location" },
    ],
    fields: [
      { name: "Venue_Name", label: "Venue name", required: true },
      { name: "Capacity", label: "Capacity", type: "number", required: true, min: 1 },
      { name: "Location", label: "Location", required: true },
    ],
    toBody: (v, isEdit, row) =>
      isEdit
        ? { Venue_ID: row.venue_id, Venue_Name: v.Venue_Name, Capacity: v.Capacity, Location: v.Location }
        : { Venue_Name: v.Venue_Name, Capacity: v.Capacity, Location: v.Location },
    toDeleteBody: (row) => ({ Venue_ID: row.venue_id }),
  };
}

function coursesConfig({ readOnlyFilterUserId } = {}) {
  return {
    title: readOnlyFilterUserId ? "My Courses" : "Courses",
    endpoint: "/query/courses.php",
    idKey: "course_id",
    canCreate: !readOnlyFilterUserId,
    canEdit: !readOnlyFilterUserId,
    canDelete: !readOnlyFilterUserId,
    filters: readOnlyFilterUserId
      ? []
      : [
          { name: "course_code", label: "Search by code" },
          { name: "course_name", label: "Search by name" },
        ],
    afterLoad: (rows) => (readOnlyFilterUserId ? rows.filter((r) => String(r.user_id) === String(readOnlyFilterUserId)) : rows),
    columns: [
      { key: "course_code", label: "Code" },
      { key: "course_name", label: "Name" },
      { key: "credit_hours", label: "Credits" },
      { key: "faculty_id", label: "Faculty", render: (r) => nameOf.faculty(r.faculty_id) },
      { key: "user_id", label: "Lecturer", render: (r) => (r.user_id ? nameOf.user(r.user_id) : "—") },
    ],
    fields: [
      { name: "course_code", label: "Course code", required: true, placeholder: "e.g. CS101" },
      { name: "course_name", label: "Course name", required: true },
      { name: "credit_hours", label: "Credit hours (1–6)", type: "number", required: true, min: 1, max: 6 },
      {
        name: "faculty_id",
        label: "Faculty",
        type: "select",
        required: true,
        options: Lookups.faculties.map((f) => ({ value: f.faculty_id, label: f.faculty_name })),
      },
      {
        name: "user_id",
        label: "Lecturer",
        type: "select",
        options: [{ value: "", label: "— unassigned —" }, ...Lookups.users.filter((u) => u.role === "Lecturer").map((u) => ({ value: u.user_id, label: u.name }))],
      },
    ],
    toBody: (v, isEdit, row) => {
      const base = { course_code: v.course_code, course_name: v.course_name, credit_hours: v.credit_hours, faculty_id: v.faculty_id, user_id: v.user_id || null };
      return isEdit ? { ...base, course_id: row.course_id } : base;
    },
    toDeleteBody: (row) => ({ course_id: row.course_id }),
    emptyMessage: readOnlyFilterUserId ? "You are not assigned to any courses yet." : "No courses yet.",
  };
}

function examinationsConfig({ lecturerCourseIds } = {}) {
  const courseOptions = (lecturerCourseIds ? Lookups.courses.filter((c) => lecturerCourseIds.includes(c.course_id)) : Lookups.courses).map((c) => ({
    value: c.course_id,
    label: `${c.course_code} — ${c.course_name}`,
  }));
  return {
    title: "Examinations",
    endpoint: "/query/examinations.php",
    idKey: "exam_id",
    filters: [{ name: "Exam_Date", label: "Filter by date (YYYY-MM-DD)", type: "date" }],
    afterLoad: (rows) => {
      const list = Array.isArray(rows) ? rows : rows?.data || [];
      return lecturerCourseIds ? list.filter((r) => lecturerCourseIds.includes(r.course_id)) : list;
    },
    columns: [
      { key: "course_id", label: "Course", render: (r) => r.Course_Code || nameOf.courseCode(r.course_id) },
      { key: "exam_date", label: "Date", render: (r) => fmtDate(r.exam_date) },
      { key: "start_time", label: "Start", render: (r) => fmtTime(r.start_time) },
      { key: "end_time", label: "End", render: (r) => fmtTime(r.end_time) },
      { key: "venue_id", label: "Venue", render: (r) => r.Venue_Name || nameOf.venue(r.venue_id) },
    ],
    fields: [
      { name: "Course_ID", label: "Course", type: "select", required: true, options: courseOptions },
      {
        name: "Venue_ID",
        label: "Venue",
        type: "select",
        required: true,
        options: Lookups.venues.map((v) => ({ value: v.venue_id, label: `${v.venue_name} (cap. ${v.capacity})` })),
      },
      { name: "Exam_Date", label: "Exam date", type: "date", required: true },
      { name: "Start_Time", label: "Start time", type: "time", required: true },
      { name: "End_Time", label: "End time", type: "time", required: true },
    ],
    toBody: (v, isEdit, row) => {
      const base = {
        Course_ID: v.Course_ID,
        Venue_ID: v.Venue_ID,
        Exam_Date: v.Exam_Date,
        Start_Time: v.Start_Time,
        End_Time: v.End_Time,
      };
      if (isEdit) return { ...base, exam_id: row.exam_id };
      return { ...base, Created_by: ME.id };
    },
    toDeleteBody: (row) => ({ exam_id: row.exam_id }),
    emptyMessage: "No examinations scheduled.",
  };
}

function registrationConfig({ studentSelf } = {}) {
  return {
    title: studentSelf ? "My Registrations" : "Registrations",
    endpoint: "/query/registration.php",
    idKey: "registration_id",
    canCreate: true,
    canEdit: !studentSelf,
    filters: studentSelf ? [] : [{ name: "course_id", label: "Filter by course ID" }],
    afterLoad: (rows) => (studentSelf ? rows.filter((r) => String(r.user_id) === String(ME.id)) : rows),
    columns: [
      ...(studentSelf ? [] : [{ key: "user_id", label: "Student", render: (r) => nameOf.user(r.user_id) }]),
      { key: "course_id", label: "Course", render: (r) => nameOf.course(r.course_id) },
      { key: "registration_date", label: "Registered on" },
    ],
    fields: studentSelf
      ? [
          {
            name: "course_id",
            label: "Course",
            type: "select",
            required: true,
            options: Lookups.courses.map((c) => ({ value: c.course_id, label: `${c.course_code} — ${c.course_name}` })),
          },
        ]
      : [
          {
            name: "user_id",
            label: "Student",
            type: "select",
            required: true,
            options: Lookups.users.filter((u) => u.role === "Student").map((u) => ({ value: u.user_id, label: u.name })),
          },
          {
            name: "course_id",
            label: "Course",
            type: "select",
            required: true,
            options: Lookups.courses.map((c) => ({ value: c.course_id, label: `${c.course_code} — ${c.course_name}` })),
          },
          { name: "registration_date", label: "Registration date", type: "date", required: true },
        ],
    toBody: (v, isEdit, row) => {
      if (studentSelf) return { user_id: ME.id, course_id: v.course_id, registration_date: new Date().toISOString().slice(0, 10) };
      const base = { user_id: v.user_id, course_id: v.course_id, registration_date: v.registration_date };
      return isEdit ? { ...base, registration_id: row.registration_id } : base;
    },
    toDeleteBody: (row) => ({ registration_id: row.registration_id }),
    emptyMessage: studentSelf ? "You haven't registered for any courses yet." : "No registrations yet.",
  };
}

function resultsConfig({ scope } = {}) {
  // scope: undefined = admin (full), "lecturer" = create/edit for own exams, "student" = read only own
  const readOnly = scope === "student";
  return {
    title: scope === "student" ? "My Results" : "Results",
    endpoint: "/query/results.php",
    idKey: "result_id",
    canCreate: !readOnly,
    canEdit: !readOnly,
    canDelete: scope === undefined,
    filters: readOnly ? [] : [{ name: "grade", label: "Filter by grade" }],
    afterLoad: (rows) => {
      if (scope === "student") return rows.filter((r) => String(r.user_id) === String(ME.id));
      return rows;
    },
    columns: [
      ...(readOnly ? [] : [{ key: "user_id", label: "Student", render: (r) => nameOf.user(r.user_id) }]),
      { key: "exam_id", label: "Exam / Course", render: (r) => `Exam #${r.exam_id}` },
      { key: "marks_obtained", label: "Marks" },
      { key: "grade", label: "Grade" },
      { key: "published_at", label: "Published", render: (r) => r.published_at || "Not yet published" },
    ],
    fields: [
      ...(readOnly
        ? []
        : [
            {
              name: "user_id",
              label: "Student",
              type: "select",
              required: true,
              options: Lookups.users.filter((u) => u.role === "Student").map((u) => ({ value: u.user_id, label: u.name })),
            },
            { name: "exam_id", label: "Exam ID", type: "number", required: true, hint: "See the Examinations list for IDs" },
            { name: "marks_obtained", label: "Marks (0–100)", type: "number", step: "0.01", min: 0, max: 100, required: true },
            { name: "grade", label: "Grade", required: true, placeholder: "e.g. A, B+, C" },
            { name: "published_at", label: "Publish date/time", type: "datetime-local" },
          ]),
    ],
    toBody: (v, isEdit, row) => {
      const base = {
        user_id: v.user_id,
        exam_id: v.exam_id,
        marks_obtained: v.marks_obtained,
        grade: v.grade,
        published_at: v.published_at ? v.published_at.replace("T", " ") + ":00" : null,
      };
      return isEdit ? { ...base, result_id: row.result_id } : base;
    },
    toDeleteBody: (row) => ({ result_id: row.result_id }),
    emptyMessage: scope === "student" ? "No results published yet." : "No results recorded yet.",
  };
}

function notificationsConfig({ adminMode } = {}) {
  return {
    title: "Notifications",
    endpoint: "/query/notifications.php",
    idKey: "notification_id",
    canCreate: !!adminMode,
    canDelete: !!adminMode,
    filters: adminMode ? [{ name: "title", label: "Search by title" }] : [],
    afterLoad: (rows) => (adminMode ? rows : rows.filter((r) => String(r.user_id) === String(ME.id))),
    columns: [
      ...(adminMode ? [{ key: "user_id", label: "User", render: (r) => nameOf.user(r.user_id) }] : []),
      { key: "title", label: "Title" },
      { key: "message", label: "Message" },
      { key: "created_at", label: "Received" },
      {
        key: "is_read",
        label: "Status",
        render: (r) => (Number(r.is_read) ? "Read" : "Unread"),
      },
    ],
    fields: adminMode
      ? [
          {
            name: "user_id",
            label: "Recipient",
            type: "select",
            required: true,
            options: Lookups.users.map((u) => ({ value: u.user_id, label: u.name })),
          },
          { name: "title", label: "Title", required: true },
          { name: "message", label: "Message", type: "textarea", required: true },
          {
            name: "is_read",
            label: "Status",
            type: "select",
            options: [
              { value: 0, label: "Unread" },
              { value: 1, label: "Read" },
            ],
          },
        ]
      : [
          {
            name: "is_read",
            label: "Status",
            type: "select",
            options: [
              { value: 0, label: "Unread" },
              { value: 1, label: "Read" },
            ],
          },
        ],
    toBody: (v, isEdit, row) => {
      if (!adminMode) {
        return { user_id: row.user_id, title: row.title, message: row.message, is_read: Number(v.is_read), notification_id: row.notification_id };
      }
      const base = { user_id: v.user_id, title: v.title, message: v.message, is_read: Number(v.is_read) || 0 };
      return isEdit ? { ...base, notification_id: row.notification_id } : base;
    },
    toDeleteBody: (row) => ({ notification_id: row.notification_id }),
    emptyMessage: "No notifications.",
  };
}

// ================================================================
// Custom (non-CRUD) views
// ================================================================

async function renderOverview() {
  const root = el("section", { class: "panel" });
  root.appendChild(el("h2", {}, `Welcome back, ${ME.email.split("@")[0]}`));
  root.appendChild(el("p", { class: "muted" }, `Role: ${ME.role}`));

  const grid = el("div", { class: "stat-grid" }, [loadingNode("Gathering your stats…")]);
  root.appendChild(grid);
  setContent(root);

  try {
    const stats = [];
    if (ME.role === "Administrator") {
      const [users, courses, exams, venues] = await Promise.all([
        Api.list("/query/users.php"),
        Api.list("/query/courses.php"),
        Api.list("/query/examinations.php"),
        Api.list("/query/venues.php"),
      ]);
      stats.push(["Users", users.length], ["Courses", courses.length], ["Examinations", (exams.data || exams).length], ["Venues", venues.length]);
    } else if (ME.role === "Lecturer") {
      const courses = await Api.list("/query/courses.php", { user_id: ME.id });
      stats.push(["My courses", courses.length]);
    } else {
      const [regs, results] = await Promise.all([
        Api.list("/query/registration.php", { user_id: ME.id }),
        Api.list("/query/results.php", { user_id: ME.id }),
      ]);
      stats.push(["Courses registered", regs.length], ["Results published", results.length]);
    }
    grid.innerHTML = "";
    stats.forEach(([label, value]) => {
      grid.appendChild(
        el("div", { class: "stat-card" }, [el("div", { class: "stat-card__value" }, String(value)), el("div", { class: "stat-card__label" }, label)])
      );
    });
  } catch (e) {
    grid.innerHTML = "";
    grid.appendChild(errorNode(e.message, renderOverview));
  }
  return null; // already set content directly
}

async function renderMyExamsStudent() {
  const root = el("section", { class: "panel" });
  root.appendChild(el("h2", {}, "My Exams"));
  const body = el("div", {}, loadingNode("Loading your exam schedule…"));
  root.appendChild(body);
  try {
    const regs = await Api.list("/query/registration.php", { user_id: ME.id });
    const courseIds = regs.map((r) => r.course_id);
    const allExams = await Api.list("/query/examinations.php");
    const list = (allExams.data || allExams).filter((e) => courseIds.includes(e.course_id));
    body.innerHTML = "";
    body.appendChild(
      renderTable(
        [
          { key: "course_id", label: "Course", render: (r) => r.Course_Code || nameOf.courseCode(r.course_id) },
          { key: "exam_date", label: "Date", render: (r) => fmtDate(r.exam_date) },
          { key: "start_time", label: "Start", render: (r) => fmtTime(r.start_time) },
          { key: "end_time", label: "End", render: (r) => fmtTime(r.end_time) },
          { key: "venue_id", label: "Venue", render: (r) => r.Venue_Name || nameOf.venue(r.venue_id) },
        ],
        list,
        { emptyMessage: "No upcoming exams — register for a course first." }
      )
    );
  } catch (e) {
    body.innerHTML = "";
    body.appendChild(errorNode(e.message, () => navigate("my-exams")));
  }
  return root;
}

async function renderSearchView() {
  const root = el("section", { class: "panel" });
  root.appendChild(el("h2", {}, "Search"));

  const moduleOptions = ["all", "users", "courses", "faculties", "examinations", "venues", "notifications"];
  const bar = el("div", { class: "filter-bar" });
  const input = el("input", { type: "text", placeholder: "Search keyword…" });
  const select = el(
    "select",
    {},
    moduleOptions.map((m) => el("option", { value: m }, m))
  );
  const resultsWrap = el("div", { class: "search-results" });
  bar.appendChild(input);
  bar.appendChild(select);
  bar.appendChild(
    el("button", { class: "btn btn--primary btn--small", type: "button", onclick: runSearch }, "Search")
  );
  input.addEventListener("keydown", (e) => e.key === "Enter" && runSearch());
  root.appendChild(bar);
  root.appendChild(resultsWrap);

  async function runSearch() {
    if (!input.value.trim()) {
      resultsWrap.innerHTML = "";
      resultsWrap.appendChild(el("p", { class: "muted" }, "Type a keyword to search."));
      return;
    }
    resultsWrap.innerHTML = "";
    resultsWrap.appendChild(loadingNode("Searching…"));
    try {
      const res = await Api.search(input.value.trim(), select.value, 20);
      resultsWrap.innerHTML = "";
      if (res.status === "error") {
        resultsWrap.appendChild(errorNode(res.message));
        return;
      }
      Object.entries(res.results).forEach(([moduleName, rows]) => {
        resultsWrap.appendChild(el("h3", { class: "search-group-title" }, `${moduleName} (${rows.length})`));
        if (!rows.length) {
          resultsWrap.appendChild(el("p", { class: "muted" }, "No matches."));
          return;
        }
        const cols = Object.keys(rows[0]).map((k) => ({ key: k, label: k }));
        resultsWrap.appendChild(renderTable(cols, rows));
      });
    } catch (e) {
      resultsWrap.innerHTML = "";
      resultsWrap.appendChild(errorNode(e.message, runSearch));
    }
  }

  return root;
}

async function renderQrView() {
  const root = el("section", { class: "panel" });
  root.appendChild(el("h2", {}, "Exam Slip QR Generator"));
  root.appendChild(el("p", { class: "muted" }, "Generate a scannable admission slip for an exam."));

  const isStudent = ME.role === "Student";
  const fields = [
    ...(isStudent
      ? []
      : [
          {
            name: "studentId",
            label: "Student",
            type: "select",
            required: true,
            options: Lookups.users.filter((u) => u.role === "Student").map((u) => ({ value: u.user_id, label: u.name })),
          },
        ]),
    { name: "examId", label: "Exam ID", type: "number", required: true },
    { name: "course", label: "Course code", required: true, placeholder: "e.g. CS101" },
    { name: "date", label: "Exam date", type: "date", required: true },
  ];
  const { form, getValues } = buildForm(fields);
  const btn = el("button", { class: "btn btn--primary", type: "submit" }, "Generate QR code");
  form.appendChild(btn);
  const output = el("div", { class: "qr-output" });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Generating…";
    try {
      const v = getValues();
      const studentId = isStudent ? ME.id : v.studentId;
      const res = await Api.generateQr({ examId: v.examId, studentId, course: v.course, date: v.date });
      output.innerHTML = "";
      output.appendChild(el("img", { src: res.qr_code_url, alt: "Exam slip QR code", class: "qr-image" }));
      output.appendChild(el("p", { class: "muted" }, "Scan this at the exam hall entrance."));
    } catch (err) {
      toast(err.message || "Could not generate QR code.", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Generate QR code";
    }
  });

  root.appendChild(form);
  root.appendChild(output);
  return root;
}

// ================================================================
// Navigation / shell
// ================================================================

function navConfig() {
  if (ME.role === "Administrator") {
    return [
      { key: "overview", label: "Overview", icon: "◆", render: renderOverview },
      { key: "users", label: "Users", icon: "◇", render: () => renderResourcePanel(usersConfig()) },
      { key: "faculties", label: "Faculties", icon: "◇", render: () => renderResourcePanel(facultiesConfig()) },
      { key: "courses", label: "Courses", icon: "◇", render: () => renderResourcePanel(coursesConfig()) },
      { key: "venues", label: "Venues", icon: "◇", render: () => renderResourcePanel(venuesConfig()) },
      { key: "examinations", label: "Examinations", icon: "◇", render: () => renderResourcePanel(examinationsConfig({})) },
      { key: "registrations", label: "Registrations", icon: "◇", render: () => renderResourcePanel(registrationConfig({})) },
      { key: "results", label: "Results", icon: "◇", render: () => renderResourcePanel(resultsConfig({})) },
      { key: "notifications", label: "Notifications", icon: "◇", render: () => renderResourcePanel(notificationsConfig({ adminMode: true })) },
      { key: "search", label: "Search", icon: "◈", render: renderSearchView },
      { key: "qr", label: "QR Generator", icon: "◈", render: renderQrView },
    ];
  }
  if (ME.role === "Lecturer") {
    const myCourseIds = Lookups.courses.filter((c) => String(c.user_id) === String(ME.id)).map((c) => c.course_id);
    return [
      { key: "overview", label: "Overview", icon: "◆", render: renderOverview },
      { key: "my-courses", label: "My Courses", icon: "◇", render: () => renderResourcePanel(coursesConfig({ readOnlyFilterUserId: ME.id })) },
      { key: "examinations", label: "Examinations", icon: "◇", render: () => renderResourcePanel(examinationsConfig({ lecturerCourseIds: myCourseIds })) },
      { key: "results", label: "Results", icon: "◇", render: () => renderResourcePanel(resultsConfig({ scope: "lecturer" })) },
      { key: "notifications", label: "Notifications", icon: "◇", render: () => renderResourcePanel(notificationsConfig({})) },
      { key: "search", label: "Search", icon: "◈", render: renderSearchView },
      { key: "qr", label: "QR Generator", icon: "◈", render: renderQrView },
    ];
  }
  // Student
  return [
    { key: "overview", label: "Overview", icon: "◆", render: renderOverview },
    { key: "my-registrations", label: "My Registrations", icon: "◇", render: () => renderResourcePanel(registrationConfig({ studentSelf: true })) },
    { key: "my-exams", label: "My Exams", icon: "◇", render: renderMyExamsStudent },
    { key: "my-results", label: "My Results", icon: "◇", render: () => renderResourcePanel(resultsConfig({ scope: "student" })) },
    { key: "notifications", label: "Notifications", icon: "◇", render: () => renderResourcePanel(notificationsConfig({})) },
    { key: "search", label: "Search", icon: "◈", render: renderSearchView },
    { key: "qr", label: "QR Generator", icon: "◈", render: renderQrView },
  ];
}

let NAV = [];

async function navigate(key) {
  const item = NAV.find((n) => n.key === key) || NAV[0];
  document.querySelectorAll(".nav-link").forEach((n) => n.classList.toggle("active", n.dataset.key === item.key));
  location.hash = "#/" + item.key;
  const main = document.getElementById("view-root");
  main.innerHTML = "";
  main.appendChild(loadingNode());
  try {
    const node = await item.render();
    if (node) setContent(node);
  } catch (e) {
    setContent(errorNode(e.message, () => navigate(key)));
  }
}

function buildShell() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const sidebar = el("aside", { class: "sidebar" }, [
    el("div", { class: "brand" }, [el("span", { class: "brand__mark" }, "◆"), el("span", { class: "brand__text" }, "Examination Ledger")]),
    el(
      "nav",
      { class: "nav" },
      NAV.map((item) =>
        el(
          "a",
          { href: `#/${item.key}`, class: "nav-link", "data-key": item.key, onclick: (e) => { e.preventDefault(); navigate(item.key); } },
          [el("span", { class: "nav-link__icon" }, item.icon), el("span", {}, item.label)]
        )
      )
    ),
    el("div", { class: "sidebar__footer" }, [
      el("div", { class: "who" }, [el("div", { class: "who__email" }, ME.email), el("div", { class: "who__role" }, ME.role)]),
      el("button", { class: "btn btn--ghost btn--small", type: "button", onclick: () => Auth.logout() }, "Log out"),
    ]),
  ]);

  const main = el("main", { class: "main" }, [
    el("div", { class: "view-root", id: "view-root" }, loadingNode("Loading dashboard…")),
  ]);

  app.appendChild(sidebar);
  app.appendChild(main);
}

async function initDashboard() {
  await loadLookups();
  NAV = navConfig();
  buildShell();
  const initialKey = (location.hash || "").replace("#/", "") || NAV[0].key;
  navigate(NAV.some((n) => n.key === initialKey) ? initialKey : NAV[0].key);
}

initDashboard();
