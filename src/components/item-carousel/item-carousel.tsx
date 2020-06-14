import React from 'react';

// type imports

// styles
import './item-carousel.css';

interface ItemCarouselComponentProps {
    iterateItem: any;
    itemText: string | undefined;
};
export const ItemCarouselComponent = (props: ItemCarouselComponentProps) => {
    const { iterateItem, itemText } = props;
    return (
        <div className='item-carousel'>
            <button onClick={iterateItem(-1)} className='carousel-button'>{"<"}</button>
            <div className='item-text'>{itemText || ""}</div>
            <button onClick={iterateItem(1)} className='carousel-button'>{">"}</button>
        </div>
    );
}