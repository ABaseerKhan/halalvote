import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { CommentMakerComponent } from "./comment-maker";
import { CommentComponent } from "./comment";
import { Comment } from '../../types';
import { commentsConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';
import { SkeletonComponent } from "./comments-skeleton";
import { topicsContext, fullScreenContext, commentsContext, authenticatedPostDataContext } from '../app-shell';

// type imports
import { Judgment, userVoteToCommentType } from '../../types';

// style imports
import './comments.css';
// import { useMedia } from '../../hooks/useMedia';

interface CommentsCardComponentProps {
    refreshTopic: (topicTofetch: string | undefined) => any,
    switchCards: (judgement: Judgment) => any,
    topicIndexOverride?: number;
};

interface CommentsCardState {
    loading: boolean;
    commentsShowable: boolean;
    pathToHighlightedComment: number[] | undefined;
};

const initialState = {
    loading: true,
    commentsShowable: true,
    pathToHighlightedComment: undefined,
}
export const CommentsCardComponent = (props: CommentsCardComponentProps) => {
    const { refreshTopic } = props;
    let { topicIndexOverride } = props;

    // const isMobile = useMedia(
    //     // Media queries
    //     ['(max-width: 600px)'],
    //     [true],
    //     // default value
    //     false
    // );

    const { fullScreenMode } = useContext(fullScreenContext);
    const { authenticatedPostData } = useContext(authenticatedPostDataContext);

    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);
    topicIndexOverride = (topicIndexOverride !== undefined) ? topicIndexOverride : topicIndex;
    const topic = topics?.length ? topics[topicIndexOverride] : undefined;

    const { commentsState, setCommentsContext } = useContext(commentsContext);
    let comments = topic?.topicTitle ? commentsState[topic.topicTitle]?.comments || [] : [];
    const specificComment = topic?.topicTitle ? commentsState[topic.topicTitle]?.specificComment : undefined;

    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const [state, setState] = useState<CommentsCardState>(initialState);

    const commentMakerRef = useRef<any>(null);
    const commentsContainerRef = useRef<HTMLDivElement>(null);

    useDebouncedEffect(() => {
        if (topic?.topicTitle && !commentsState[topic.topicTitle]) {
            state.pathToHighlightedComment = undefined;
            fetchComments([]);
        } else {
            setState(prevState => ({ ...prevState, loading: false, commentsShowable: true }));
        }
    }, 500, [topic?.topicTitle, sessiontoken]);

    useEffect(() => {
        if (!state.loading) {
            setTimeout(() => { setState(prevState => ({ ...prevState, commentsShowable: true })) }, 300);
            setState(prevState => ({ ...prevState, loading: true, commentsShowable: false }));
        } // eslint-disable-next-line
    }, [topic?.topicTitle]);

    const fetchComments = async (pathToParentComment: number[], n?: number, specificCommentId?: number, depth=1) => {
        const parentComment = getCommentFromPath(comments, pathToParentComment);
        const { data: newComments, status }: { data: Comment[]; status: number } = await authenticatedPostData({
            baseUrl: commentsConfig.url,
            path: 'get-comments', 
            data: {
                "topicTitle": topic?.topicTitle,
                "username": username,
                "parentId": parentComment?.id,
                "singleCommentId": specificCommentId,
                "depth": depth,
                "n": !!n ? n : 50,
                "excludedCommentIds": parentComment ? parentComment.replies.map((r) => r.id) : comments?.map((r) => r.id),
            },
            additionalHeaders: { },
        }, true);
        const updatedComments = addCommentsLocally(comments, newComments.map(c => ({ ...c, repliesShown: 0 })), pathToParentComment, true);
        setCommentsContext(topic?.topicTitle!, updatedComments, specificComment!);
        setState(prevState => ({ ...prevState, loading: false }));

        if (specificCommentId) {
            const pathToSpecificComment = getPathFromId(updatedComments, specificCommentId, []);
            setState(prevState => ({ ...prevState, pathToHighlightedComment: pathToSpecificComment }));
        }

        if(status===200) {
            return newComments.length;
        } else return 0;
    }

    const createComment = async (commentText: string) => {
        const commentsCopy = comments.map(c => ({...c}));
        const highlightedComment = getCommentFromPath(commentsCopy, state.pathToHighlightedComment);
        const isReply = (highlightedComment?.depth || 0) >= 2;
        const parentOfhighlightedComment = isReply ? getCommentFromPath(commentsCopy, state.pathToHighlightedComment?.slice(0,-1)) : undefined;

        const { status, data: comment }: { status: number, data: Comment } = await authenticatedPostData({
            baseUrl: commentsConfig.url,
            path: 'add-comment', 
            data: {
                "parentId": !isReply ? highlightedComment?.id : parentOfhighlightedComment?.id,
                "topicTitle": topic?.topicTitle, 
                "username": username,
                "comment": commentText,
                "commentType": userVoteToCommentType(topic?.vote),
            },
            additionalHeaders: {
                "sessiontoken": sessiontoken
            },
            setCookie: setCookie,
        }, true);
        if (status !== 200) {
            return status;
        }
        const commentObject: Comment = {
            id: comment.id,
            commentType: userVoteToCommentType(topic?.vote),
            username: username,
            comment: commentText,
            replies: [],
            upVotes: 0,
            downVotes: 0,
            numReplies: 0,
            timeStamp: comment.timeStamp,
            depth: comment.depth,
            repliesShown: 0,
        };
        if (highlightedComment) { highlightedComment.repliesShown++; highlightedComment.numReplies++; };
        if (parentOfhighlightedComment) { parentOfhighlightedComment.numReplies++; };
        const updatedComments = addCommentsLocally(commentsCopy, [commentObject], isReply ? parentOfhighlightedComment && state.pathToHighlightedComment?.slice(0,-1) : highlightedComment && state.pathToHighlightedComment);
        setCommentsContext(topic?.topicTitle!, updatedComments, specificComment!);
        setState(prevState => ({ ...prevState }));
        return status;
    }

    const deleteComment = async (pathToComment: number[]) => {
        const commentToDelete = getCommentFromPath(comments, pathToComment);
        const response = await authenticatedPostData({
            baseUrl: commentsConfig.url,
            path: 'delete-comment', 
            data: { 
                "topicTitle": topic?.topicTitle,
                "id": commentToDelete?.id,
                "username": username,
                "commentType": commentToDelete?.commentType,
            },
            additionalHeaders: {
                "sessiontoken": sessiontoken
            }
        }, true);
        
        if (pathToComment.length === 1) {
            await refreshTopic(topic?.topicTitle);
        }

        const commentsCopy = comments.map(c => ({...c}));
        const updatedComments = deleteCommentLocally(commentsCopy, pathToComment, !!response.data?.psuedoDelete);
        setCommentsContext(topic?.topicTitle!, updatedComments, specificComment!);
        setState(prevState => ({ ...prevState, pathToHighlightedComment: undefined }));
    }

    const highlightComment = (path: number[] | undefined) => {
        setState(prevState => ({
            ...prevState,
            pathToHighlightedComment: path,
        }));
        if (commentMakerRef.current && path !== undefined) {
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
            const highlightedComment = document.getElementById(`comment-${getCommentFromPath(comments, path)?.id}`);
            const viewPortOffsetCommentContentBottom = (highlightedComment?.childNodes[1].childNodes[0] as HTMLDivElement).getBoundingClientRect().bottom; ;
            const viewPortOffsetMakerBottom = commentMakerRef.current.getCommentMakerCardRef()!.getBoundingClientRect().bottom;
            commentMakerRef.current.setHeight(vh - viewPortOffsetCommentContentBottom - (vh - viewPortOffsetMakerBottom));
            commentMakerRef.current.focus();
        };
    }

    const highlightedComment = getCommentFromPath(comments, state.pathToHighlightedComment);
    const commentsContainerId = `comments-container`;
    const commentsCardId = "comments-card";

    return(
        <div id={commentsCardId} onClick={ (e) => { highlightComment(undefined) }} className={commentsCardId} style={{ zIndex: fullScreenMode ? 3 : 0 }} >
                { !state.loading && state.commentsShowable && comments.length === 0 ?
                    <div className="no-comments-to-show-text">No arguments to show</div> :
                        <div id={commentsContainerId} ref={commentsContainerRef} className={fullScreenMode ? "comments-container-fs" : "comments-container"} >
                        <div className={"comments-container-padding-div"}>
                            {state.loading || !state.commentsShowable ? <SkeletonComponent /> :
                                comments.map((comment: Comment, i: number) => {
                                    return <CommentComponent 
                                                key={comment.id}
                                                comment={comment}
                                                specificComment={specificComment}
                                                path={[i]} 
                                                pathToHighlightedComment={state.pathToHighlightedComment} 
                                                highlightComment={highlightComment} 
                                                fetchMoreReplies={fetchComments}
                                                deleteComment={deleteComment}
                                                topicIndexOverride={topicIndexOverride}
                                            />
                                })
                            }
                        </div>
                </div>
                }
                <CommentMakerComponent 
                    ref={commentMakerRef}
                    submitComment={createComment} 
                    replyToUsername={highlightedComment?.username}
                />
                <br/>
        </div>
    )
}

export const getCommentFromPath = (comments: Comment[], path: number[] | undefined): Comment | undefined => {
    // base cases
    if (!path || (path.length < 1) || !comments) {
        return undefined;
    }
    if (path.length === 1) {
        return comments[path![0]];
    }

    // recursive step
    return getCommentFromPath(comments[path[0]]?.replies, path.slice(1));
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
        comments[pathToComment[0]].repliesShown -= 1;
    }

    // recursive step
    const updatedReplies = deleteCommentLocally(comments[pathToComment[0]].replies, pathToComment.splice(1), psuedoDelete);
    comments[pathToComment[0]].replies = updatedReplies;
    return comments;
}

const getPathFromId = (comments: Comment[], commentId: number, accumulator: number[]): number[] => {
    if (comments && comments[0]) {
        accumulator.push(0);
        if (comments[0].id === commentId) {
            return accumulator;
        }
        return getPathFromId(comments[0].replies, commentId, accumulator);
    } else {
        return accumulator;
    }
}
