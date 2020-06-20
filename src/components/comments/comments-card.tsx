import React, { useState, useEffect } from 'react';
import { CommentMakerComponent } from "./comment-maker";
import { CommentComponent } from "./comment";
import { Comment } from '../../types';
import { postData } from '../../https-client/post-data';
import { commentsConfig } from '../../https-client/config';
import { UserContext } from '../app-shell'

// type imports
import { Item, Judgment } from '../../types';

// style imports
import './comments-card.css';

interface CommentsCardComponentProps {
    judgment: Judgment,
    item: Item | undefined,
    totalTopLevelComments: number,
};

interface CommentsCardState {
    comments: Comment[];
    pathToHighlightedComment: number[] | undefined;
};

export const CommentsCardComponent = (props: CommentsCardComponentProps) => {
    const { judgment, item } = props;
    let {username, sessiontoken} = React.useContext(UserContext)

    const [state, setState] = useState<CommentsCardState>({
        comments: [],
        pathToHighlightedComment: undefined,
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await postData({ 
                baseUrl: commentsConfig.url,
                path: 'get-comments', 
                data: {
                    "commentType": judgementToTextMap[judgment],
                    "itemName": item?.itemName,
                    "depth": 2,
                    "n": 2
                },
                additionalHeaders: { },
            });
            setState(s => ({ ...s, comments: data }));
        };
        if (item?.itemName) {
            fetchData();
        }
    }, [item?.itemName, judgment])

    const fetchMoreReplies = (pathToParentComment: number[]) => {
        const parentComment = getCommentFromPath(state.comments, pathToParentComment);
        const fetchData = async () => {
            const comments: Comment[] = await postData({ 
                baseUrl: commentsConfig.url,
                path: 'get-comments', 
                data: { 
                    "commentType": judgementToTextMap[judgment],
                    "itemName": item?.itemName,
                    "parentId": parentComment?.id,
                    "depth": 2, 
                    "n": 2,
                    "excludedCommentIds": parentComment ? parentComment.replies.map((r) => r.id) : state.comments.map((r) => r.id),
                },
                additionalHeaders: { },
            });
            const updatedComments = addCommentsLocally(state.comments, comments, pathToParentComment);
            setState({ ...state, comments: updatedComments });
        };
        fetchData();
    }

    const createComment = (commentText: string) => {
        const fetchData = async () => {
            const highlightedComment = getCommentFromPath(state.comments, state.pathToHighlightedComment);
            const comment: Comment = await postData({
                baseUrl: commentsConfig.url,
                path: 'add-comment', 
                data: { 
                    "parentId": highlightedComment?.id,
                    "itemName": props.item?.itemName, 
                    "username": username,
                    "comment": commentText,
                    "commentType": judgementToTextMap[judgment],
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                }
            });
            const commentObject: Comment = {
                id: comment.id,
                commentType: judgementToTextMap[judgment],
                username: username,
                comment: commentText,
                replies: [],
                upVotes: 0,
                downVotes: 0,
                numReplies: 0,
                timeStamp: comment.timeStamp
            };
            
            let updatedComments;
            if (highlightedComment) {
                updatedComments = addCommentsLocally(state.comments, [commentObject], state.pathToHighlightedComment);
            } else {
                updatedComments = addCommentsLocally(state.comments, [commentObject]);
            }
            setState({ ...state, comments: updatedComments });
        }

        fetchData();
    }

    const deleteComment = (pathToComment: number[]) => {
        const fetchData = async () => {
            const commentToDelete = getCommentFromPath(state.comments, pathToComment);
            const response = await postData({
                baseUrl: commentsConfig.url,
                path: 'delete-comment', 
                data: { 
                    "itemName": item?.itemName,
                    "id": commentToDelete?.id,
                    "username": username,
                    "commentType": commentToDelete?.commentType,
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                }
            });
            
            const updatedComments = deleteCommentLocally(state.comments, pathToComment, !!response.psuedoDelete);

            setState({ ...state, comments: updatedComments });
        }
        fetchData();
    }

    const highlightComment = (path: number[] | undefined) => {
        setState({
            ...state,
            pathToHighlightedComment: path,
        });
    }

    const moreComments = props.totalTopLevelComments - state.comments.length;
    const highlightedComment = getCommentFromPath(state.comments, state.pathToHighlightedComment);

    return(
        <div className={"container"}>
            <div className={'header-text'} >{judgementToVoteText(judgment, item)}</div>
            <br />
            <div onClick={() => highlightComment(undefined)} className={"comments-card-" + judgment.toString()}>
                <div >
                    {
                        state.comments.map((comment: Comment, i: number) => {
                            return <CommentComponent 
                                        key={comment.id} 
                                        comment={comment} 
                                        path={[i]} 
                                        pathToHighlightedComment={state.pathToHighlightedComment} 
                                        highlightComment={highlightComment} 
                                        fetchMoreReplies={fetchMoreReplies}
                                        deleteComment={deleteComment}
                                    />
                        })
                    }
                    {
                        moreComments > 0 &&
                        <div className="show-more-comments" onClick={(e) => { e.stopPropagation(); fetchMoreReplies([]);  }}>
                            {moreComments + " more comments"}
                        </div>
                    }
                </div>
            </div>
            <br />
            <CommentMakerComponent 
                judgment={judgment} 
                callback={createComment} 
                replyToUsername={highlightedComment?.username}
            />
            <br />
        </div>
    )
}

export const judgementToVoteText = (judgement: Judgment, item: Item | undefined) => {
    const halalVotes = item?.halalVotes
    const haramVotes = item?.haramVotes
    
    switch (judgement) {
        case Judgment.HALAL:
            if (halalVotes != undefined && haramVotes != undefined) {
                if (halalVotes > 0 || haramVotes > 0) {
                    return `👼 Halal - ${ halalVotes + "(" + halalVotes / (halalVotes + haramVotes) + ")"} 👼`
                } else {
                    return `👼 Halal - ${halalVotes} 👼`
                }
            } else {
                return "👼 Halal 👼"
            }
        case Judgment.HARAM:
            if (halalVotes != undefined && haramVotes != undefined) {
                if (halalVotes > 0 || haramVotes > 0) {
                    return `🔥 Haram - ${ haramVotes + "(" + haramVotes / (halalVotes + haramVotes) + ")"} 🔥`
                } else {
                    return `🔥 Haram - ${haramVotes} 🔥`
                }
            } else {
                return "🔥 Haram 🔥"
            }
        default:
            return ""
    }
};

export const judgementToTextMap = {
    0: "HALAL",
    1: "HARAM",
};

const getCommentFromPath = (comments: Comment[], path: number[] | undefined): Comment | undefined => {
    // base cases
    if (!path || path.length < 1) {
        return undefined;
    }
    if (path.length === 1) {
        return comments[path![0]];
    }

    // recursive step
    return getCommentFromPath(comments[path[0]].replies, path.slice(1));
}

const addCommentsLocally = (comments: Comment[], data: Comment[], pathToParentComment?: number[]): Comment[] => {
    // base case/add top level comment
    if (!pathToParentComment || pathToParentComment.length === 0) {
        return [...comments, ...data];
    }

    // recursive step
    const updatedReplies = addCommentsLocally(comments[pathToParentComment[0]].replies, data, pathToParentComment.slice(1));
    comments[pathToParentComment[0]].replies = updatedReplies;
    return comments;
}

const deleteCommentLocally = (comments: Comment[], pathToComment: number[], psuedoDelete: boolean = true): Comment[] => {
    // base case/remove top level comment
    if (pathToComment.length === 1) {
        if (psuedoDelete) {
            comments[pathToComment[0]].comment = "__deleted__";
            return comments;
        }
        return [...comments.slice(0, pathToComment[0]), ...comments.slice(pathToComment[0] + 1)];
    };

    // decrement numReplies for parent comment
    if (pathToComment.length === 2) {
        comments[pathToComment[0]].numReplies -= 1;
    }

    // recursive step
    const updatedReplies = deleteCommentLocally(comments[pathToComment[0]].replies, pathToComment.splice(1), psuedoDelete);
    comments[pathToComment[0]].replies = updatedReplies;
    return comments;
}
