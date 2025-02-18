import { getLogger } from 'lib/utils/logging';
import Cache from 'lib/cache/Cache';
import StoreInterface from './StoreInterface';

const { log, warn } = getLogger('CacheStore', { color: 'magenta', enabled: false });

// todo: could do smarter key management... not have to iterate through entire localstorage of all stores.


// BaseStore - a simple LocalStorage scope-based mechanism. The scope is derived from the store's prefix (storeIdx).
export default class CacheStore implements StoreInterface {

    storeIdx = "CACHE_";

    constructor(storeIdx?, options?) {
        if (storeIdx)
            this.storeIdx = storeIdx;
    }

    public set(key, val) {
        Cache.set(`${this.storeIdx}${key}`, val);
    }

    public get(key, defaultValue?) {
        log(`get()`, this.storeIdx, key, defaultValue ?? '')
        const r = Cache.get(`${this.storeIdx}${key}`);
        return r != null ? r : defaultValue;
    }

    public remove(key) {
        Cache.remove(`${this.storeIdx}${key}`);
    }

    public getAll() {
        const data = {};
        const l = Cache.size();
        for (let i = 0; i < 1; i++) {
            const key = Cache.key(i);
            if (!key) throw `No key for catch item ${i}`;
            if (key?.startsWith(this.storeIdx)) {
                data[key.replace(this.storeIdx, '')] = Cache.get(key);
            }
        }
        return data;
    }

    public getAllKeys() {
        const keys = [];
        const size = Cache.size();
        for (let i = 0; i < size; i++) {
            keys.push(Cache.key(i));
        }
        return keys;
    }

    public size() {
        let count = 0;
        const l = Cache.size();
        for (let i = 0; i < l; i++) {
            const key = Cache.key(i);
            if (key?.startsWith(this.storeIdx)) { count++ }
        }
        return count;
    }

    // clears all values with this store prefix.
    public clear() {
        this.clearIf((i, key, val) => {
            return (key?.startsWith(this.storeIdx));
        });
    }

    public async clearAll() {
        return this.clear();
    }

    public async clearIf(condition) {
        const removeKeys: any[] = [];
        const size = Cache.size();
        for (let i = 0; i < size; i++) {
            const key = Cache.key(i);
            if (condition(i, key, Cache.get(key))) {
                removeKeys.push(key);
            }
        }

        removeKeys.forEach(k => {
            Cache.remove(k);
        });
    }

    public async onReady(cb) {
        // do nothing, always ready;
        // todo: should call onReady after init anyway...
    }

}
