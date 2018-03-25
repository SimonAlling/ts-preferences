# ts-preferences
> Type-safe library for saving and loading preferences

[![NPM Version][npm-image]][npm-url]
[![Downloads Stats][npm-downloads]][npm-url]


## Installation

```sh
npm install ts-preferences --save
```


## Why should I use it?

`ts-preferences` gives you an easy, safe way of defining and accessing preferences for your application, without a lot of boilerplate code. You can only set and get preferences that actually exist, so no more hassle with preference keys. And when requesting a preference value, you can always trust that you _will_ get something and that it will have the right type, even if something goes wrong with `localStorage`.


## Usage

### Basic example

This rather artificial example shows how preferences can be used with full type-safety:

```javascript
import * as TSPreferences from "ts-preferences";
import { BooleanPreference, NumericPreference } from "ts-preferences";

const PREFERENCES = {
    replace_title: new BooleanPreference({
        key: "replace_title",
        label: "Replace title",
        description: "Replace boring page title",
        default: true,
    }),
    counter: new NumericPreference({
        key: "counter",
        label: "Counter",
        description: "Weird counter thingy",
        default: 0,
    }),
};

// Initialize a preference manager:
const Preferences = TSPreferences.init(
    PREFERENCES,
    "my-awesome-app",
    TSPreferences.SIMPLE_RESPONSE_HANDLER,
);

// Replace title if corresponding preference is true:
if (Preferences.get(PREFERENCES.replace_title)) {
    document.title = "top kek";
}

const counter = Preferences.get(PREFERENCES.counter);

// Randomize background-color if saved counter value is a multiple of 5:
if (counter % 5 === 0) {
    document.body.style.backgroundColor = `rgb(${upTo(255)}, ${upTo(255)}, ${upTo(255)})`;
}

// Save a new counter value:
Preferences.set(PREFERENCES.counter, counter + 1);

function upTo(max: number): number {
    return Math.round(Math.random() * max);
}
```

(A preference which is automatically changed on every page load probably doesn't make too much sense beyond demonstration purposes.)


### The `PREFERENCES` object

`get(p)`, `set(p, v)` and `reset(p)` work as expected if _and only if_ `p` is in the `PreferencesObject` given as the **first argument to `init`**. That is, you can use all preferences in `PREFERENCES`, _and only those_, when talking to `ts-preferences`. The following code compiles, **but crashes**:

```javascript
import * as TSPreferences from "ts-preferences";
import { BooleanPreference } from "ts-preferences";

const forgedPreference = new BooleanPreference({
    key: "foo",
    label: "foo label",
    description: "foo description",
    default: true,
});

const PREFERENCES = {
    foo: new BooleanPreference({
        key: "foo",
        label: "foo label",
        description: "foo description",
        default: true,
    }),
};

const Preferences = TSPreferences.init(
    PREFERENCES,
    "my-awesome-app",
    TSPreferences.SIMPLE_RESPONSE_HANDLER,
);

Preferences.get(PREFERENCES.foo);         // OK
Preferences.set(PREFERENCES.foo, false);  // OK
Preferences.get(forgedPreference);        // throws exception
Preferences.set(forgedPreference, false); // throws exception
```

(Note that, although `forgedPreference` and `PREFERENCES.foo` are identical, they are not _the same object_, which is what counts in this case.)

You should only use members of your `PREFERENCES` object as input to `get`, `set` and `reset`. If your editor supports TypeScript, it will autocomplete available preferences for you when you type e.g. `Preferences.get(PREFERENCES._)`.

You may of course give your `PREFERENCES` object any name you want.


### Error handling

Things can go wrong when getting or setting preferences. For example, `localStorage` may not be accessible, or the string saved therein may not parse to a value of the expected type. To take care of these cases in a graceful way, define a **response handler** and give it as an argument to `init`. Here is an example:

```javascript
import * as TSPreferences from "ts-preferences";
import { Status, Response, RequestSummary, PreferencesInterface } from "ts-preferences";

const PREFERENCES = {
    // ...
};

const Preferences = TSPreferences.init(
    PREFERENCES,
    "my-awesome-app",
    responseHandler,
);

function responseHandler<T>(summary: RequestSummary<T>, preferences: PreferencesInterface): Response<T> {
    const response = summary.response;
    switch (response.status) {
        case Status.OK:
            return response;

        case Status.INVALID_VALUE:
            if (summary.action === "get") {
                console.warn(`The value found in localStorage for preference '${summary.preference.key}' was invalid. Replacing it with ${JSON.stringify(response.value)}.`);
                preferences.set(summary.preference, response.value);
            }
            if (summary.action === "set") {
                console.warn(`Could not set value ${JSON.stringify(response.value)} for preference '${summary.preference.key}' because it was invalid.`);
            }
            return response;

        case Status.JSON_ERROR:
            if (summary.action === "get") {
                console.warn(`The value found in localStorage for preference '${summary.preference.key}' could not be parsed. Replacing it with ${JSON.stringify(response.value)}.`);
                preferences.set(summary.preference, response.value);
            }
            return response;

        case Status.LOCALSTORAGE_FAILURE:
            switch (summary.action) {
                case "get":
                    console.error(`Could not read preference '${summary.preference.key}' because localStorage could not be accessed. Using value ${JSON.stringify(summary.preference.default)}.`);
                    return response;
                case "set":
                    console.error(`Could not save value ${JSON.stringify(summary.response.value)} for preference '${summary.preference.key}' because localStorage could not be accessed.`);
                    return response;
            }
            return assertUnreachable(summary.action);
    }
    return assertUnreachable(response.status); // enforces exhaustive case analysis
}

function assertUnreachable(x: never): never {
    throw new Error("assertUnreachable: " + x);
}
```

(`assertUnreachable` is just a way to enforce exhaustiveness in the `switch` statement.)

If you don't want to define a response handler, you can use `SIMPLE_RESPONSE_HANDLER`, which is exported by `ts-preferences`, e.g. `TSPreferences.SIMPLE_RESPONSE_HANDLER`. Note, however, that you will then get no indication whatsoever if something goes wrong (but you _will_ get valid preference values).


[npm-image]: https://img.shields.io/npm/v/ts-preferences.svg
[npm-url]: https://npmjs.org/package/ts-preferences
[npm-downloads]: https://img.shields.io/npm/dm/ts-preferences.svg
