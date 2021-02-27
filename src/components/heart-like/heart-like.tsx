import React from 'react';
import { ReactComponent as HeartButtonSVG } from '../../icons/heart-icon.svg';

// style imports
import './heart-like.css';

interface HeartLikeProps {
    liked: boolean,
    numLikes: number,
    onClickCallback?: any,
    strokeColor?: string,
};
export const HeartLike = (props: HeartLikeProps) => {
    const { liked, onClickCallback, numLikes, strokeColor } = props;
    return (
        <div onClick={onClickCallback} className="likes-container">
            <HeartButtonSVG className={liked ? "heart-liked" : "heart"} stroke={liked ? undefined : strokeColor || 'gray'} />
            <div className={liked ? "likes-liked" : "likes"} style={{ color: liked ? undefined : strokeColor || 'gray' }}>{numLikes}</div>
        </div>
    )
}
