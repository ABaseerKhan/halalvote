import React, { useState, useEffect } from 'react';
import { getData } from '../../https-client/post-data';
import { itemsConfig } from '../../https-client/config';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';

// styles
import './search.css';

interface SearchComponentProps {
    id: string,
    onSuggestionClick: (itemTofetch?: string) => void;
};
export const SearchComponent = (props: SearchComponentProps) => {
    const { id } = props;
    const { inputText, setInputText, searchResults } = useItemsSearch();
    const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
    const [autoCompleteIndex, setAutoCompleteIndex] = useState<number>(-1);

    useEffect(() => {
        if (searchResults?.result?.data && searchResults?.result?.data.length) {
            setAutoCompleteOpen(true);
        } else {
            setAutoCompleteOpen(false);
        }
    }, [searchResults]);

    const onClickSuggestion = (itemName: string) => () => {
        props.onSuggestionClick(itemName)
        document.getElementById('app-shell')?.scrollTo(0, window.innerHeight);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!(searchResults?.result?.data || searchResults?.result?.data?.length)) return;
        
        // arrow up/down button should select next/previous list element
        if (e.keyCode === 38) {
            e.preventDefault();
            if (autoCompleteIndex > 0) setAutoCompleteIndex(prevIndex => (prevIndex - 1));
        } else if (e.keyCode === 40) {
            e.preventDefault();
            if (autoCompleteIndex === -1) setAutoCompleteIndex(0);
            else if (autoCompleteIndex < searchResults?.result?.data?.length - 1) {
                setAutoCompleteIndex( prevIndex => (prevIndex + 1));
            }
        } else if (e.keyCode === 13) {
            onClickSuggestion(searchResults.result.data[autoCompleteIndex][0])();
        }
    }

    return (
        <div id={id} className='search-page'>
            <div className={"search-bar"}>
                <span className="search-header">--Logo--</span>
                <input 
                    className={autoCompleteOpen ? "search-bar-input-autocomplete-open" : "search-bar-input"} 
                    type="text" value={inputText} 
                    onChange={e => setInputText(e.target.value)} 
                    onKeyDown={onKeyDown}
                />
                <div className={"autocomplete"}>
                    {searchResults.result && searchResults.result.data && !!searchResults.result.data.length && (
                        <ul className={"autocomplete-list"}>
                            {
                                searchResults.result.data.map((itemName: [string], index: number) => (
                                    <li className={index===autoCompleteIndex ? "autocomplete-list-item-highlighted" : "autocomplete-list-item"} key={itemName[0]}>
                                        <div onClick={onClickSuggestion(itemName[0])} className={"suggestions-inner-container"}>
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