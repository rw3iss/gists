import StoreInterface from './StoreInterface';
import IDB from './IDB';

export default class IDbStore implements StoreInterface {

    // store's identifier
    storeId = "BASE_";

    // underlying IDb reference
    store = undefined;

    options = {};

    constructor(storeId?, options?) {
        if (storeId) this.storeId = storeId;
        if (options) this.options = options;

        this.store = IDB.newStore(this.storeId, this.options);

        // if (this.options.loadOnStart) {
        //     this.loadStoreData();
        // }
    }

    public async set(key, val) {
        return await IDB.set(this.storeId, key, val);
    }

    public async get(key, defaultValue?) {
        let v = await IDB.get(this.storeId, key);
        return (!v && defaultValue) ? defaultValue : v;
    }

    public async remove(key) {
        return await IDB.delete(this.storeId, key);
    }

    public async getAll() {
        return await IDB.getAll(this.storeId);
    }

    public async getAllKeys() {
        return await IDB.getAllKeys(this.storeId);
    }

    public async size() {
        return await IDB.size(this.storeId);
    }

    public async clear() {
        return await IDB.clearAll(this.storeId);
    }

    public async clearAll() {
        return await this.clear();
    }

    public async clearIf(condition) {
        return await IDB.clearIf(this.storeId, condition);
    }

    public async onReady(cb) {
        IDB.onReady(cb);
    }
    // public clearIf(condition) {
    //     let removeKeys: any[] = [];
    //     let size = Cache.size();
    //     for (let i = 0; i < size; i++) {
    //         let key = Cache.key(i);
    //         if (condition(i, key, Cache.get(key))) {
    //             removeKeys.push(key);
    //         }
    //     }

    //     removeKeys.forEach(k => {
    //         IDB.delete(k);
    //     });
    // }

}
