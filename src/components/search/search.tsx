import React, { useState, useEffect, useRef } from 'react';
import { getData } from '../../https-client/client';
import { topicsConfig } from '../../https-client/config';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { ReactComponent as SearchSVG } from '../../icons/search.svg';

// styles
import './search.css';

interface SearchComponentProps {
    onSuggestionClick: (topicTofetch?: string) => void;
};

export const SearchComponent = (props: SearchComponentProps) => {
    const { inputText, setInputText, searchResults } = useTopicsSearch();
    const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
    const [autoCompleteIndex, setAutoCompleteIndex] = useState<number>(0);
    const searchPageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (searchResults?.result?.data && searchResults?.result?.data.length) {
            setAutoCompleteOpen(true);
        } else {
            setAutoCompleteOpen(false);
        }
    }, [searchResults]);

    const handleClick = (e: any) => {
        if (searchPageRef.current && searchPageRef.current.contains(e.target)) {
          // inside click
            return;
        }
        // outside click 
        if (searchPageRef.current) {
            searchPageRef.current.style.transform = `translate(0, -10.5em)`;
        }
    };
    useEffect(() => {
        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, []);

    useEffect(() => {
        if (searchPageRef.current) {
            var touchsurface = searchPageRef.current,
            swipedir: any,
            startX: any,
            startY: any,
            distX,
            distY,
            threshold = 45, //required min distance traveled to be considered swipe
            restraint = 90, // maximum distance allowed at the same time in perpendicular direction
            allowedTime = 500, // maximum time allowed to travel that distance
            elapsedTime,
            startTime: any;

            const touchStartCB = function(e: any){
                var touchobj = e.changedTouches[0];
                swipedir = 'none';
                distX = 0;
                distY = 0;
                startX = touchobj.pageX;
                startY = touchobj.pageY;
                startTime = new Date().getTime(); // record time when finger first makes contact with surface
            };
            const touchMoveCB = function(e: any){
            };
            const touchendCB = function(e: any){
                var touchobj = e.changedTouches[0];
                distX = touchobj.pageX - startX; // get horizontal dist traveled by finger while in contact with surface
                distY = touchobj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
                elapsedTime = new Date().getTime() - startTime; // get time elapsed
                if (elapsedTime <= allowedTime){ // first condition for awipe met
                    if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
                        swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
                    }
                    else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
                        swipedir = (distY < 0)? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
                    }
                }
                switch(swipedir) {
                    case 'up':
                        searchPageRef.current!.style.transform = `translate(0, -10.5em)`;
                        break;
                };
                // e.preventDefault()
            };
            touchsurface.addEventListener('touchstart', touchStartCB, { passive: true });
            touchsurface.addEventListener('touchmove', touchMoveCB, { passive: true });
            touchsurface.addEventListener('touchend', touchendCB, { passive: true });

            return () => {
                touchsurface.removeEventListener('touchstart', touchStartCB);
                touchsurface.removeEventListener('touchmove', touchMoveCB);
                touchsurface.removeEventListener('touchend', touchendCB);
            };
        }; // eslint-disable-next-line
    }, []);


    const onClickSuggestion = (topicTitle: string) => () => {
        props.onSuggestionClick(topicTitle);
        setInputText("");
        searchPageRef.current!.style.transform = `translate(0, -10.5em)`;
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
            if (searchResults.result.data && searchResults.result.data.length) {
                onClickSuggestion(searchResults.result.data[autoCompleteIndex][0])();
            }
        }
    }

    return (
        <div id="search-page" ref={searchPageRef} className='search-page'>
            <div className={"search-bar"}>
                <span className="search-header">
                    <span className="search-header-haram">H</span>
                    <span className="search-header-halal">V</span>
                </span>
                <div className="search-icon-container">
                    <SearchSVG width='18px'/>
                </div>
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
                                    <li className={index===autoCompleteIndex ? "autocomplete-list-item-highlighted" : "autocomplete-list-item"} key={topicTitle[0]} onMouseOver={() => {setAutoCompleteIndex(index)}}>
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

export const useTopicsSearch = () => useDebouncedSearch((text: string) => getData({ baseUrl: topicsConfig.url, path: 'search-topics', queryParams: { 'searchTerm': text }, additionalHeaders: {}}));