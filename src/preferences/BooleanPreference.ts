import { Preference } from "./Preference";

export class BooleanPreference extends Preference<boolean> {
    public getClassName() { return "BooleanPreference"; }
}
