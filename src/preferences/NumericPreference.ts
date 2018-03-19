import { PreferenceData, Preference } from "./Preference";

export abstract class NumericPreference extends Preference<number> {
    constructor(data: PreferenceData<number>) {
        super(data);
    }
}
