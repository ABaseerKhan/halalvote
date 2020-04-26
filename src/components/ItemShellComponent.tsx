import React, { useState } from 'react';
import { CommentsCardComponent } from './CommentsCardComponent';
import { CommentMakerCardComponent } from './CommentMakerCardComponent';
import { Comment } from '../index';
import '../index.css';

interface ItemShellProps {
  halalVotes: number,
  halalComments: Comment[],
  highlightedHalalComment?: number[],
  totalHalalComments: number,
  haramVotes: number,
  haramComments: Comment[],
  totalHaramComments: number,
  highlightedHaramComment?: number[]
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
    votePrompt: true
  });

  const getHalalVotePercentage = (): number => {
    const decimal = props.halalVotes/(props.halalVotes + props.haramVotes);
    const percentage = decimal * 100;
    return Math.round(percentage);
  }

  const getHaramVotePercentage = (): number => {
    const decimal = props.haramVotes/(props.halalVotes + props.haramVotes);
    const percentage = decimal * 100;
    return Math.round(percentage);
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

    let haramCommentsCard = (document.getElementsByClassName('comments-card-haram')[0] as HTMLInputElement);
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

    let halalCommentsCard = (document.getElementsByClassName('comments-card-halal')[0] as HTMLInputElement);
        halalCommentsCard.scrollTop = 0;

    setState({
      ...state,
      halalComments: [commentObject, ...state.halalComments],
      highlightedHalalComment: [0],
      totalHalalComments: state.totalHalalComments + 1
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
      <CommentsCardComponent judgment="haram" comments={state.haramComments} votePrompt={state.votePrompt} removeVotePrompt={removeVotePrompt} highlightedComment={state.highlightedHaramComment}/>
      <CommentsCardComponent judgment="halal" comments={state.halalComments} votePrompt={state.votePrompt} removeVotePrompt={removeVotePrompt} highlightedComment={state.highlightedHalalComment}/>
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
