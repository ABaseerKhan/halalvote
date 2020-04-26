import React, { useState } from 'react';
import { CommentsCardComponent } from './CommentsCardComponent';
import { CommentMakerComponent } from './CommentMakerComponent';
import { Comment } from '../index';
import '../index.css';

export enum Judgment {
  HALAL,
  HARAM,
};

interface ItemShellProps {
  halalComments: Comment[],
  highlightedHalalComment?: number[],
  totalHalalComments: number,
  haramComments: Comment[],
  highlightedHaramComment?: number[],
  totalHaramComments: number,
};

export const ItemShellComponent = (props: ItemShellProps) => {
  const [state, setState] = useState({
    username: "op",
    halalComments: props.halalComments,
    highlightedHalalComment: props.highlightedHalalComment,
    totalHalalComments: props.totalHalalComments,
    haramComments: props.haramComments,
    highlightedHaramComment: props.highlightedHaramComment,
    totalHaramComments: props.totalHaramComments,
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
        id: state.totalHaramComments,
        username: state.username,
        comment: comment,
        replies: [],
        upVotes: 0,
        downVotes: 0
    }

    let haramCommentsCard = (document.getElementsByClassName(`comments-card-${Judgment.HARAM.toString()}`)[0] as HTMLInputElement);
    haramCommentsCard.scrollTop = 0;

    setState({
        ...state,
        haramComments: [commentObject, ...state.haramComments],
        highlightedHaramComment: [0],
        totalHaramComments: state.totalHaramComments + 1
    });
  }

  const halalCommentCallback = (comment: string) => {
    const commentObject = {
        id: state.totalHalalComments,
        username: state.username,
        comment: comment,
        replies: [],
        upVotes: 0,
        downVotes: 0
    }

    let halalCommentsCard = (document.getElementsByClassName(`comments-card-${Judgment.HALAL.toString()}`)[0] as HTMLInputElement);
        halalCommentsCard.scrollTop = 0;

    setState({
      ...state,
      halalComments: [commentObject, ...state.halalComments],
      highlightedHalalComment: [0],
      totalHalalComments: state.totalHalalComments + 1
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
      <CommentsCardComponent judgment={Judgment.HARAM} comments={state.haramComments} votePrompt={state.votePrompt} vote={vote} highlightedComment={state.highlightedHaramComment}/>
      <CommentsCardComponent judgment={Judgment.HALAL} comments={state.halalComments} votePrompt={state.votePrompt} vote={vote} highlightedComment={state.highlightedHalalComment}/>
      <br />
      {
        !state.votePrompt && <CommentMakerComponent judgment={Judgment.HARAM} callback={haramCommentCallback}/>
      }
      {
        !state.votePrompt && <CommentMakerComponent judgment={Judgment.HALAL} callback={halalCommentCallback}/>
      }
      <br />
      <div className="floor"/>
    </div>
  )
}
