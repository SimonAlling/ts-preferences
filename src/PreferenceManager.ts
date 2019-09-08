import * as Storage from "ts-storage";
import { is, isString } from "ts-type-guards";

import {
    AllowedTypes,
    Dependency,
    Preference,
} from "./preferences/Preference";
import { stringify } from "./Utilities";

export const enum Status {
    OK,
    INVALID_VALUE,
    TYPE_ERROR,
    JSON_ERROR,
    STORAGE_ERROR,
}

export interface Response<T> {
    status: Status
    value: T
    saved?: T
}

export interface RequestSummary<T extends AllowedTypes> {
    action: "set" | "get"
    preference: Preference<T>
    response: Response<T>
}

export type ResponseHandler = <T extends AllowedTypes>(summary: RequestSummary<T>, pm: PreferenceManager) => Response<T>;

export interface PreferencesObject {
    readonly [key: string]: Preference<any> | PreferenceGroup
}

export interface PreferenceGroup {
    readonly label: string
    readonly _: PreferencesObject
    readonly dependencies?: ReadonlyArray<Dependency<any>>
    readonly extras?: { readonly [key: string]: any }
}

const SIMPLE_RESPONSE_HANDLER: ResponseHandler = (summary, _) => summary.response;

export class PreferenceManager {
    private readonly cache: Map<Preference<any>, any>;

    constructor(
        preferences: PreferencesObject,
        private readonly localStoragePrefix: string,
        private readonly responseHandler: ResponseHandler = SIMPLE_RESPONSE_HANDLER,
    ) {
        this.cache = new Map<Preference<any>, any>();
        const seenKeys: string[] = [];
        const allPreferences = flatten(preferences);

        allPreferences.forEach(p => {
            const key = p.key;
            if (seenKeys.includes(key)) {
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

    public get<T extends AllowedTypes>(preference: Preference<T>): T {
        return this.getWith(this.responseHandler, preference);
    }

    public set<T extends AllowedTypes>(preference: Preference<T>, value: T): void {
        this.setWith(this.responseHandler, preference, value);
    }

    public getWith<T extends AllowedTypes>(responseHandler: ResponseHandler, preference: Preference<T>): T {
        return responseHandler({
            action: "get",
            preference,
            response: this.getRaw(preference),
        }, this).value;
    }

    public setWith<T extends AllowedTypes>(responseHandler: ResponseHandler, preference: Preference<T>, value: T): void {
        responseHandler({
            action: "set",
            preference,
            response: this.setRaw(preference, value),
        }, this);
    }

    public reset<T extends AllowedTypes>(preference: Preference<T>): void {
        // If Storage.remove fails, the user doesn't really need to know, because default values will be used anyway.
        this.getFromCacheOrThrowIfUnknown(preference);
        Storage.remove(this.localStoragePrefix + preference.key);
    }

    public resetAll(): void {
        for (const p of this.cache.keys()) { this.reset(p); }
    }

    public shouldBeAvailable<T extends AllowedTypes>(p: Preference<T>): boolean {
        const isMet = <D extends AllowedTypes>(d: Dependency<D>) => d.condition(this.getRaw(d.preference).value);
        return p.dependencies.every(isMet);
    }

    public getRaw<T extends AllowedTypes>(preference: Preference<T>): Response<T> {
        const cachedValue = this.getFromCacheOrThrowIfUnknown(preference);
        const response = Storage.get(this.localStoragePrefix + preference.key, preference.default);
        if (response.status === Storage.Status.OK) {
            const savedValue = response.value;
            const validationResult = preference.validate(savedValue);
            return (
                isString(validationResult)
                ? {
                    status: Status.INVALID_VALUE,
                    value: preference.toValid(savedValue),
                    saved: savedValue,
                }
                : {
                    status: Status.OK,
                    value: savedValue,
                }
            );
        }
        return {
            status: fromStorageStatus(response.status),
            value: cachedValue,
        };
    }

    public setRaw<T extends AllowedTypes>(preference: Preference<T>, value: T): Response<T> {
        this.getFromCacheOrThrowIfUnknown(preference);
        if (isString(preference.validate(value))) {
            return {
                status: Status.INVALID_VALUE,
                value,
            };
        }
        this.cache.set(preference, value);
        const response = Storage.set(this.localStoragePrefix + preference.key, value);
        return {
            status: fromStorageStatus(response.status),
            value: response.value,
        };
    }

    private getFromCacheOrThrowIfUnknown<T extends AllowedTypes>(preference: Preference<T>): T {
        const cachedValue = this.cache.get(preference);
        if (cachedValue === undefined) {
            throw new Error(unknown(preference));
        }
        return cachedValue;
    }
}

function unknown(p: Preference<any>): string {
    return `Unknown preference:\n\n${stringify(p)}.`;
}

function flatten(tree: PreferencesObject): ReadonlyArray<Preference<any>> {
    return Object.values(tree).reduce(
        (acc, node) => acc.concat(
            is(Preference)(node) ? node : flatten(node._),
        ),
        [] as ReadonlyArray<Preference<any>>,
    );
}

function fromStorageStatus(s: Storage.Status): Status {
    switch (s) {
        case Storage.Status.OK:                 return Status.OK;
        case Storage.Status.ABSENT:             return Status.OK;
        case Storage.Status.NUMBER_ERROR:       return Status.INVALID_VALUE;
        case Storage.Status.TYPE_ERROR:         return Status.TYPE_ERROR;
        case Storage.Status.JSON_ERROR:         return Status.JSON_ERROR;
        case Storage.Status.STORAGE_ERROR:      return Status.STORAGE_ERROR;
    }
}
