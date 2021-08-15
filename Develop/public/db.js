const indexedDB = window.indexedDB
let db;
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
    db = target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    consol.log("Not Correct" + event.target.errorCode);

};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const save = transaction.objectStore("pending");
    save.add(record);
}
//Funciton to gech the database (with in get all.onsuccess with if then)
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const save = transaction.objectStore("pending");
    const getAll = save.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    "Content-Type": "application/json"
                }
            })
                .then(response => { return responce.json(); })
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const save = transaction.objectStore("pending");
                    save.clear();
                });
        }
    };
}
window.addEventListener("online", checkDatabase);
