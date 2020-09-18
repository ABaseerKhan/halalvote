import React from 'react';

// type imports

// styles
import './analytics-card.css';

interface AnalyticsCardComponentProps {
    id: string
};

export const AnalyticsCardComponent = (props: AnalyticsCardComponentProps) => {
    const { id } = props;

    return (
    <div id={id} className="analytics">{id}</div>
    );
}