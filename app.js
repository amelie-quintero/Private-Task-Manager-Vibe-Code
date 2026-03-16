let tasks = [];

const list = document.getElementById("taskList");

if ("Notification" in window) {
  Notification.requestPermission();
}

async function refresh() {
  render(tasks);

  await saveVault(tasks);
}

function render() {
  list.innerHTML = "";

  let filtered = tasks;

  if (currentSearch) {
    filtered = tasks.filter(
      (t) =>
        t.text.toLowerCase().includes(currentSearch) ||
        t.tags.join(" ").toLowerCase().includes(currentSearch),
    );
  }

  filtered.forEach((t) => renderTask(t));
}

function renderTask(t) {
  const li = document.createElement("li");

  if (t.completed) li.classList.add("completed");

  const tagsHTML = t.tags
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join("");

  const dueHTML = t.due ? `<span class="due">${t.due}</span>` : "";

  li.innerHTML = `
    <div class="task-left">
      <span class="task-text">${t.text}</span>
      <div class="task-meta">
        ${dueHTML}
        ${tagsHTML}
      </div>
    </div>
    <div class="task-actions">
      <button onclick="toggle('${t.id}')">✓</button>
      <button onclick="removeTask('${t.id}')">✕</button>
    </div>
    `;

  list.appendChild(li);
}

document.getElementById("addTaskBtn").onclick = () => {
  const text = taskInput.value.trim();

  if (!text) return;

  const due = dueDateInput.value || null;

  const tags = tagInput.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  addTask(text, due, tags);

  taskInput.value = "";
  tagInput.value = "";
  dueDateInput.value = "";
};

function addTask(text, dueDate, tags) {
  tasks.unshift({
    id: crypto.randomUUID(),
    text: text,
    completed: false,
    created: Date.now(),
    due: dueDate || null,
    tags: tags || [],
    reminder: null,
  });

  refresh();
}

function scheduleReminder(task) {
  if (!task.reminder) return;

  const delay = new Date(task.reminder).getTime() - Date.now();

  if (delay <= 0) return;

  setTimeout(() => {
    new Notification("Task Reminder", {
      body: task.text,
    });
  }, delay);
}

document.getElementById("taskInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask(e.target.value);

    e.target.value = "";
  }
});

window.toggle = (id) => {
  const t = tasks.find((x) => x.id === id);

  t.completed = !t.completed;

  refresh();
};

window.removeTask = (id) => {
  tasks = tasks.filter((t) => t.id !== id);

  refresh();
};

let firstRun = false;

const title = document.getElementById("lockTitle");
const confirmInput = document.getElementById("passwordConfirm");
const hint = document.getElementById("lockHint");
const passwordInput = document.getElementById("passwordInput");

async function startApp() {
  await initDB();
  const exists = await vaultExists();
  if (!exists) {
    firstRun = true;

    title.innerText = "Create Passphrase";

    confirmInput.style.display = "block";

    hint.innerText = "Set a password to protect your tasks";
  }
}

startApp();

document.getElementById("unlockBtn").onclick = async () => {
  const pass = passwordInput.value;
  const confirm = confirmInput.value;

  if (!pass) {
    hint.innerText = "Enter a passphrase";
    return;
  }

  await deriveKey(pass);

  if (firstRun) {
    if (pass !== confirm) {
      hint.innerText = "Passwords do not match";
      return;
    }

    tasks = [];

    await saveVault(tasks);

    document.getElementById("lockScreen").style.display = "none";

    render();

    return;
  }

  try {
    tasks = await loadVault();

    tasks.forEach(scheduleReminder);
    document.getElementById("lockScreen").style.display = "none";

    render();
  } catch (e) {
    hint.innerText = "Incorrect password";
  }
};

async function resetVault() {
  const confirmReset = confirm(
    "This will permanently delete all encrypted tasks. Continue?",
  );

  if (!confirmReset) return;

  await indexedDB.deleteDatabase("todoDB");

  location.reload();
}

document.getElementById("resetVaultUnlock").onclick = resetVault;

document.getElementById("resetVaultMain").onclick = resetVault;

const searchInput = document.getElementById("searchInput");

let currentSearch = "";

searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value.toLowerCase();

  render();
});
