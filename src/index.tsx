import React from 'react';
import ReactDOM from 'react-dom';
import { ItemShellComponent } from './components/ItemShellComponent';
import './index.css';

export interface Comment {
    id: number,
    username: string,
    comment: string,
    replies: Comment[],
    upVotes: number,
    downVotes: number,
};

const comments: Comment[] = [
  {
    id: 0,
    username: "pessimist",
    comment: "This sucks.",
    replies: [
      {
        id: 1,
        username: "thing-1",
        comment: "You suck!",
        replies: [
          {
            id: 2,
            username: "pessimist",
            comment: "Fuck You",
            replies: [],
            upVotes: 1,
            downVotes: 1
          },
          {
            id: 3,
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
        id: 4,
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
    id: 5,
    username: "optimist",
    comment: "This rocks!",
    replies: [
      {
        id: 6,
        username: "wholesome_dude",
        comment: "you rock!",
        replies: [],
        upVotes: 3,
        downVotes: 2
      },
      {
        id: 7,
        username: "but_technically",
        comment: "No it doesn't",
        replies: [],
        upVotes: 1,
        downVotes: 2
      },
      {
        id: 8,
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
  <ItemShellComponent halalComments={comments} highlightedHalalComment={undefined} totalHalalComments={9} haramComments={comments} highlightedHaramComment={undefined} totalHaramComments={9}/>,
  document.getElementById('root')
);
