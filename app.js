let tasks = [];

const list = document.getElementById("taskList");

async function refresh() {
  render(tasks);

  await saveVault(tasks);
}

function render() {
  list.innerHTML = "";

  tasks.forEach((t) => {
    const li = document.createElement("li");

    if (t.completed) li.classList.add("completed");

    li.innerHTML = `
        <span>${t.text}</span>
        <div class="task-actions">
            <button onclick="toggle('${t.id}')">✓</button>
            <button onclick="removeTask('${t.id}')">✕</button>
        </div>
        `;

    list.appendChild(li);
  });
}

function addTask(text) {
  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
    created: Date.now(),
  });

  refresh();
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

document.getElementById("unlockBtn").onclick = async () => {
  const pass = document.getElementById("passwordInput").value;

  await deriveKey(pass);

  await initDB();

  tasks = await loadVault();

  document.getElementById("lockScreen").style.display = "none";

  render();
};
