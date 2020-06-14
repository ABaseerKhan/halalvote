import React, { useState } from 'react';
import { Comment } from '../../types';

// type imports
import { Vote } from '../../types';

// style imports
import './comments-card.css';
import { postData } from '../../https-client/post-data';
import { commentsConfig } from '../../https-client/config';

interface CommentComponentProps {
    key: number,
    comment: Comment,
    index: number,
    highlightedComment: Comment | undefined,
    setHighlightedComment: (comment: Comment | undefined) => void,
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

    const fetchMoreReplies = () => {
        const fetchData = async () => {
            const data = await postData({ 
                baseUrl: commentsConfig.url,
                path: 'get-comments', 
                data: { 
                    "parentId": state.comment.id,
                    "depth": 2, 
                    "n": 55,
                    "excludedCommentIds": state.comment.replies,
                },
                additionalHeaders: { },
            });
            setState({ ...state, comment: { ...state.comment, replies: [...state.comment.replies, ...data] } });
        };
        fetchData();
    }
    const moreReplies = (state.comment.numReplies - state.comment.replies.length);

    const isHighlighted = props.highlightedComment && props.highlightedComment.id === state.comment.id;
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
                        props.setHighlightedComment(state.comment);
                    }}
                >
                    Reply
                </span>
            </div>
            <div className="replies">
                {
                    state.comment.replies.map((reply: Comment, i: number) => {
                        return <CommentComponent key={reply.id} comment={reply} index={i} highlightedComment={props.highlightedComment} setHighlightedComment={props.setHighlightedComment} />
                    })
                }
            </div>
            {
                moreReplies > 0 &&
                <div className="show-more-replies" onClick={(e) => { e.stopPropagation(); fetchMoreReplies();  }}>
                    {moreReplies + " more replies"}
                </div>
            }
        </div>
    )
}
