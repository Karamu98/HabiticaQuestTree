// To parse this data:
//
//   import { Convert, TasksRequest } from "./file";
//
//   const tasksRequest = Convert.toTasksRequest(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

import { TaskType } from "./CommonData";

export interface TasksRequest {
    success:       boolean;
    data:          Datum[];
    notifications: Notification[];
    appVersion:    string;
}

export interface Datum {
    challenge:          Challenge;
    group:              Group;
    up?:                boolean;
    down?:              boolean;
    counterUp?:         number;
    counterDown?:       number;
    frequency?:         Frequency;
    history?:           History[];
    type:               TaskType;
    notes:              string;
    tags:               string[];
    value:              number;
    priority:           number;
    attribute:          Attribute;
    byHabitica:         boolean;
    reminders:          any[];
    createdAt:          Date;
    updatedAt:          Date;
    _id:                string;
    text:               string;
    userId:             string;
    id:                 string;
    repeat?:            Repeat;
    everyX?:            number;
    streak?:            number;
    nextDue?:           string[];
    yesterDaily?:       boolean;
    completed?:         boolean;
    collapseChecklist?: boolean;
    startDate?:         Date;
    daysOfMonth?:       any[];
    weeksOfMonth?:      number[];
    checklist?:         any[];
    isDue?:             boolean;
    date?:              Date | null;
}

export enum Attribute {
    Int = "int",
    Str = "str",
}

export interface Challenge {
}

export enum Frequency {
    Daily = "daily",
    Monthly = "monthly",
    Weekly = "weekly",
}

export interface Group {
    approval:         Approval;
    assignedUsers:    any[];
    sharedCompletion: SharedCompletion;
}

export interface Approval {
    required:  boolean;
    approved:  boolean;
    requested: boolean;
}

export enum SharedCompletion {
    SingleCompletion = "singleCompletion",
}

export interface History {
    date:        number;
    value:       number;
    scoredUp?:   number;
    scoredDown?: number;
    isDue?:      boolean;
    completed?:  boolean;
}

export interface Repeat {
    m:  boolean;
    t:  boolean;
    w:  boolean;
    th: boolean;
    f:  boolean;
    s:  boolean;
    su: boolean;
}

export enum Type {
    Daily = "daily",
    Habit = "habit",
    Reward = "reward",
    Todo = "todo",
}

export interface Notification {
    type: string;
    data: Data;
    seen: boolean;
    id:   string;
}

export interface Data {
    headerText: string;
    bodyText:   string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class TasksRequestConvert {
    public static ToData(json: string): TasksRequest {
        return cast(JSON.parse(json), r("TasksRequest"));
    }

    public static tasksRequestToJson(value: TasksRequest): string {
        return JSON.stringify(uncast(value, r("TasksRequest")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "TasksRequest": o([
        { json: "success", js: "success", typ: true },
        { json: "data", js: "data", typ: a(r("Datum")) },
        { json: "notifications", js: "notifications", typ: a(r("Notification")) },
        { json: "appVersion", js: "appVersion", typ: "" },
    ], false),
    "Datum": o([
        { json: "challenge", js: "challenge", typ: r("Challenge") },
        { json: "group", js: "group", typ: r("Group") },
        { json: "up", js: "up", typ: u(undefined, true) },
        { json: "down", js: "down", typ: u(undefined, true) },
        { json: "counterUp", js: "counterUp", typ: u(undefined, 0) },
        { json: "counterDown", js: "counterDown", typ: u(undefined, 0) },
        { json: "frequency", js: "frequency", typ: u(undefined, r("Frequency")) },
        { json: "history", js: "history", typ: u(undefined, a(r("History"))) },
        { json: "type", js: "type", typ: r("Type") },
        { json: "notes", js: "notes", typ: "" },
        { json: "tags", js: "tags", typ: a("") },
        { json: "value", js: "value", typ: 3.14 },
        { json: "priority", js: "priority", typ: 3.14 },
        { json: "attribute", js: "attribute", typ: r("Attribute") },
        { json: "byHabitica", js: "byHabitica", typ: true },
        { json: "reminders", js: "reminders", typ: a("any") },
        { json: "createdAt", js: "createdAt", typ: Date },
        { json: "updatedAt", js: "updatedAt", typ: Date },
        { json: "_id", js: "_id", typ: "" },
        { json: "text", js: "text", typ: "" },
        { json: "userId", js: "userId", typ: "" },
        { json: "id", js: "id", typ: "" },
        { json: "repeat", js: "repeat", typ: u(undefined, r("Repeat")) },
        { json: "everyX", js: "everyX", typ: u(undefined, 0) },
        { json: "streak", js: "streak", typ: u(undefined, 0) },
        { json: "nextDue", js: "nextDue", typ: u(undefined, a("")) },
        { json: "yesterDaily", js: "yesterDaily", typ: u(undefined, true) },
        { json: "completed", js: "completed", typ: u(undefined, true) },
        { json: "collapseChecklist", js: "collapseChecklist", typ: u(undefined, true) },
        { json: "startDate", js: "startDate", typ: u(undefined, Date) },
        { json: "daysOfMonth", js: "daysOfMonth", typ: u(undefined, a("any")) },
        { json: "weeksOfMonth", js: "weeksOfMonth", typ: u(undefined, a(0)) },
        { json: "checklist", js: "checklist", typ: u(undefined, a("any")) },
        { json: "isDue", js: "isDue", typ: u(undefined, true) },
        { json: "date", js: "date", typ: u(undefined, u(Date, null)) },
    ], false),
    "Challenge": o([
    ], false),
    "Group": o([
        { json: "approval", js: "approval", typ: r("Approval") },
        { json: "assignedUsers", js: "assignedUsers", typ: a("any") },
        { json: "sharedCompletion", js: "sharedCompletion", typ: r("SharedCompletion") },
    ], false),
    "Approval": o([
        { json: "required", js: "required", typ: true },
        { json: "approved", js: "approved", typ: true },
        { json: "requested", js: "requested", typ: true },
    ], false),
    "History": o([
        { json: "date", js: "date", typ: 0 },
        { json: "value", js: "value", typ: 3.14 },
        { json: "scoredUp", js: "scoredUp", typ: u(undefined, 0) },
        { json: "scoredDown", js: "scoredDown", typ: u(undefined, 0) },
        { json: "isDue", js: "isDue", typ: u(undefined, true) },
        { json: "completed", js: "completed", typ: u(undefined, true) },
    ], false),
    "Repeat": o([
        { json: "m", js: "m", typ: true },
        { json: "t", js: "t", typ: true },
        { json: "w", js: "w", typ: true },
        { json: "th", js: "th", typ: true },
        { json: "f", js: "f", typ: true },
        { json: "s", js: "s", typ: true },
        { json: "su", js: "su", typ: true },
    ], false),
    "Notification": o([
        { json: "type", js: "type", typ: "" },
        { json: "data", js: "data", typ: r("Data") },
        { json: "seen", js: "seen", typ: true },
        { json: "id", js: "id", typ: "" },
    ], false),
    "Data": o([
        { json: "headerText", js: "headerText", typ: "" },
        { json: "bodyText", js: "bodyText", typ: "" },
    ], false),
    "Attribute": [
        "int",
        "str",
    ],
    "Frequency": [
        "daily",
        "monthly",
        "weekly",
    ],
    "SharedCompletion": [
        "singleCompletion",
    ],
    "Type": [
        "daily",
        "habit",
        "reward",
        "todo",
    ],
};
