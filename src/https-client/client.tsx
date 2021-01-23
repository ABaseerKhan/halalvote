import { config, EnvConfig } from './config';

const envConfig = config();

export interface Request { 
    baseUrl: string, 
    path: string, 
    data?: any, 
    queryParams?: any,
    additionalHeaders: any,
    setCookie?: any,
};

export interface Response {
    status: number,
    data: any,
}

export const postData = async (request: Request): Promise<Response> => {
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
    return { status: response.status, data: await response.json() };
}

export const getData = async (request: Request): Promise<Response> => {
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
