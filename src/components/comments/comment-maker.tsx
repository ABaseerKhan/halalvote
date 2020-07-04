import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactQuill, { Quill } from 'react-quill';
import { ReactComponent as SendButtonSVG } from '../../icons/send-button.svg';

//type imports
import { Judgment } from '../../types';

//style imports
import 'react-quill/dist/quill.snow.css';
import './comments-card.css';

interface CommentMakerComponentProps {
    judgment: Judgment,
    callback: (comment: any) => void,
    replyToUsername?: string,
};

export const CommentMakerComponent = (props: CommentMakerComponentProps) => {
    const [state, setState] = useState({
        holdingDownShift: false
    });

    const [value, setValue] = useState('');

    const textAreaId = props.judgment.toString() + "-comment";

    const submitComment = (event: any) => {
        event.preventDefault();
        props.callback(value);
        setValue('');
    };

    return (
        <div className={"comment-maker-card-" + props.judgment} onClick={(e) => { e.stopPropagation()}}>
            <ReactQuill className={"comment-maker-input"} theme="snow" value={value} onChange={setValue} modules={modules} formats={formats}/>
            <SendButtonSVG className={"comment-maker-button-" + props.judgment} onClick={submitComment}/>
        </div>
    )
}

const modules = {
    toolbar: [
        [{'header': 1}, 'bold', 'italic', 'underline','strike', 'blockquote', 'code-block', 'link', 'image'],
    ],
};

const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'link', 'image',
];