import StoreInterface from './StoreInterface';
import CacheStore from './CacheStore';
import IDbStore from './IDbStore';

export default class IDbOrCacheStore implements StoreInterface {

    // store identifier
    storeId = "BASE_";

    // underlying IDbStore or in-memory CacheStore reference
    store: any = undefined;

    supportsIdb = true;

    constructor(storeId?, options?) {
        if (storeId) this.storeId = storeId;
        const win: any = typeof window == 'undefined' ? {} : window;
        let indexedDB = win.indexedDB || win.mozIndexedDB || win.webkitIndexedDB || win.msIndexedDB;
        if (!indexedDB) {
            this.supportsIdb = false;
            this.store = new CacheStore(this.storeId, options);
        } else {
            this.store = new IDbStore(this.storeId, options);
        }
    }

    public async set(key, val) {
        return await this.store.set(key, val);
    }

    public async get(key, defaultValue?) {
        return await this.store.get(key, defaultValue);
    }

    public async remove(key) {
        return await this.store.remove(key);
    }

    public async getAll() {
        return await this.store.getAll();
    }

    public async getAllKeys() {
        return await this.store.getAllKeys();
    }

    public async size() {
        return await this.store.size();
    }

    public async clear() {
        return await this.store.clearAll();
    }

    public async clearAll() {
        return await this.clear();
    }

    public async clearIf(condition) {
        return await this.store.clearIf(condition);
    }

    public async printAll() {
        let d = await this.getAll();
    }

    public async onReady(cb) {
        this.store.onReady(cb);
    }

}
