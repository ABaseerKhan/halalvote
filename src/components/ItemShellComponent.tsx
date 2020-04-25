import React, { useState } from 'react';
import { CommentsCardComponent } from './CommentsCardComponent';
import { CommentMakerCardComponent } from './CommentMakerCardComponent';
import { Comment } from '../index';
import '../index.css';

export enum Judgment {
  HALAL,
  HARAM,
};

interface ItemShellProps {
  halalComments: Comment[],
  haramComments: Comment[],
};

export const ItemShellComponent = (props: ItemShellProps) => {
  const [state, setState] = useState({
    username: "op",
    halalComments: props.halalComments,
    haramComments: props.haramComments,
    votePrompt: true,
    halalVotes: 0,
    haramVotes: 0,
  });

  const getHalalVotePercentage = (): number => {
    const totalVotes = state.halalVotes + state.haramVotes;
    const decimal = state.halalVotes/totalVotes;
    const percentage = decimal * 100;
    return totalVotes ? Math.round(percentage) : 0;
  }

  const getHaramVotePercentage = (): number => {
    const totalVotes = state.halalVotes + state.haramVotes;
    const decimal = state.haramVotes/totalVotes;
    const percentage = decimal * 100;
    return totalVotes ? Math.round(percentage) : 0;
  }

  const haramCommentCallback = (comment: string) => {
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

  const halalCommentCallback = (comment: string) => {
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

  const vote = (judgment: Judgment) => {
    switch (judgment) {
      case 0: 
        setState({ ...state, halalVotes: state.halalVotes+1, votePrompt: false });
        break;
      case 1: 
        setState({ ...state, haramVotes: state.haramVotes+1, votePrompt: false });
        break;
    }
  };

  return (
    <div className="item-shell">
      <div className="item-text">Penis</div>
      <div className="haram-text">🔥 Haram - {state.haramVotes} ({getHaramVotePercentage()}%) 🔥</div>
      <div className="halal-text">👼 Halal - {state.halalVotes} ({getHalalVotePercentage()}%) 👼</div>
      <br />
      <CommentsCardComponent judgment={Judgment.HARAM} comments={state.haramComments} votePrompt={state.votePrompt} vote={vote}/>
      <CommentsCardComponent judgment={Judgment.HALAL} comments={state.halalComments} votePrompt={state.votePrompt} vote={vote}/>
      <br />
      {
        !state.votePrompt && <CommentMakerCardComponent judgment={Judgment.HARAM} callback={haramCommentCallback}/>
      }
      {
        !state.votePrompt && <CommentMakerCardComponent judgment={Judgment.HALAL} callback={halalCommentCallback}/>
      }
      <br />
      <div className="floor"/>
    </div>
  )
}
