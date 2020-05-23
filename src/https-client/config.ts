export interface EnvConfig {
    itemsApiKey: string;
    itemsUrl: string;
}

export const config = (): EnvConfig => {
    const qaConfig = {
        itemsApiKey: '0idjsdWPR62EQoEPW8Wh46tw2TYNgpU36VLHGQpu',
        itemsUrl: 'https://3qhzg4cerc.execute-api.us-east-1.amazonaws.com/qa/',
    };
    const prodConfig = {
        itemsApiKey: '',
        itemsUrl: '',
    };

    switch(process.env.NODE_ENV) {
        case 'development':
            return qaConfig;
        case 'production':
            return prodConfig;
        default:
            return qaConfig;
    }
};
