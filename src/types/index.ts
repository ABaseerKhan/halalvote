export enum Judgment {
    HALAL,
    HARAM,
};

export const judgementToTextMap = {
    0: "HALAL",
    1: "HARAM"
};

export interface Topic {
    topicTitle: string;
    username: string;
    haramPoints: number;
    halalPoints: number;
    numVotes: number;
    numHalalComments: number;
    numHaramComments: number;
    timeStamp: string;
    vote: number | undefined;
}

export interface TopicImages {
    id: number;
    username: string;
    image: string;
    likes: number;
    width?: number;
    height?: number;
}

export interface Comment {
    id: number,
    topicTitle?: string,
    commentType: string,
    username: string,
    comment: string,
    replies: Comment[],
    upVotes: number,
    downVotes: number,
    numReplies: number,
    timeStamp: string,
    userVote?: number,
};

export enum Vote {
    DOWNVOTE,
    UPVOTE,
}

export enum ModalType {
    LOGIN,
    ADD_TOPIC,
    TOPIC_IMAGE,
    ACCOUNT,
}

export enum MenuLocation {
    UPPER_LEFT,
    UPPER_RIGHT,
    BOTTOM_RIGHT,
    BOTTOM_LEFT,
    NONE
}