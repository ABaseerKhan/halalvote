import React from 'react';

// type imports

// styles
import './description.css';

interface DescriptionComponentProps {
    id: string
};

export const DescriptionComponent = (props: DescriptionComponentProps) => {
    const { id } = props;

    return (
        <div id={id} className="description">Description</div>
    );
}