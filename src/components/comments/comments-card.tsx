import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { CommentMakerComponent } from "./comment-maker";
import { CommentComponent } from "./comment";
import { Comment } from '../../types';
import { postData } from '../../https-client/client';
import { commentsConfig } from '../../https-client/config';
import { useCookies } from 'react-cookie';
import { SkeletonComponent } from "./comments-skeleton";

// type imports
import { Judgment, userVoteToCommentType } from '../../types';

// style imports
import './comments.css';
import { topicsContext, fullScreenContext, commentsContext } from '../app-shell';
import { isMobile } from '../../utils';
// import { useMedia } from '../../hooks/useMedia';

interface CommentsCardComponentProps {
    refreshTopic: (topicTofetch: string | undefined) => any,
    switchCards: (judgement: Judgment) => any,
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

    // const isMobile = useMedia(
    //     // Media queries
    //     ['(max-width: 600px)'],
    //     [true],
    //     // default value
    //     false
    // );

    const { fullScreenMode, setFullScreenModeContext } = useContext(fullScreenContext);

    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);
    const topic = topics?.length ? topics[topicIndex] : undefined;

    const { commentsState, setCommentsContext } = useContext(commentsContext);
    let comments = topic?.topicTitle ? commentsState[topic.topicTitle]?.comments || [] : [];
    const specificComment = topic?.topicTitle ? commentsState[topic.topicTitle]?.specificComment : undefined;

    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const [state, setState] = useState<CommentsCardState>(initialState);

    const commentMakerRef = useRef<any>(null);

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

    useEffect(() => {
        if (topic?.topicTitle && specificComment && (topic.topicTitle === specificComment.topicTitle)) {
            // eslint-disable-next-line
            comments = [];
            state.pathToHighlightedComment = undefined;
            fetchComments([], specificComment?.id);
        } // eslint-disable-next-line
    }, [specificComment]);

    useEffect(() => {
        if(state.pathToHighlightedComment) {
            scrollToHighlightedComment(getCommentFromPath(comments, state.pathToHighlightedComment));
        } // eslint-disable-next-line
    }, [state.pathToHighlightedComment])

    const fetchComments = async (pathToParentComment: number[], specificCommentId?: number, depth=1) => {
        const parentComment = getCommentFromPath(comments, pathToParentComment);
        const { data: newComments }: { data: Comment[]} = await postData({
            baseUrl: commentsConfig.url,
            path: 'get-comments', 
            data: {
                "topicTitle": topic?.topicTitle,
                "username": username,
                "parentId": parentComment?.id,
                "singleCommentId": specificCommentId,
                "depth": depth,
                "n": 50,
                "excludedCommentIds": parentComment ? parentComment.replies.map((r) => r.id) : comments?.map((r) => r.id),
            },
            additionalHeaders: { },
        });
        const updatedComments = addCommentsLocally(comments, newComments, pathToParentComment, true);
        setCommentsContext(topic?.topicTitle!, updatedComments, specificComment!);
        setState(prevState => ({ ...prevState, loading: false }));

        if (specificCommentId) {
            const pathToSpecificComment = getPathFromId(updatedComments, specificCommentId, []);
            setState(prevState => ({ ...prevState, pathToHighlightedComment: pathToSpecificComment }));
        }
    }

    const createComment = async (commentText: string) => {
        const highlightedComment = getCommentFromPath(comments, state.pathToHighlightedComment);
        const isReplyToReply = (highlightedComment?.depth || 0) >= 2;
        const parentOfhighlightedComment = isReplyToReply ? getCommentFromPath(comments, state.pathToHighlightedComment?.slice(0,-1)) : undefined;

        const { status, data: comment }: { status: number, data: Comment } = await postData({
            baseUrl: commentsConfig.url,
            path: 'add-comment', 
            data: {
                "parentId": !isReplyToReply ? highlightedComment?.id : parentOfhighlightedComment?.id,
                "topicTitle": topic?.topicTitle, 
                "username": username,
                "comment": commentText,
                "commentType": userVoteToCommentType(topic?.vote),
            },
            additionalHeaders: {
                "sessiontoken": sessiontoken
            },
            setCookie: setCookie,
        });
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
        };
        
        const updatedComments = addCommentsLocally(comments, [commentObject], isReplyToReply ? parentOfhighlightedComment && state.pathToHighlightedComment?.slice(0,-1) : highlightedComment && state.pathToHighlightedComment);
        setCommentsContext(topic?.topicTitle!, updatedComments, specificComment!);
        setState(prevState => ({ ...prevState }));
        return status;
    }

    const deleteComment = async (pathToComment: number[]) => {
        const commentToDelete = getCommentFromPath(comments, pathToComment);
        const response = await postData({
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
        });
        
        if (pathToComment.length === 1) {
            await refreshTopic(topic?.topicTitle);
        }

        const updatedComments = deleteCommentLocally(comments, pathToComment, !!response.data?.psuedoDelete);
        setCommentsContext(topic?.topicTitle!, updatedComments, specificComment!);
        setState(prevState => ({ ...prevState, pathToHighlightedComment: undefined }));
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
        }    
        if (commentMakerRef.current && path !== undefined) {
            commentMakerRef.current.focus();
            if (!isMobile) {
                const commentsCard = document.getElementById('comments-card');
                const highlightedComment = document.getElementById(`comment-${getCommentFromPath(comments, path)?.id}`);
                const offsetTop = highlightedComment?.offsetParent?.id === 'comments-container' ? highlightedComment.offsetTop : (highlightedComment?.offsetParent as HTMLElement)?.offsetTop + highlightedComment!.offsetTop;
                commentMakerRef.current.setHeight(commentsCard?.clientHeight! - (offsetTop + highlightedComment!.clientHeight));
            }
        };
    }

    const scrollToHighlightedComment = (highlightedComment: Comment | undefined) => {
        if (highlightedComment) {
            const highlightedCommentElement = document.getElementById("comment-" + highlightedComment.id);
            const commentsContainerElement = document.getElementById(commentsContainerId);
            
            if (highlightedCommentElement && commentsContainerElement) {
                let topPos = highlightedCommentElement.offsetTop;
                let offsetParent = highlightedCommentElement.offsetParent;
    
                while (offsetParent && offsetParent.className !== "comments-container") {
                    topPos += (offsetParent as HTMLElement).offsetTop;
                    offsetParent = (offsetParent as HTMLElement).offsetParent;
                }
                commentsContainerElement.scrollTop =  topPos - 5;
            }
        }
    }

    const highlightedComment = getCommentFromPath(comments, state.pathToHighlightedComment);
    const commentsContainerId = `comments-container`;
    const commentsCardId = "comments-card";

    const doubleTap = () => {
        setFullScreenModeContext(!fullScreenMode);
    };
    return(
        <div id={commentsCardId} onClick={ (e) => { highlightComment(undefined) }} onDoubleClick={doubleTap} className={commentsCardId} style={{ zIndex: fullScreenMode ? 3 : 0 }} >
                { !state.loading && state.commentsShowable && comments.length === 0 ?
                    <div className="no-comments-to-show-text">No arguments to show</div> :
                        <div id={commentsContainerId} className={fullScreenMode ? "comments-container-fs" : "comments-container"} >
                        <div className={"comments-container-padding-div"}>
                            {state.loading || !state.commentsShowable ? <SkeletonComponent /> :
                                comments.map((comment: Comment, i: number) => {
                                    return <CommentComponent 
                                                key={comment.id}
                                                path={[i]} 
                                                pathToHighlightedComment={state.pathToHighlightedComment} 
                                                highlightComment={highlightComment} 
                                                fetchMoreReplies={fetchComments}
                                                deleteComment={deleteComment}
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
    comments[pathToParentComment[0]].numReplies = updatedReplies.length;
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
