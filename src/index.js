import React from 'react';
import ReactDOM from 'react-dom';
import Comment from './Comment.js';
import ItemShellComponent from './ItemShellComponent.js';
import './index.css';

const comments = [
  new Comment("pessimist", "This sucks.", [
    new Comment("op", "You suck!", [
      new Comment("pessimist", "Fuck You", [], 1, 1),
      new Comment("random_dude", "Real smart...", [], 0, 0),
    ], 2, 1),
    new Comment("pushover", "Agreed.", [], 0, 0)
  ], 3, 2),
  new Comment("optimist", "This rocks!", [
    new Comment("wholesome_dude", "you rock!", [], 3, 2),
    new Comment("but_technically", "No it doesn't", [], 1, 2),
    new Comment("yes_man", "yup", [], 0, 0)
  ], 9, 3),
];

ReactDOM.render(
  <ItemShellComponent halalVotes={5} halalComments={comments} haramVotes={3} haramComments={comments}/>,
  document.getElementById('root')
);
