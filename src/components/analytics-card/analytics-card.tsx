import React from 'react';
import { VotesBar } from './votes-bar';

// type imports

// styles
import './analytics-card.css';

interface AnalyticsCardComponentProps {
    id: string,
    halalPoints: number,
    haramPoints: number,
    numVotes: number
};

export const AnalyticsCardComponent = (props: AnalyticsCardComponentProps) => {
    const { id, halalPoints, haramPoints, numVotes } = props;

    return (
    <div id={id} className="analytics">
        <VotesBar halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes}></VotesBar>
    </div>
    );
}