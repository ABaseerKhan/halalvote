import React, { useState, useEffect, useRef, ReactElement } from 'react';
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
    const [value, setValue] = useState('');
    const quillEditor = useRef<ReactQuill>(null);

    useEffect(() => {
        if (quillEditor.current) {
            const placeholderText = (props.replyToUsername && "Reply to " + props.replyToUsername) || "Comment";
            quillEditor.current.getEditor().root.dataset.placeholder = placeholderText;
            if (props.replyToUsername) {
                quillEditor.current.focus();
            }
        }
    }, [props.replyToUsername])
    const submitComment = (event: any) => {
        if (value !== "") {
            event.preventDefault();
            props.callback(value);
            setValue('');
        }
    };
    return (
        <div className={"comment-maker-card-" + props.judgment} onClick={(e) => { e.stopPropagation()}}>
            <ReactQuill ref={quillEditor} className={"comment-maker-input"} theme="snow" value={value} onChange={setValue} modules={modules} formats={formats} />
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