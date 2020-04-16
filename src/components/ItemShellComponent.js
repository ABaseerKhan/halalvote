import React, { useState } from 'react';
import { CommentsCardComponent } from './CommentsCardComponent.js';
import '../index.css';

export const ItemShellComponent = (props) => {
  const [state, setState] = useState({ votePrompt: true });

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

  const removeVotePrompt = () => {
    setState({ votePrompt: false });
  };

  return (
    <div className="item-shell">
      <div className="item-text">Penis</div>
      <div className="haram-text">🔥 Haram - {getHaramVotePercentage()}% 🔥</div>
      <div className="halal-text">👼 Halal - {getHalalVotePercentage()}% 👼</div>
      <br />
      <CommentsCardComponent direction="left" comments={props.haramComments} votePrompt={state.votePrompt} removeVotePrompt={removeVotePrompt}/>
      <CommentsCardComponent direction="right" comments={props.halalComments} votePrompt={state.votePrompt} removeVotePrompt={removeVotePrompt}/>
    </div>
  )
}
