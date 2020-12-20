import React, { useEffect, useContext } from 'react';
import { TopicVotesComponent } from './topic-votes';
import { ReactComponent as ChevronLeftSVG } from '../../icons/chevron-left.svg';
import { ReactComponent as ChevronRightSVG } from '../../icons/chevron-right.svg';
import { useMedia } from '../../hooks/useMedia';
import { topicsContext, fullScreenContext } from '../app-shell';

// type imports

// styles
import './topic-carousel.css';
import { SearchComponent } from '../search/search';

enum SwipeDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    NONE
}

interface TopicCarouselComponentProps {
    id: string,
    iterateTopic: any,
    style?: any,
    searchTopic: (topicTofetch?: string) => void
};
export const TopicCarouselComponent = (props: TopicCarouselComponentProps) => {
    const { id, iterateTopic, searchTopic } = props;

    const { fullScreenMode } = useContext(fullScreenContext);

    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);

    const topic = topics?.length ? topics[topicIndex] : undefined;
    const topicTitle = topic?.topicTitle || "";
    const halalPoints = topic?.halalPoints !== undefined ? topic.halalPoints : 0;
    const haramPoints = topic?.haramPoints !== undefined ? topic.haramPoints : 0;
    const numVotes = topic?.numVotes !== undefined ? topic.numVotes : 0;
    const userVote = topic?.vote;

    const isMobile = useMedia(
        // Media queries
        ['(max-width: 600px)'],
        [true],
        // default value
        false
    );

    const leftCarouselButtonId = "left-carousel-button";
    const rightCarouselButtonId = "right-carousel-button";

    const leftTopicNavigatorDisplayId = "left-topic-navigator-display";
    const rightTopicNavigatorDisplayId = "right-topic-navigator-display";

    const searchContainerId = "search-component-container";

    const searchContainerAnimationDuration = 100;

    useEffect(() => {
        if (!isMobile) {
            const leftCarouselButton = document.getElementById(leftCarouselButtonId);
            const rightCarouselButton = document.getElementById(rightCarouselButtonId);
            if (leftCarouselButton && rightCarouselButton) {
                leftCarouselButton.classList.add("carousel-button-computer");
                rightCarouselButton.classList.add("carousel-button-computer");
            }
        } else {
            const navigatorDeltaMin = 100;
            const leftTopicNavigatorDisplay = document.getElementById(leftTopicNavigatorDisplayId);
            const rightTopicNavigatorDisplay = document.getElementById(rightTopicNavigatorDisplayId);

            const searchContainerTopMin = 285;
            const searchContainer = document.getElementById(searchContainerId);
            
            if (leftTopicNavigatorDisplay && rightTopicNavigatorDisplay && searchContainer) {
                let swipeDet = {
                    sX: 0,
                    sY: 0,
                    eX: 0,
                    eY: 0
                }
                let swipeDirection = SwipeDirection.NONE;
                let correctDirection: boolean | undefined = undefined;

                const touchStartListener = (e: TouchEvent) => {
                    const t = e.touches[0];
                    swipeDet.sX = t.screenX;
                    swipeDet.sY = t.screenY;
                    swipeDet.eX = t.screenX;
                    swipeDet.eY = t.screenY;
                }

                const touchMoveListener = (e: TouchEvent) => {
                    const t = e.touches[0];
                    swipeDet.eX = t.screenX;
                    swipeDet.eY = t.screenY;
                    const deltaX = Math.abs(swipeDet.eX - swipeDet.sX);
                    const deltaY = Math.abs(swipeDet.eY - swipeDet.sY);

                    if (swipeDet.sY <= 105) {
                        // pull down search component
                        if (correctDirection === undefined) {
                            correctDirection = deltaY > (deltaX)/2;
                        }

                        if (correctDirection) {
                            e.preventDefault();

                            const cappedTop = Math.min(deltaY, searchContainerTopMin);

                            if (swipeDet.eY > swipeDet.sY && (swipeDirection === SwipeDirection.DOWN || swipeDirection === SwipeDirection.NONE)) {
                                swipeDirection = SwipeDirection.DOWN;

                                searchContainer.style.top = (cappedTop - 285) + "px";
                            } else {
                                searchContainer.style.top = "-285px";
                            }
                        }
                    } else {
                        // navigate topics
                        if (correctDirection === undefined) {
                            correctDirection = deltaX > (deltaY)/2;
                        }
    
                        if (correctDirection) {
                            e.preventDefault();
    
                            const cappedDelta = Math.min(deltaX, navigatorDeltaMin);
    
                            if (swipeDet.eX > swipeDet.sX && (swipeDirection === SwipeDirection.LEFT || swipeDirection === SwipeDirection.NONE)) {
                                swipeDirection = SwipeDirection.LEFT;
                                leftTopicNavigatorDisplay.style.left = -(cappedDelta/2) + "px";
                                leftTopicNavigatorDisplay.style.width = cappedDelta + "px";
                            } else if (swipeDet.eX < swipeDet.sX && (swipeDirection === SwipeDirection.RIGHT || swipeDirection === SwipeDirection.NONE)) {
                                swipeDirection = SwipeDirection.RIGHT;
                                rightTopicNavigatorDisplay.style.right = -(cappedDelta/2) + "px";
                                rightTopicNavigatorDisplay.style.width = cappedDelta + "px";
                            } else {
                                leftTopicNavigatorDisplay.style.left = "0";
                                leftTopicNavigatorDisplay.style.width = "0px";
                                rightTopicNavigatorDisplay.style.right = "0";
                                rightTopicNavigatorDisplay.style.width = "0px";
                            }
                        }
                    }
                }

                const touchEndListener = (e: TouchEvent) => {
                    const deltaX = Math.abs(swipeDet.eX - swipeDet.sX);
                    const deltaY = Math.abs(swipeDet.eY - swipeDet.sY);

                    if (swipeDet.sY <= 105) {
                        // pull down search component
                        if (correctDirection && deltaY >= (285 / 2)) {
                            searchContainer.animate(
                                {
                                    top: "0"
                                },{
                                    duration: searchContainerAnimationDuration * (Math.abs(deltaY - 285) / 285),
                                    easing: 'ease-out'
                                }
                            ).onfinish = () => {
                                searchContainer.style.top = "0";
                            };
                        } else {
                            searchContainer.animate(
                                {
                                    top: "-285px"
                                },{
                                    duration: searchContainerAnimationDuration * (Math.abs(285 - deltaY) / 285),
                                    easing: 'ease-out'
                                }
                            ).onfinish = () => {
                                searchContainer.style.top = "-285px";
                            };

                        }
                    } else {
                        // navigate topics
                        if (correctDirection && deltaX >= navigatorDeltaMin) {
                            if (swipeDet.eX > swipeDet.sX) {
                                e.preventDefault();
                                iterateTopic(-1)();
                            } else if (swipeDet.eX < swipeDet.sX) {
                                e.preventDefault();
                                iterateTopic(1)();
                            }
                        }
                        leftTopicNavigatorDisplay.style.left = "0";
                        leftTopicNavigatorDisplay.style.width = "0px";
                        rightTopicNavigatorDisplay.style.right = "0";
                        rightTopicNavigatorDisplay.style.width = "0px";
                    }
                    
                    swipeDirection = SwipeDirection.NONE;
                    correctDirection = undefined;
                    swipeDet = {
                        sX: 0,
                        sY: 0,
                        eX: 0,
                        eY: 0
                    };
                }

                window.addEventListener("touchstart", touchStartListener, {passive: false});
                window.addEventListener("touchmove", touchMoveListener, {passive: false});
                window.addEventListener("touchend", touchEndListener, {passive: false});

                return () => {
                    window.removeEventListener("touchstart", touchStartListener);
                    window.removeEventListener("touchmove", touchMoveListener);
                    window.removeEventListener("touchend", touchEndListener);
                }
            }
        } // eslint-disable-next-line
    }, [iterateTopic]);

    useEffect(() => {
        if (isMobile) {
            const searchContainer = document.getElementById(searchContainerId);

            if (searchContainer) {
                let swipeDet = {
                    sY: 0,
                    eY: 0
                }

                searchContainer.ontouchstart = (e: TouchEvent) => {
                    e.stopPropagation();

                    const t = e.touches[0];
                    swipeDet.sY = t.screenY;
                    swipeDet.eY = t.screenY;
                }

                searchContainer.ontouchmove = (e: TouchEvent) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const t = e.touches[0];
                    swipeDet.eY = t.screenY;

                    searchContainer.style.top = Math.min(0, Math.max(-285, swipeDet.eY - swipeDet.sY)) + "px";
                }

                searchContainer.ontouchend = (e: TouchEvent) => {
                    e.stopPropagation();

                    const deltaY = Math.abs(swipeDet.eY - swipeDet.sY);

                    if (deltaY <= (285 / 2)) {
                        searchContainer.animate(
                            {
                                top: "0"
                            },{
                                duration: searchContainerAnimationDuration * (deltaY / 285),
                                easing: 'ease-out'
                            }
                        ).onfinish = () => {
                            searchContainer.style.top = "0";
                        };
                    } else {
                        searchContainer.animate(
                            {
                                top: "-285px"
                            },{
                                duration: searchContainerAnimationDuration * (Math.abs(deltaY - 285) / 285),
                                easing: 'ease-out'
                            }
                        ).onfinish = () => {
                            searchContainer.style.top = "-285px";
                        };

                    }
                }
            }
        } // eslint-disable-next-line
    }, [iterateTopic]);

    const closeAndSearchTopic = (topicTofetch?: string) => {
        const searchContainer = document.getElementById(searchContainerId);

        if (searchContainer) {
            searchTopic(topicTofetch);
            searchContainer.animate(
                {
                    top: "-285px"
                },{
                    duration: searchContainerAnimationDuration,
                    easing: 'ease-out'
                }
            ).onfinish = () => {
                searchContainer.style.top = "-285px";
            };
        }
    }

    return (
        <div id={id} style={props.style} className='topic-carousel'>
            <div className="topic-navigator">
                {
                    !isMobile ?
                    <button id={leftCarouselButtonId} onClick={iterateTopic(-1)} className='carousel-button-left'>
                        <ChevronLeftSVG color={'var(--neutral-color)'} transform={"translate(0 0)"}/>
                    </button> :
                    <div id={leftTopicNavigatorDisplayId} className={leftTopicNavigatorDisplayId}>
                        <ChevronLeftSVG color={'var(--neutral-color)'} style={{position: "absolute", right: 15, top: "calc(25vh - 15px)"}}/>
                    </div>
                }
                <div id="topic-title" className='topic-title'>
                    {topicTitle}
                </div>
                {
                    !isMobile ?
                    <button id={rightCarouselButtonId} onClick={iterateTopic(1)} className='carousel-button-right'>
                        <ChevronRightSVG color={'var(--neutral-color)'} transform={"translate(0 0)"}/>
                    </button> :
                    <div id={rightTopicNavigatorDisplayId} className={rightTopicNavigatorDisplayId}>
                        <ChevronRightSVG color={'var(--neutral-color)'} style={{position: "absolute", left: 15, top: "calc(25vh - 15px)"}}/>
                    </div>
                }
            </div>
            {!fullScreenMode && <TopicVotesComponent topicTitle={topicTitle} userVote={userVote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes} />}
            { isMobile && <div id={searchContainerId} className="search-component-container"><SearchComponent onSuggestionClick={closeAndSearchTopic} /></div>}
        </div>
    );
}

interface TopicCarouselComponentFSProps {
    id: string,
    style?: any;
    topicIndexOverride?: number;
};
export const TopicCarouselComponentFS = (props: TopicCarouselComponentFSProps) => {
    let { id, topicIndexOverride } = props;

    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);
    topicIndexOverride = (topicIndexOverride !== undefined) ? topicIndexOverride : topicIndex;
    const topicTitle = topics?.length ? topics[topicIndexOverride]?.topicTitle || '' : '';

    return (
        <div id={id} style={props.style} className='topic-carousel-fs'>
            <span className="topic-label">Topic:</span>
            <div id="topic-title" className='topic-title' onTouchStart={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                    onTouchMove={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                    onTouchEnd={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} >
                        {topicTitle}
            </div>
        </div>
    );
}

