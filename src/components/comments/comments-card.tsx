import React, { useState, memo, useRef } from 'react';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { CommentMakerComponent } from "./comment-maker";
import { CommentComponent } from "./comment";
import { Comment } from '../../types';
import { postData } from '../../https-client/post-data';
import { commentsConfig } from '../../https-client/config';
import { UserContext } from '../app-shell'

// type imports
import { Judgment, judgementToTextMap } from '../../types';

// style imports
import './comments.css';

interface CommentsCardComponentProps {
    judgment: Judgment,
    itemName: string, 
    numHalalComments: number,
    numHaramComments: number,
    refreshItem: (itemTofetch: string) => any,
    switchCard: (judgement: Judgment) => any
};

interface CommentsCardState {
    comments: Comment[];
    pathToHighlightedComment: number[] | undefined;
};

const initialState = {
    comments: [],
    pathToHighlightedComment: undefined,
}
const CommentsCardImplementation = (props: CommentsCardComponentProps) => {
    const { judgment, itemName, numHalalComments, numHaramComments, refreshItem } = props;
    const totalTopLevelComments = (judgment === Judgment.HALAL ? numHalalComments : numHaramComments) || 0;

    const { username, sessiontoken } = React.useContext(UserContext)

    const [state, setState] = useState<CommentsCardState>(initialState);

    const commentMakerRef = useRef<any>(null);

    useDebouncedEffect(() => {
        if (itemName) {
            state.comments = [];
            state.pathToHighlightedComment = undefined;
            fetchComments([]);
        }
    }, 500, [itemName, judgment])

    const fetchComments = async (pathToParentComment: number[], totalTopLevelComments?: number) => {
        const parentComment = getCommentFromPath(state.comments, pathToParentComment);
        const { data: comments }: { data: Comment[]} = await postData({ 
            baseUrl: commentsConfig.url,
            path: 'get-comments', 
            data: { 
                "commentType": judgementToTextMap[judgment],
                "itemName": itemName,
                "username": username,
                "parentId": parentComment?.id,
                "depth": 2, 
                "n": 5,
                "excludedCommentIds": parentComment ? parentComment.replies.map((r) => r.id) : state.comments?.map((r) => r.id),
            },
            additionalHeaders: { },
        });
        const updatedComments = addCommentsLocally(state.comments, comments, pathToParentComment, true);
        if (totalTopLevelComments !== undefined) {
            setState(prevState => ({ ...prevState, comments: updatedComments, totalTopLevelComments: totalTopLevelComments }));
        } else {
            setState(prevState => ({ ...prevState, comments: updatedComments }));
        }
    }

    const createComment = async (commentText: string) => {
        const highlightedComment = getCommentFromPath(state.comments, state.pathToHighlightedComment);
        const { data: comment }: { data: Comment } = await postData({
            baseUrl: commentsConfig.url,
            path: 'add-comment', 
            data: { 
                "parentId": highlightedComment?.id,
                "itemName": itemName, 
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
            refreshItem(itemName);
        }
        
        const updatedComments = addCommentsLocally(state.comments, [commentObject], highlightedComment && state.pathToHighlightedComment);
        setState(prevState => ({ ...prevState, comments: updatedComments }));
        highlightComment(state.pathToHighlightedComment ? state.pathToHighlightedComment.concat(0) : [0]);
    }

    const deleteComment = async (pathToComment: number[]) => {
        const commentToDelete = getCommentFromPath(state.comments, pathToComment);
        const response = await postData({
            baseUrl: commentsConfig.url,
            path: 'delete-comment', 
            data: { 
                "itemName": itemName,
                "id": commentToDelete?.id,
                "username": username,
                "commentType": commentToDelete?.commentType,
            },
            additionalHeaders: {
                "sessiontoken": sessiontoken
            }
        });
        
        if (pathToComment.length === 1) {
            await refreshItem(itemName);
        }

        const updatedComments = deleteCommentLocally(state.comments, pathToComment, !!response.data?.psuedoDelete);
        setState(prevState => ({ ...prevState, comments: updatedComments }));
    }

    const highlightComment = (path: number[] | undefined) => {
        const commentsContainerElement = document.getElementById(commentsContainerId);
        setState(prevState => ({
            ...prevState,
            pathToHighlightedComment: path,
        }));
        if (path?.length === 1 && path[0] === 0) {
            if (commentsContainerElement) {
                document.getElementById(commentsContainerId)!.scrollTop = 0;
            };
            if (commentMakerRef.current) {
                commentMakerRef.current.focus();
            };
        } else {
            let highlightedComment = getCommentFromPath(state.comments, path);
            scrollToHighlightedComment(highlightedComment);
            if (commentMakerRef.current) {
                commentMakerRef.current.focus();
            };
        }
    }

    const scrollToHighlightedComment = (highlightedComment: Comment | undefined) => {
        if (highlightedComment) {
            const highlightedCommentElement = document.getElementById("comment-" + highlightedComment.id);
            const commentsContainerElement = document.getElementById(commentsContainerId);
            
            if (highlightedCommentElement && commentsContainerElement) {
                let topPos = highlightedCommentElement.offsetTop;
                let offsetParent = highlightedCommentElement.offsetParent;
    
                while (offsetParent && offsetParent.className != "comments-container") {
                    topPos += (offsetParent as HTMLElement).offsetTop;
                    offsetParent = (offsetParent as HTMLElement).offsetParent;
                }
                commentsContainerElement.scrollTop =  topPos - 5;
            }
        }
    }

    const moreComments = totalTopLevelComments - state.comments.length;
    const highlightedComment = getCommentFromPath(state.comments, state.pathToHighlightedComment);
    const commentsContainerId = `comments-container-${judgment.toString()}`;
    const commentsCardId = "comments-card-" + judgment.toString();
    const commentsCardCoverId = `comments-card-cover-${judgment.toString()}`

    return(
        <div id={commentsCardId} onClick={ (e) => { highlightComment(undefined) }} className={commentsCardId} >
            <div id={commentsCardCoverId} className="comments-card-cover" onClick={props.switchCard(judgment)}></div>
            <div id={commentsContainerId} className="comments-container">
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
                                    judgment={judgment}
                                />
                    })
                }
                {
                    moreComments > 0 && state.comments.length &&
                    <div className="show-more-comments" onClick={(e) => { e.stopPropagation(); fetchComments([]);  }}>
                        {moreComments + (moreComments > 1 ? " more comments" : " more comment")}
                    </div> || null
                }
            </div>
            <CommentMakerComponent 
                ref={commentMakerRef}
                judgment={judgment} 
                submitComment={createComment} 
                replyToUsername={highlightedComment?.username}
            />
            <br/>
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

const addCommentsLocally = (comments: Comment[], data: Comment[], pathToParentComment?: number[], appendToEnd: Boolean = false): Comment[] => {
    // base case/add top level comment
    if (!pathToParentComment || pathToParentComment.length === 0) {
        return appendToEnd ? [...comments, ...data] : [...data, ...comments];
    }

    // recursive step
    const updatedReplies = addCommentsLocally(comments[pathToParentComment[0]].replies, data, pathToParentComment.slice(1), appendToEnd);
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

const areCommentsCardPropsEqual = (prevProps: CommentsCardComponentProps, nextProps: CommentsCardComponentProps) => {
    return prevProps.itemName === nextProps.itemName && 
        prevProps.numHalalComments === nextProps.numHalalComments && 
        prevProps.numHaramComments === nextProps.numHaramComments
}

export const CommentsCardComponent = memo(CommentsCardImplementation, areCommentsCardPropsEqual);
