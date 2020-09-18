import React, { useState, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import { ReactComponent as HeartButtonSVG } from '../../icons/heart-icon.svg';
import { Comment, Judgment } from '../../types';
import { convertUTCDateToLocalDate, timeSince } from '../../utils';
import { commentsConfig } from '../../https-client/config';
import { postData } from '../../https-client/client';

// type imports
import { Vote } from '../../types';

// style imports
import './comments.css';
import { useCookies } from 'react-cookie';

interface CommentComponentProps {
    key: number,
    comment: Comment,
    path: number[],
    pathToHighlightedComment: number[] | undefined,
    highlightComment: (path: number[] | undefined) => void,
    fetchMoreReplies: (path: number[]) => void,
    deleteComment: (path: number[]) => void,
    judgment: Judgment;
}
export const CommentComponent = (props: CommentComponentProps) => {
    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    const [state, setState] = useState({
        comment: props.comment,
        canShowMore: true,
        collapsed: false,
    });

    useEffect(() => {
        setState(prevState => ({ ...prevState, comment: props.comment }));
    }, [props.comment]);

    // eslint-disable-next-line
    const toggleCollapse = () => {
        setState({
            ...state,
            collapsed: !state.collapsed,
        });
    };

    const upVote = async () => {
        const { status } = await postData({
            baseUrl: commentsConfig.url,
            path: 'vote-comment', 
            data: {
                "username": username,
                "commentId": state.comment.id,
                "vote": 1,
            },
            additionalHeaders: sessiontoken ? {
                "sessiontoken": sessiontoken
            } : { },
            setCookie: setCookie,
        });

        if (status === 200){
            const upVotes = (state.comment.userVote === Vote.UPVOTE) ? state.comment.upVotes - 1 : state.comment.upVotes + 1;
            const downVotes = (state.comment.userVote === Vote.DOWNVOTE) ? state.comment.downVotes - 1 : state.comment.downVotes;
            const userVote = (state.comment.userVote === Vote.UPVOTE) ? undefined : Vote.UPVOTE;
            setState(prevState => ({
                ...prevState,
                comment: { ...prevState.comment, upVotes: upVotes, downVotes: downVotes, userVote: userVote },
            }));
        }
    }

    const { judgment } = props;
    const moreReplies = (props.comment.numReplies - props.comment.replies.length);

    const isHighlighted = 
    props.pathToHighlightedComment && 
    props.pathToHighlightedComment.length === props.path.length && 
    props.pathToHighlightedComment.every((value, index) => value === props.path[index]);

    let commentBorderClass = isHighlighted ? "comment-border-highlighted" : "comment-border-unhighlighted";

    return (
        <div id={`comment-${state.comment.id}`} onClick={(e) => { if (isHighlighted) e.stopPropagation(); }} className={commentBorderClass}>
            <div className="comment-bubble-container">
                <div className="comment-bubble"></div>
            </div>
            <div className="comment-body">
                <div className="username">{props.comment.username}</div>
                <div className="comment">
                    <div style={{ maxWidth: 'calc(100% - 50px)' }} dangerouslySetInnerHTML={{__html: props.comment.comment}}/>
                </div>
                <div className={"time-stamp"} >
                    <span data-tip={convertUTCDateToLocalDate(props.comment.timeStamp)} data-for="comment">{timeSince(props.comment.timeStamp)}</span>
                    <ReactTooltip delayShow={400} effect={"solid"} id="comment"/>
                </div>
                <div className="replies">
                    {
                        props.comment.replies.map((reply: Comment, i: number) => {
                            return <CommentComponent 
                                        key={reply.id} 
                                        comment={reply} 
                                        path={props.path.concat([i])} 
                                        pathToHighlightedComment={props.pathToHighlightedComment} 
                                        highlightComment={props.highlightComment} 
                                        fetchMoreReplies={props.fetchMoreReplies}
                                        deleteComment={props.deleteComment}
                                        judgment={judgment}
                                    />
                        })
                    }
                </div>
            </div>
            <div className="likes-container">
                <HeartButtonSVG className="heart" onClick={upVote} />
                <div className="likes">{state.comment.upVotes}</div>
            </div>
            {
                moreReplies > 0 &&
                <div className={judgment ? "show-more-replies-1" : "show-more-replies-0"} onClick={(e) => { e.stopPropagation(); props.fetchMoreReplies(props.path);  }}>
                    {moreReplies + (moreReplies > 1 ? " more replies" : " more reply")}
                </div>
            }
        </div>
    )
}