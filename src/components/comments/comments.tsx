import React from 'react';
import { CommentsCardComponent } from './comments-card';

// type imports

// styles
import './comments.css';
import { Judgment } from '../../types';

interface CommentsComponentProps {
    id: string,
    itemName: string, 
    numHalalComments: number,
    numHaramComments: number,
    refreshItem: (itemsTofetch: string[]) => any,
};
export const CommentsComponent = (props: CommentsComponentProps) => {
    const { id, itemName, numHalalComments, numHaramComments, refreshItem } = props;

    return (
        <div id={id} className="comments-body">
          <div className="comments-body-1">
            <CommentsCardComponent judgment={Judgment.HARAM} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={refreshItem} />
          </div>
          <div className="comments-body-0">
            <CommentsCardComponent judgment={Judgment.HALAL} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={refreshItem} />
          </div>
        </div>
    );
}