import React, { useState, useEffect } from 'react';
import { CommentMakerComponent } from "./comment-maker";
import { CommentComponent } from "./comment";
import { Comment } from '../../types';
import { postData } from '../../https-client/post-data';
import { commentsConfig } from '../../https-client/config';
import { UserContext } from '../app-shell'

// type imports
import { Judgment } from '../../types';

// style imports
import './comments-card.css';

interface CommentsCardComponentProps {
    judgment: Judgment,
    itemName: string | undefined,
};

interface CommentsCardState {
    comments: Comment[];
    pathToHighlightedComment: number[] | undefined;
    totalComments: number;
};

export const CommentsCardComponent = (props: CommentsCardComponentProps) => {
    const { judgment, itemName } = props;
    let {username, sessiontoken} = React.useContext(UserContext)

    const [state, setState] = useState<CommentsCardState>({
        comments: [],
        pathToHighlightedComment: undefined,
        totalComments: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await postData({ 
                baseUrl: commentsConfig.url,
                path: 'get-comments', 
                data: {
                    "commentType": judgementToTextMap[judgment].commentType,
                    "itemName": itemName,
                    "depth": 2,
                    "n": 55
                },
                additionalHeaders: { },
            });
            setState(s => ({ ...s, comments: data }));
        };
        if (itemName) {
            fetchData();
        }
    }, [itemName, judgment])

    const fetchMoreReplies = (pathToParentComment: number[]) => {
        const parentComment = getCommentByPath(state.comments, pathToParentComment);
        const fetchData = async () => {
            const data: Comment[] = await postData({ 
                baseUrl: commentsConfig.url,
                path: 'get-comments', 
                data: { 
                    "parentId": parentComment?.id,
                    "depth": 2, 
                    "n": 55,
                    "excludedCommentIds": parentComment?.replies,
                },
                additionalHeaders: { },
            });
            const updatedComments = addComments(state.comments, data, pathToParentComment);
            setState({ ...state, comments: updatedComments });
        };
        fetchData();
    }

    const createComment = (comment: string) => {
        const fetchData = async () => {
            const highlightedComment = getCommentByPath(state.comments, state.pathToHighlightedComment);
            const commentId = await postData({
                baseUrl: commentsConfig.url,
                path: 'add-comment', 
                data: { 
                    "parentId": highlightedComment?.id,
                    "itemName": props.itemName, 
                    "username": username,
                    "comment": comment,
                    "commentType": judgementToTextMap[judgment].commentType,
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                }
            });
            const commentObject: Comment = {
                id: commentId,
                username: username,
                comment: comment,
                replies: [],
                upVotes: 0,
                downVotes: 0,
                numReplies: 0,
            };
            
            let updatedComments;
            if (highlightedComment) {
                updatedComments = addComments(state.comments, [commentObject], state.pathToHighlightedComment);
            } else {
                updatedComments = [...state.comments, commentObject];
            }
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

    const highlightedComment = getCommentByPath(state.comments, state.pathToHighlightedComment);

    return(
        <div className={"container"}>
            <div className={'header-text'} >{judgementToTextMap[judgment].text}</div>
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
                                    />
                        })
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

export const judgementToTextMap = {
    0: {
        text: "👼 Halal - {votes} ({%}) 👼",
        commentType: "HALAL",
    },
    1: {
        text: "🔥 Haram - {votes} ({%}) 🔥",
        commentType: "HARAM",
    }
};

const getCommentByPath = (comments: Comment[], path: number[] | undefined): Comment | undefined => {
    // base cases
    if (!path || path.length < 1) {
        return undefined;
    }
    if (path.length === 1) {
        return comments[path![0]];
    }

    // recursive step
    return getCommentByPath(comments[path[0]].replies, path.slice(1));
}

const addComments = (comments: Comment[], data: Comment[], pathToParentComment?: number[]): Comment[] => {
    // base case or add top level comment
    if (!pathToParentComment || pathToParentComment.length === 0) {
        return [...comments, ...data];
    }

    // recursive step
    const updatedReplies = addComments(comments[pathToParentComment[0]].replies, data, pathToParentComment.slice(1));
    comments[pathToParentComment[0]].replies = updatedReplies;
    return comments;
}