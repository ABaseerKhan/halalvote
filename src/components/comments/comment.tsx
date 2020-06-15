import React, { useState } from 'react';
import { Comment } from '../../types';

// type imports
import { Vote } from '../../types';

// style imports
import './comments-card.css';
import { UserContext } from '../app-shell';

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
        vote: Vote.NONE,
        canShowMore: true,
        collapsed: false,
    });

    const toggleCollapse = () => {
        setState({
            ...state,
            collapsed: !state.collapsed,
        });
    };

    const upVote = () => {
        setState({
            ...state,
            vote: (state.vote === Vote.UPVOTE ? Vote.NONE : Vote.UPVOTE)
        });
    }

    const downVote =() => {
        setState({
            ...state,
            vote: (state.vote === Vote.DOWNVOTE ? Vote.NONE : Vote.DOWNVOTE)
        });
    }

    const moreReplies = (props.comment.numReplies - props.comment.replies.length);

    const isHighlighted = 
    props.pathToHighlightedComment && 
    props.pathToHighlightedComment.length === props.path.length && 
    props.pathToHighlightedComment.every((value, index) => value === props.path[index]);

    let commentBorderClass = isHighlighted ? "comment-border-highlighted" : "comment-border-unhighlighted";

    const CommentHeader = (
        <div className={"comment-header"}>
            <div className={"toggle-collapse"} onClick={toggleCollapse}>{state.collapsed ? "+" : "--"}</div>
            <div className="username">{props.comment.username}</div>
            <div className={"vote-section"}>
                <div className="down-votes" onClick={downVote} >{props.comment.downVotes + (state.vote === Vote.DOWNVOTE ? 1 : 0)}</div>
                <div className="up-votes" onClick={upVote} >{props.comment.upVotes + (state.vote === Vote.UPVOTE ? 1 : 0)}</div>
            </div>
        </div>
    );

    return (
        state.collapsed ? CommentHeader : 
        <div onClick={(e) => { if (isHighlighted) e.stopPropagation(); }} className={commentBorderClass}>
            {CommentHeader}
            <div className="comment">{props.comment.comment}</div>
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
                    {moreReplies + " more replies"}
                </div>
            }
        </div>
    )
}
