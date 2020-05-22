import React, { useState } from 'react';
import { Comment } from '../index';
import { Judgment } from './item-shell';
import '../index.css';

interface CommentsCardComponentProps {
    judgment: Judgment,
    comments: Comment[],
    votePrompt: boolean,
    vote: (judgment: Judgment) => void,
    highlightedComment?: number[]
};

export const CommentsCardComponent = (props: CommentsCardComponentProps) => {
    const { judgment, votePrompt } = props;
    return(
        <div className={"comments-card-" + judgment.toString()} style={votePrompt ? { overflow: 'hidden'} : undefined}>
            {votePrompt &&
                <div className={"vote-prompt"}>
                  <button className={"vote-button"} onClick={() => {props.vote(judgment)}}>+</button>
                </div>}
            <div >
                {
                    props.comments.map((comment: Comment, i: number) => {
                        let repliesHidden: boolean = true
                        if (props.highlightedComment != undefined && props.highlightedComment.length > 1 && props.highlightedComment[0] === i && props.highlightedComment[1] > 0) {
                            repliesHidden = false;
                        }
                        return <CommentComponent key={comment.id} comment={comment} index={i} highlightedComment={props.highlightedComment} repliesHidden={repliesHidden}/>
                    })
                }
            </div>
        </div>
    )
}

enum Vote {
    UPVOTE,
    DOWNVOTE,
    NONE
}

interface CommentComponentProps {
    key: number,
    comment: Comment,
    index: number,
    highlightedComment?: number[],
    repliesHidden: boolean
}

const CommentComponent = (props: CommentComponentProps) => {
    const [state, setState] = useState({
        vote: Vote.NONE,
        repliesHidden: props.repliesHidden
    });

    const flipRepliesHidden = () => {
        setState({
            ...state,
            repliesHidden: !state.repliesHidden
        });
    }

    const upVote = () => {
        setState({
            ...state,
            vote: (state.vote === Vote.UPVOTE ? Vote.NONE : Vote.UPVOTE)
        });
    }

    const downVote = () => {
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

    return (
        <div className={commentBorderClass}>
            <div className="username">{props.comment.username}</div>
            <div className="comment">{props.comment.comment}</div>
            <div className="down-votes">{props.comment.downVotes + (state.vote == Vote.DOWNVOTE ? 1 : 0)}</div>
            <button className="down-vote-button" onClick={() => downVote()}>-</button>
            <div className="up-votes">{props.comment.upVotes + (state.vote == Vote.UPVOTE ? 1 : 0)}</div>
            <button className="up-vote-button" onClick={() => upVote()}>+</button>
            <br />
            <div className="replies">
            {
                props.comment.replies.map((reply: Comment, i: number) => {
                    if (!state.repliesHidden || i === 0) {
                        return <CommentComponent key={reply.id} comment={reply} index={i} highlightedComment={newHighlightedComment} repliesHidden={showRepliesFor != i}/>
                    } else {
                        return null
                    }
                })
            }
            </div>
            {
            props.comment.replies.length > 1 &&
                <button className="show-more-button" onClick={() => flipRepliesHidden()}>
                    {
                        state.repliesHidden ? "Show More" : "Show Less"
                    }
                </button>
            }
        </div>
    )
}
