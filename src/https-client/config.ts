export interface EnvConfig {
    topics: {
        apiKey: string,
        url: string
    };
    comments: {
        apiKey: string,
        url: string
    };
    users: {
        apiKey: string,
        url: string
    };
}

export const config = (): EnvConfig => {
    const qaConfig = {
        topics: {
            apiKey: 'HsRUdQh7tO96y4IPwD5xd6wZZAq9qklS4kUt2YTk',
            url: 'https://da6u798b7k.execute-api.us-east-1.amazonaws.com/qa/',
        },
        comments: {
            apiKey: 'wQeeD3fsZ5yvo5E74WeW64pB0rPPOWm4AXdEF4zc',
            url: 'https://15v0695aui.execute-api.us-east-1.amazonaws.com/qa/',
        },
        users: {
            apiKey: 'KaNe6CPBPAaakZXWauVd61E2hPU0uxLG7AkIzdEI',
            url: 'https://3nu4kqzyt4.execute-api.us-east-1.amazonaws.com/qa/'
        }
    };
    const prodConfig = {
        topics: {
            apiKey: 'HsRUdQh7tO96y4IPwD5xd6wZZAq9qklS4kUt2YTk',
            url: 'https://da6u798b7k.execute-api.us-east-1.amazonaws.com/qa/',
        },
        comments: {
            apiKey: 'wQeeD3fsZ5yvo5E74WeW64pB0rPPOWm4AXdEF4zc',
            url: 'https://15v0695aui.execute-api.us-east-1.amazonaws.com/qa/',
        },
        users: {
            apiKey: 'KaNe6CPBPAaakZXWauVd61E2hPU0uxLG7AkIzdEI',
            url: 'https://3nu4kqzyt4.execute-api.us-east-1.amazonaws.com/qa/',
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
export const topicsConfig = config().topics
export const usersConfig = config().users
