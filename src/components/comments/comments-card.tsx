import React, { useState, useEffect } from 'react';
import { CommentMakerComponent } from "./comment-maker";
import { CommentComponent } from "./comment";
import { Comment } from '../../types';
import { postData } from '../../https-client/post-data';
import { commentsConfig } from '../../https-client/config';
import { UserContext } from '../app-shell'

// type imports
import { Item, Judgment, judgementToTextMap } from '../../types';

// style imports
import './comments-card.css';

interface CommentsCardComponentProps {
    judgment: Judgment,
    item: Item | undefined,
    refreshItem: (itemsTofetch: string[]) => any,
};

interface CommentsCardState {
    comments: Comment[];
    pathToHighlightedComment: number[] | undefined;
};

const initialState = {
    comments: [],
    pathToHighlightedComment: undefined,
}
export const CommentsCardComponent = (props: CommentsCardComponentProps) => {
    const { judgment, item, refreshItem } = props;
    const totalTopLevelComments = (judgment === Judgment.HALAL ? item?.numHalalComments : item?.numHaramComments) || 0;
    const { username, sessiontoken } = React.useContext(UserContext)

    const [state, setState] = useState<CommentsCardState>(initialState);

    useEffect(() => {
        if (item?.itemName) {
            state.comments = [];
            state.pathToHighlightedComment = undefined;
            fetchComments([]);
        }
    }, [item?.itemName, judgment])

    const fetchComments = async (pathToParentComment: number[], totalTopLevelComments?: number) => {
        const parentComment = getCommentFromPath(state.comments, pathToParentComment);
        const comments: Comment[] = await postData({ 
            baseUrl: commentsConfig.url,
            path: 'get-comments', 
            data: { 
                "commentType": judgementToTextMap[judgment],
                "itemName": item?.itemName,
                "parentId": parentComment?.id,
                "depth": 2, 
                "n": 2,
                "excludedCommentIds": parentComment ? parentComment.replies.map((r) => r.id) : state.comments?.map((r) => r.id),
            },
            additionalHeaders: { },
        });
        const updatedComments = addCommentsLocally(state.comments, comments, pathToParentComment);
        if (totalTopLevelComments !== undefined) {
            setState(prevState => ({ ...prevState, comments: updatedComments, totalTopLevelComments: totalTopLevelComments }));
        } else {
            setState(prevState => ({ ...prevState, comments: updatedComments }));
        }
    }

    const createComment = async (commentText: string) => {
        const highlightedComment = getCommentFromPath(state.comments, state.pathToHighlightedComment);
        const comment: Comment = await postData({
            baseUrl: commentsConfig.url,
            path: 'add-comment', 
            data: { 
                "parentId": highlightedComment?.id,
                "itemName": item?.itemName, 
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

        if (!highlightedComment) {
            refreshItem([item!.itemName]);
        }
        
        const updatedComments = addCommentsLocally(state.comments, [commentObject], highlightedComment && state.pathToHighlightedComment);
        setState(prevState => ({ ...prevState, comments: updatedComments }));
    }

    const deleteComment = async (pathToComment: number[]) => {
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
        
        if (pathToComment.length === 1) {
            refreshItem([item!.itemName]);
        }

        const updatedComments = deleteCommentLocally(state.comments, pathToComment, !!response.psuedoDelete);
        setState(prevState => ({ ...prevState, comments: updatedComments }));
    }

    const highlightComment = (path: number[] | undefined) => {
        setState(prevState => ({
            ...prevState,
            pathToHighlightedComment: path,
        }));
    }

    const moreComments = totalTopLevelComments - state.comments.length;
    const highlightedComment = getCommentFromPath(state.comments, state.pathToHighlightedComment);

    return(
        <div>
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
                                        fetchMoreReplies={fetchComments}
                                        deleteComment={deleteComment}
                                    />
                        })
                    }
                    {
                        moreComments > 0 &&
                        <div className="show-more-comments" onClick={(e) => { e.stopPropagation(); fetchComments([]);  }}>
                            {moreComments + (moreComments > 1 ? " more comments" : " more comment")}
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
