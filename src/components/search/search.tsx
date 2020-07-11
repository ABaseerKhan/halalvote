import React, { useState } from 'react';

// styles
import './search.css';

interface SearchComponentProps {
    id: string,
};
export const SearchComponent = (props: SearchComponentProps) => {
    const { id } = props;
    const [value, setValue] = useState('');
    const onChangeInput = (e: any) => {
        setValue(e.target.value);
    }
    return (
        <div id={id} className='search-page'>
            <div className={"search-bar"}>
                <span className="search-header">Google</span>
                <input className="search-bar-input" type="text" value={value} onChange={onChangeInput} />
            </div>
        </div>
    );
}