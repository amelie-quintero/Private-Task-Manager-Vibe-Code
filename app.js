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
