import React, { useState, useEffect } from 'react';
import { postData } from '../../https-client/post-data';

// styles
import './item-carousel.css';

interface ItemCarouselComponentProps { };
export const ItemCarouselComponent = (props: ItemCarouselComponentProps) => {
    const [state, setState] = useState({
        items: [],
        itemIndex: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await postData("https://3qhzg4cerc.execute-api.us-east-1.amazonaws.com/qa/get-items", { "n": 3 });
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

    console.log(state);
    return (
        <div className='item-carousel'>
            <button onClick={iterateItem(-1)} className='carousel-button'>{"<"}</button>
            <div className='item-text'>{state.items.length > 0 ? state.items[state.itemIndex]['itemName'] : ""}</div>
            <button onClick={iterateItem(1)} className='carousel-button'>{">"}</button>
        </div>
    );
}