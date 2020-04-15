import React from 'react';
import '../index.css';

class CommentComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.comment.username,
      comment: this.props.comment.comment,
      replies: this.props.comment.replies,
      upVotes: this.props.comment.upVotes,
      downVotes: this.props.comment.downVotes,
      repliesHidden: true
    }
    console.log(props);
  }

  flipRepliesHidden() {
    this.setState((state, props) => {
      return {
        repliesHidden: !state.repliesHidden
      };
    });
  }

  upVote() {
    this.setState((state, props) => {
      return {
        upVotes: state.upVotes + 1
      }
    });
  }

  downVote() {
    this.setState((state, props) => {
      return {
        downVotes: state.downVotes + 1
      }
    });
  }

  render() {
    var replies = this.state.replies;
    return(
      <div>
        <div className="username">{this.state.username}</div>
        <div className="comment">{this.state.comment}</div>
        <div className="down-votes">{this.state.downVotes}</div>
        <button className="down-vote-button" onClick={() => {this.downVote();}}>-</button>
        <div className="up-votes">{this.state.upVotes}</div>
        <button className="up-vote-button" onClick={() => {this.upVote();}}>+</button>
        <br />
        <div className="replies">
          {
            replies.map((reply, i) => {
              if (!this.state.repliesHidden || i === 0) {
                return <CommentComponent comment={reply} key={i}/>
              } else {
                return null
              }
            })
          }
        </div>
        {
          replies.length > 1 &&
            <button className="show-more-button" onClick={() => {this.flipRepliesHidden();}}>
              {
                this.state.repliesHidden ? "Show More" : "Show Less"
              }
            </button>
        }
      </div>
    )
  }
}

class CommentsCardComponent extends React.Component {
  render() {
    var comments = this.props.comments;
    return(
      <div className={"card-" + this.props.direction}>
        {
          comments.map((comment, i) => {
            return <CommentComponent comment={comment} key={i}/>
          })
        }
      </div>
    )
  }
}

export {Comment, CommentsCardComponent}
