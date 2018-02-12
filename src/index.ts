import {
    PreferenceManager,
    PreferencesObject,
    Status,
    Response,
} from "./PreferenceManager";
import { Preference } from "./preferences/Preference";
import { BooleanPreference } from "./preferences/BooleanPreference";
import { NumericPreference } from "./preferences/NumericPreference";
import { StringPreference } from "./preferences/StringPreference";
import { CustomPreference } from "./preferences/CustomPreference";
import { RangePreference } from "./preferences/RangePreference";
import { IntegerRangePreference } from "./preferences/IntegerRangePreference";
import { MultichoicePreference } from "./preferences/MultichoicePreference";

export type RequestSummary<T> = {
    action: "set" | "get"
    preference: Preference<T>
    response: Response<T>
}

export type ResponseHandler = <T>(s: RequestSummary<T>, p: PreferencesInterface) => Response<T>;

export type PreferencesInterface = {
    get: <T>(p: Preference<T>) => T
    set: <T>(p: Preference<T>, v: T) => void
    reset: <T>(p: Preference<T>) => void
    resetAll: () => void
}

const LS_INFIX: string = "-preference-";

export function init(
    preferences: PreferencesObject,
    localStoragePrefix: string,
    responseHandler: ResponseHandler,
): PreferencesInterface {
    const PM = new PreferenceManager(preferences, localStoragePrefix + LS_INFIX);
    const thisInterface = { get, set, reset, resetAll };

    function get<T>(p: Preference<T>): T {
        return responseHandler({
            action: "get",
            preference: p,
            response: PM.get<T>(p),
        }, thisInterface).value;
    }

    function set<T>(p: Preference<T>, value: T): void {
        responseHandler({
            action: "set",
            preference: p,
            response: PM.set<T>(p, value),
        }, thisInterface);
    }

    function reset<T>(p: Preference<T>): void {
        set(p, p.default);
    }

    function resetAll(): void {
        Object.keys(preferences).forEach(k => {
            const p = preferences[k];
            reset(p);
        });
    }

    return thisInterface;
}

export {
    Status,
    Response,
    PreferenceManager,
    PreferencesObject,
    Preference,
    BooleanPreference,
    NumericPreference,
    StringPreference,
    CustomPreference,
    RangePreference,
    IntegerRangePreference,
    MultichoicePreference,
};
