
import { useEffect, useState } from 'preact/hooks';
import { IndexedDBManager } from '../IndexedDBManager.js';

export type IDbSavedState = {
    id: string,
    state: {}
}

export const STATE_STORE = 'saved-states';

export const wrapState = (id: string, state: {}): IDbSavedState => ({ id, state });

/**
 * Manages storing and retrieving saved data to IndexedDB for arbitrary components.
 * @param id The id for the saved state.
 * @param def The default state prior to loading any from the DB.
 * @param waitFor Prevent setting the state to default immediately,
 * and instead wait to try and load the stored data.
 * If no data is found the default is set.
 * @returns The current stored state, and a setter to persist a new state to the DB.
 */
export function useSavedState(id: string, def: {}, waitFor = true) {
    const [state, setState] = useState(waitFor ? undefined : def);

    // load saved state on mount, or otherwise set the default state
    useEffect(() => {
        //console.log(`useSavedState effect`, id);
        (async function () {
            const db = IndexedDBManager.getDb();
            if (db) {
                const s: IDbSavedState | undefined = await db.get(STATE_STORE, id);
                setState(s ? s.state : def);
            } else {
                console.error(`no db in useSavedState get?`)
            }
        })();
    }, []);

    // when state changes, save to db
    useEffect(() => {
        async function save() {
            const db = IndexedDBManager.getDb();
            if (db) {
                if (state) { // must do this so default undefined state does not trigger
                    //console.log(`useSavedState changed`, id, state);
                    await db.put(STATE_STORE, wrapState(id, state));
                }
            } else {
                console.error(`no db in useSavedState put?`)
            }
        }
        save();
    }, [state]);

    return { state, setState };
}
