import React, { useState } from 'react';
import { Comment } from '../../types';

// type imports
import { Vote } from '../../types';

// style imports
import './comments-card.css';

interface CommentComponentProps {
    key: number,
    comment: Comment,
    index: number,
    highlightedComment?: number[],
}
export const CommentComponent = (props: CommentComponentProps) => {
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

    let isHighlighted: boolean = false;
    let newHighlightedComment: number[] | undefined = undefined;
    let showRepliesFor: number = -1;
    if (props.highlightedComment != undefined && props.highlightedComment.length > 0 && props.highlightedComment[0] === props.index) {
        isHighlighted = props.highlightedComment.length === 1;

        if (!isHighlighted) {
                newHighlightedComment = props.highlightedComment.slice(1);

            if (newHighlightedComment.length > 1 && newHighlightedComment[1] > 0) {
                showRepliesFor = newHighlightedComment[0];
            }
        }
    }

    let commentBorderClass = isHighlighted ? "comment-border-highlighted" : "comment-border-unhighlighted";

    const CommentHeader = (
        <div className={"comment-header"}>
            <div className={"toggle-collapse"} onClick={toggleCollapse}>+</div>
            <div className="username">{props.comment.username}</div>
            <div className={"vote-section"}>
                <div className="down-votes" onClick={downVote} >{props.comment.downVotes + (state.vote == Vote.DOWNVOTE ? 1 : 0)}</div>
                <div className="up-votes" onClick={upVote} >{props.comment.upVotes + (state.vote == Vote.UPVOTE ? 1 : 0)}</div>
            </div>
        </div>
    );

    return (
        state.collapsed ? CommentHeader : 
        <div className={commentBorderClass}>
            {CommentHeader}
            <div className="comment">{props.comment.comment}</div>
            <div className="replies">
                {
                    props.comment.replies.map((reply: Comment, i: number) => {
                        return <CommentComponent key={reply.id} comment={reply} index={i} highlightedComment={newHighlightedComment} />
                    })
                }
            </div>
            {
            state.canShowMore &&
                <div className="show-more-replies" onClick={() => {}}>
                    {"more replies"}
                </div>
            }
        </div>
    )
}
