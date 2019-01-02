import {
    PreferenceGroup,
    PreferenceManager,
    PreferencesObject,
    Response,
    Status,
    flatten,
} from "./PreferenceManager";
import {
    AllowedTypes,
    FromString,
    Preference,
} from "./preferences/Preference";

export { BooleanPreference } from "./preferences/BooleanPreference";
export { DictionaryPreference } from "./preferences/DictionaryPreference";
export { DoublePreference } from "./preferences/DoublePreference";
export { DoubleRangePreference } from "./preferences/DoubleRangePreference";
export { IntegerPreference } from "./preferences/IntegerPreference";
export { IntegerRangePreference } from "./preferences/IntegerRangePreference";
export { ListPreference } from "./preferences/ListPreference";
export { MultichoicePreference } from "./preferences/MultichoicePreference";
export { NumericPreference } from "./preferences/NumericPreference";
export { RangePreference } from "./preferences/RangePreference";
export { StringPreference } from "./preferences/StringPreference";

export interface RequestSummary<T extends AllowedTypes> {
    action: "set" | "get"
    preference: Preference<T>
    response: Response<T>
}

export type ResponseHandler = <T extends AllowedTypes>(s: RequestSummary<T>, p: PreferencesInterface) => Response<T>;

export interface PreferencesInterface {
    get: <T extends AllowedTypes>(p: Preference<T>) => T
    set: <T extends AllowedTypes>(p: Preference<T>, v: T) => void
    reset: <T extends AllowedTypes>(p: Preference<T>) => void
    resetAll: () => void
    enabled: <T extends AllowedTypes>(p: Preference<T>) => boolean
    htmlMenu: (f: (ps: PreferencesObject) => HTMLElement) => HTMLElement
}

export function SIMPLE_RESPONSE_HANDLER<T extends AllowedTypes>(s: RequestSummary<T>, p: PreferencesInterface): Response<T> {
    return s.response;
}

export function init(
    preferences: PreferencesObject,
    localStoragePrefix: string,
    responseHandler: ResponseHandler,
): PreferencesInterface {
    const LS_INFIX: string = "-preference-";
    const PM = new PreferenceManager(preferences, localStoragePrefix + LS_INFIX);
    const thisInterface = { get, set, reset, resetAll, enabled, htmlMenu };

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

    function enabled<T extends AllowedTypes>(p: Preference<T>): boolean {
        return p.dependencies.every(d => d.condition(get(d.preference)));
    }

    function htmlMenu(f: (ps: PreferencesObject) => HTMLElement): HTMLElement {
        return f(preferences);
    }

    return thisInterface;
}

export {
    AllowedTypes,
    FromString,
    Status,
    Response,
    PreferenceManager,
    PreferencesObject,
    PreferenceGroup,
    Preference,
};
