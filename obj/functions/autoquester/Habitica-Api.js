"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabiticaAPI = void 0;
const axios_1 = require("axios");
class HabiticaAPI {
    constructor(user_id, api_token) {
        this.v3_url = "https://habitica.com/api/v3";
        this.user_id = user_id;
        this.api_token = api_token;
        this.default_config =
            {
                headers: {
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
                    axios_1.default.get(path, curConfig).then((response) => {
                        return response.data;
                    });
                    break;
                }
            case 'PUT':
                {
                    if (data != null) {
                        data = new TextEncoder().encode(JSON.stringify(data));
                        axios_1.default.put(path, data, curConfig).then((response) => {
                            return response.data;
                        });
                    }
                    else {
                        axios_1.default.put(path, null, curConfig).then((response) => {
                            return response.data;
                        });
                    }
                    break;
                }
            default:
                {
                    console.log("Not implemented");
                    break;
                }
        }
        return null;
    }
    user() {
        return this.v3_request('GET', "/user");
    }
    tasks() {
        return this.v3_request('GET', "/tasks/user");
    }
    task(task_id) {
        return this.v3_request('GET', "/tasks/" + task_id);
    }
    update_task(task_id, data) {
        return this.v3_request('PUT', "/tasks/" + task_id, data);
    }
}
exports.HabiticaAPI = HabiticaAPI;
//# sourceMappingURL=Habitica-Api.js.map