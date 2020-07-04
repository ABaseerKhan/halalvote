import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { ReactComponent as SendButtonSVG } from '../../icons/send-button.svg';

//type imports
import { Judgment } from '../../types';

//style imports
import './comments-card.css';

interface CommentMakerComponentProps {
    judgment: Judgment,
    callback: (comment: string) => void,
    replyToUsername?: string,
};

export const CommentMakerComponent = (props: CommentMakerComponentProps) => {
    const [state, setState] = useState({
        holdingDownShift: false
    });

    const textAreaId = props.judgment.toString() + "-comment";

    const textAreaOnKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        switch (event.keyCode) {
            case 13:
                if (!state.holdingDownShift) {
                    submitComment(event as any);
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

    const submitComment = (event: any) => {
        const textValue = ((document.getElementById(textAreaId) as HTMLInputElement).value).trim();
        if (textValue !== null && textValue !== '') {
            event.preventDefault();
            props.callback((document.getElementById(textAreaId) as HTMLInputElement).value);
            (document.getElementById(textAreaId) as HTMLInputElement).value = '';
        }
    };

    const placeholderText = (props.replyToUsername && "Reply to " + props.replyToUsername) || "Comment";

    return (
        <div className={"comment-maker-card-" + props.judgment} onClick={(e) => { e.stopPropagation()}}>
            <TextareaAutosize className="comment-maker-input" id={textAreaId} placeholder={placeholderText} onKeyDown={textAreaOnKeyDown} onKeyUp={textAreaOnKeyUp}/>
            <SendButtonSVG className={"comment-maker-button-" + props.judgment} onClick={submitComment}/>
        </div>
    )
}
