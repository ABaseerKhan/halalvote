import React, { useState } from 'react';
import { UserContext } from '../app-shell'
import { postData } from '../../https-client/post-data';
import { itemsConfig } from '../../https-client/config';

//type imports
import { Judgment } from '../../types';

//style imports
import './comments-card.css';

interface ItemVoterComponentProps {
    judgment: Judgment,
    userVote: number | undefined | null,
    itemName: string | undefined,
    addItemVoteLocally: (itemName: string, itemVote: number) => void
};

export const ItemVoterComponent = (props: ItemVoterComponentProps) => {
    const { judgment, userVote, itemName, addItemVoteLocally } = props;
    const { username, sessiontoken } = React.useContext(UserContext)
    
    const isSelected = userVote === judgment

    const vote = async () => {
        if (itemName && username && sessiontoken) {
            const response = await postData({
                baseUrl: itemsConfig.url,
                path: 'vote-item',
                data: {
                    "itemName": itemName,
                    "username": username,
                    "vote": judgment,
                },
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                }
            });
    
            addItemVoteLocally(itemName, judgment)
        }
    };

    const classNames = "item-voter-" + judgment + " " + (isSelected ? "item-voter-" + judgment + "-selected" : "");

    return (
        <div onClick={ vote } className={classNames}>VOTE {judgementToTextMap[judgment]}</div>
    )
}

export const judgementToTextMap = {
    0: "HALAL",
    1: "HARAM"
};
