import React, { useState, useEffect } from 'react';
import { getData } from '../../https-client/post-data';

// styles
import './search.css';
import { itemsConfig } from '../../https-client/config';
import { useDebouncedSearch } from '../../hooks/useDebouncedEffect';

interface SearchComponentProps {
    id: string,
};
export const SearchComponent = (props: SearchComponentProps) => {
    const { id } = props;
    const { inputText, setInputText, searchResults } = useItemsSearch();
    const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);

    useEffect(() => {
        if (searchResults?.result?.data && searchResults?.result?.data.length) {
            setAutoCompleteOpen(true);
        } else {
            setAutoCompleteOpen(false);
        }
    }, [searchResults])

    return (
        <div id={id} className='search-page'>
            <div className={"search-bar"}>
                <span className="search-header">Google</span>
                <input className={autoCompleteOpen ? "search-bar-input-autocomplete-open" : "search-bar-input"} type="text" value={inputText} onChange={e => setInputText(e.target.value)} />
                <div className={"autocomplete"}>
                    {searchResults.result && searchResults.result.data && !!searchResults.result.data.length && (
                        <ul className={"autocomplete-list"}>
                            {
                                searchResults.result.data.map((itemName: [string]) => (
                                    <li className={"autocomplete-list-item"} key={itemName[0]}>
                                        <div className={"suggestions-inner-container"}>
                                            <div className={"option"}>{itemName[0]}</div>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

const useItemsSearch = () => useDebouncedSearch((text: string) => getData({ baseUrl: itemsConfig.url, path: 'search-items', queryParams: { 'searchTerm': text }, additionalHeaders: {}}));