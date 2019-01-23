import { Dictionary } from "ts-storage";

import { AllowedTypes, Preference } from "./Preference";

export class DictionaryPreference<
    K extends string,
    T extends AllowedTypes & { [key in K]: AllowedTypes },
> extends Preference<Dictionary<K, T>> {
    public getClassName() { return "DictionaryPreference"; }
}
