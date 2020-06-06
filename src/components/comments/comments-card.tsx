import React, { useState } from 'react';
import { CommentMakerComponent } from "./comment-maker";
import { CommentComponent } from "./comment";
import { Comment } from '../../types';

// type imports
import { Judgment } from '../../types';

// style imports
import './comments-card.css';

interface CommentsCardComponentProps {
    judgment: Judgment,
    comments: Comment[],
    highlightedComment?: number[]
};

interface CommentsCardState {
    halalComments: Comment[],
    highlightedHalalComment?: number[],
    totalHalalComments: number,
    haramComments: Comment[],
    highlightedHaramComment?: number[],
    totalHaramComments: number,
};

export const CommentsCardComponent = (props: CommentsCardComponentProps) => {
    const { judgment } = props;

    const [state, setState] = useState<CommentsCardState>({
        halalComments: [],
        highlightedHalalComment: [],
        totalHalalComments: 0,
        haramComments: [],
        highlightedHaramComment: [],
        totalHaramComments: 0,
    });

    const makeHaramComment = (comment: string) => {
        const commentObject = {
            id: state.totalHaramComments,
            username: "OP",
            comment: comment,
            replies: [],
            upVotes: 0,
            downVotes: 0
        }
    
        let haramCommentsCard = (document.getElementsByClassName(`comments-card-${Judgment.HARAM.toString()}`)[0] as HTMLInputElement);
        haramCommentsCard.scrollTop = 0;
    
        setState({
            ...state,
            haramComments: [commentObject, ...state.haramComments],
            highlightedHaramComment: [0],
            totalHaramComments: state.totalHaramComments + 1
        });
    }

    const makeHalalComment = (comment: string) => {
        const commentObject = {
            id: state.totalHalalComments,
            username: "OP",
            comment: comment,
            replies: [],
            upVotes: 0,
            downVotes: 0
        }
    
        let halalCommentsCard = (document.getElementsByClassName(`comments-card-${Judgment.HALAL.toString()}`)[0] as HTMLInputElement);
        halalCommentsCard.scrollTop = 0;
    
        setState({
            ...state,
            halalComments: [commentObject, ...state.halalComments],
            highlightedHalalComment: [0],
            totalHalalComments: state.totalHalalComments + 1
        });
    }

    return(
        <div className={"container"}>
            <div className={'header-text'} >{judgementToTextMap[judgment].text}</div>
            <br />
            <div className={"comments-card-" + judgment.toString()}>
                <div >
                    {
                        props.comments.map((comment: Comment, i: number) => {
                            let repliesHidden: boolean = true
                            if (props.highlightedComment != undefined && props.highlightedComment.length > 1 && props.highlightedComment[0] === i && props.highlightedComment[1] > 0) {
                                repliesHidden = false;
                            }
                            return <CommentComponent key={comment.id} comment={comment} index={i} highlightedComment={props.highlightedComment} repliesHidden={repliesHidden}/>
                        })
                    }
                </div>
            </div>
            <br />
            <CommentMakerComponent judgment={judgment} callback={judgment === Judgment.HARAM ? makeHaramComment : makeHalalComment}/>
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
