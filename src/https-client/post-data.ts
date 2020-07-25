import { config, EnvConfig } from './config';

const envConfig = config();

export const postData = async ({ baseUrl, path, data, additionalHeaders }: { baseUrl: string, path: string, data: Object, additionalHeaders: any }) => {
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

export const getData = async ({ baseUrl, path, queryParams={}, additionalHeaders={} }: { baseUrl: string, path: string, queryParams: any, additionalHeaders: any }) => {
    const query = Object.keys(queryParams)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(queryParams[k]))
        .join('&');

    const url = baseUrl + path + (query && ("?" + query) || "");
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
