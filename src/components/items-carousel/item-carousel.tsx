import React, { useState } from 'react';

// type imports
import { Item } from '../../types';

// styles
import './item-carousel.css';

interface ItemCarouselComponentProps {
    items: Array<Item>,
};
export const ItemCarouselComponent = (props: ItemCarouselComponentProps) => {
    console.log(process.env.NODE_ENV);
    const [state, setState] = useState({
        itemIndex: 0
    });

    const iterateItem = (iteration: number) => () => {
        if ((state.itemIndex + iteration) < props.items.length && (state.itemIndex + iteration) >= 0) {
            setState({  itemIndex: state.itemIndex + iteration });
        } else {
            return undefined;
        }
    };

    return (
        <div className='item-carousel'>
            <button onClick={iterateItem(-1)} className='carousel-button'>{"<"}</button>
            <div className='item-text'>{props.items.length > 0 ? props.items[state.itemIndex].itemName : ""}</div>
            <button onClick={iterateItem(1)} className='carousel-button'>{">"}</button>
        </div>
    );
}