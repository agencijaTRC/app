const STORAGE_KEY = "mini-task-tracker:v1";

const els = {
  form: document.getElementById("taskForm"),
  input: document.getElementById("taskInput"),
  list: document.getElementById("taskList"),
  stats: document.getElementById("stats"),
  clearDone: document.getElementById("clearDone"),
  seed: document.getElementById("seed"),
  filterButtons: Array.from(document.querySelectorAll(".chip")),
};

let state = {
  tasks: loadTasks(),
  filter: "all", // all | active | done
};

// ---------- Storage ----------
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

// ---------- Helpers ----------
function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function setFilter(nextFilter) {
  state.filter = nextFilter;
  els.filterButtons.forEach((b) => {
    b.classList.toggle("active", b.dataset.filter === nextFilter);
  });
  render();
}

function filteredTasks() {
  if (state.filter === "active") return state.tasks.filter((t) => !t.done);
  if (state.filter === "done") return state.tasks.filter((t) => t.done);
  return state.tasks;
}

// ---------- Actions ----------
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  state.tasks.unshift({ id: uid(), text: trimmed, done: false, createdAt: Date.now() });
  saveTasks();
  render();
}

function toggleTask(id) {
  const t = state.tasks.find((x) => x.id === id);
  if (!t) return;
  t.done = !t.done;
  saveTasks();
  render();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function clearDone() {
  state.tasks = state.tasks.filter((t) => !t.done);
  saveTasks();
  render();
}

function seedDemo() {
  const demo = [
    "Push repo to GitHub",
    "Open index.html in browser",
    "Add a task",
    "Mark it done ✅",
  ];
  demo.reverse().forEach((txt) => addTask(txt));
}

// ---------- Render ----------
function render() {
  const tasks = filteredTasks();
  els.list.innerHTML = "";

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "item" + (task.done ? " done" : "");
    li.dataset.id = task.id;

    const check = document.createElement("button");
    check.className = "check";
    check.type = "button";
    check.setAttribute("aria-label", task.done ? "Mark as not done" : "Mark as done");
    check.textContent = task.done ? "✓" : "";

    const text = document.createElement("div");
    text.className = "text";
    text.textContent = task.text;

    const del = document.createElement("button");
    del.className = "iconbtn";
    del.type = "button";
    del.setAttribute("aria-label", "Delete task");
    del.textContent = "Delete";

    check.addEventListener("click", () => toggleTask(task.id));
    del.addEventListener("click", () => deleteTask(task.id));

    li.appendChild(check);
    li.appendChild(text);
    li.appendChild(del);
    els.list.appendChild(li);
  }

  const total = state.tasks.length;
  const done = state.tasks.filter((t) => t.done).length;
  els.stats.textContent =
    total === 0 ? "0 tasks" : `${total} task${total === 1 ? "" : "s"} • ${done} done`;
}

// ---------- Events ----------
els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(els.input.value);
  els.input.value = "";
  els.input.focus();
});

els.clearDone.addEventListener("click", clearDone);
els.seed.addEventListener("click", seedDemo);

els.filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

// Initial render
render();
