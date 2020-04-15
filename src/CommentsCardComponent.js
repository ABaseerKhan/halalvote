import React, { useState } from 'react';
import './index.css';

const CommentComponent = (props) => {
  const [state, setState] = useState({
    username: props.comment.username,
    post: props.comment.post,
    replies: props.comment.replies,
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

  var replies = state.replies;

  return (
    <div>
      <div className="username">{state.username}</div>
      <div className="comment">{state.post}</div>
      <div className="down-votes">{state.downVotes}</div>
      <button className="down-vote-button" onClick={() => downVote()}>-</button>
      <div className="up-votes">{state.upVotes}</div>
      <button className="up-vote-button" onClick={() => upVote()}>+</button>
      <br />
      <div className="replies">
        {
          replies.map((reply, i) => {
            if (!state.repliesHidden || i === 0) {
              return <CommentComponent comment={reply} key={i}/>
            } else {
              return null
            }
          })
        }
      </div>
      {
        replies.length > 1 &&
          <button className="show-more-button" onClick={() => flipRepliesHidden()}>
            {
              state.repliesHidden ? "Show More" : "Show Less"
            }
          </button>
      }
    </div>
  )
};

export const CommentsCardComponent = (props) => {
  var comments = props.comments;
  return(
    <div className={"card-" + props.direction}>
      {
        comments.map((comment, i) => {
          return <CommentComponent comment={comment} key={i}/>
        })
      }
    </div>
  )
}
