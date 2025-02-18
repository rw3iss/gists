/* Usage:

this.db = new IDB();
this.db.open(DBNAME);
this.db.newStore(DBNAME, { autoIncrement: true }, [
    { name: 'id', key: 'id', params: { unique: true } },
    { name: 'word, language', key: [ 'word', 'language' ], params: { unique: true } },
]);

// get:
let existing = await this.db.get(DBNAME, 'word, language', [word.word, word.language]);

// insert:
let o = await this.db.insert(DBNAME, word);

*/

import { getLogger } from "lib/utils/logging";
const { log, warn } = getLogger('idb', { color: 'green', enabled: false });

// todo: queue all operations (such as clear, and delete) and execute when initialized/onupgradeneeded
// todo: wrap all in try/catch

// this number must be increased for new DB changes to take effect and register themselves on existing clients.
const DB_VERSION = parseInt(process.env.IDB_VERSION || '1');

const win: any = typeof window == 'undefined' ? {} : window;

class IDb {

    isLoading = false;
    isOpen = false;         // if it's ready
    isReady = false;        // if its open and ready (upgrades complete)
    isInitialized = false   // if the stores have been instantiated
    db: any = undefined;    // underlying opened DB instance
    _storeDefs = [];        // the user-registered pending definitions
    stores = {};            // the instantiated stores
    readyListeners = [];

    constructor() {
        let indexedDB = win.indexedDB || win.mozIndexedDB || win.webkitIndexedDB || win.msIndexedDB;
        if (!indexedDB) {
            if (typeof window != 'undefined') {
                console.log(`window`, window, typeof window);
                throw "Your browser doesn't support a stable version of IndexedDB.";
            }
            return;
        }
        let IDBTransaction = win.IDBTransaction || win.webkitIDBTransaction || win.msIDBTransaction || { READ_WRITE: "readwrite" };
        let IDBKeyRange = win.IDBKeyRange || win.webkitIDBKeyRange || win.msIDBKeyRange;
        Object.defineProperty(window, 'IDBTransaction', { value: IDBTransaction });
        Object.defineProperty(window, 'IDBKeyRange', { value: IDBKeyRange });
    }

    async open(dbName) {
        return new Promise((resolve, reject) => {
            try {
                let indexedDB: IDBFactory = win.indexedDB || win.mozIndexedDB || win.webkitIndexedDB || win.msIndexedDB;
                if (!indexedDB) {
                    if (typeof window != 'undefined') {
                        console.log(`window`, window, typeof window);
                        throw "Your browser doesn't support a stable version of IndexedDB.";
                    }
                    return;
                }
                log('open() - version:', DB_VERSION)
                this.isLoading = true;
                var request = indexedDB.open(dbName, DB_VERSION);

                // create stores after upgrade/ready
                request.onupgradeneeded = (e: any) => {
                    this.db = e.target.result;
                    warn('onupgradeneeded() !', e.target)
                    this.isOpen = true;
                    this.initializeStores();
                };

                // handle operations after success
                request.onsuccess = (e: any) => {
                    log('onsuccess() - opened and ready.')
                    this.db = e.target.result;
                    this.isOpen = true;
                    this.isReady = true;
                    //if (!this.isInitialized) this.initializeStores();
                    this.execQueuedCommands();
                    this.emitReady();
                    this.isLoading = false;
                    resolve(true);
                };

                request.onerror = (e: any) => {
                    console.error('IDB open error! ', e.target.error)
                    this.isOpen = false;
                    this.isLoading = false;
                    reject(e);
                };
            } catch (e) {
                this.isLoading = false;
                reject(e);
            }
        });
    }

    onReady = (cb) => {
        this.readyListeners.push(cb);
    }

    emitReady = () => {
        this.readyListeners.forEach(l => l());
    }

    execQueuedCommands() {
        // todo:
    }

    get(storeName, key, index?) {
        return new Promise((resolve, reject) => {
            if (this.isReady) {
                try {
                    const txn = this.db.transaction(storeName, "readwrite"); //IDBTransaction.READ_WRITE);
                    const q = index ?
                        txn.objectStore(storeName).index(index).get(key) :
                        txn.objectStore(storeName).get(key);

                    q.onsuccess = function (e) {
                        return resolve(q.result);
                    };

                    q.onerror = function (e) {
                        console.error('Error getting IDB store item:', storeName, key, e)
                        return reject(e);
                    };

                    q.oncomplete = function (e) { };
                } catch (e) {
                    console.error('IDB get exception!', storeName, key, e)
                    return reject(e);
                }
            } else {
                return resolve(undefined);
            }
        });
    }

    getAll(storeName) {
        log('getAll', storeName);
        return new Promise((resolve, reject) => {
            if (this.isReady) {
                try {
                    const txn = this.db.transaction(storeName, "readwrite"); //IDBTransaction.READ_WRITE);
                    const q = txn.objectStore(storeName).getAll();

                    q.onsuccess = function (e) {
                        return resolve(q.result);
                    };

                    q.onerror = function (e) {
                        return reject(e);
                    };

                    q.oncomplete = function (e) { };
                } catch (e) {
                    console.error('IDB getAll exception!', storeName, e)
                    return reject(e);
                }
            } else {
                return resolve(undefined);
            }
        });
    }

    getAllKeys(storeName) {
        return new Promise((resolve, reject) => {
            if (this.isReady) {
                const txn = this.db.transaction(storeName, "readwrite"); //IDBTransaction.READ_WRITE);
                const q = txn.objectStore(storeName).getAllKeys();

                q.onsuccess = function (e) {
                    return resolve(q.result);
                };

                q.onerror = function (e) {
                    return reject(e);
                };

                q.oncomplete = function (e) { };
            } else {
                return resolve(undefined);
            }
        });
    }

    set(storeName, key, object) {
        log('set()', storeName, key, object);
        return new Promise((resolve, reject) => {
            if (this.isReady && key) {
                try {
                    const txn = this.db.transaction(storeName, "readwrite"); //IDBTransaction.READ_WRITE);
                    let q = txn.objectStore(storeName).put(object, key);

                    q.onsuccess = function (e) {
                        return resolve(e.target.result);
                    };

                    q.onerror = function (e) {
                        console.error('Error setting IDB store item:', storeName, object, key, e)
                        return reject(e);
                    }
                } catch (e) {
                    console.error('IDB.put() exception!', storeName, key, object, e)
                    return reject(e);
                }
            } else {
                return resolve(undefined);
            }
        });
    }

    update(storeName, key, object) {
        return new Promise((resolve, reject) => {
            if (this.isReady) {
                try {
                    const txn = this.db.transaction(storeName, "readwrite"); //IDBTransaction.READ_WRITE);
                    const q = txn.objectStore(storeName).put(object, key);

                    q.onsuccess = function (event) {
                        return resolve(object);
                    };

                    txn.onerror = function (event) {
                        return reject(event);
                    }

                    q.oncomplete = function () {
                    };
                } catch (e) {
                    console.error('IDB update exception!', storeName, key, object, e)
                    return reject(e);
                }
            } else {
                return resolve(undefined)
            }
        });
    }

    delete(storeName, key) {
        if (this.isInitialized) {
            var request = this.db.transaction([storeName], "readwrite")
                .objectStore(storeName)
                .delete(key);
        }
    }

    clearAll(storeName) {
        if (this.isInitialized) {
            var t = this.db.transaction([storeName], "readwrite")
                .objectStore(storeName)
                .clear();
        }
    }

    clearIf(storeName, condition) {
        if (this.isReady) {
            const txn = this.db.transaction([storeName], "readwrite");
            let store = txn.objectStore(storeName);

            if (store) {
                let removeKeys: any[] = [];
                let t = store.getAllKeys();

                t.onsuccess = async (r) => {
                    if (t.result) {
                        let allKeys = t.result;

                        for (let i = 0; i < allKeys.length; i++) {
                            let key = allKeys[i];
                            if (condition(i, key, await this.get(storeName, key))) {
                                removeKeys.push(key);
                            }
                        }

                        removeKeys.forEach(k => {
                            this.delete(storeName, k);
                        });
                    }
                };

            }
        }
    }

    size(storeName) {
        if (this.isInitialized) {
            var request = this.db.transaction([storeName], "readwrite")
                .objectStore(storeName)
                .count();
            return request.result;
        }
    }

    // registers a new store to be created.
    // todo:  this should return a store with an interface... ?
    newStore(storeName, options?) {
        log('newStore()', storeName);
        if (this._storeDefs.find(s => s.name == storeName))
            throw "This store definition exists already: " + storeName;
        this._storeDefs.push({ name: storeName, options });
        // if system is already initialized, register the store now:
        if (this.isInitialized) {
            console.log(`Idb initialized for store.`, storeName)
            return this.createStore(storeName, options);
        }
    }

    // creates the registered stores when DB is ready.
    initializeStores() {
        log('initializeStores()');
        if (!this.isInitialized) {
            //console.log('Initializing IDB stores...',);
            this._storeDefs.forEach(s => {
                this.createStore(s.name, s.options);
            });
            this.isInitialized = true;
        } else {
            console.warn('(IDB already initialized?)')
        }
    }

    // Instantiates a new store with IndexedDB. Assumes the DB is ready.
    private async createStore(storeName, options) {
        log('createStore()', storeName, options);
        let store;
        if (this.isOpen) {
            try {
                // check if store exists already
                //if (this.isReady) {
                log('createStore() open:', storeName);
                // query if store exists
                if (this.db.objectStoreNames.contains(storeName)) {
                    console.log(`store exists.`)
                    const txn = this.db.transaction(storeName, "readwrite");
                    store = txn.objectStore(storeName);
                }

                if (!store) {
                    log('store doesnt exist.', storeName, options)
                    store = await this.db.createObjectStore(storeName);//, options);
                    if (options?.indexes && options?.indexes.length) {
                        options.indexes.map(i => store.createIndex(i.name, i.key, i.params));
                    }

                    this.stores[storeName] = store;
                }
                // } else {
                //     log(`db not ready for store`, storeName);
                // }
            } catch (e) {
                console.error('createStore() error', e);
            }
        }
        return store;
    }

}

const IDB = new IDb();

//idb.open(process.env.IDB_NAME || 'app_db');

export default IDB;