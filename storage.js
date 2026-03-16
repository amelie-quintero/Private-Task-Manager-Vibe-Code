const DB_NAME = "todoDB";
const STORE = "tasks";

let db;

const initDB = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = (e) => {
      db = e.target.result;
      db.createObjectStore(STORE, { keyPath: "id" });
    };

    req.onsuccess = (e) => {
      db = e.target.result;
      resolve();
    };

    req.onerror = reject;
  });

const getTasks = () =>
  new Promise((res) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);

    const req = store.getAll();

    req.onsuccess = () => res(req.result);
  });

const saveTask = (task) => {
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(task);
};

const deleteTask = (id) => {
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(id);
};
