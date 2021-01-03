export enum Judgment {
    HALAL,
    HARAM,
    OTHER
};

export const userVoteToCommentType = (userVote: number | undefined) => {
    switch(userVote) {
        case 1:
            return "HALAL";
        case -1:
            return "HARAM";
        default:
            return "OTHER";
    }
};

export interface Topic {
    topicTitle: string;
    username: string;
    haramPoints: number;
    halalPoints: number;
    numVotes: number;
    numComments: number;
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
    userLike: number;
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
    depth: number,
    userVote?: number,
    repliesShown: number,
};

export enum Vote {
    DOWNVOTE,
    UPVOTE,
}

export enum ModalType {
    LOGIN,
    ADD_TOPIC,
    PROFILE,
}

export enum MenuLocation {
    UPPER_LEFT,
    UPPER_RIGHT,
    BOTTOM_RIGHT,
    BOTTOM_LEFT,
    NONE
}

export interface AnalyticCounts {
    halalCounts: number[],
    haramCounts: number[]
}