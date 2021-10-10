"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabiticaAPI = void 0;
const axios_1 = __importDefault(require("axios"));
class HabiticaAPI {
    constructor(user_id, api_token) {
        this.v3_url = "https://habitica.com/api/v3";
        this.user_id = user_id;
        this.api_token = api_token;
        this.default_config =
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-user': this.user_id,
                    'x-api-key': this.api_token
                }
            };
    }
    v3_request(method, path, data) {
        var curConfig = this.default_config;
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        path = this.v3_url + path;
        switch (method) {
            case 'GET':
                {
                    return axios_1.default.get(path, curConfig).then((response) => {
                        return JSON.stringify(response.data);
                    });
                }
            case 'PUT':
                {
                    if (data != null) {
                        data = new TextEncoder().encode(JSON.stringify(data));
                        return axios_1.default.put(path, data, curConfig).then((response) => {
                            return response.data;
                        });
                    }
                    else {
                        return axios_1.default.put(path, "", curConfig).then((response) => {
                            return response.data;
                        });
                    }
                }
            default:
                {
                    console.log("Not implemented");
                    break;
                }
        }
        return null;
    }
    GetAllTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.v3_request('GET', "/tasks/user");
        });
    }
    update_task(task_id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.v3_request('PUT', "/tasks/" + task_id, data);
        });
    }
}
exports.HabiticaAPI = HabiticaAPI;
//# sourceMappingURL=Habitica-Api.js.map