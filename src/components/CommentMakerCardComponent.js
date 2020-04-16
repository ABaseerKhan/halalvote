import React, { useState } from 'react';
import '../index.css';

export const CommentMakerCardComponent = (props) => {
  const [state, setState] = useState({
    isReply: false,
    holdingDownShift: false
  });

  const textAreaId = props.judgement + "-comment";

  const textAreaOnKeyDown = (event) => {
    switch (event.keyCode) {
      case 13:
        if (!state.holdingDownShift) {
          invokeCallback();
        }
        break;
      case 16:
        setState({
          ...state,
          holdingDownShift: true
        });
    }
  }

  const textAreaOnKeyUp = (event) => {
    if (event.keyCode === 16) {
      setState({
        ...state,
        holdingDownShift: false
      });
    }
  };

  const invokeCallback = () => {
    const textValue = (document.getElementById(textAreaId).value).trim();
    if (textValue !== null && textValue !== '') {
      event.preventDefault(); 
      props.callback(document.getElementById(textAreaId).value);
      document.getElementById(textAreaId).value = '';
    }
  };

  return (
    <div className={"comment-maker-card-" + props.judgement}>
      <textarea id={textAreaId} className="comment-maker-input" placeholder={state.isReply ? "Reply" : "Comment"} onKeyDown={textAreaOnKeyDown} onKeyUp={textAreaOnKeyUp}/>
      <button className="comment-maker-button" onClick={invokeCallback}>^</button>
    </div>
  )
}
