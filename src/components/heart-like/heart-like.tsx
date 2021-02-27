import React from 'react';
import { ReactComponent as HeartButtonSVG } from '../../icons/heart-icon.svg';

// style imports
import './heart-like.css';

interface HeartLikeProps {
    liked: boolean,
    onClickCallback: any,
    numLikes: number,
};
export const HeartLike = (props: HeartLikeProps) => {
    const { liked, onClickCallback, numLikes } = props;
    return (
        <div onClick={onClickCallback} className="likes-container">
            <HeartButtonSVG className={liked ? "heart-liked" : "heart"} />
            <div className={liked ? "likes-liked" : "likes"}>{numLikes}</div>
        </div>
    )
}
