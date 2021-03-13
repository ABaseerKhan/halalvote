import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import "quill-mention";
import { ReactComponent as SendButtonSVG } from '../../icons/send-button.svg';
import { ReactComponent as PencilSVG } from '../../icons/pencil.svg';
import { useMedia } from '../../hooks/useMedia';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { getData } from '../../https-client/client';
import { usersAPIConfig } from '../../https-client/config';

//type imports

//style imports
import 'react-quill/dist/quill.snow.css';
import './comments.css';

const expandedStyles = { width: 'calc(100% - 10px)', height: 'auto', right: 0, bottom: '0.5em', borderRadius: '25px', boxShadow: '0 5px 50px 0 rgba(32,33,36,0.28)' };
const collapsedStyles = { width: '50px', height: '50px', borderRadius: '50%', right: 15, bottom: 15, boxShadow: '0px 0px 5px 5px rgba(0, 0, 0, 0.5)' };

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

    const [commentMakerCardStyles, setCommentMakerCardStyles] = useState<any>(collapsedStyles);
    const [state, setState] = useState({
        holdingDownShift: false,
        cancelSubmissionOnEnter: false,
    });
    let [value, setValue] = useState('');
    const quillEditor = useRef<ReactQuill>(null);
    const commentMakerCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (quillEditor.current) {
            const placeholderText = (props.replyToUsername && "Reply to " + props.replyToUsername) || "Comment";
            quillEditor.current.getEditor().root.dataset.placeholder = placeholderText;
            if (!props.replyToUsername) {
                setValue('');
            }
        }
    }, [props.replyToUsername])

    useImperativeHandle(ref, () => ({
        collapse: collapse,
        focus: () => {
            if (quillEditor.current) {
                focusAndOpenKeyboard(quillEditor.current, 250);
            }
        },
        setHeight: (height: number) => {
            if (commentMakerCardRef.current) {
                commentMakerCardRef.current.style.height = `${height - 10}px`;
                commentMakerCardRef.current.style.width = expandedStyles.width;
                commentMakerCardRef.current.style.bottom = expandedStyles.bottom;
                commentMakerCardRef.current.style.borderRadius = expandedStyles.borderRadius;
                commentMakerCardRef.current.style.boxShadow = expandedStyles.boxShadow;
                commentMakerCardRef.current.style.right = 'unset';

                setCommentMakerCardStyles({ ...expandedStyles, height: `${height - 10}px` });
            }
        },
        getCommentMakerCardRef: () => {
            if (commentMakerCardRef.current) {
                return commentMakerCardRef.current;
            }
        }
    }));

    const expand = () => {
        if (commentMakerCardStyles.width === '50px') setCommentMakerCardStyles(expandedStyles);
    };

    const collapse = () => {
        if (commentMakerCardStyles.width !== '50px') setCommentMakerCardStyles(collapsedStyles);
    };

    const submitComment = async () => {
        if (value !== "") {
            value = value.replace(new RegExp('<img '), '<img style="max-width: 100%;max-height: 65vh;border-radius: 15px;"');
            if ((await props.submitComment(value)) === 200) {
                if (commentMakerCardRef.current) {
                    commentMakerCardRef.current.style.height = `4em`;
                }
                setValue('')
            }
        }
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        switch (event.keyCode) {
            case 13:
                if (!state.holdingDownShift && !state.cancelSubmissionOnEnter && !isMobile) {
                    value = value.replace(new RegExp('<p><br></p>$'), '');
                    submitComment();
                };
                setState(prevState => ({ ...prevState, cancelSubmissionOnEnter: false }));
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

    modules.mention.onClose = () => setState(prevState => ({ ...prevState, cancelSubmissionOnEnter: true }));

    return (
        <div id="comment-maker-card" ref={commentMakerCardRef} className={"comment-maker-card"} style={commentMakerCardStyles} onClick={(e) => { e.stopPropagation(); }}>
            <ReactQuill
                ref={quillEditor} 
                className={"comment-maker-input"}
                style={commentMakerCardStyles.width !== '50px' ? { opacity:'unset' } : { opacity: 0 }}
                theme="snow"
                value={value}
                onChange={setValue}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                modules={modules}
                formats={formats}
                preserveWhitespace
            />
            <SendButtonSVG className={"comment-maker-button"} style={{ display: commentMakerCardStyles.width !== '50px' ? 'unset' : 'none' }} onClick={submitComment}/>
            {commentMakerCardStyles.width === '50px' && <div className="pencil-container" onClick={(e) => { expand(); e.stopPropagation(); }} ><PencilSVG className={"pencil-icon"} /></div>}
        </div>
    )
}

export const CommentMakerComponent = forwardRef(_CommentMakerComponent);

const suggestUsers = async (searchTerm: string) => {
    const { data } = await getData({ baseUrl: usersAPIConfig.url, path: 'get-users', queryParams: { 'searchTerm': searchTerm }, additionalHeaders: {}});
    const allUsers = data.map((user: any, idx: number) => ({ id: idx++, value: user.username }));

    return allUsers;
};

const fetchMentions = async (searchTerm: any, renderList: any) => {
    const matchedUsers = await suggestUsers(searchTerm);
    renderList(matchedUsers);
};

const modules: any = {
    toolbar: [
        ['bold', 'italic', 'underline','strike', 'blockquote', 'code-block', 'link'],
    ],
    mention: {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ["@"],
        source: AwesomeDebouncePromise(fetchMentions, 300),
    }
};

const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'link', 'mention',
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
    }
}

CustomMentionBlot.blotName = "mention";
CustomMentionBlot.tagName = "span";
CustomMentionBlot.className = "mention";

Quill.register(CustomMentionBlot);
Quill.register(CustomLink);

function focusAndOpenKeyboard(el: any, timeout: any) {
    if(!timeout) {
        timeout = 100;
    }
    if(el) {
        // Align temp input element approximately where the input element is
        // so the cursor doesn't jump around
        var __tempEl__: any = document.createElement('input');
        __tempEl__.style.position = 'absolute';
        __tempEl__.style.top = (el.offsetTop + 7) + 'px';
        __tempEl__.style.left = el.offsetLeft + 'px';
        __tempEl__.style.height = 0;
        __tempEl__.style.opacity = 0;
        // Put this temp element as a child of the page <body> and focus on it
        document.body.appendChild(__tempEl__);
        __tempEl__.focus();
    
        // The keyboard is open. Now do a delayed focus on the target element
        setTimeout(function() {
            el.focus();
            //el.click();
            // Remove the temp element
            document.body.removeChild(__tempEl__);
        }, timeout);
    }
}