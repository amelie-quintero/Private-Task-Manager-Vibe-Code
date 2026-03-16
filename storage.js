const DB = "todoDB";
const STORE = "vault";

let db;

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 2);

    req.onupgradeneeded = (e) => {
      db = e.target.result;

      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };

    req.onsuccess = (e) => {
      db = e.target.result;
      resolve();
    };

    req.onerror = reject;
  });
}

async function saveVault(data) {
  const encrypted = await encrypt(data);

  const tx = db.transaction(STORE, "readwrite");

  tx.objectStore(STORE).put({
    id: "tasks",
    payload: encrypted,
  });
}

async function loadVault() {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly");

    const req = tx.objectStore(STORE).get("tasks");

    req.onsuccess = async () => {
      if (!req.result) return resolve([]);

      const decrypted = await decrypt(req.result.payload);

      resolve(decrypted);
    };
  });
}

function vaultExists() {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly");

    const req = tx.objectStore(STORE).get("tasks");

    req.onsuccess = () => {
      resolve(!!req.result);
    };
  });
}
