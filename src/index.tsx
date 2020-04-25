import React from 'react';
import ReactDOM from 'react-dom';
import { ItemShellComponent } from './components/ItemShellComponent';
import './index.css';

export interface Comment {
  username: string,
  comment: string,
  replies: Comment[],
  upVotes: number,
  downVotes: number,
};

const comments: Comment[] = [
  {
    username: "pessimist",
    comment: "This sucks.",
    replies: [
      {
        username: "thing-1",
        comment: "You suck!",
        replies: [
          {
            username: "pessimist",
            comment: "Fuck You",
            replies: [],
            upVotes: 1,
            downVotes: 1
          },
          {
            username: "random_dude",
            comment: "Real smart...",
            replies: [],
            upVotes: 0,
            downVotes: 0
          }
        ],
        upVotes: 2,
        downVotes: 1
      },
      {
        username: "pushover",
        comment: "Agreed.",
        replies: [],
        upVotes: 0,
        downVotes: 0
      }
    ],
    upVotes: 3,
    downVotes: 2
  },
  {
    username: "optimist",
    comment: "This rocks!",
    replies: [
      {
        username: "wholesome_dude",
        comment: "you rock!",
        replies: [],
        upVotes: 3,
        downVotes: 2
      },
      {
        username: "but_technically",
        comment: "No it doesn't",
        replies: [],
        upVotes: 1,
        downVotes: 2
      },
      {
        username: "yes_man",
        comment: "yup",
        replies: [],
        upVotes: 0,
        downVotes: 0
      }
    ],
    upVotes: 9,
    downVotes: 3
  }
];

ReactDOM.render(
  <ItemShellComponent halalComments={comments} haramComments={comments}/>,
  document.getElementById('root')
);
