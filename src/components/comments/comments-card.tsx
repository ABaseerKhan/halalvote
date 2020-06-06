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
};

interface CommentsCardState {
    comments: Comment[],
    highlightedComment?: number[],
    totalComments: number,
};

export const CommentsCardComponent = (props: CommentsCardComponentProps) => {
    const { judgment } = props;

    const [state, setState] = useState<CommentsCardState>({
        comments: [],
        highlightedComment: [],
        totalComments: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await postData({ baseUrl: config().commentsUrl, path: 'get-comments', data: { "commentType": "OTHER", "itemName": "Tesla", "depth": 2, "n": 55 } });
            const transformedData = data.map((comment: Comment) => ({ replies: [], ...comment }));
            setState({ ...state, comments: transformedData });
        };
        fetchData();
    }, [])

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
                            let repliesHidden: boolean = true
                            if (state.highlightedComment != undefined && state.highlightedComment.length > 1 && state.highlightedComment[0] === i && state.highlightedComment[1] > 0) {
                                repliesHidden = false;
                            }
                            return <CommentComponent key={comment.id} comment={comment} index={i} highlightedComment={state.highlightedComment} repliesHidden={repliesHidden}/>
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
    },
    1: {
        text: "🔥 Haram - {votes} ({%}) 🔥",
    }
};
