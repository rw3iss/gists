import StoreInterface from './StoreInterface';

export default class MockStore implements StoreInterface {

    // store's identifier
    storeIdx = "BASE_";

    // underlying IDb reference
    store = undefined;

    constructor(storeIdx?) {
        if (storeIdx)
            this.storeIdx = storeIdx;
        this.store = {};
    }

    public async set(key, val) {
        this.store[key] = val;
    }

    public async get(key, defaultValue?) {
        return this.store[key];
    }

    public async remove(key) {
    }

    public async getAll() {
    }

    public async size() {
    }

    public async clear() {
    }

    public async clearAll() {
    }

    public async clearIf(condition) {
    }

}
