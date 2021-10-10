import axios, { AxiosRequestConfig } from "axios";

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
                'x-api-user': this.user_id,
                'x-api-key': this.api_token
            }
        }
    }

    private v3_request(method: HTTPNAMES, path: string, data?)
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
                    axios.get(path, curConfig).then((response) =>
                    {
                        return response.data;
                    });
                    break;
                }
            case 'PUT':
                {
                    if(data != null)
                    {
                        data = new TextEncoder().encode(JSON.stringify(data));
                        axios.put(path, data, curConfig).then((response) =>
                        {
                            return response.data;
                        })
                    }
                    else
                    {
                        axios.put(path, null, curConfig).then((response) =>
                        {
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

    user()
    {
        return this.v3_request('GET', "/user");
    }

    tasks()
    {
        return this.v3_request('GET', "/tasks/user");
    }

    task(task_id: string)
    {
        return this.v3_request('GET', "/tasks/" + task_id)
    }

    update_task(task_id: string, data)
    {
        return this.v3_request('PUT', "/tasks/" + task_id, data);
    }


    private readonly default_config: AxiosRequestConfig
    private readonly user_id: string;
    private readonly api_token: string;
    private readonly v3_url = "https://habitica.com/api/v3";
}

type HTTPNAMES = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTION' | 'TRACE' 