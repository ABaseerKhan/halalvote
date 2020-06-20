import React from 'react';

// type imports

// styles
import './item-carousel.css';

interface ItemCarouselComponentProps {
    iterateItem: any;
    itemName: string | undefined;
};
export const ItemCarouselComponent = (props: ItemCarouselComponentProps) => {
    const { iterateItem, itemName } = props;
    return (
        <div className='item-carousel'>
            <button onClick={iterateItem(-1)} className='carousel-button'>{"<"}</button>
            <div className='item-text'>{itemName || ""}</div>
            <button onClick={iterateItem(1)} className='carousel-button'>{">"}</button>
        </div>
    );
}