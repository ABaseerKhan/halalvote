import React, { useState } from 'react';
import { CommentsCardComponent } from './CommentsCardComponent';
import { CommentMakerCardComponent } from './CommentMakerCardComponent';
import '../index.css';

export const ItemShellComponent = (props: any) => {
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

  const haramCommentCallback = (comment: any) => {
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

  const halalCommentCallback = (comment: any) => {
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
      <CommentsCardComponent judgment="haram" comments={state.haramComments} votePrompt={state.votePrompt} removeVotePrompt={removeVotePrompt}/>
      <CommentsCardComponent judgment="halal" comments={state.halalComments} votePrompt={state.votePrompt} removeVotePrompt={removeVotePrompt}/>
      <br />
      {
        !state.votePrompt && <CommentMakerCardComponent judgment="haram" callback={haramCommentCallback}/>
      }
      {
        !state.votePrompt && <CommentMakerCardComponent judgment="halal" callback={halalCommentCallback}/>
      }
      <br />
      <div className="floor"/>
    </div>
  )
}
