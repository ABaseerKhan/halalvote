import React, { useState, useEffect } from 'react';
import { getData } from '../../https-client/client';
import { topicsConfig } from '../../https-client/config';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';

// styles
import './search.css';

interface SearchComponentProps {
    id: string,
    onSuggestionClick: (topicTofetch?: string) => void;
};
export const SearchComponent = (props: SearchComponentProps) => {
    const { id } = props;
    const { inputText, setInputText, searchResults } = useTopicsSearch();
    const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
    const [autoCompleteIndex, setAutoCompleteIndex] = useState<number>(-1);

    useEffect(() => {
        if (searchResults?.result?.data && searchResults?.result?.data.length) {
            setAutoCompleteOpen(true);
        } else {
            setAutoCompleteOpen(false);
        }
    }, [searchResults]);

    const onClickSuggestion = (topicTitle: string) => () => {
        props.onSuggestionClick(topicTitle)
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
        } 
        // enter key should execute topicClick
        else if (e.keyCode === 13) {
            onClickSuggestion(searchResults.result.data[autoCompleteIndex][0])();
        }
    }

    return (
        <div id={id} className='search-page'>
            <div className={"search-bar"}>
                <span className="search-header">
                    <span className="search-header-haram">H</span>
                    <span className="search-header-halal">V</span>
                </span>
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
                                searchResults.result.data.map((topicTitle: [string], index: number) => (
                                    <li className={index===autoCompleteIndex ? "autocomplete-list-item-highlighted" : "autocomplete-list-item"} key={topicTitle[0]}>
                                        <div onClick={onClickSuggestion(topicTitle[0])} className={"suggestions-inner-container"}>
                                            <div className={"option"}>{topicTitle[0]}</div>
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

const useTopicsSearch = () => useDebouncedSearch((text: string) => getData({ baseUrl: topicsConfig.url, path: 'search-topics', queryParams: { 'searchTerm': text }, additionalHeaders: {}}));