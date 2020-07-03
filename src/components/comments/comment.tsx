import React, { useState, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import { ReactComponent as UpArrowSVG } from '../../icons/upArrow.svg';
import { ReactComponent as DownArrowSVG } from '../../icons/downArrow.svg';
import { Comment } from '../../types';

// type imports
import { Vote } from '../../types';

// style imports
import './comments-card.css';
import { UserContext } from '../app-shell';
import { convertUTCDateToLocalDate, timeSince } from '../../utils';
import Linkify from 'react-linkify'; 
import { SSL_OP_ALL } from 'constants';

interface CommentComponentProps {
    key: number,
    comment: Comment,
    path: number[],
    pathToHighlightedComment: number[] | undefined,
    highlightComment: (path: number[] | undefined) => void,
    fetchMoreReplies: (path: number[]) => void,
    deleteComment: (path: number[]) => void,
}
export const CommentComponent = (props: CommentComponentProps) => {
    let { username } = React.useContext(UserContext);
    const [state, setState] = useState({
        comment: props.comment,
        vote: Vote.NONE,
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

    const upVote = () => {
        const upVotes = (state.vote === Vote.UPVOTE) ? state.comment.upVotes - 1 : state.comment.upVotes + 1;
        const downVotes = (state.vote === Vote.DOWNVOTE) ? state.comment.downVotes - 1 : state.comment.downVotes;
        const vote = (state.vote === Vote.UPVOTE) ? Vote.NONE : Vote.UPVOTE;
        setState(prevState => ({
            ...prevState,
            comment: { ...prevState.comment, upVotes: upVotes, downVotes: downVotes },
            vote: vote,
        }));
    }

    const downVote =() => {
        const downVotes = (state.vote === Vote.DOWNVOTE) ? state.comment.downVotes - 1 : state.comment.downVotes + 1;
        const upVotes = (state.vote === Vote.UPVOTE) ? state.comment.upVotes - 1 : state.comment.upVotes;
        const vote = (state.vote === Vote.DOWNVOTE) ? Vote.NONE : Vote.DOWNVOTE;
        setState(prevState => ({
            ...prevState,
            comment: { ...prevState.comment, downVotes: downVotes, upVotes: upVotes },
            vote: vote,
        }));
    }

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
                    <div className={"toggle-collapse"} onClick={toggleCollapse}>{"+"}</div> :
                    <div className={"vote-buttons"}>
                        <UpArrowSVG onClick={upVote} className={state.vote === Vote.UPVOTE ? "up-vote-button-clicked" : "up-vote-button"}/>
                        <DownArrowSVG onClick={downVote} className={state.vote === Vote.DOWNVOTE ? "down-vote-button-clicked" : "down-vote-button"} />
                    </div>
            }
            <div className={"vote-counts"}>
                <>
                    <div className="up-votes" >{state.comment.upVotes}</div>
                    <div className="down-votes" >{state.comment.downVotes}</div>
                </>
            </div>
            <span className={"bullet-separator"}>&bull;</span>
            <div className="username">{props.comment.username}</div>
            <span className={"bullet-separator"}>&bull;</span>
            <div className={"time-stamp"} data-tip={convertUTCDateToLocalDate(props.comment.timeStamp)} >
                <span >{timeSince(props.comment.timeStamp)}</span>
            </div>
            <ReactTooltip delayShow={400} effect={"solid"}/>
        </div>
    );

    return (
        state.collapsed ? CommentHeader : 
        <div onClick={(e) => { if (isHighlighted) e.stopPropagation(); }} className={commentBorderClass}>
            {CommentHeader}
            {!isHighlighted && <div className="comment-tail" onClick={toggleCollapse}></div>}
            <div className="comment">
                <Linkify>{props.comment.comment}</Linkify>
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
                                />
                    })
                }
            </div>
            {
                moreReplies > 0 &&
                <div className="show-more-replies" onClick={(e) => { e.stopPropagation(); props.fetchMoreReplies(props.path);  }}>
                    {moreReplies + (moreReplies > 1 ? " more replies" : "more reply")}
                </div>
            }
        </div>
    )
}
