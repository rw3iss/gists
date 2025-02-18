import storage from 'better-local-storage-fallback';
import { tryJsonParse, tryJsonStringify } from 'lib/utils/ObjectUtils';
import { getLogger } from 'lib/utils/logging';

const { log, warn } = getLogger('Cache', { color: 'magenta', enabled: false });

log(`storage`, storage);

export default class Cache {

    static get(id) {
        // Look in local storage for object
        const key = id; // this._getClassTypeName(id);
        const str = storage.getItem(key);
        log(`get()`, id, '=', str);

        if (str != null) {
            try {
                const object = tryJsonParse(str);
                return object;
            } catch (e) {
                return null;
            }
        }

        return str;
    }

    static set(key, value) {
        log(`set()`, key, '=', typeof value, value);
        let v = value;
        if (v != null && v != undefined) v = tryJsonStringify(value);
        storage.setItem(key, v);
    }

    static del(key) {
        Cache.remove(key);
    }

    static remove(key) {
        log(`remove()`, key);
        storage.removeItem(key);
    }

    static key(index) {
        return storage.getKey(index);
    }

    static size() {
        return storage.size();
    }

    static clear() {
        return storage.clear();
    }

    // static _getClassTypeName(id: string): string {
    //     return id;
    // }

}

// TODO: combine with backend shared