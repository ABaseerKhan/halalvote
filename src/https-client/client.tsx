import { usersAPIConfig, topicsAPIConfig, commentsAPIConfig } from './config';
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

    if (path.includes('delete')) {
        const confirmed = window.confirm("Confirm delete");
        if (!confirmed) {
            return { status: 499, data: undefined };
        }
    }

    const response = await fetch(baseUrl + path, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            ...additionalHeaders,
            'Content-Type': 'application/json',
            'x-api-key': getApiKey(baseUrl),
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
            'x-api-key': getApiKey(baseUrl),
        },
    });
    return { status: response.status, data: await response.json() };
}

const getApiKey = (baseUrl: string) => { 
    switch(baseUrl) {
        case usersAPIConfig.url:
            return usersAPIConfig.apiKey;
        case topicsAPIConfig.url:
            return topicsAPIConfig.apiKey;
        case commentsAPIConfig.url:
            return commentsAPIConfig.apiKey;
        default:
            return topicsAPIConfig.apiKey;
    }
}
