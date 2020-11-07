import React, { useState, useContext, useRef } from 'react';
import ReactTooltip from 'react-tooltip';
import { ReactComponent as HeartButtonSVG } from '../../icons/heart-icon.svg';
import { Comment } from '../../types';
import { convertUTCDateToLocalDate, timeSince } from '../../utils';
import { commentsConfig } from '../../https-client/config';
import { postData } from '../../https-client/client';
import { ReactComponent as UpSVG } from '../../icons/up-arrow.svg';
import { ReactComponent as DownSVG } from '../../icons/down-arrow.svg';
import ClipLoader from "react-spinners/ClipLoader";
import { 
    useHistory,
} from "react-router-dom";
import { getCommentFromPath } from "./comments-card";

// type imports
import { Vote } from '../../types';

// style imports
import './comments.css';
import { useCookies } from 'react-cookie';
import { useQuery } from '../../hooks/useQuery';
import { topicsContext, commentsContext } from '../app-shell';

interface CommentComponentProps {
    key: number,
    path: number[],
    comment: Comment,
    specificComment: Comment | undefined,
    pathToHighlightedComment: number[] | undefined,
    highlightComment: (path: number[] | undefined) => void,
    fetchMoreReplies: (pathToParentComment: number[], specificCommentId?: number | undefined, depth?: number) => Promise<void>,
    deleteComment: (path: number[]) => void,
    topicIndexOverride?: number;
    level2?: boolean;
}
export const CommentComponent = (props: CommentComponentProps) => {
    let { topicIndexOverride, comment, specificComment } = props;

    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const query = useQuery();
    const history = useHistory();

    const commentContentRef = useRef<HTMLDivElement>(null);

    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);
    topicIndexOverride = (topicIndexOverride !== undefined) ? topicIndexOverride : topicIndex;
    const topic = topics?.length ? topics[topicIndexOverride] : undefined;

    const { commentsState, setCommentsContext } = useContext(commentsContext);

    const [state, setState] = useState({
        fetchingReplies: false,
        canShowMore: true,
    });

    // eslint-disable-next-line
    const hideReplies = () => {
        comment!.repliesShown = false;
        setCommentsContext(topic?.topicTitle!, commentsState[topic?.topicTitle!].comments, specificComment!);
        setState({
            ...state,
        });
    };

    // eslint-disable-next-line
    const showReplies = async () => {
        comment!.repliesShown = true;
        setCommentsContext(topic?.topicTitle!, commentsState[topic?.topicTitle!].comments, specificComment!);
        setState(prevState => ({ ...prevState, fetchingReplies: true }));

        if(comment.replies.length < comment.numReplies) await props.fetchMoreReplies(props.path);
        setState(prevState => ({
            ...prevState,
            fetchingReplies: false,
        }));
    };

    const upVote = async () => {
        const upVotes = (comment.userVote === Vote.UPVOTE) ? comment.upVotes - 1 : comment.upVotes + 1;
        const userVote = (comment.userVote === Vote.UPVOTE) ? undefined : Vote.UPVOTE;
        const { status } = await postData({
            baseUrl: commentsConfig.url,
            path: 'vote-comment', 
            data: {
                "username": username,
                "commentId": comment.id,
                "vote": 1,
            },
            additionalHeaders: sessiontoken ? {
                "sessiontoken": sessiontoken
            } : { },
            setCookie: setCookie,
        });

        if (status === 200){
            comment.upVotes = upVotes;
            comment.userVote = userVote;
            setCommentsContext(topic?.topicTitle!, commentsState[topic?.topicTitle!].comments, specificComment!);
            // setState(prevState => ({
            //     ...prevState,
            //     comment: { ...prevState.comment, upVotes: upVotes, userVote: userVote },
            // }));
        }
    }

    const moreReplies = (comment.numReplies - comment.replies.length);
    const viewMoreReplies = !comment.repliesShown ? (comment.numReplies) : (moreReplies);

    const isHighlighted = 
    !!props.pathToHighlightedComment;

    let commentContentClass = "comment-content";

    const onUserClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();
        query.set('userProfile', comment.username);
        history.push({
            search: "?" + query.toString()
        });
    };

    return (
        <div id={`comment-${comment.id}`} className={"comment-container"}>
            <div className="comment-bubble-container">
                <div className={`comment-bubble-${comment.commentType.toLowerCase()}`}></div>
            </div>
            <div className="comment-body">
                <div
                    ref={commentContentRef}
                    className={commentContentClass} 
                    onClick={(e) => {
                        const selection = window.getSelection();
                        if(selection?.toString().length === 0) {
                            if (isHighlighted) {
                                e.stopPropagation();
                                props.highlightComment(undefined);
                            } else {
                                e.stopPropagation();
                                props.highlightComment(props.path);
                                commentContentRef.current!.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                                setTimeout(() => {
                                    commentContentRef.current!.style.backgroundColor = "rgba(0, 0, 0, 0)";
                                }, 100);
                            }
                        }
                    }}
                >
                    <div className="username" onClick={onUserClick}>{comment.username}</div>
                    <div className="comment">
                        <div style={{ maxWidth: 'calc(100% - 50px)' }} dangerouslySetInnerHTML={{__html: comment.comment}}/>
                    </div>
                    <div className="comment-extras">
                        <span className={"time-stamp"} data-tip={convertUTCDateToLocalDate(comment.timeStamp)} data-for="comment">{timeSince(comment.timeStamp)}</span>
                        <ReactTooltip delayShow={400} effect={"solid"} id="comment"/>
                        {
                            comment.username === username &&
                            !(comment.comment === "__deleted__" && comment.numReplies > 0) &&
                            <span
                                className={"delete-button"}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation();  props.deleteComment(props.path); }}
                                role={"img"}
                                aria-label="trash"
                            >
                                🗑️
                            </span>
                        }
                    </div>
                </div>
                {comment.repliesShown && <div className="replies">
                    {
                        !!state.fetchingReplies ? <ClipLoader size={25} color={"var(--light-neutral-color)"} loading={state.fetchingReplies}/> : comment.replies.map((reply: Comment, i: number) => {
                            return <CommentComponent 
                                        key={reply.id}
                                        path={props.path.concat([i])}
                                        comment={reply}
                                        specificComment={specificComment}
                                        pathToHighlightedComment={props.pathToHighlightedComment} 
                                        highlightComment={props.highlightComment} 
                                        fetchMoreReplies={props.fetchMoreReplies}
                                        deleteComment={props.deleteComment}
                                        level2={true}
                                    />
                        })
                    }
                </div>}
                {
                        (comment.numReplies > 0) && (!props.level2) &&
                        <div className={"show-or-hide-container"}>
                            {viewMoreReplies > 0 ? <div className="more-replies" onClick={showReplies}><span>{`View replies (${viewMoreReplies})`}</span><DownSVG style={{ marginLeft: '0.5em', fill: 'gray' }} width={'1em'}/></div> : null}
                            {comment.repliesShown ? <div className="hide-replies" onClick={hideReplies}><span>Hide</span><UpSVG style={{ marginLeft: '0.5em', fill: 'gray' }} width={'1em'}/></div> : null}
                        </div>
                }
            </div>
            <div className="likes-container">
                <HeartButtonSVG className={!!comment.userVote ? "heart-liked" : "heart"} onClick={upVote} />
                <div className={!!comment.userVote ? "likes-liked" : "likes"}>{comment.upVotes}</div>
            </div>
        </div>
    )
}