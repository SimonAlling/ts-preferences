import { Preference, AllowedTypes } from "./Preference";

export class ListPreference<T extends AllowedTypes> extends Preference<ReadonlyArray<T>> {
    public getClassName() { return "ListPreference"; }
}
