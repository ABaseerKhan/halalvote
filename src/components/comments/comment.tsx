import React, { useState, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import { ReactComponent as HeartButtonSVG } from '../../icons/heart-icon.svg';
import { Comment, Judgment } from '../../types';
import { convertUTCDateToLocalDate, timeSince } from '../../utils';
import { commentsConfig } from '../../https-client/config';
import { postData } from '../../https-client/client';
import { ReactComponent as UpSVG } from '../../icons/up-arrow.svg';
import { ReactComponent as DownSVG } from '../../icons/down-arrow.svg';
import ClipLoader from "react-spinners/ClipLoader";

// type imports
import { Vote } from '../../types';

// style imports
import './comments.css';
import { useCookies } from 'react-cookie';

interface CommentComponentProps {
    key: number,
    comment: Comment,
    path: number[],
    pathToHighlightedComment: number[] | undefined,
    highlightComment: (path: number[] | undefined) => void,
    fetchMoreReplies: (pathToParentComment: number[], totalTopLevelComments?: number | undefined, specificCommentId?: number | undefined, depth?: number) => Promise<void>,
    deleteComment: (path: number[]) => void,
    judgment: Judgment;
    level2?: boolean;
}
export const CommentComponent = (props: CommentComponentProps) => {
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const [state, setState] = useState({
        comment: props.comment,
        fetchingReplies: false,
        canShowMore: true,
        collapsed: true,
    });

    useEffect(() => {
        setState(prevState => ({ ...prevState, comment: props.comment }));
    }, [props.comment]);

    // eslint-disable-next-line
    const hideReplies = () => {
        setState({
            ...state,
            collapsed: true,
        });
    };

    // eslint-disable-next-line
    const showReplies = async () => {
        setState(prevState => ({ ...prevState, collapsed: false, fetchingReplies: true }));
        await props.fetchMoreReplies(props.path);
        setState(prevState => ({
            ...prevState,
            fetchingReplies: false,
        }));
    };

    const upVote = async () => {
        const upVotes = (state.comment.userVote === Vote.UPVOTE) ? state.comment.upVotes - 1 : state.comment.upVotes + 1;
        const userVote = (state.comment.userVote === Vote.UPVOTE) ? undefined : Vote.UPVOTE;
        setState(prevState => ({
            ...prevState,
            comment: { ...prevState.comment, upVotes: upVotes, userVote: userVote },
        }));
        const { status } = await postData({
            baseUrl: commentsConfig.url,
            path: 'vote-comment', 
            data: {
                "username": username,
                "commentId": state.comment.id,
                "vote": 1,
            },
            additionalHeaders: sessiontoken ? {
                "sessiontoken": sessiontoken
            } : { },
            setCookie: setCookie,
        });

        if (status === 200){
            setState(prevState => ({
                ...prevState,
                comment: { ...prevState.comment, upVotes: upVotes, userVote: userVote },
            }));
        }
    }

    const { judgment } = props;
    const moreReplies = (props.comment.numReplies - props.comment.replies.length);
    const viewMoreReplies = state.collapsed ? (props.comment.numReplies) : (moreReplies);

    const isHighlighted = 
    props.pathToHighlightedComment && 
    props.pathToHighlightedComment.length === props.path.length && 
    props.pathToHighlightedComment.every((value, index) => value === props.path[index]);

    let commentContentClass = isHighlighted ? "comment-content-highlighted" : "comment-content";

    return (
        <div id={`comment-${state.comment.id}`} className={"comment-container"}>
            <div className="comment-bubble-container">
                <div className="comment-bubble"></div>
            </div>
            <div className="comment-body">
                <div 
                    className={commentContentClass} 
                    onClick={(e) => {
                        e.stopPropagation();
                        props.highlightComment(props.path);
                    }}
                >
                    <div className="username">{props.comment.username}</div>
                    <div className="comment">
                        <div style={{ maxWidth: 'calc(100% - 50px)' }} dangerouslySetInnerHTML={{__html: props.comment.comment}}/>
                    </div>
                    <div className="comment-extras">
                        <span className={"time-stamp"} data-tip={convertUTCDateToLocalDate(props.comment.timeStamp)} data-for="comment">{timeSince(props.comment.timeStamp)}</span>
                        <ReactTooltip delayShow={400} effect={"solid"} id="comment"/>
                        {
                            props.comment.username === username &&
                            !(props.comment.comment === "__deleted__" && props.comment.numReplies > 0) &&
                            <span
                                className={"delete-button"}
                                onClick={() => props.deleteComment(props.path)}
                                role={"img"}
                                aria-label="trash"
                            >
                                🗑️
                            </span>
                        }
                    </div>
                </div>
                {!state.collapsed && <div className="replies">
                    {
                        !!state.fetchingReplies ? <ClipLoader size={25} color={"var(--light-neutral-color)"} loading={state.fetchingReplies}/> : props.comment.replies.map((reply: Comment, i: number) => {
                            return <CommentComponent 
                                        key={reply.id} 
                                        comment={reply} 
                                        path={props.path.concat([i])} 
                                        pathToHighlightedComment={props.pathToHighlightedComment} 
                                        highlightComment={props.highlightComment} 
                                        fetchMoreReplies={props.fetchMoreReplies}
                                        deleteComment={props.deleteComment}
                                        judgment={judgment}
                                        level2={true}
                                    />
                        })
                    }
                </div>}
                {
                        (props.comment.numReplies > 0) && (!props.level2) &&
                        <div className={"show-or-hide-container"}>
                            {viewMoreReplies > 0 ? <div className="more-replies" onClick={showReplies}><span>{`View replies (${viewMoreReplies})`}</span><DownSVG style={{ marginLeft: '0.5em', fill: 'gray' }} width={'1em'}/></div> : null}
                            {!state.collapsed ? <div className="hide-replies" onClick={hideReplies}><span>Hide</span><UpSVG style={{ marginLeft: '0.5em', fill: 'gray' }} width={'1em'}/></div> : null}
                        </div>
                }
            </div>
            <div className="likes-container">
                <HeartButtonSVG className={!!state.comment.userVote ? "heart-liked" : "heart"} onClick={upVote} />
                <div className={!!state.comment.userVote ? "likes-liked" : "likes"}>{state.comment.upVotes}</div>
            </div>
        </div>
    )
}