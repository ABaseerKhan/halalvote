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
        holdingDownForSubmission: false,
    });
    let [value, setValue] = useState('');
    const quillEditor = useRef<ReactQuill>(null);

    useEffect(() => {
        if (quillEditor.current) {
            const placeholderText = (props.replyToUsername && "Reply to " + props.replyToUsername) || "Comment";
            quillEditor.current.getEditor().root.dataset.placeholder = placeholderText;
            if (props.replyToUsername) {
                quillEditor.current.getEditor().getModule('mention').insertItem({ denotationChar: "@", id: 0, index: 0, value: props.replyToUsername }, true);
            } else {
                setValue('');
                if (document.getElementById("comment-maker-card")) {
                    document.getElementById("comment-maker-card")!.style.height = `4em`;
                }
            }
        }
    }, [props.replyToUsername])

    useImperativeHandle(ref, () => ({
        focus: () => {
            if (quillEditor.current) {
                quillEditor.current.focus();
            }
        },
        setHeight: (height: number) => {
            if (document.getElementById("comment-maker-card")) {
                document.getElementById("comment-maker-card")!.style.height = `${height}px`;
            }
        }
    }));

    const submitComment = async () => {
        if (value !== "") {
            value = value.replace(new RegExp('<img '), '<img style="max-width: 100%;max-height: 65vh;border-radius: 15px;"');
            if ((await props.submitComment(value)) === 200) { 
                setValue('')
            }
        }
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        switch (event.keyCode) {
            case 13:
                if (state.holdingDownForSubmission && !isMobile) {
                    value = value.replace(new RegExp('<p><br></p>$'), '');
                    submitComment();
                };
                break;
            case 17:
            case 18:
                setState({	
                    ...state,
                    holdingDownForSubmission: true
                });	
            }	
    }	


    const onKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.keyCode === 17 || event.keyCode === 18) {	
            setState({	
                ...state,	
                holdingDownForSubmission: false	
            });	
        }	
    };

    return (
        <div id="comment-maker-card" className={"comment-maker-card"} onClick={(e) => { e.stopPropagation()}}>
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

const modules: any = {
    toolbar: [
        [{'header': 1}, 'bold', 'italic', 'underline','strike', 'blockquote', 'code-block', 'link', 'image'],
    ],
    mention: {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ["@"],
        source: AwesomeDebouncePromise(fetchMentions, 300),
        link: 'https://google.com'
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

const Embed = Quill.import("blots/embed");
class CustomMentionBlot extends Embed {
    static create(data:any) {
        const node = super.create();
        const denotationChar = document.createElement("span");
        denotationChar.className = "ql-mention-denotation-char";
        denotationChar.innerHTML = data.denotationChar;
        node.appendChild(denotationChar);
        node.innerHTML += data.value;
        return CustomMentionBlot.setDataValues(node, data);
    }

    static setDataValues(element:any, data:any) {
        const domNode = element;
        Object.keys(data).forEach(key => {
        domNode.dataset[key] = data[key];
        });
        return domNode;
    }

    static value(domNode: any) {
        return domNode.dataset;
    }

    constructor(domNode: any) {
        super(domNode);

        // Bind our click handler to the class.
        this.clickHandler = this.clickHandler.bind(this);
        domNode.addEventListener('click', this.clickHandler);
    }

    clickHandler(event: any) {
        console.log("ClickableSpan was clicked. Blot: ", this);
    }
}

CustomMentionBlot.blotName = "mention";
CustomMentionBlot.tagName = "span";
CustomMentionBlot.className = "mention";

Quill.register(CustomMentionBlot);
Quill.register(CustomLink);