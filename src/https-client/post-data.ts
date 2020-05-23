import { config, EnvConfig } from './config';

const envConfig = config();

export const postData = async ({ baseUrl, path, data}: { baseUrl: string, path: string, data: Object }) => {
    const response = await fetch(baseUrl + path, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
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
        case envConfig.itemsUrl:
            return envConfig.itemsApiKey;
        default:
            return envConfig.itemsApiKey;
    }
}
