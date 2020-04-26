import React, { useState } from 'react';
import '../index.css';
import { Judgment } from './ItemShellComponent';

interface CommentMakerComponentProps {
    judgment: Judgment,
    callback: (comment: string) => void,
};

export const CommentMakerComponent = (props: CommentMakerComponentProps) => {
    const [state, setState] = useState({
        isReply: false,
        holdingDownShift: false
    });

    const textAreaId = props.judgment.toString() + "-comment";

    const textAreaOnKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        switch (event.keyCode) {
            case 13:
                if (!state.holdingDownShift) {
                  invokeCallback(event as any);
                }
                break;
            case 16:
                setState({
                    ...state,
                    holdingDownShift: true
                });
            }
    }

    const textAreaOnKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.keyCode === 16) {
            setState({
                ...state,
                holdingDownShift: false
            });
        }
    };

    const invokeCallback = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const textValue = ((document.getElementById(textAreaId) as HTMLInputElement).value).trim();
        if (textValue !== null && textValue !== '') {
            event.preventDefault();
            props.callback((document.getElementById(textAreaId) as HTMLInputElement).value);
            (document.getElementById(textAreaId) as HTMLInputElement).value = '';
        }
    };

    return (
        <div className={"comment-maker-card-" + props.judgment}>
            <textarea id={textAreaId} className="comment-maker-input" placeholder={state.isReply ? "Reply" : "Comment"} onKeyDown={textAreaOnKeyDown} onKeyUp={textAreaOnKeyUp}/>
            <button className="comment-maker-button" onClick={invokeCallback}>^</button>
        </div>
    )
}
