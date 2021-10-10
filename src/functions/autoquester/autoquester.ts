import { Handler } from '@netlify/functions'
import {WebhookConvert, WebhookUpdateData} from "../../WebhookUpdateData"
import {TasksRequestConvert, TasksRequest, Datum} from "../../TasksRequestData";
import {HabiticaAPI} from "../../Habitica-Api"
import dotenv from "dotenv";

class MapEntry
{
    Total: number = 0;
    Completed: number = 0;
    ListeningHabits: Datum[] = [];
}

const PROGRESS_BAR_TAG = `https://progress-bar.dev/`;

export async function autoquesterFunc(body: string)
{
    dotenv.config();
    
    try
    {
        const allData: WebhookUpdateData = WebhookConvert.ToData(body);
        if(allData.task.type == 'daily')
        {
            if(allData.task.tags.length > 0)
            {
                // Do we have a possible tag to test
                if(allData.task.tags.length > 0)
                {
                    const currentAPI = new HabiticaAPI(allData.user._id, process.env.USER_API_TOKEN);
                    await currentAPI.GetAllTasks().then((rawData) =>
                    {
                        if(rawData == null)
                        {
                            throw new Error("Couldn't get tasks");
                        }

                        var data: TasksRequest = TasksRequestConvert.ToData(rawData);
                        if(data != null)
                        {
                            var tagsMap = new Map<string, MapEntry>();

                            for(var i = 0; i < data.data.length; ++i)
                            {
                                var currentTask = data.data[i];

                                if(currentTask.type == 'daily' || currentTask.type == 'todo')
                                {
                                    for(var y = 0; y < currentTask.tags.length; ++y)
                                    {
                                        var currentTag = currentTask.tags[y];
                                        
                                        var curVal: MapEntry = new MapEntry();
                                        if(tagsMap.has(currentTag))
                                        {
                                            curVal = tagsMap.get(currentTag);
                                        }

                                        ++curVal.Total;
                                        if(currentTask.completed)
                                        {
                                            ++curVal.Completed;
                                        }
                                        tagsMap.set(currentTag, curVal);
                                    }
                                }
                                else if(currentTask.type == 'habit')
                                {
                                    for(var y = 0; y < currentTask.tags.length; ++y)
                                    {
                                        var currentTag = currentTask.tags[y];

                                        var curVal: MapEntry = new MapEntry();
                                        if(tagsMap.has(currentTag))
                                        {
                                            curVal = tagsMap.get(currentTag);
                                        }

                                        curVal.ListeningHabits.push(currentTask);
                                        tagsMap.set(currentTag, curVal);
                                    }
                                }
                            }
                            
                            tagsMap.forEach((value, key) =>
                            {
                                if(value.Total > 0)
                                {
                                    var percentage = value.Total == value.Completed ? 1.0 : value.Completed / value.Total;
                                    percentage = percentage == Infinity ? 0 : percentage;
                                    var isComplete = percentage == 1.0 ? true : false;
                                    value.ListeningHabits.forEach(async habitTask => 
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

                                        await currentAPI.update_task(habitTask.id, habitTask);
                                    });
                                }
                            });
                        }
                    });

                }
            }
        }
    }
    catch(e)
    {
        console.log(e);
    }
}

export const handler: Handler = async(event, context) =>
{
    var body = event.body;
    console.log(body);
    body = JSON.stringify(event.body);

    await autoquesterFunc(body);

    return {
        statusCode: 200
    }
}