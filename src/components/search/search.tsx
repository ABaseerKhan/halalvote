import React from 'react';

// styles
import './search.css';

interface SearchComponentProps {
    id: string,
};
export const SearchComponent = (props: SearchComponentProps) => {
    const { id } = props;
    return (
        <div id={id} className='search-page'>
            Search
        </div>
    );
}