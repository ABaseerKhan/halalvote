import React, { useState, useEffect } from 'react';
import { CommentMakerComponent } from "./comment-maker";
import { CommentComponent } from "./comment";
import { Comment } from '../../types';
import { postData } from '../../https-client/post-data';
import { commentsConfig } from '../../https-client/config';

// type imports
import { Judgment } from '../../types';

// style imports
import './comments-card.css';

interface CommentsCardComponentProps {
    judgment: Judgment,
    itemName: string | undefined,
};

interface CommentsCardState {
    comments: Comment[],
    highlightedComment?: Comment | undefined,
    totalComments: number,
};

export const CommentsCardComponent = (props: CommentsCardComponentProps) => {
    const { judgment, itemName } = props;

    const [state, setState] = useState<CommentsCardState>({
        comments: [],
        highlightedComment: undefined,
        totalComments: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await postData({ 
                baseUrl: commentsConfig.url,
                path: 'get-comments', 
                data: { 
                    "commentType": judgementToTextMap[judgment].commentType, 
                    "itemName": itemName, 
                    "depth": 2, 
                    "n": 55 
                },
                additionalHeaders: { },
            });
            setState({ ...state, comments: data });
        };
        if (itemName) {
            fetchData();
        }
    }, [itemName])

    const addComment = (comment: string) => {
        const fetchData = async () => {
            const commentId = await postData({
                baseUrl: commentsConfig.url,
                path: 'add-comment', 
                data: { 
                    "parentId": state.highlightedComment, 
                    "itemName": props.itemName, 
                    "username": "OP",
                    "comment": comment,
                    "commentType": judgementToTextMap[judgment].commentType,
                },
                additionalHeaders: {
                    "sessiontoken": "7b22acc3266307cdf4ba"
                }
            });
            const commentObject: Comment = {
                id: commentId,
                username: "OP",
                comment: comment,
                replies: [],
                upVotes: 0,
                downVotes: 0,
                numReplies: 0,
            };
            
            setState({ ...state, comments: [...state.comments, commentObject] });
        }
        fetchData();
        let commentsCard = (document.getElementsByClassName(`comments-card-${judgment.toString()}`)[0] as HTMLInputElement);
        commentsCard.scrollTop = 0;
    }

    const setHighlightedComment = (comment: Comment | undefined) => {
        setState({
            ...state,
            highlightedComment: comment,
        });
    }

    return(
        <div className={"container"}>
            <div className={'header-text'} >{judgementToTextMap[judgment].text}</div>
            <br />
            <div onClick={() => setHighlightedComment(undefined)} className={"comments-card-" + judgment.toString()}>
                <div >
                    {
                        state.comments.map((comment: Comment, i: number) => {
                            return <CommentComponent key={comment.id} comment={comment} index={i} highlightedComment={state.highlightedComment} setHighlightedComment={setHighlightedComment} />
                        })
                    }
                </div>
            </div>
            <br />
            <CommentMakerComponent judgment={judgment} callback={addComment} replyToUsername={state.highlightedComment?.username}/>
            <br />
        </div>
    )
}

export const judgementToTextMap = {
    0: {
        text: "👼 Halal - {votes} ({%}) 👼",
        commentType: "HALAL",
    },
    1: {
        text: "🔥 Haram - {votes} ({%}) 🔥",
        commentType: "HARAM",
    }
};
