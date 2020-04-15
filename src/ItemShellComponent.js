import React, { useState } from 'react';
import { CommentsCardComponent } from './CommentsCardComponent.js';
import './index.css';

export const ItemShellComponent = (props) => {
  const [state] = useState({
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

  return (
    <div className="item-shell">
      <div className="item-text">Penis</div>
      <div className="haram-text">🔥 Haram - {getHaramVotePercentage()}% 🔥</div>
      <div className="halal-text">👼 Halal - {getHalalVotePercentage()}% 👼</div>
      <br />
      <CommentsCardComponent direction="left" comments={state.haramComments}/>
      <CommentsCardComponent direction="right" comments={state.halalComments}/>
    </div>
  )
}
