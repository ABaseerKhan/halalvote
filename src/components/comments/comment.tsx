import React, { useState, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import { ReactComponent as UpArrowSVG } from '../../icons/up-arrow.svg';
import { ReactComponent as DownArrowSVG } from '../../icons/down-arrow.svg';
import { ReactComponent as ExpandSVG } from '../../icons/expand-button.svg';
import { Comment, Judgment } from '../../types';
import { UserContext } from '../app-shell';
import { convertUTCDateToLocalDate, timeSince } from '../../utils';
import Linkify from 'react-linkify'; 
import { commentsConfig } from '../../https-client/config';
import { postData } from '../../https-client/post-data';

// type imports
import { Vote } from '../../types';

// style imports
import './comments-card.css';

interface CommentComponentProps {
    key: number,
    comment: Comment,
    path: number[],
    pathToHighlightedComment: number[] | undefined,
    highlightComment: (path: number[] | undefined) => void,
    fetchMoreReplies: (path: number[]) => void,
    deleteComment: (path: number[]) => void,
    judgment: Judgment;
}
export const CommentComponent = (props: CommentComponentProps) => {
    let { username, sessiontoken } = React.useContext(UserContext);
    const [state, setState] = useState({
        comment: props.comment,
        canShowMore: true,
        collapsed: false,
    });

    useEffect(() => {
        setState(prevState => ({ ...prevState, comment: props.comment }));
    }, [props.comment]);

    const toggleCollapse = () => {
        setState({
            ...state,
            collapsed: !state.collapsed,
        });
    };

    const upVote = async () => {
        const { status } = await postData({
            baseUrl: commentsConfig.url,
            path: 'vote-comment', 
            data: {
                "username": username,
                "commentId": state.comment.id,
                "vote": 1,
            },
            additionalHeaders: {
                "sessiontoken": sessiontoken
            }
        });

        if (status === 200){
            const upVotes = (state.comment.userVote === Vote.UPVOTE) ? state.comment.upVotes - 1 : state.comment.upVotes + 1;
            const downVotes = (state.comment.userVote === Vote.DOWNVOTE) ? state.comment.downVotes - 1 : state.comment.downVotes;
            const userVote = (state.comment.userVote === Vote.UPVOTE) ? undefined : Vote.UPVOTE;
            setState(prevState => ({
                ...prevState,
                comment: { ...prevState.comment, upVotes: upVotes, downVotes: downVotes, userVote: userVote },
            }));
        }
    }

    const downVote = async () => {
        const { status } = await postData({
            baseUrl: commentsConfig.url,
            path: 'vote-comment', 
            data: { 
                "username": username,
                "commentId": state.comment.id,
                "vote": 0,
            },
            additionalHeaders: {
                "sessiontoken": sessiontoken
            }
        });

        if (status === 200) {
            const downVotes = (state.comment.userVote === Vote.DOWNVOTE) ? state.comment.downVotes - 1 : state.comment.downVotes + 1;
            const upVotes = (state.comment.userVote === Vote.UPVOTE) ? state.comment.upVotes - 1 : state.comment.upVotes;
            const userVote = (state.comment.userVote === Vote.DOWNVOTE) ? undefined : Vote.DOWNVOTE;
            setState(prevState => ({
                ...prevState,
                comment: { ...prevState.comment, downVotes: downVotes, upVotes: upVotes, userVote: userVote },
            }));
        }
    }

    const { judgment } = props;
    const moreReplies = (props.comment.numReplies - props.comment.replies.length);

    const isHighlighted = 
    props.pathToHighlightedComment && 
    props.pathToHighlightedComment.length === props.path.length && 
    props.pathToHighlightedComment.every((value, index) => value === props.path[index]);

    let commentBorderClass = isHighlighted ? "comment-border-highlighted" : "comment-border-unhighlighted";

    const CommentHeader = (
        <div className={"comment-header"}>
            {
                state.collapsed ? 
                    <div className={"toggle-collapse"} onClick={toggleCollapse}><ExpandSVG className={"expand-button-" + judgment}/></div> :
                    <>
                        <div className={"vote-buttons"}>
                            <UpArrowSVG onClick={upVote} className={state.comment.userVote === Vote.UPVOTE ? "up-vote-button-clicked" : "up-vote-button"}/>
                            <DownArrowSVG onClick={downVote} className={state.comment.userVote === Vote.DOWNVOTE ? "down-vote-button-clicked" : "down-vote-button"} />
                        </div>
                        <div className={"vote-counts"}>
                            <div className="up-votes" >{state.comment.upVotes}</div>
                            <div className="down-votes" >{state.comment.downVotes}</div>
                        </div>
                    </>
            }
            <span className={"bullet-separator"}>&bull;</span>
            <div className="username">{props.comment.username}</div>
            <span className={"bullet-separator"}>&bull;</span>
            <div className={"time-stamp"} >
                <span data-tip={convertUTCDateToLocalDate(props.comment.timeStamp)}>{timeSince(props.comment.timeStamp)}</span>
                <ReactTooltip delayShow={400} effect={"solid"} />
            </div>
        </div>
    );

    return (
        state.collapsed ? CommentHeader : 
        <div id={`comment-${state.comment.id}`} onClick={(e) => { if (isHighlighted) e.stopPropagation(); }} className={commentBorderClass}>
            {CommentHeader}
            {!isHighlighted && <div className={"comment-tail-" + judgment} onClick={toggleCollapse}></div>}
            <div className="comment">
                <Linkify><div dangerouslySetInnerHTML={{__html: props.comment.comment}}/></Linkify>
            </div>
            <div className="comment-actions">
                <span 
                    className={"reply-button"} 
                    onClick={(e) => {
                        e.stopPropagation();
                        props.highlightComment(props.path);
                    }}
                >
                    Reply
                </span>
                {
                    props.comment.username === username &&
                    !(props.comment.comment === "__deleted__" && props.comment.numReplies > 0) &&
                    <span
                        className={"delete-button"}
                        onClick={() => props.deleteComment(props.path)}
                    >
                        🗑️
                    </span>
                }
            </div>
            <div className="replies">
                {
                    props.comment.replies.map((reply: Comment, i: number) => {
                        return <CommentComponent 
                                    key={reply.id} 
                                    comment={reply} 
                                    path={props.path.concat([i])} 
                                    pathToHighlightedComment={props.pathToHighlightedComment} 
                                    highlightComment={props.highlightComment} 
                                    fetchMoreReplies={props.fetchMoreReplies}
                                    deleteComment={props.deleteComment}
                                    judgment={judgment}
                                />
                    })
                }
            </div>
            {
                moreReplies > 0 &&
                <div className="show-more-replies" onClick={(e) => { e.stopPropagation(); props.fetchMoreReplies(props.path);  }}>
                    {moreReplies + (moreReplies > 1 ? " more replies" : " more reply")}
                </div>
            }
        </div>
    )
}
