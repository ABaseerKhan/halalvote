import { usersAPIConfig, topicsAPIConfig, commentsAPIConfig, superUsername } from './config';
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

const getLoggedInUser = (): string | undefined => {
    return document.cookie.split('; ').find(row => row.startsWith("username="))?.split('=')[1];
}

const getSessionToken = (): string | undefined => {
    return document.cookie.split('; ').find(row => row.startsWith("sessiontoken="))?.split('=')[1];
}

export const postData = async (request: Request): Promise<Response> => {
    const { baseUrl, path, data, additionalHeaders } = request;

    if (path.includes('delete')) {
        const confirmed = window.confirm("Confirm delete");
        if (!confirmed) {
            return { status: 499, data: undefined };
        }
    }

    const loggedInUser = getLoggedInUser();
    const userSessionToken = getSessionToken();

    let refreshSessionTokenHeaders: any = {}
    if (loggedInUser && userSessionToken) {
        refreshSessionTokenHeaders.refreshusername = loggedInUser;
        refreshSessionTokenHeaders.refreshsessiontoken = userSessionToken;
    }

    const response = await fetch(baseUrl + path, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            ...additionalHeaders,
            ...refreshSessionTokenHeaders,
            'Content-Type': 'application/json',
            'x-api-key': getApiKey(baseUrl),
            'issuperuser': (loggedInUser && loggedInUser === superUsername)
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
    const loggedInUser = getLoggedInUser();
    const userSessionToken = getSessionToken();

    let refreshSessionTokenHeaders: any = {}
    if (loggedInUser && userSessionToken) {
        refreshSessionTokenHeaders.refreshusername = loggedInUser;
        refreshSessionTokenHeaders.refreshsessiontoken = userSessionToken;
    }

    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            ...additionalHeaders,
            ...refreshSessionTokenHeaders,
            'Content-Type': 'application/json',
            'x-api-key': getApiKey(baseUrl),
            'issuperuser': (loggedInUser && loggedInUser === superUsername)
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
