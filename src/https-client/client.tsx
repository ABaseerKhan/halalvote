import { config, EnvConfig } from './config';

const envConfig = config();

interface Request { 
    baseUrl: string, 
    path: string, 
    data?: any, 
    queryParams?: any,
    additionalHeaders: any,
    setCookie?: any,
};

export const postData = async (request: Request, willRetry: boolean = true): Promise<any> => {
    const { baseUrl, path, data, additionalHeaders } = request;

    const response = await fetch(baseUrl + path, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            ...additionalHeaders,
            'Content-Type': 'application/json',
            'x-api-key': getApiKey(baseUrl, envConfig),
        },
        body: JSON.stringify(data),
    });
    if(response.status === 401) {
        handle401(request);
        if (willRetry) {
            return await postData(request);
        }
    }
    if(response.status === 400) {
        handle400();
    }
    return { status: response.status, data: await response.json() };
}

export const getData = async (request: Request, willRetry: boolean = true): Promise<any> => {
    const { baseUrl, path, queryParams={}, additionalHeaders={} } = request;

    const query = Object.keys(queryParams)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(queryParams[k]))
        .join('&');

    const url = baseUrl + path + ((query && ("?" + query)) || "");
    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            ...additionalHeaders,
            'Content-Type': 'application/json',
            'x-api-key': getApiKey(baseUrl, envConfig),
        },
    });
    if(response.status === 401) {
        handle401(request);
        if (willRetry) {
            return await getData(request);
        }
    }
    if(response.status === 400) {
        handle400();
    }
    return { status: response.status, data: await response.json() };
}

const getApiKey = (baseUrl: string, envConfig: EnvConfig) => { 
    switch(baseUrl) {
        case envConfig.topics.url:
            return envConfig.topics.apiKey;
        case envConfig.comments.url:
            return envConfig.comments.apiKey;
        case envConfig.users.url:
            return envConfig.users.apiKey;
        default:
            return envConfig.topics.apiKey;
    }
}

const handle401 = async ({ data, additionalHeaders }: Request) => {
    document.cookie = "username= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "sessiontoken= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
    delete additionalHeaders.sessiontoken;
    delete additionalHeaders.username;
    if (data) delete data.username;
}

const handle400 = () => {
    window.history.replaceState({}, document.title, window.location.href + "&loginScreen=login");
}
