import {
    PreferenceManager,
    PreferencesObject,
    PreferenceGroup,
    Status,
    Response,
    flatten,
} from "./PreferenceManager";
import { Preference, AllowedTypes } from "./preferences/Preference";
import { BooleanPreference } from "./preferences/BooleanPreference";
import { NumericPreference } from "./preferences/NumericPreference";
import { IntegerPreference } from "./preferences/IntegerPreference";
import { DoublePreference } from "./preferences/DoublePreference";
import { StringPreference } from "./preferences/StringPreference";
import { CustomPreference } from "./preferences/CustomPreference";
import { RangePreference } from "./preferences/RangePreference";
import { IntegerRangePreference } from "./preferences/IntegerRangePreference";
import { MultichoicePreference } from "./preferences/MultichoicePreference";

export type RequestSummary<T extends AllowedTypes> = {
    action: "set" | "get"
    preference: Preference<T>
    response: Response<T>
}

export type ResponseHandler = <T extends AllowedTypes>(s: RequestSummary<T>, p: PreferencesInterface) => Response<T>;

export type PreferencesInterface = {
    get: <T extends AllowedTypes>(p: Preference<T>) => T
    set: <T extends AllowedTypes>(p: Preference<T>, v: T) => void
    reset: <T extends AllowedTypes>(p: Preference<T>) => void
    resetAll: () => void
    htmlMenu: (f: (ps: PreferencesObject) => HTMLElement) => HTMLElement
}

export const SIMPLE_RESPONSE_HANDLER = <T extends AllowedTypes>(s: RequestSummary<T>, p: PreferencesInterface) => s.response;

const LS_INFIX: string = "-preference-";

export function init(
    preferences: PreferencesObject,
    localStoragePrefix: string,
    responseHandler: ResponseHandler,
): PreferencesInterface {
    const PM = new PreferenceManager(preferences, localStoragePrefix + LS_INFIX);
    const thisInterface = { get, set, reset, resetAll, htmlMenu };

    function get<T extends AllowedTypes>(p: Preference<T>): T {
        return responseHandler({
            action: "get",
            preference: p,
            response: PM.get<T>(p),
        }, thisInterface).value;
    }

    function set<T extends AllowedTypes>(p: Preference<T>, value: T): void {
        responseHandler({
            action: "set",
            preference: p,
            response: PM.set<T>(p, value),
        }, thisInterface);
    }

    function reset<T extends AllowedTypes>(p: Preference<T>): void {
        set(p, p.default);
    }

    function resetAll(): void {
        flatten(preferences).forEach(reset);
    }

    function htmlMenu(f: (ps: PreferencesObject) => HTMLElement): HTMLElement {
        return f(preferences);
    }

    return thisInterface;
}

export {
    AllowedTypes,
    Status,
    Response,
    PreferenceManager,
    PreferencesObject,
    PreferenceGroup,
    Preference,
    BooleanPreference,
    NumericPreference,
    IntegerPreference,
    DoublePreference,
    StringPreference,
    CustomPreference,
    RangePreference,
    IntegerRangePreference,
    MultichoicePreference,
};
