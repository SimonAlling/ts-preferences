import { isLike } from "ts-type-guards";
import * as Storage from "ts-storage";
import { assertUnreachable } from "./Utilities";
import { Preference } from "./preferences/Preference";

export const enum Status {
    OK,
    INVALID_VALUE,
    JSON_ERROR,
    LOCALSTORAGE_ERROR,
}

export type Response<T> = {
    status: Status
    value: T
}

export interface PreferencesObject {
    readonly [key: string]: Preference<any>;
}

function unknown(p: Preference<any>): string {
    return `Unknown preference. Please use only preferences from the object used to initialize the ${PreferenceManager.name}. This one is not among them:\n\n${JSON.stringify(p)}.`;
}

export class PreferenceManager {
    private readonly LS_PREFIX: string;
    private readonly cache: Map<Preference<any>, any>;

    constructor(preferences: PreferencesObject, localStoragePrefix: string) {
        this.LS_PREFIX = localStoragePrefix;
        this.cache = new Map();
        let seenKeys: string[] = [];
        Object.keys(preferences).forEach(k => {
            const p = preferences[k];
            const key = p.key;
            if (seenKeys.indexOf(key) > -1) {
                throw new Error(`Duplicate preference key ${JSON.stringify(key)}.`);
            }
            this.cache.set(p, p.default);
            seenKeys.push(key);
        });
    }

    public get<T>(preference: Preference<T>): Response<T> {
        const cachedValue: any = this.cache.get(preference);
        if (!isLike(preference.default)(cachedValue)) {
            // If we got undefined from cache, the preference was not among the known ones.
            throw new Error(unknown(preference));
        }
        const resp = Storage.get(this.LS_PREFIX + preference.key, preference.default);
        return {
            status: fromStorageStatus(resp.status),
            value: resp.status === Storage.Status.OK ? resp.value : cachedValue,
        };
    }

    public set<T>(preference: Preference<T>, value: T): Response<T> {
        if (!isLike(preference.default)(this.cache.get(preference))) {
            throw new Error(unknown(preference));
        }
        if (!preference.isValidValue(preference.data, value)) {
            return {
                status: Status.INVALID_VALUE,
                value: value,
            };
        }
        this.cache.set(preference, value);
        const resp = Storage.set(this.LS_PREFIX + preference.key, value);
        return {
            status: fromStorageStatus(resp.status),
            value: resp.value,
        };
    }
}

function fromStorageStatus(s: Storage.Status): Status {
    switch (s) {
        case Storage.Status.OK:                 return Status.OK;
        case Storage.Status.ABSENT:             return Status.OK;
        case Storage.Status.TYPE_ERROR:         return Status.INVALID_VALUE;
        case Storage.Status.JSON_ERROR:         return Status.JSON_ERROR;
        case Storage.Status.LOCALSTORAGE_ERROR: return Status.LOCALSTORAGE_ERROR;
    }
    return assertUnreachable(s);
}
