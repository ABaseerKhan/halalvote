import { config, EnvConfig } from './config';

const envConfig = config();

export const postData = async ({ baseUrl, path, data, additionalHeaders}: { baseUrl: string, path: string, data: Object, additionalHeaders: any }) => {
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
    return await response.json();
}

export const getData = async (url = '', data = {}) => {
    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': '0idjsdWPR62EQoEPW8Wh46tw2TYNgpU36VLHGQpu',
        },
    });
    return await response.json();
}

const getApiKey = (baseUrl: string, envConfig: EnvConfig) => { 
    switch(baseUrl) {
        case envConfig.items.url:
            return envConfig.items.apiKey;
        case envConfig.comments.url:
            return envConfig.comments.apiKey;
        default:
            return envConfig.items.apiKey;
    }
}
