import React, { useEffect, useContext, useRef } from 'react';
import { TopicVotesComponent } from './topic-votes';
import { ReactComponent as ChevronLeftSVG } from '../../icons/chevron-left.svg';
import { ReactComponent as ChevronRightSVG } from '../../icons/chevron-right.svg';
import { useMedia } from '../../hooks/useMedia';
import { topicsContext } from '../app-shell';

// type imports

// styles
import './topic-carousel.css';

enum SwipeDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    NONE
}

interface TopicCarouselMobileComponentProps {
    id: string,
    iterateTopic: any,
    fetchTopics: any;
    style?: any,
};
export const TopicCarouselMobileComponent = (props: TopicCarouselMobileComponentProps) => {
    const { id, iterateTopic, fetchTopics } = props;

    const topicTitleRefs = useRef<any>([]);

    const { topicsState: { topics, topicIndex }, setTopicsContext } = useContext(topicsContext);
    const topicTitles = topics.map((topic) => topic.topicTitle);
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

    const topicTitleAndVotingSwitch = "topic-title-and-voting-switch";

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
            
            if (leftTopicNavigatorDisplay && rightTopicNavigatorDisplay) {
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

                const touchEndListener = (e: TouchEvent) => {
                    const deltaX = Math.abs(swipeDet.eX - swipeDet.sX);

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
                    
                    swipeDirection = SwipeDirection.NONE;
                    correctDirection = undefined;
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

    return (
        <div id={id} style={props.style} className='topic-carousel-mobile'>
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
            <div id={topicTitleAndVotingSwitch}>
                <span className="topic-label">Topic:</span>
                <div id="topic-title" className='topic-titles-container' >
                            {topicTitles.map((topicTitle: string, idx: number) => {
                                const distance = idx - topicIndex;

                                let onClick;
                                let className: string;
                                let translationVW;
                                if (distance < 0) {
                                    translationVW = ((distance * 16) + 17);
                                    className = "prev-topic-titles";
                                    if (distance === -1) {
                                        onClick = () => { 
                                            if ((topicIndex - 1) >= 0) setTopicsContext(topics, topicIndex-1);
                                        };
                                    }
                                } else if (distance > 0) {
                                    translationVW = ((distance * 16) + 70);
                                    className = "next-topic-titles";
                                    if (distance === 1) {
                                        onClick = () => {
                                            if ((topicIndex + 1) >= topics.length - 2) {
                                                fetchTopics(undefined, topicIndex+1);
                                            } else {
                                                setTopicsContext(topics, topicIndex+1);
                                            };
                                        };
                                    }
                                } else {
                                    translationVW = 15;
                                    className = "topic-title-mobile";
                                }

                                return <div ref={(el) => topicTitleRefs.current.push(el)} className={className} style={{ transform: `translate(${translationVW}vw, 0)` }} onClick={onClick} >
                                    <span>{topicTitles[idx]}</span>
                                </div>
                            })}
                </div>
                <TopicVotesComponent topicTitle={topicTitle} userVote={userVote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes} />
            </div>
        </div>
    );
}

interface TopicCarouselComponentProps {
    id: string,
    iterateTopic: any,
    style?: any;
};
export const TopicCarouselComponent = (props: TopicCarouselComponentProps) => {
    const { id, iterateTopic } = props;

    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);

    const topic = topics?.length ? topics[topicIndex] : undefined;
    const topicTitle = topic?.topicTitle || "";
    const halalPoints = topic?.halalPoints !== undefined ? topic.halalPoints : 0;
    const haramPoints = topic?.haramPoints !== undefined ? topic.haramPoints : 0;
    const numVotes = topic?.numVotes !== undefined ? topic.numVotes : 0;
    const userVote = topic?.vote;

    const leftCarouselButtonId = "left-carousel-button";
    const rightCarouselButtonId = "right-carousel-button";

    useEffect(() => {
        const leftCarouselButton = document.getElementById(leftCarouselButtonId);
        const rightCarouselButton = document.getElementById(rightCarouselButtonId);
        if (leftCarouselButton && rightCarouselButton) {
            leftCarouselButton.classList.add("carousel-button-computer");
            rightCarouselButton.classList.add("carousel-button-computer");
        }
    }, [iterateTopic]);

    return (
        <div id={id} style={props.style} className='topic-carousel'>
            <div className="topic-navigator">
                <button id={leftCarouselButtonId} onClick={iterateTopic(-1)} className='carousel-button-left'>
                    <ChevronLeftSVG color={'var(--neutral-color)'} transform={"translate(0 0)"}/>
                </button>
                <span className="topic-label">Topic:</span>
                <div id="topic-title" className='topic-title'>
                    {topicTitle}
                </div>
                <button id={rightCarouselButtonId} onClick={iterateTopic(1)} className='carousel-button-right'>
                    <ChevronRightSVG color={'var(--neutral-color)'} transform={"translate(0 0)"}/>
                </button>
            </div>
            <TopicVotesComponent topicTitle={topicTitle} userVote={userVote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes} />
        </div>
    );
}