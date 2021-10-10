import {WebhookConvert, WebhookUpdateData} from "./WebhookUpdateData"
import {TasksRequestConvert, TasksRequest, Datum} from "./TasksRequestData";
import {HabiticaAPI} from "./Habitica-Api"

class MapEntry
{
    Total: number = 0;
    Completed: number = 0;
    ListeningHabits: Datum[] = [];
}

const PROGRESS_BAR_TAG = `https://progress-bar.dev/`;

exports.handler = async(event, context) =>
{
    try
    {
        const allData: WebhookUpdateData = WebhookConvert.ToData(event.body);
        if(allData.task.type == 'daily')
        {
            if(allData.task.tags.length > 0)
            {
                var toProcess: string[] = []
                allData.task.tags.forEach(element => 
                {
                    if(element.startsWith("! "))
                    {
                        toProcess.push(element);
                    }
                });

                // Do we have a possible tag to test
                if(toProcess.length > 0)
                {
                    const currentAPI = new HabiticaAPI(allData.user._id, process.env.USER_API_TOKEN);
                    var rawData = currentAPI.tasks();
                    if(rawData != null)
                    {
                        var data: TasksRequest = TasksRequestConvert.ToData(rawData);
                        if(data != null)
                        {
                            var tagsMap = new Map<string, MapEntry>();

                            data.data.forEach((task =>
                                {
                                    if(task.type == 'daily' || task.type == 'todo')
                                    {
                                        task.tags.forEach(tag => 
                                        {
                                            if(tag.startsWith("["))
                                            {
                                                var curVal: MapEntry;
                                                if(tagsMap.has(tag))
                                                {
                                                    curVal = tagsMap.get(tag);
                                                }

                                                ++curVal.Total;
                                                if(task.completed)
                                                {
                                                    ++curVal.Completed;
                                                }
                                                tagsMap.set(tag, curVal);
                                            }
                                        });
                                    }
                                    else if(task.type == 'habit')
                                    {
                                        task.tags.forEach((tag) =>
                                        {
                                            if(tag.startsWith("["))
                                            {
                                                var curVal: MapEntry;
                                                if(tagsMap.has(tag))
                                                {
                                                    curVal = tagsMap.get(tag);
                                                }

                                                curVal.ListeningHabits.push(task);
                                                tagsMap.set(tag, curVal);
                                            }
                                        });
                                    }
                                }));
                            
                            tagsMap.forEach((value, key) =>
                            {
                                if(value.Total > 0)
                                {
                                    var percentage = value.Total == value.Completed ? 1.0 : value.Total / value.Completed;
                                    var isComplete = percentage == 1.0 ? true : false;
                                    value.ListeningHabits.forEach(habitTask => 
                                    {
                                        // Mark listeners as done/revert
                                        // Update progress bar (if available)
                                        // Find https://progress-bar.dev/???/ and replace ??? with percentage


                                        var progressStartIDX: number = habitTask.notes.indexOf(PROGRESS_BAR_TAG) + PROGRESS_BAR_TAG.length;
                                        if(progressStartIDX != -1)
                                        {
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
    catch(e)
    {
        console.log(e);
    }
}