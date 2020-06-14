import React, { useState, useEffect } from 'react';
import { CommentMakerComponent } from "./comment-maker";
import { CommentComponent } from "./comment";
import { Comment } from '../../types';
import { postData } from '../../https-client/post-data';
import { config } from '../../https-client/config';

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
    highlightedComment?: number[],
    totalComments: number,
};

export const CommentsCardComponent = (props: CommentsCardComponentProps) => {
    const { judgment, itemName } = props;

    const [state, setState] = useState<CommentsCardState>({
        comments: [],
        highlightedComment: [],
        totalComments: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await postData({ 
                baseUrl: config().commentsUrl, 
                path: 'get-comments', 
                data: { 
                    "commentType": judgementToTextMap[judgment].commentType, 
                    "itemName": itemName, 
                    "depth": 2, 
                    "n": 55 
                },
            });
            const transformedData = data.map((comment: Comment) => ({ replies: [], ...comment })); // Temporary, remove when comment data structure is available
            setState({ ...state, comments: transformedData });
        };
        if (itemName) {
            fetchData();
        }
    }, [itemName])

    const addComment = (comment: string) => {
        const commentObject = {
            id: state.totalComments,
            username: "OP",
            comment: comment,
            replies: [],
            upVotes: 0,
            downVotes: 0
        }
    
        let commentsCard = (document.getElementsByClassName(`comments-card-${judgment.toString()}`)[0] as HTMLInputElement);
        commentsCard.scrollTop = 0;
    
        setState({
            ...state,
            comments: [commentObject, ...state.comments],
            highlightedComment: [0],
            totalComments: state.totalComments + 1
        });
    }

    return(
        <div className={"container"}>
            <div className={'header-text'} >{judgementToTextMap[judgment].text}</div>
            <br />
            <div className={"comments-card-" + judgment.toString()}>
                <div >
                    {
                        state.comments.map((comment: Comment, i: number) => {
                            return <CommentComponent key={comment.id} comment={comment} index={i} highlightedComment={state.highlightedComment}/>
                        })
                    }
                </div>
            </div>
            <br />
            <CommentMakerComponent judgment={judgment} callback={addComment}/>
            <br />
        </div>
    )
}

const judgementToTextMap = {
    0: {
        text: "👼 Halal - {votes} ({%}) 👼",
        commentType: "HALAL",
    },
    1: {
        text: "🔥 Haram - {votes} ({%}) 🔥",
        commentType: "HARAM",
    }
};
