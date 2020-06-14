import React, { useState } from 'react';
import { Comment } from '../../types';

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
}
export const CommentComponent = (props: CommentComponentProps) => {
    const [state, setState] = useState({
        comment: props.comment,
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

    const moreReplies = (state.comment.numReplies - state.comment.replies.length);

    const isHighlighted = 
    props.pathToHighlightedComment && 
    props.pathToHighlightedComment.length === props.path.length && 
    props.pathToHighlightedComment.every((value, index) => value === props.path[index]);
    
    let commentBorderClass = isHighlighted ? "comment-border-highlighted" : "comment-border-unhighlighted";

    const CommentHeader = (
        <div className={"comment-header"}>
            <div className={"toggle-collapse"} onClick={toggleCollapse}>{state.collapsed ? "+" : "--"}</div>
            <div className="username">{state.comment.username}</div>
            <div className={"vote-section"}>
                <div className="down-votes" onClick={downVote} >{state.comment.downVotes + (state.vote == Vote.DOWNVOTE ? 1 : 0)}</div>
                <div className="up-votes" onClick={upVote} >{state.comment.upVotes + (state.vote == Vote.UPVOTE ? 1 : 0)}</div>
            </div>
        </div>
    );

    return (
        state.collapsed ? CommentHeader : 
        <div onClick={(e) => { if (isHighlighted) e.stopPropagation(); }} className={commentBorderClass}>
            {CommentHeader}
            <div className="comment">{state.comment.comment}</div>
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
            </div>
            <div className="replies">
                {
                    state.comment.replies.map((reply: Comment, i: number) => {
                        return <CommentComponent key={reply.id} comment={reply} path={props.path.concat([i])} pathToHighlightedComment={props.pathToHighlightedComment} highlightComment={props.highlightComment} fetchMoreReplies={props.fetchMoreReplies}/>
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
