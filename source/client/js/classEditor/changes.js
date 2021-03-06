/**
 * This module holds functions that control changes made to classes. To register the new change,
 * @see addChange
 */

import { save } from "../server";
import { changeIsMade } from "./index";

let changes = {};

/**
 * Adding and deleting the same property may cause unnecessary saving data appear. This function
 * filters such changes and returns boolean value identifying whether the update is needed.
 * @returns {boolean}
 */
function filterChanges () {

    function parse (o) {
        if (typeof o !== "object")
            return 1;
        let p = 0;
        for (let i in o)
            if (o[i] && o[i]["$add"] && o[i]["$delete"]) {
                delete o[i];
            } else {
                p += parse(o[i]);
            }
        return p;
    }

    return parse(changes) > 0;

}

/**
 * Adds a change to pending changes.
 * @param path - ["ClassName", "properties", "PropName", "Private"]
 * @param value - 1
 */
export function addChange (path = [], value) {
    let obj = changes,
        prop = path.slice(-1);
    path.slice(0, -1).forEach((p) => obj = obj[p] || (() => obj[p] = {})() );
    obj[prop] = value;
    changeIsMade(filterChanges());
}

export function saveChanges (namespace, callback) {
    save(namespace, changes, (res) => {

        if (!res["error"])
            changes = {};

        callback(res);

    });
}