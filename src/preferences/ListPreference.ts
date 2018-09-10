import { Preference, ItemTypes } from "./Preference";

export class ListPreference<T extends ItemTypes> extends Preference<ReadonlyArray<T>> {}
