import React from 'react';
import {CommentsCardComponent} from './CommentsCardComponent.js';
import '../index.css';

class ItemShellComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      halalVotes: props.halalVotes,
      halalComments: props.halalComments,
      haramVotes: props.haramVotes,
      haramComments: props.haramComments
    }
  }

  getHalalVotePercentage() {
    const decimal = this.state.halalVotes/(this.state.halalVotes + this.state.haramVotes);
    const percentage = decimal * 100;
    return Math.round(percentage);
  }

  getHaramVotePercentage() {
    const decimal = this.state.haramVotes/(this.state.halalVotes + this.state.haramVotes);
    const percentage = decimal * 100;
    return Math.round(percentage);
  }

  render() {
    return(
      <div className="item-shell">
        <div className="item-text">Penis</div>
        <div className="haram-text">🔥 Haram - {this.getHaramVotePercentage()}% 🔥</div>
        <div className="halal-text">👼 Halal - {this.getHalalVotePercentage()}% 👼</div>
        <br />
        <CommentsCardComponent direction="left" comments={this.state.haramComments}/>
        <CommentsCardComponent direction="right" comments={this.state.halalComments}/>
      </div>
    )
  }
}

export {ItemShellComponent}
