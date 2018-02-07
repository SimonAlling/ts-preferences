import { PreferenceData, Preference } from "./Preference";

export class StringPreference extends Preference<string> {
    constructor(data: PreferenceData<string>) {
        super(data);
    }
}
