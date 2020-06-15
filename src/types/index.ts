export enum Judgment {
    HALAL,
    HARAM,
};

export interface Item {
    itemName: string;
    username: string;
    haramVotes: number;
    halalVotes: number;
    numComments: number;
    timeStamp: string;
}

export interface Comment {
    id: number,
    username: string,
    comment: string,
    replies: Comment[],
    upVotes: number,
    downVotes: number,
    numReplies: number,
};

export enum Vote {
    UPVOTE,
    DOWNVOTE,
    NONE
}