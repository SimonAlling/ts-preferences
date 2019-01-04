import { Dictionary } from "ts-storage";

import { Preference, AllowedTypes } from "./Preference";

export class DictionaryPreference<
    K extends string,
    T extends AllowedTypes & { [key in K]: AllowedTypes },
> extends Preference<Dictionary<K, T>> {
    public getClassName() { return "DictionaryPreference"; }
}
