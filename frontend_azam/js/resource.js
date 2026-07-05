/**
 * resource.js
 * A generic "list + filter + create/edit/delete" panel, configured per
 * entity so we don't repeat the same CRUD scaffolding eight times.
 *
 * config = {
 *   title, endpoint, idKey,
 *   columns: [{key,label,render?}],
 *   fields: [...same shape as buildForm expects],
 *   filters: [{name,label,type}],           // rendered as a filter bar
 *   toBody(values, isEdit) -> object          // shape the JSON body per-endpoint quirks
 *   toDeleteBody(row) -> object
 *   canCreate/canEdit/canDelete: bool (default true)
 *   afterLoad(rows) -> rows                    // optional post-processing
 * }
 */
function renderResourcePanel(config) {
  const {
    title,
    endpoint,
    columns,
    fields,
    filters = [],
    toBody,
    toDeleteBody,
    canCreate = true,
    canEdit = true,
    canDelete = true,
    afterLoad,
    emptyMessage,
  } = config;

  const root = el("section", { class: "panel" });
  const header = el("div", { class: "panel__header" }, [
    el("h2", {}, title),
    canCreate
      ? el("button", { class: "btn btn--primary", type: "button", onclick: () => openForm() }, "+ Add")
      : null,
  ]);
  root.appendChild(header);

  // filter bar
  let filterValues = {};
  if (filters.length) {
    const bar = el("div", { class: "filter-bar" });
    filters.forEach((f) => {
      const input = el("input", {
        type: f.type || "text",
        placeholder: f.label,
        oninput: (e) => {
          filterValues[f.name] = e.target.value;
        },
      });
      bar.appendChild(input);
    });
    bar.appendChild(
      el("button", { class: "btn btn--ghost btn--small", type: "button", onclick: () => load() }, "Filter")
    );
    bar.appendChild(
      el("button", {
        class: "btn btn--ghost btn--small",
        type: "button",
        onclick: () => {
          filterValues = {};
          bar.querySelectorAll("input").forEach((i) => (i.value = ""));
          load();
        },
      }, "Clear")
    );
    root.appendChild(bar);
  }

  const body = el("div", {});
  root.appendChild(body);

  async function load() {
    body.innerHTML = "";
    body.appendChild(loadingNode(`Loading ${title.toLowerCase()}…`));
    try {
      let rows = await Api.list(endpoint, filterValues);
      if (rows && !Array.isArray(rows)) rows = [rows]; // single-object responses
      if (afterLoad) rows = afterLoad(rows) || rows;
      body.innerHTML = "";
      body.appendChild(
        renderTable(columns, rows, {
          onEdit: canEdit ? (row) => openForm(row) : null,
          onDelete: canDelete ? (row) => handleDelete(row) : null,
          emptyMessage,
        })
      );
    } catch (e) {
      body.innerHTML = "";
      body.appendChild(errorNode(e.message, load));
    }
  }

  function openForm(row) {
    const isEdit = !!row;
    const { form, getValues } = buildForm(fields, row || {});
    const footer = el("div", { class: "btn-row" }, [
      el("button", { class: "btn btn--ghost", type: "button", onclick: closeModal }, "Cancel"),
      el("button", { class: "btn btn--primary", type: "button" }, isEdit ? "Save changes" : "Create"),
    ]);
    openModal({ title: isEdit ? `Edit ${title.slice(0, -1) || title}` : `New ${title.slice(0, -1) || title}`, bodyNode: form, footerNode: footer });

    const submitBtn = footer.querySelectorAll("button")[1];
    submitBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const values = getValues();
      const payload = toBody ? toBody(values, isEdit, row) : values;
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving…";
      try {
        if (isEdit) {
          await Api.update(endpoint, payload);
          toast("Saved changes.", "success");
        } else {
          await Api.create(endpoint, payload);
          toast("Created successfully.", "success");
        }
        closeModal();
        load();
      } catch (err) {
        toast(err.message || "Request failed.", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = isEdit ? "Save changes" : "Create";
      }
    });
  }

  async function handleDelete(row) {
    const ok = await confirmDialog(`Delete this record? This can't be undone.`);
    if (!ok) return;
    try {
      await Api.remove(endpoint, toDeleteBody ? toDeleteBody(row) : row);
      toast("Deleted.", "success");
      load();
    } catch (err) {
      toast(err.message || "Delete failed.", "error");
    }
  }

  load();
  return root;
}
