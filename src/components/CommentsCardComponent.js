import React, { useState } from 'react';
import '../index.css';

export const CommentComponent = (props) => {
  const [state, setState] = useState({
    upVotes: props.comment.upVotes,
    downVotes: props.comment.downVotes,
    repliesHidden: true
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
        upVotes: state.upVotes + 1
    });
  }

  const downVote = () => {
    setState({
        ...state,
        downVotes: state.downVotes + 1
    });
  }

  return (
    <div>
      <div className="username">{props.comment.username}</div>
      <div className="comment">{props.comment.comment}</div>
      <div className="down-votes">{state.downVotes}</div>
      <button className="down-vote-button" onClick={() => downVote()}>-</button>
      <div className="up-votes">{state.upVotes}</div>
      <button className="up-vote-button" onClick={() => upVote()}>+</button>
      <br />
      <div className="replies">
        {
          props.comment.replies.map((reply, i) => {
            if (!state.repliesHidden || i === 0) {
              return <CommentComponent comment={reply} key={i}/>
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

export const CommentsCardComponent = (props) => {
  return(
    <div className={"comments-card-" + props.judgement}>
      {
        props.comments.map((comment, i) => {
          return <CommentComponent comment={comment} key={i}/>
        })
      }
    </div>
  )
}
