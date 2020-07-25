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
        if (searchResults.loading || searchResults?.result?.data) {
            setAutoCompleteOpen(true);
        } else {
            setAutoCompleteOpen(false);
        }
    }, [searchResults])

    return (
        <div id={id} className='search-page'>
            <div className={"search-bar"}>
                <span className="search-header">Google</span>
                <input className={autoCompleteOpen ? "search-bar-input-no-bottom-radius" : "search-bar-input"} type="text" value={inputText} onChange={e => setInputText(e.target.value)} />
                <div className={"autocomplete"}>
                    {searchResults.loading && <div>...</div>}
                    {searchResults.error && <div>Error: {searchResults.error.message}</div>}
                    {searchResults.result && searchResults.result.data && (
                        <ul className={"autocomplete-list"}>
                            {
                                searchResults.result.data.map((itemName: [string]) => (
                                    <li className={"autocomplete-list-item"} key={itemName[0]}>{itemName[0]}</li>
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