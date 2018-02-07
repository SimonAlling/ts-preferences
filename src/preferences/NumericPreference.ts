import { PreferenceData, Preference } from "./Preference";

export class NumericPreference extends Preference<number> {
    constructor(data: PreferenceData<number>) {
        super(data);
    }
}
