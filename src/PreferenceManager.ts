import { is, isLike, isNull } from "ts-type-guards";
import { Preference } from "./preferences/Preference";

export const enum Status {
    OK,
    INVALID_VALUE,
    PARSE_FAILED,
    LOCALSTORAGE_FAILURE,
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
        if (isLike(preference.default)(cachedValue)) {
            // The preference asked for is one of the known ones.
            try {
                const savedValue: T | null = this.readFromLocalStorage(preference);
                if (isNull(savedValue)) {
                    // There was no saved value.
                    return {
                        status: Status.OK,
                        value: cachedValue,
                    };
                } else if (!preference.isValidValue(preference.data, savedValue)) {
                    // The saved value was not valid.
                    return {
                        status: Status.INVALID_VALUE,
                        value: preference.fromInvalid(savedValue),
                    };
                } else {
                    // There was a valid saved value.
                    return {
                        status: Status.OK,
                        value: savedValue,
                    };
                }
            } catch (err) {
                let status;
                if (is(SyntaxError)(err)) {
                    // The saved value could not be parsed.
                    status = Status.PARSE_FAILED;
                } else if (is(TypeError)(err)) {
                    // The saved value had the wrong type.
                    status = Status.INVALID_VALUE;
                } else {
                    // Something went wrong when trying to access localStorage.
                    status = Status.LOCALSTORAGE_FAILURE;
                }
                return {
                    status: status,
                    value: cachedValue,
                };
            }
        }
        // If we got undefined from cache, the preference was not among the known ones.
        throw new Error(unknown(preference));
    }

    public set<T>(preference: Preference<T>, value: T): Response<T> {
        const getResponse = this.get(preference);
        if (!preference.isValidValue(preference.data, value)) {
            return {
                status: Status.INVALID_VALUE,
                value: value,
            };
        }
        this.cache.set(preference, value);
        try {
            this.saveToLocalStorage(preference, value);
            return {
                status: Status.OK,
                value: value,
            };
        } catch {
            // Something went wrong when trying to access localStorage.
            return {
                status: Status.LOCALSTORAGE_FAILURE,
                value: value,
            };
        }
    }

    private readFromLocalStorage<T>(preference: Preference<T>): T | null {
        // Throws DOMException:
        const readValue: string | null = localStorage.getItem(this.LS_PREFIX + preference.key);
        if (isNull(readValue)) {
            return null;
        }
        // Throws SyntaxError:
        const parsedValue: any = JSON.parse(readValue);
        if (isLike(preference.default)(parsedValue)) {
            return parsedValue;
        }
        throw new TypeError(`Saved value had wrong type.`);
    }

    private saveToLocalStorage<T>(preference: Preference<T>, value: T): void {
        // Throws DOMException:
        localStorage.setItem(this.LS_PREFIX + preference.key, JSON.stringify(value));
    }
}
