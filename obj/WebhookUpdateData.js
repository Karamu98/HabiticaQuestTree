"use strict";
// To parse this data:
//
//   import { Convert, WebhookUpdateData } from "./file";
//
//   const webhookUpdateData = Convert.toWebhookUpdateData(json);
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookConvert = void 0;
// Converts JSON strings to/from your types
class WebhookConvert {
    static ToData(json) {
        return JSON.parse(json);
    }
    static ToJSON(value) {
        return JSON.stringify(value);
    }
}
exports.WebhookConvert = WebhookConvert;
//# sourceMappingURL=WebhookUpdateData.js.map