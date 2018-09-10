import { Preference, AllowedTypes } from "./Preference";
import { Dictionary } from "ts-storage";

export class DictionaryPreference<
    K extends string,
    T extends AllowedTypes & { [key in K]: AllowedTypes },
> extends Preference<Dictionary<K, T>> {}
