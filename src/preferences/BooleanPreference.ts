import {
    Preference,
    PreferenceData,
} from "./Preference";

export class BooleanPreference extends Preference<boolean> {
    constructor(data: PreferenceData<boolean>) {
        super(data);
    }
}
