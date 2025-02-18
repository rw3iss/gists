export default interface StoreInterface {

    set(key, val);

    get(key, defaultValue?);

    remove(key);

    getAll();

    size();

    clear();

    clearIf(condition);

}