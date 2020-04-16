import React, { useState } from 'react';
import { CommentsCardComponent } from './CommentsCardComponent.js';
import { CommentComponent } from './CommentsCardComponent.js';
import { CommentMakerCardComponent } from './CommentMakerCardComponent.js';
import '../index.css';

export const ItemShellComponent = (props) => {
  const [state, setState] = useState({
    username: "op",
    halalComments: props.halalComments,
    haramComments: props.haramComments,
    votePrompt: true
  });

  const getHalalVotePercentage = () => {
    const decimal = props.halalVotes/(props.halalVotes + props.haramVotes);
    const percentage = decimal * 100;
    return Math.round(percentage);
  }

  const getHaramVotePercentage = () => {
    const decimal = props.haramVotes/(props.halalVotes + props.haramVotes);
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

  const removeVotePrompt = () => {
    setState({ ...state, votePrompt: false });
  };

  return (
    <div className="item-shell">
      <div className="item-text">Penis</div>
      <div className="haram-text">🔥 Haram - {getHaramVotePercentage()}% 🔥</div>
      <div className="halal-text">👼 Halal - {getHalalVotePercentage()}% 👼</div>
      <br />
      <CommentsCardComponent judgement="haram" comments={state.haramComments} votePrompt={state.votePrompt} removeVotePrompt={removeVotePrompt}/>
      <CommentsCardComponent judgement="halal" comments={state.halalComments} votePrompt={state.votePrompt} removeVotePrompt={removeVotePrompt}/>
      <br />
      <CommentMakerCardComponent judgement="haram" callback={haramCommentCallback}/>
      <CommentMakerCardComponent judgement="halal" callback={halalCommentCallback}/>
      <br />
      <div className="floor"/>
    </div>
  )
}
