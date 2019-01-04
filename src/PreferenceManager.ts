import * as Storage from "ts-storage";
import {
    is,
    isLike,
    isString,
} from "ts-type-guards";

import {
    AllowedTypes,
    Dependency,
    Preference,
} from "./preferences/Preference";
import {
    assertUnreachable,
    stringify,
} from "./Utilities";

export const enum Status {
    OK,
    INVALID_VALUE,
    TYPE_ERROR,
    JSON_ERROR,
    LOCALSTORAGE_ERROR,
}

export interface Response<T> {
    status: Status
    value: T
    saved?: T
}

export interface PreferencesObject {
    readonly [key: string]: Preference<any> | PreferenceGroup
}

export interface PreferenceGroup {
    readonly label: string
    readonly _: PreferencesObject
    readonly dependencies?: Dependency<any>[]
    readonly extras?: { readonly [key: string]: any }
}

function unknown(p: Preference<any>): string {
    return `Unknown preference. Please use only preferences from the object used to initialize the ${PreferenceManager.className}. This one is not among them:\n\n${stringify(p)}.`;
}

export class PreferenceManager {
    public static readonly className: string = "PreferenceManager";
    private readonly LS_PREFIX: string;
    private readonly cache: Map<Preference<any>, any>;

    constructor(preferences: PreferencesObject, localStoragePrefix: string) {
        this.LS_PREFIX = localStoragePrefix;
        this.cache = new Map();
        const seenKeys: string[] = [];
        const allPreferences = flatten(preferences);

        allPreferences.forEach(p => {
            const key = p.key;
            if (seenKeys.indexOf(key) > -1) {
                throw new Error(`Duplicate preference key ${stringify(key)}.`);
            }
            this.cache.set(p, p.default);
            seenKeys.push(key);
        });

        // Must be done after all preferences have been added to the cache:
        allPreferences.forEach(p => {
            p.dependencies.forEach(dependency => {
                if (this.cache.get(dependency.preference) === undefined) {
                    throw new Error(`Dependency error in ${p}: ${unknown(dependency.preference)}`);
                }
            });
        });
    }

    public get<T extends AllowedTypes>(preference: Preference<T>): Response<T> {
        const cachedValue: any = this.cache.get(preference);
        if (!isLike(preference.default)(cachedValue)) {
            // If we got undefined from cache, the preference was not among the known ones.
            throw new Error(unknown(preference));
        }
        const resp = Storage.get(this.LS_PREFIX + preference.key, preference.default);
        if (resp.status === Storage.Status.OK) {
            const validationResult = preference.validate(resp.value);
            return isString(validationResult) ? {
                status: Status.INVALID_VALUE,
                value: preference.toValid(resp.value),
                saved: resp.value,
            } : {
                status: Status.OK,
                value: resp.value,
            };
        }
        return {
            status: fromStorageStatus(resp.status),
            value: cachedValue,
        };
    }

    public set<T extends AllowedTypes>(preference: Preference<T>, value: T): Response<T> {
        if (!isLike(preference.default)(this.cache.get(preference))) {
            throw new Error(unknown(preference));
        }
        if (isString(preference.validate(value))) {
            return {
                status: Status.INVALID_VALUE,
                value,
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

export function flatten(tree: PreferencesObject): Preference<any>[] {
    return Object.keys(tree).map(k => tree[k]).reduce(
        (acc, node) => acc.concat(
            is(Preference)(node) ? node : flatten(node._),
        ),
        [] as Preference<any>[],
    );
}

function fromStorageStatus(s: Storage.Status): Status {
    switch (s) {
        case Storage.Status.OK:                 return Status.OK;
        case Storage.Status.ABSENT:             return Status.OK;
        case Storage.Status.NUMBER_ERROR:       return Status.INVALID_VALUE;
        case Storage.Status.TYPE_ERROR:         return Status.TYPE_ERROR;
        case Storage.Status.JSON_ERROR:         return Status.JSON_ERROR;
        case Storage.Status.STORAGE_ERROR:      return Status.LOCALSTORAGE_ERROR;
    }
    return assertUnreachable(s);
}
