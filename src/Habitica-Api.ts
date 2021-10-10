import axios, { AxiosRequestConfig } from "axios";
import { TagsRequestConvert, TagsRequestData } from "./TagsRequestData";
import { TasksRequest, TasksRequestConvert } from "./TasksRequestData";

export class HabiticaAPI
{

    constructor(user_id, api_token)
    {
        this.user_id = user_id;
        this.api_token = api_token;
        this.default_config = 
        {
            headers:
            {
                'Content-Type': 'application/json',
                'x-api-user': this.user_id,
                'x-api-key': this.api_token,
            },
            timeout: 5000
        }
    }

    private v3_request(method: HTTPNAMES, path: string, data: string = null): Promise<any>
    {
        var curConfig = this.default_config;

        if(!path.startsWith("/"))
        {
            path = "/" + path;
        }
        path = this.v3_url + path;

        switch(method)
        {
            case 'GET':
                {
                    return axios.get(path, curConfig).then((response) =>
                    {
                        return JSON.stringify(response.data);
                    }).catch((error) =>
                    {
                        console.log(`Failed GET request with path ${path} and config (${curConfig})`);
                    });
                    break;
                }
            case 'PUT':
                {
                    if(data != null)
                    {
                        return axios.put(path, data, curConfig).then((response) =>
                        {
                            console.log(`PUT Responce: ${response.status}: ${response.statusText}`);
                            return response.data;
                        }).catch((error) =>
                        {
                            console.log(`Failed PUT request with path ${path} and config (${curConfig}). Data: ${data}.`);
                        })
                    }
                    else
                    {
                        return axios.put(path, "", curConfig).then((response) =>
                        {
                            return response.data;
                        }).catch((error) =>
                        {
                            console.log(`Failed PUT request with path ${path} and config (${curConfig}). No Data.`);
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

    async GetAllTasks(): Promise<TasksRequest>
    {
        try
        {
            var outData: TasksRequest = null;

            console.log("Getting all tasks....");
            await this.v3_request('GET', "/tasks/user").then((rawData) =>
            {
                if(rawData != null)
                {
                    outData = TasksRequestConvert.ToData(rawData);
                }
                else
                {
                    throw new Error("Couldn't parse task request data");                
                }
    
                console.log(`Fetched all tasks: ${outData}`);
            });
            
            return outData;
        }
        catch(error)
        {
            console.log(error);
        }
    }

    async Update_Task(task_id: string, data: string = null): Promise<void>
    {
        try
        {
            if(data != null)
            {
                console.log(`Updating ${task_id}, with data: ${data}`);
                await this.v3_request('PUT', "/tasks/" + task_id, data);
            }
            else
            {
                console.log(`Sending PUT to task (${task_id}) with no data`);
                await this.v3_request('PUT', "/tasks/" + task_id, null);
            }

            console.log("PUT UpdateTask completed");
        }
        catch(error)
        {
            console.log(error);
        }
    }

    async GetAllTags(): Promise<TagsRequestData>
    {
        try
        {
            console.log("Getting all tags...");
            return this.v3_request('GET', "/tags").then((rawData) => 
            {
                var parsedData: TagsRequestData = null;
                if(rawData != null)
                {
                    parsedData = TagsRequestConvert.ToData(rawData);
                }
                else
                {
                    throw new Error("Couldn't parse tags request data");
                }

                console.log(`Fetched all tags: ${parsedData}`);

                return parsedData;
            });
        }
        catch(error)
        {
            console.log(error);
        }
    }


    private readonly default_config: AxiosRequestConfig
    private readonly user_id: string;
    private readonly api_token: string;
    private readonly v3_url = "https://habitica.com/api/v3";
}

type HTTPNAMES = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTION' | 'TRACE' 