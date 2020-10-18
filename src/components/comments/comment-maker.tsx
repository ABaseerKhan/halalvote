import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import "quill-mention";
import { ReactComponent as SendButtonSVG } from '../../icons/send-button.svg';
import { useMedia } from '../../hooks/useMedia';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

//type imports

//style imports
import 'react-quill/dist/quill.snow.css';
import './comments.css';
import { getData } from '../../https-client/client';
import { usersConfig } from '../../https-client/config';

interface CommentMakerComponentProps {
    submitComment: (comment: any) => Promise<number>,
    replyToUsername?: string,
};

const _CommentMakerComponent = (props: CommentMakerComponentProps, ref: any) => {
    const isMobile = useMedia(
        // Media queries
        ['(max-width: 600px)'],
        [true],
        // default value
        false
    );

    const [state, setState] = useState({
        holdingDownShift: false
    });
    let [value, setValue] = useState('');
    const quillEditor = useRef<ReactQuill>(null);

    useEffect(() => {
        if (quillEditor.current) {
            quillEditor.current.getEditor().root.dataset.placeholder = "Comment";
            if (props.replyToUsername) {
                quillEditor.current.getEditor().getModule('mention').insertItem({ denotationChar: "@", id: 0, index: 0, value: props.replyToUsername }, true);
            } else {
                setValue('');
            }
        }
    }, [props.replyToUsername])

    useImperativeHandle(ref, () => ({
        focus: () => {
            if (quillEditor.current) {
                quillEditor.current.focus();
            }
        }
    }));

    const submitComment = async (event: any) => {
        if (value !== "") {
            event.preventDefault();
            value = value.replace(new RegExp('<img '), '<img style="max-width: 100%;max-height: 65vh;border-radius: 15px;"');
            if ((await props.submitComment(value)) === 200) { 
                setValue('')
            }
        }
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        switch (event.keyCode) {	
            case 13:
                event.preventDefault();
                if (!state.holdingDownShift && !isMobile && false) {
                    value = value.replace(new RegExp('<p><br></p>$'), '');
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


    const onKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.keyCode === 16) {	
            setState({	
                ...state,	
                holdingDownShift: false	
            });	
        }	
    };
    
    return (
        <div className={"comment-maker-card"} onClick={(e) => { e.stopPropagation()}}>
            <ReactQuill
                ref={quillEditor} 
                className={"comment-maker-input"} 
                theme="snow" 
                value={value}
                onChange={setValue}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                modules={modules} 
                formats={formats}
                preserveWhitespace
            />
            <SendButtonSVG className={"comment-maker-button"} onClick={submitComment}/>
        </div>
    )
}

export const CommentMakerComponent = forwardRef(_CommentMakerComponent);

const suggestUsers = async (searchTerm: string) => {
    const { data } = await getData({ baseUrl: usersConfig.url, path: 'get-users', queryParams: { 'searchTerm': searchTerm }, additionalHeaders: {}});
    const allUsers = data.map((user: any, idx: number) => ({ id: idx++, value: user.username }));

    return allUsers;
};

const fetchMentions = async (searchTerm: any, renderList: any) => {
    const matchedUsers = await suggestUsers(searchTerm);
    renderList(matchedUsers);
};

const modules = {
    toolbar: [
        [{'header': 1}, 'bold', 'italic', 'underline','strike', 'blockquote', 'code-block', 'link', 'image'],
    ],
    mention: {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ["@"],
        source: AwesomeDebouncePromise(fetchMentions, 300),
        onSelect: (item: any, insertItem: any) => { insertItem(item); console.log(item);}
    }
};

const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'link', 'image', 'mention',
];

let Link = Quill.import('formats/link');
class CustomLink extends Link {
    static sanitize(url: any) {
        let value = super.sanitize(url);
        if(value)
        {
            for(let i=0;i<CustomLink.PROTOCOL_WHITELIST.length;i++) {
                if(value.startsWith(CustomLink.PROTOCOL_WHITELIST[i]))
                    return value;
            }
            return `http://${value}`
        }
        return value;
    }
}
Quill.register(CustomLink);