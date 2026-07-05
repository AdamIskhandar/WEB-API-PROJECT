/**
 * ui.js — small DOM helpers used across the dashboard. No framework.
 */

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c === undefined || c === null) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}

function toast(message, kind = "info") {
  const host = document.getElementById("toast-host") || (() => {
    const h = el("div", { id: "toast-host", class: "toast-host" });
    document.body.appendChild(h);
    return h;
  })();
  const node = el("div", { class: `toast toast--${kind}` }, message);
  host.appendChild(node);
  requestAnimationFrame(() => node.classList.add("show"));
  setTimeout(() => {
    node.classList.remove("show");
    setTimeout(() => node.remove(), 250);
  }, 3200);
}

function openModal({ title, bodyNode, footerNode }) {
  closeModal();
  const overlay = el("div", { class: "modal-overlay", id: "active-modal" });
  const modal = el("div", { class: "modal" }, [
    el("div", { class: "modal__header" }, [
      el("h3", {}, title),
      el("button", { class: "modal__close", type: "button", onclick: closeModal, "aria-label": "Close" }, "×"),
    ]),
    el("div", { class: "modal__body" }, bodyNode),
    footerNode ? el("div", { class: "modal__footer" }, footerNode) : null,
  ]);
  overlay.appendChild(modal);
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.body.appendChild(overlay);
  document.addEventListener("keydown", escCloseHandler);
}

function escCloseHandler(e) {
  if (e.key === "Escape") closeModal();
}

function closeModal() {
  const existing = document.getElementById("active-modal");
  if (existing) existing.remove();
  document.removeEventListener("keydown", escCloseHandler);
}

function confirmDialog(message) {
  return new Promise((resolve) => {
    const footer = el("div", { class: "btn-row" }, [
      el("button", { class: "btn btn--ghost", type: "button", onclick: () => { closeModal(); resolve(false); } }, "Cancel"),
      el("button", { class: "btn btn--danger", type: "button", onclick: () => { closeModal(); resolve(true); } }, "Delete"),
    ]);
    openModal({ title: "Please confirm", bodyNode: el("p", {}, message), footerNode: footer });
  });
}

/** Build a <form> from a field spec array and return {form, getValues}. */
function buildForm(fields, initial = {}) {
  const form = el("form", { class: "form" });
  fields.forEach((f) => {
    const value = initial[f.name] ?? f.default ?? "";
    const fieldWrap = el("div", { class: "field" });
    fieldWrap.appendChild(el("label", { for: `f_${f.name}` }, f.label));

    let input;
    if (f.type === "select") {
      input = el("select", { id: `f_${f.name}`, name: f.name, required: f.required ? "required" : null });
      (f.options || []).forEach((opt) => {
        const optEl = el("option", { value: opt.value }, opt.label);
        if (String(opt.value) === String(value)) optEl.selected = true;
        input.appendChild(optEl);
      });
    } else if (f.type === "textarea") {
      input = el("textarea", { id: `f_${f.name}`, name: f.name, required: f.required ? "required" : null, rows: 3 });
      input.value = value;
    } else {
      input = el("input", {
        id: `f_${f.name}`,
        name: f.name,
        type: f.type || "text",
        step: f.step,
        min: f.min,
        max: f.max,
        required: f.required ? "required" : null,
        placeholder: f.placeholder || "",
      });
      input.value = value;
    }
    fieldWrap.appendChild(input);
    if (f.hint) fieldWrap.appendChild(el("small", { class: "hint" }, f.hint));
    form.appendChild(fieldWrap);
  });

  const getValues = () => {
    const out = {};
    fields.forEach((f) => {
      const input = form.querySelector(`[name="${f.name}"]`);
      let v = input.value;
      if (f.type === "number") v = v === "" ? null : Number(v);
      out[f.name] = v;
    });
    return out;
  };

  return { form, getValues };
}

/** Render an array of row objects as a table using a column spec. */
function renderTable(columns, rows, { onEdit, onDelete, emptyMessage } = {}) {
  const wrap = el("div", { class: "table-wrap" });
  if (!rows || rows.length === 0) {
    wrap.appendChild(el("div", { class: "empty-state" }, emptyMessage || "Nothing here yet."));
    return wrap;
  }

  const table = el("table", { class: "data-table" });
  const thead = el("tr", {}, [
    ...columns.map((c) => el("th", {}, c.label)),
    (onEdit || onDelete) ? el("th", { class: "col-actions" }, "Actions") : null,
  ]);
  table.appendChild(el("thead", {}, thead));

  const tbody = el("tbody");
  rows.forEach((row) => {
    const tds = columns.map((c) => el("td", { "data-label": c.label }, c.render ? c.render(row) : String(row[c.key] ?? "—")));
    if (onEdit || onDelete) {
      const actions = el("div", { class: "row-actions" }, [
        onEdit ? el("button", { class: "btn btn--small btn--ghost", type: "button", onclick: () => onEdit(row) }, "Edit") : null,
        onDelete ? el("button", { class: "btn btn--small btn--danger-ghost", type: "button", onclick: () => onDelete(row) }, "Delete") : null,
      ]);
      tds.push(el("td", { "data-label": "Actions" }, actions));
    }
    tbody.appendChild(el("tr", {}, tds));
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

function setContent(node) {
  const main = document.getElementById("view-root");
  main.innerHTML = "";
  main.appendChild(node);
}

function loadingNode(label = "Loading…") {
  return el("div", { class: "loading" }, [el("span", { class: "spinner" }), label]);
}

function errorNode(message, retry) {
  return el("div", { class: "error-state" }, [
    el("p", {}, `Something went wrong: ${message}`),
    retry ? el("button", { class: "btn btn--ghost", type: "button", onclick: retry }, "Try again") : null,
  ]);
}
