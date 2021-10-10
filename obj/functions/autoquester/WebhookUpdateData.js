"use strict";
// To parse this data:
//
//   import { Convert, Welcome } from "./file";
//
//   const welcome = Convert.toWelcome(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookConvert = void 0;
// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
class WebhookConvert {
    static ToData(json) {
        return cast(JSON.parse(json), r("Welcome"));
    }
    static DataToJSON(value) {
        return JSON.stringify(uncast(value, r("Welcome")), null, 2);
    }
}
exports.WebhookConvert = WebhookConvert;
function invalidValue(typ, val, key = '') {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`);
}
function jsonToJSProps(typ) {
    if (typ.jsonToJS === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}
function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}
function transform(val, typ, getProps, key = '') {
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val)
            return val;
        return invalidValue(typ, val, key);
    }
    function transformUnion(typs, val) {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            }
            catch (_) { }
        }
        return invalidValue(typs, val);
    }
    function transformEnum(cases, val) {
        if (cases.indexOf(val) !== -1)
            return val;
        return invalidValue(cases, val);
    }
    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val))
            return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }
    function transformDate(val) {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }
    function transformObject(props, additional, val) {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result = {};
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
    if (typ === "any")
        return val;
    if (typ === null) {
        if (val === null)
            return val;
        return invalidValue(typ, val);
    }
    if (typ === false)
        return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ))
        return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems") ? transformArray(typ.arrayItems, val)
                : typ.hasOwnProperty("props") ? transformObject(getProps(typ), typ.additional, val)
                    : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number")
        return transformDate(val);
    return transformPrimitive(typ, val);
}
function cast(val, typ) {
    return transform(val, typ, jsonToJSProps);
}
function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}
function a(typ) {
    return { arrayItems: typ };
}
function u(...typs) {
    return { unionMembers: typs };
}
function o(props, additional) {
    return { props, additional };
}
function m(additional) {
    return { props: [], additional };
}
function r(name) {
    return { ref: name };
}
const typeMap = {
    "Welcome": o([
        { json: "type", js: "type", typ: "" },
        { json: "direction", js: "direction", typ: "" },
        { json: "delta", js: "delta", typ: 0 },
        { json: "task", js: "task", typ: r("Task") },
        { json: "user", js: "user", typ: r("User") },
        { json: "webhookType", js: "webhookType", typ: "" },
    ], false),
    "Task": o([
        { json: "challenge", js: "challenge", typ: r("Challenge") },
        { json: "group", js: "group", typ: r("Group") },
        { json: "up", js: "up", typ: true },
        { json: "down", js: "down", typ: true },
        { json: "counterUp", js: "counterUp", typ: 0 },
        { json: "counterDown", js: "counterDown", typ: 0 },
        { json: "frequency", js: "frequency", typ: "" },
        { json: "history", js: "history", typ: a(r("History")) },
        { json: "type", js: "type", typ: "" },
        { json: "notes", js: "notes", typ: "" },
        { json: "tags", js: "tags", typ: a("any") },
        { json: "value", js: "value", typ: 0 },
        { json: "priority", js: "priority", typ: 0 },
        { json: "attribute", js: "attribute", typ: "" },
        { json: "byHabitica", js: "byHabitica", typ: true },
        { json: "reminders", js: "reminders", typ: a("any") },
        { json: "createdAt", js: "createdAt", typ: Date },
        { json: "updatedAt", js: "updatedAt", typ: Date },
        { json: "_id", js: "_id", typ: "" },
        { json: "text", js: "text", typ: "" },
        { json: "userId", js: "userId", typ: "" },
        { json: "id", js: "id", typ: "" },
    ], false),
    "Challenge": o([], false),
    "Group": o([
        { json: "approval", js: "approval", typ: r("Approval") },
        { json: "assignedUsers", js: "assignedUsers", typ: a("any") },
        { json: "sharedCompletion", js: "sharedCompletion", typ: "" },
    ], false),
    "Approval": o([
        { json: "required", js: "required", typ: true },
        { json: "approved", js: "approved", typ: true },
        { json: "requested", js: "requested", typ: true },
    ], false),
    "History": o([
        { json: "date", js: "date", typ: 0 },
        { json: "value", js: "value", typ: 0 },
        { json: "scoredUp", js: "scoredUp", typ: 0 },
        { json: "scoredDown", js: "scoredDown", typ: 0 },
    ], false),
    "User": o([
        { json: "_tmp", js: "_tmp", typ: r("Tmp") },
        { json: "stats", js: "stats", typ: r("Stats") },
        { json: "_id", js: "_id", typ: "" },
    ], false),
    "Tmp": o([
        { json: "quest", js: "quest", typ: r("Quest") },
        { json: "drop", js: "drop", typ: r("Drop") },
    ], false),
    "Drop": o([
        { json: "value", js: "value", typ: 0 },
        { json: "key", js: "key", typ: "" },
        { json: "premium", js: "premium", typ: true },
        { json: "limited", js: "limited", typ: true },
        { json: "type", js: "type", typ: "" },
        { json: "dialog", js: "dialog", typ: "" },
    ], false),
    "Quest": o([
        { json: "progressDelta", js: "progressDelta", typ: 3.14 },
    ], false),
    "Stats": o([
        { json: "buffs", js: "buffs", typ: r("Buffs") },
        { json: "training", js: "training", typ: r("Training") },
        { json: "hp", js: "hp", typ: 0 },
        { json: "mp", js: "mp", typ: 3.14 },
        { json: "exp", js: "exp", typ: 0 },
        { json: "gp", js: "gp", typ: 3.14 },
        { json: "lvl", js: "lvl", typ: 0 },
        { json: "class", js: "class", typ: "" },
        { json: "points", js: "points", typ: 0 },
        { json: "str", js: "str", typ: 0 },
        { json: "con", js: "con", typ: 0 },
        { json: "int", js: "int", typ: 0 },
        { json: "per", js: "per", typ: 0 },
        { json: "toNextLevel", js: "toNextLevel", typ: 0 },
        { json: "maxHealth", js: "maxHealth", typ: 0 },
        { json: "maxMP", js: "maxMP", typ: 0 },
    ], false),
    "Buffs": o([
        { json: "str", js: "str", typ: 0 },
        { json: "int", js: "int", typ: 0 },
        { json: "per", js: "per", typ: 0 },
        { json: "con", js: "con", typ: 0 },
        { json: "stealth", js: "stealth", typ: 0 },
        { json: "streaks", js: "streaks", typ: true },
        { json: "snowball", js: "snowball", typ: true },
        { json: "spookySparkles", js: "spookySparkles", typ: true },
        { json: "shinySeed", js: "shinySeed", typ: true },
        { json: "seafoam", js: "seafoam", typ: true },
    ], false),
    "Training": o([
        { json: "int", js: "int", typ: 0 },
        { json: "per", js: "per", typ: 0 },
        { json: "str", js: "str", typ: 0 },
        { json: "con", js: "con", typ: 0 },
    ], false),
};
//# sourceMappingURL=WebhookUpdateData.js.map