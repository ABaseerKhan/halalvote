import React from 'react';
import Linkify from 'react-linkify';

// type imports

// styles
import './item-carousel.css';

interface ItemCarouselComponentProps {
    id: string,
    iterateItem: any;
    itemName: string | undefined;
    style?: any;
};
export const ItemCarouselComponent = (props: ItemCarouselComponentProps) => {
    const { id, iterateItem, itemName } = props;
    return (
        <div id={id} style={props.style} className='item-carousel'>
            <button onClick={iterateItem(-1)} className='carousel-button'>{"<"}</button>
            <div className='item-text'>
                <Linkify>{itemName || ""}</Linkify>
            </div>
            <button onClick={iterateItem(1)} className='carousel-button'>{">"}</button>
        </div>
    );
}