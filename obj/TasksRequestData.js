"use strict";
// To parse this data:
//
//   import { Convert, WebhookUpdateData } from "./file";
//
//   const webhookUpdateData = Convert.toWebhookUpdateData(json);
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksRequestConvert = exports.Type = exports.SharedCompletion = exports.Frequency = exports.Attribute = void 0;
var Attribute;
(function (Attribute) {
    Attribute["Int"] = "int";
    Attribute["Str"] = "str";
})(Attribute = exports.Attribute || (exports.Attribute = {}));
var Frequency;
(function (Frequency) {
    Frequency["Daily"] = "daily";
    Frequency["Monthly"] = "monthly";
    Frequency["Weekly"] = "weekly";
})(Frequency = exports.Frequency || (exports.Frequency = {}));
var SharedCompletion;
(function (SharedCompletion) {
    SharedCompletion["SingleCompletion"] = "singleCompletion";
})(SharedCompletion = exports.SharedCompletion || (exports.SharedCompletion = {}));
var Type;
(function (Type) {
    Type["Daily"] = "daily";
    Type["Habit"] = "habit";
    Type["Reward"] = "reward";
    Type["Todo"] = "todo";
})(Type = exports.Type || (exports.Type = {}));
// Converts JSON strings to/from your types
class TasksRequestConvert {
    static ToData(json) {
        return JSON.parse(json);
    }
    static ToJSON(value) {
        return JSON.stringify(value);
    }
}
exports.TasksRequestConvert = TasksRequestConvert;
//# sourceMappingURL=TasksRequestData.js.map