import React, { useState, useEffect } from 'react';
import { postData } from '../../https-client/post-data';

// styles
import './item-carousel.css';
import { config } from '../../https-client/config';

interface ItemCarouselComponentProps { };
export const ItemCarouselComponent = (props: ItemCarouselComponentProps) => {
    console.log(process.env.NODE_ENV);
    const [state, setState] = useState({
        items: [],
        itemIndex: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await postData({ baseUrl: config().itemsUrl, path: '/get-items', data: { }});
            setState({ ...state, items: data });
        };
        fetchData();
    }, [])

    const iterateItem = (iteration: number) => () => {
        if ((state.itemIndex + iteration) < state.items.length && (state.itemIndex + iteration) >= 0) {
            setState({  ...state, itemIndex: state.itemIndex + iteration });
        } else {
            return undefined;
        }
    };

    return (
        <div className='item-carousel'>
            <button onClick={iterateItem(-1)} className='carousel-button'>{"<"}</button>
            <div className='item-text'>{state.items.length > 0 ? state.items[state.itemIndex]['itemName'] : ""}</div>
            <button onClick={iterateItem(1)} className='carousel-button'>{">"}</button>
        </div>
    );
}