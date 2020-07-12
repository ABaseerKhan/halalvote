import React from 'react';

// type imports

// styles
import './analytics.css';

interface AnalyticsComponentProps {
    id: string
};

export const AnalyticsComponent = (props: AnalyticsComponentProps) => {
    const { id } = props;

    return (
        <div id={id} className="analytics">Analytics</div>
    );
}