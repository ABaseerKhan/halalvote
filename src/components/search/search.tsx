import React, { useState, useEffect, useRef, useContext } from 'react';
import { getData } from '../../https-client/client';
import { topicsAPIConfig } from '../../https-client/config';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { ReactComponent as SearchSVG } from '../../icons/search.svg';
import SearchIcon from '@material-ui/icons/Search';
import { useCookies } from 'react-cookie';
import { authenticatedPostDataContext } from '../app-shell';
import { useMedia } from '../../hooks/useMedia';

// styles
import './search.css';

interface SearchComponentProps {
    onSuggestionClick: (topicTofetch?: string) => void;
};

export const SearchComponent = (props: SearchComponentProps) => {
    const { onSuggestionClick } = props;

    const isMobile = useMedia(
        // Media queries
        ['(max-width: 600px)'],
        [true],
        // default value
        false
    );

    const { inputText, setInputText, searchResults } = useTopicsSearch();
    const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
    const [autoCompleteIndex, setAutoCompleteIndex] = useState<number>(0);
    const searchPageRef = useRef<HTMLDivElement>(null);

    const { authenticatedPostData } = useContext(authenticatedPostDataContext);

    const [cookies, setCookie] = useCookies(['username', 'sessiontoken']);
    const { username, sessiontoken } = cookies;

    useEffect(() => {
        if (searchResults?.result?.data) {
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
            setInputText("");
            searchPageRef.current.style.transform = `translate(0, -10.5em)`;
        }
    };
    useEffect(() => {
        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        }; // eslint-disable-next-line
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
                        setInputText("");
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
        onSuggestionClick(topicTitle);
        setInputText("");
        searchPageRef.current!.style.transform = `translate(0, -10.5em)`;
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!searchResults?.result?.data) return;
        
        // arrow up/down button should select next/previous list element
        if (e.keyCode === 38) {
            e.preventDefault();
            if (autoCompleteIndex > 0) setAutoCompleteIndex(prevIndex => (prevIndex - 1));
        } else if (e.keyCode === 40) {
            e.preventDefault();
            if (autoCompleteIndex !== -1 && searchResults?.result?.data?.length && autoCompleteIndex < searchResults?.result?.data?.length - 1) {
                setAutoCompleteIndex( prevIndex => (prevIndex + 1));
            } else {
                setAutoCompleteIndex(0);
            }
        } 
        // enter key should execute topicClick
        else if (e.keyCode === 13) {
            if (searchResults.result.data) {
                if (searchResults.result.data.length) onClickSuggestion(searchResults.result.data[autoCompleteIndex][0])();
                else addTopic();
            }
        }
    }

    const addTopic = async () => {
        if (inputText) {
            const body: any = {
                "username": username,
                "topicTitle": inputText
            };
            const { status, data } = await authenticatedPostData({
                baseUrl: topicsAPIConfig.url,
                path: 'add-topic',
                data: body,
                additionalHeaders: {
                    "sessiontoken": sessiontoken
                },
                setCookie: setCookie
            }, true);

            if (status === 200 && inputText === data) {
                onSuggestionClick(inputText);
                setInputText("");
                searchPageRef.current!.style.transform = `translate(0, -10.5em)`;
            }
        }
    }

    const SearchPulldown = (
        <div 
            className={"search-pulldown"} 
            onClick={() => { 
                if (searchPageRef.current) {
                    if (searchPageRef.current.style.transform === 'translate(0px, 0px)') {
                        searchPageRef.current!.style.transform = `translate(0, -10.5em)`;
                    } else {
                        searchPageRef.current.style.transform = 'translate(0, 0)';
                    }
                }
            }}
        >
            <SearchIcon style={{ margin: 'auto', color: 'white', height: '40px', width: '40px' }}/>
        </div>
    );

    return (
        <>
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
                    {
                        (searchResults.result && searchResults.result.data && !!searchResults.result.data.length) ?
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
                            </ul> :
                        (searchResults.result && searchResults.result.data && searchResults.result.data.length === 0) &&
                        <ul className={"autocomplete-list"}>
                            <li className={autoCompleteIndex === 0 ? "autocomplete-list-item-highlighted" : "autocomplete-list-item"} onMouseOver={() => {setAutoCompleteIndex(0)}}>
                                <div onClick={addTopic} className={"suggestions-inner-container"}>
                                    <div className={"option"}><span className={"add-topic-option-text"}>Add Topic:</span><span className={"add-topic-option-topic-text"}>{inputText}</span></div>
                                </div>
                            </li>
                        </ul>
                    }
                </div>
            </div>
            {isMobile && SearchPulldown}
        </div>
        {!isMobile && SearchPulldown}
        </>
    );
}

export const useTopicsSearch = () => useDebouncedSearch((text: string) => getData({ baseUrl: topicsAPIConfig.url, path: 'search-topics', queryParams: { 'searchTerm': text }, additionalHeaders: {}}));