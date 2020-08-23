import { config, EnvConfig } from './config';

const envConfig = config();

export const postData = async (request: { baseUrl: string, path: string, data: any, additionalHeaders: any }): Promise<any> => {
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
        return await postData(request);
    }
    return { status: response.status, data: await response.json() };
}

export const getData = async (request: { baseUrl: string, path: string, queryParams: any, additionalHeaders: any }): Promise<any> => {
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
        return await getData(request);
    }
    return { status: response.status, data: await response.json() };
}

const getApiKey = (baseUrl: string, envConfig: EnvConfig) => { 
    switch(baseUrl) {
        case envConfig.items.url:
            return envConfig.items.apiKey;
        case envConfig.comments.url:
            return envConfig.comments.apiKey;
        case envConfig.users.url:
            return envConfig.users.apiKey;
        default:
            return envConfig.items.apiKey;
    }
}

const handle401 = async ({ data, additionalHeaders }: { baseUrl: string, path: string, data?: any, additionalHeaders: any }) => {
    document.cookie = "username= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "sessiontoken= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
    delete additionalHeaders.sessiontoken;
    delete additionalHeaders.username;
    if (data) delete data.username;
}
