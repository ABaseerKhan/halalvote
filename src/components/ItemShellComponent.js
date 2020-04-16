import React, { useState } from 'react';
import { CommentsCardComponent } from './CommentsCardComponent.js';
import { CommentComponent } from './CommentsCardComponent.js';
import { CommentMakerCardComponent } from './CommentMakerCardComponent.js';
import '../index.css';

export const ItemShellComponent = (props) => {
  const [state, setState] = useState({
    username: "op",
    halalVotes: props.halalVotes,
    halalComments: props.halalComments,
    haramVotes: props.haramVotes,
    haramComments: props.haramComments
  });

  const getHalalVotePercentage = () => {
    const decimal = state.halalVotes/(state.halalVotes + state.haramVotes);
    const percentage = decimal * 100;
    return Math.round(percentage);
  }

  const getHaramVotePercentage = () => {
    const decimal = state.haramVotes/(state.halalVotes + state.haramVotes);
    const percentage = decimal * 100;
    return Math.round(percentage);
  }

  const haramCommentCallback = (comment) => {
    const commentObject = {
      username: state.username,
      comment: comment,
      replies: [],
      upVotes: 0,
      downVotes: 0
    }

    setState({
      ...state,
      haramComments: [commentObject, ...state.haramComments]
    });
  }

  const halalCommentCallback = (comment) => {
    const commentObject = {
      username: state.username,
      comment: comment,
      replies: [],
      upVotes: 0,
      downVotes: 0
    }

    setState({
      ...state,
      halalComments: [commentObject, ...state.halalComments]
    });
  }

  return (
    <div className="item-shell">
      <div className="item-text">Penis</div>
      <div className="haram-text">🔥 Haram - {getHaramVotePercentage()}% 🔥</div>
      <div className="halal-text">👼 Halal - {getHalalVotePercentage()}% 👼</div>
      <br />
      <CommentsCardComponent judgement="haram" comments={state.haramComments}/>
      <CommentsCardComponent judgement="halal" comments={state.halalComments}/>
      <br />
      <CommentMakerCardComponent judgement="haram" callback={haramCommentCallback}/>
      <CommentMakerCardComponent judgement="halal" callback={halalCommentCallback}/>
      <br />
      <div className="floor"/>
    </div>
  )
}
