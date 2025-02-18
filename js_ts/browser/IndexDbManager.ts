import { APP_ID } from 'env';
import { getLogger } from 'lib/utils/logging';

const { log, warn, error } = getLogger('IndexedDBManager', { color: 'yellow', enabled: false });

export class IndexedDBManager {
    private static dbs: Array<IndexedDBManager> = []; // global DB index

    private db: IDBDatabase | null = null;
    private dbName: string;
    private version: number;
    private stores: { [name: string]: string[] } = {};

    constructor(dbName: string, initialVersion: number = 1) {
        this.dbName = dbName;
        this.version = this.getVersionFromLocalStorage() || initialVersion;
        IndexedDBManager.dbs.push(this);
    }

    // static accessor for clients to retrieve an instance of a DB from anywhere.
    public static getDb(name = APP_ID) {
        let db = IndexedDBManager.dbs.find(d => d.dbName == APP_ID);
        if (!db) db = new IndexedDBManager(APP_ID);
        return db;
    }

    private getVersionFromLocalStorage(): number | null {
        const versionString = localStorage.getItem(`${this.dbName}_version`);
        return versionString ? parseInt(versionString, 10) : null;
    }

    private setVersionInLocalStorage(version: number) {
        localStorage.setItem(`${this.dbName}_version`, version.toString());
    }

    private openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            log(`openDB()`, this.version);
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (event) => {
                error(`openDB() error:`, error);
                // Check if the error is due to version mismatch
                if (event.target?.error?.name === 'VersionError') {
                    this.version++;
                    this.setVersionInLocalStorage(this.version);
                    resolve(this.openDB()); // Recursively try to open with new version
                } else {
                    reject(`Database error: ${event.target?.error}`);
                }
            };

            request.onsuccess = (event) => {
                log(`openDB() onsuccess:`, event);
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve(this.db as IDBDatabase);
            };

            request.onupgradeneeded = (event) => {
                warn(`openDB() onupgradeneeded:`, event);
                this.db = (event.target as IDBOpenDBRequest).result;
                this.upgradeDB(event);
            };
        });
    }

    private upgradeDB(event: IDBVersionChangeEvent) {
        log(`upgradeDB():`, event);
        const db = (event.target as IDBOpenDBRequest).result;
        const newVersion = event.newVersion || this.version;

        for (const [storeName, indexes] of Object.entries(this.stores)) {
            if (!db.objectStoreNames.contains(storeName)) {
                log(`creating new objectStore:`, storeName);
                const objectStore = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });

                for (const index of indexes) {
                    objectStore.createIndex(index, index, { unique: false });
                }
            }
        }

        this.setVersionInLocalStorage(newVersion);
    }

    public addStore(storeName: string, indexNames: string[]) {
        log(`addStore():`, storeName);
        this.stores[storeName] = indexNames;
        // Store is added to the list, but we don't increment version here
    }

    private handleMissingStore(storeName: string): Promise<void> {
        log(`handleMissingStore():`, storeName);
        return new Promise((resolve, reject) => {
            this.version++;
            this.setVersionInLocalStorage(this.version);

            const request = indexedDB.open(this.dbName, this.version);
            request.onupgradeneeded = (event) => {
                warn(`handleMissingStore() onupgradeneeded:`, storeName);
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(storeName)) {
                    const objectStore = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                    if (this.stores[storeName]) {
                        for (const index of this.stores[storeName]) {
                            objectStore.createIndex(index, index, { unique: false });
                        }
                    }
                }
                resolve();
            };
            request.onerror = (event) => reject(`Error creating store: ${event.target?.error}`);
        });
    }

    public async put<T>(storeName: string, value: T): Promise<void> {
        log(`put()`, storeName, value);
        if (!this.db) await this.openDB();

        try {
            const transaction = this.db!.transaction(storeName, 'readwrite');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.put(value);
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve();
                request.onerror = (e) => {
                    log(`put() request error`, storeName, e);
                    if (request.error?.name === 'NotFoundError') {
                        this.handleMissingStore(storeName).then(() => this.put<T>(storeName, value).then(resolve).catch(reject));
                    } else {
                        reject(request.error);
                    }
                };
            });
        } catch (e) {
            log(`put() error`, storeName, value);
            if ((e as DOMException).name === 'NotFoundError') {
                await this.handleMissingStore(storeName);
                return this.put<T>(storeName, value); // Retry the operation
            }
            throw e;
        }
    }

    public async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
        log(`get()`, storeName, key);
        if (!this.db) await this.openDB();

        try {
            const transaction = this.db!.transaction(storeName, 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.get(key);
            return new Promise((resolve) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => {
                    log(`get() request error`, storeName, e);
                    if (request.error?.name === 'NotFoundError') {
                        this.handleMissingStore(storeName).then(() => this.get<T>(storeName, key).then(resolve));
                    }
                };
            });
        } catch (e) {
            log(`get() error`, storeName, e);
            if ((e as DOMException).name === 'NotFoundError') {
                await this.handleMissingStore(storeName);
                return this.get<T>(storeName, key);
            }
            return undefined;
        }
    }

    public closeDB() {
        log(`closeDB()`);
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}