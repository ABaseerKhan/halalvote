export interface APIConfig {
    users: {
        apiKey: string,
        url: string
    };
    topics: {
        apiKey: string,
        url: string
    };
    comments: {
        apiKey: string,
        url: string
    };
}

const config: APIConfig = {
    users: {
        apiKey: process.env.REACT_APP_USERS_API_KEY!,
        url: process.env.REACT_APP_USERS_API_URL!,
    },
    topics: {
        apiKey: process.env.REACT_APP_TOPICS_API_KEY!,
        url: process.env.REACT_APP_TOPICS_API_URL!,
    },
    comments: {
        apiKey: process.env.REACT_APP_ARGUMENTS_API_KEY!,
        url: process.env.REACT_APP_ARGUMENTS_API_URL!,
    },
};

export const usersAPIConfig = config.users;
export const topicsAPIConfig = config.topics;
export const commentsAPIConfig = config.comments;

