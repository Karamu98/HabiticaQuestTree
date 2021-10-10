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
Object.defineProperty(exports, "__esModule", { value: true });
const WebhookUpdateData_1 = require("./WebhookUpdateData");
const TasksRequestData_1 = require("./TasksRequestData");
const Habitica_Api_1 = require("./Habitica-Api");
class MapEntry {
    constructor() {
        this.Total = 0;
        this.Completed = 0;
        this.ListeningHabits = [];
    }
}
const PROGRESS_BAR_TAG = `https://progress-bar.dev/`;
exports.handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allData = WebhookUpdateData_1.WebhookConvert.ToData(event.body);
        if (allData.task.type == 'daily') {
            if (allData.task.tags.length > 0) {
                var toProcess = [];
                allData.task.tags.forEach(element => {
                    if (element.startsWith("! ")) {
                        toProcess.push(element);
                    }
                });
                // Do we have a possible tag to test
                if (toProcess.length > 0) {
                    const currentAPI = new Habitica_Api_1.HabiticaAPI(allData.user._id, process.env.USER_API_TOKEN);
                    var rawData = currentAPI.tasks();
                    if (rawData != null) {
                        var data = TasksRequestData_1.TasksRequestConvert.ToData(rawData);
                        if (data != null) {
                            var tagsMap = new Map();
                            data.data.forEach((task => {
                                if (task.type == 'daily' || task.type == 'todo') {
                                    task.tags.forEach(tag => {
                                        if (tag.startsWith("[")) {
                                            var curVal;
                                            if (tagsMap.has(tag)) {
                                                curVal = tagsMap.get(tag);
                                            }
                                            ++curVal.Total;
                                            if (task.completed) {
                                                ++curVal.Completed;
                                            }
                                            tagsMap.set(tag, curVal);
                                        }
                                    });
                                }
                                else if (task.type == 'habit') {
                                    task.tags.forEach((tag) => {
                                        if (tag.startsWith("[")) {
                                            var curVal;
                                            if (tagsMap.has(tag)) {
                                                curVal = tagsMap.get(tag);
                                            }
                                            curVal.ListeningHabits.push(task);
                                            tagsMap.set(tag, curVal);
                                        }
                                    });
                                }
                            }));
                            tagsMap.forEach((value, key) => {
                                if (value.Total > 0) {
                                    var percentage = value.Total == value.Completed ? 1.0 : value.Total / value.Completed;
                                    var isComplete = percentage == 1.0 ? true : false;
                                    value.ListeningHabits.forEach(habitTask => {
                                        // Mark listeners as done/revert
                                        // Update progress bar (if available)
                                        // Find https://progress-bar.dev/???/ and replace ??? with percentage
                                        var progressStartIDX = habitTask.notes.indexOf(PROGRESS_BAR_TAG) + PROGRESS_BAR_TAG.length;
                                        if (progressStartIDX != -1) {
                                            var progressNum = Math.floor(percentage * 100).toString();
                                            var nextSlash = habitTask.notes.indexOf("/", progressStartIDX);
                                            var modNotes = habitTask.notes.substr(0, progressStartIDX) + progressNum + habitTask.notes.substr(nextSlash);
                                            habitTask.notes = modNotes;
                                        }
                                        currentAPI.update_task(habitTask.id, habitTask);
                                    });
                                }
                            });
                        }
                    }
                }
            }
        }
    }
    catch (e) {
        console.log(e);
    }
});
//# sourceMappingURL=main.js.map