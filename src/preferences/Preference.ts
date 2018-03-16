export type PreferenceData<T> = {
    key: string
    default: T
    label: string
    description: string
}

export type AllowedTypes = boolean | number | string

export abstract class Preference<T extends AllowedTypes> {
    readonly data: PreferenceData<T>;
    readonly key: string;
    readonly default: T;
    readonly label: string;
    readonly description: string;

    constructor(data: PreferenceData<T>) {
        if (data.key === "") {
            throw new TypeError(`A preference key cannot be the empty string, but this was the case for this preference data:\n${JSON.stringify(data)}`);
        }
        this.data = data;
        this.key = data.key;
        this.default = data.default;
        this.label = data.label;
        this.description = data.description;
        if (!this.isValidValue(data, data.default)) {
            this.invalidValue(data.default);
        }
    }

    // All type-correct values are valid by default; specialized preference types may need a more specific implementation:
    isValidValue(data: PreferenceData<T>, value: T): boolean {
        return true;
    }

    // Identity function by default; specialized preference types may need a more specific implementation:
    fromInvalid(value: T): T {
        return value;
    }

    invalidValue(value: T): void {
        throw new Error(`${JSON.stringify(value)} is not a valid value for ${this.getType()} '${this.key}'.`);
    }

    getType(): string {
        return this.constructor["name"];
    }
}
