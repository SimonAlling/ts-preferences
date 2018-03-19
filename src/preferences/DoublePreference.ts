import { PreferenceData } from "./Preference";
import { NumericPreference } from "./NumericPreference";

export class DoublePreference extends NumericPreference {
    constructor(data: PreferenceData<number>) {
        super(data);
    }
}
