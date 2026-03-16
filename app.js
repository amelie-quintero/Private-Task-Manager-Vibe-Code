const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");

const render = (tasks) => {
  list.innerHTML = "";

  tasks.forEach((t) => {
    const li = document.createElement("li");

    if (t.completed) li.classList.add("completed");

    li.innerHTML = `
<span>${t.text}</span>
<div>
<button onclick="toggle('${t.id}')">✓</button>
<button onclick="remove('${t.id}')">✕</button>
</div>
`;

    list.appendChild(li);
  });
};

const refresh = async () => {
  const tasks = await getTasks();
  render(tasks);
};

document.getElementById("addBtn").onclick = () => {
  if (!input.value) return;

  saveTask({
    id: crypto.randomUUID(),
    text: input.value,
    completed: false,
    created: Date.now(),
  });

  input.value = "";
  refresh();
};

window.toggle = async (id) => {
  const tasks = await getTasks();
  const task = tasks.find((t) => t.id === id);

  task.completed = !task.completed;

  saveTask(task);
  refresh();
};

window.remove = (id) => {
  deleteTask(id);
  refresh();
};

initDB().then(refresh);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
