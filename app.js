const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");

const render = (tasks) => {
  list.innerHTML = "";

  tasks.sort((a, b) => b.created - a.created);

  tasks.forEach((t) => {
    const li = document.createElement("li");

    if (t.completed) li.classList.add("completed");

    li.innerHTML = `

<span class="task-text">${t.text}</span>

<div class="task-actions">

<button class="task-btn" onclick="toggle('${t.id}')">✓</button>

<button class="task-btn" onclick="removeTask('${t.id}')">✕</button>

</div>

`;

    list.appendChild(li);
  });
};

const refresh = async () => {
  const tasks = await getTasks();
  render(tasks);
};

const addTask = () => {
  const text = input.value.trim();

  if (!text) return;

  saveTask({
    id: crypto.randomUUID(),

    text,

    completed: false,

    created: Date.now(),
  });

  input.value = "";

  refresh();
};

document.getElementById("addBtn").onclick = addTask;

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

window.toggle = async (id) => {
  const tasks = await getTasks();

  const task = tasks.find((t) => t.id === id);

  task.completed = !task.completed;

  saveTask(task);

  refresh();
};

window.removeTask = (id) => {
  deleteTask(id);

  refresh();
};

initDB().then(refresh);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
