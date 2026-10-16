const DB = 'save-qs-workspace';
const open = () => new Promise((resolve,reject) => {
  const request = indexedDB.open(DB,1);
  request.onupgradeneeded = () => request.result.createObjectStore('records');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export async function loadProject() {
  const db = await open();
  return new Promise((resolve,reject) => {
    const transaction = db.transaction('records');
    const request = transaction.objectStore('records').get('project');
    transaction.oncomplete = () => { db.close(); resolve(request.result || null); };
    transaction.onerror = () => { db.close(); reject(transaction.error || request.error); };
    transaction.onabort = () => { db.close(); reject(transaction.error || new Error('Storage read aborted.')); };
  });
}

export async function saveProject(project) {
  const db = await open();
  return new Promise((resolve,reject) => {
    const transaction = db.transaction('records','readwrite');
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error || new Error('Storage write failed.')); };
    transaction.onabort = () => { db.close(); reject(transaction.error || new Error('Storage transaction aborted.')); };
    try { transaction.objectStore('records').put(project,'project'); }
    catch(error) { transaction.abort(); db.close(); reject(error); }
  });
}
