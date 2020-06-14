export interface EnvConfig {
    items: {
        apiKey: string,
        url: string
    };
    comments: {
        apiKey: string,
        url: string
    };
}

export const config = (): EnvConfig => {
    const qaConfig = {
        items: {
            apiKey: '0idjsdWPR62EQoEPW8Wh46tw2TYNgpU36VLHGQpu',
            url: 'https://3qhzg4cerc.execute-api.us-east-1.amazonaws.com/qa/',
        },
        comments: {
            apiKey: 'wQeeD3fsZ5yvo5E74WeW64pB0rPPOWm4AXdEF4zc',
            url: 'https://15v0695aui.execute-api.us-east-1.amazonaws.com/qa/',
        }
    };
    const prodConfig = {
        items: {
            apiKey: '',
            url: '',
        },
        comments: {
            apiKey: '',
            url: '',
        }
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

export const commentsConfig = config().comments
export const itemsConfig = config().items
