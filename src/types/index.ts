export enum Judgment {
    HALAL,
    HARAM,
};

export const judgementToTextMap = {
    0: "HALAL",
    1: "HARAM"
};

export interface Item {
    itemName: string;
    username: string;
    haramVotes: number;
    halalVotes: number;
    numHalalComments: number;
    numHaramComments: number;
    timeStamp: string;
    vote: number | undefined | null;
}

export interface Comment {
    id: number,
    commentType: string,
    username: string,
    comment: string,
    replies: Comment[],
    upVotes: number,
    downVotes: number,
    numReplies: number,
    timeStamp: string,
};

export enum Vote {
    UPVOTE,
    DOWNVOTE,
    NONE
}