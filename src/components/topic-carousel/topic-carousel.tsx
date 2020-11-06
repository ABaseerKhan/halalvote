import React, { useEffect, useContext } from 'react';
import { TopicVotesComponent } from './topic-votes';
import { ReactComponent as ChevronLeftSVG } from '../../icons/chevron-left.svg';
import { ReactComponent as ChevronRightSVG } from '../../icons/chevron-right.svg';
import { useMedia } from '../../hooks/useMedia';
import { topicsContext, fullScreenContext } from '../app-shell';

// type imports

// styles
import './topic-carousel.css';

enum SwipeDirection {
    LEFT,
    RIGHT,
    NONE
}

interface TopicCarouselComponentProps {
    id: string,
    iterateTopic: any,
    style?: any;
};
export const TopicCarouselComponent = (props: TopicCarouselComponentProps) => {
    const { id, iterateTopic } = props;

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

    useEffect(() => {
        if (!isMobile) {
            const leftCarouselButton = document.getElementById(leftCarouselButtonId);
            const rightCarouselButton = document.getElementById(rightCarouselButtonId);
            if (leftCarouselButton && rightCarouselButton) {
                leftCarouselButton.classList.add("carousel-button-computer");
                rightCarouselButton.classList.add("carousel-button-computer");
            }
        } else {
            const deltaMin = 100;
            const itemCarousel = document.getElementById(id);
            const leftTopicNavigatorDisplay = document.getElementById(leftTopicNavigatorDisplayId);
            const rightTopicNavigatorDisplay = document.getElementById(rightTopicNavigatorDisplayId);
            
            if (itemCarousel && leftTopicNavigatorDisplay && rightTopicNavigatorDisplay) {
                let swipeDet = {
                    sX: 0,
                    sY: 0,
                    eX: 0,
                    eY: 0
                }
                let swipeDirection = SwipeDirection.NONE;

                const touchStartListener = (e: TouchEvent) => {
                    const t = e.touches[0]
                    swipeDet.sX = t.screenX;
                    swipeDet.sY = t.screenY;
                    swipeDet.eX = t.screenX;
                    swipeDet.eY = t.screenY;
                }

                const touchMoveListener = (e: TouchEvent) => {
                    const t = e.touches[0]
                    swipeDet.eX = t.screenX;
                    swipeDet.eY = t.screenY;
                    const deltaX = Math.abs(swipeDet.eX - swipeDet.sX);
                    const deltaY = Math.abs(swipeDet.eY - swipeDet.sY);

                    if (deltaX > (deltaY)/2) {
                        e.preventDefault();
                        const cappedDelta = Math.min(deltaX, deltaMin);

                        if (swipeDet.eX > swipeDet.sX && (swipeDirection === SwipeDirection.LEFT || swipeDirection === SwipeDirection.NONE)) {
                            swipeDirection = SwipeDirection.LEFT;
                            leftTopicNavigatorDisplay.style.left = -(cappedDelta/2) + "px";
                            leftTopicNavigatorDisplay.style.width = cappedDelta + "px";
                        } else if (swipeDet.eX < swipeDet.sX && (swipeDirection === SwipeDirection.RIGHT || swipeDirection === SwipeDirection.NONE)) {
                            swipeDirection = SwipeDirection.RIGHT;
                            rightTopicNavigatorDisplay.style.right = -(cappedDelta/2) + "px";
                            rightTopicNavigatorDisplay.style.width = cappedDelta + "px";
                        }
                    }
                }

                const touchEndListener = (e: TouchEvent) => {
                    const deltaX = Math.abs(swipeDet.eX - swipeDet.sX);

                    if (deltaX >= deltaMin) {
                        if (swipeDet.eX > swipeDet.sX) {
                            e.preventDefault();
                            iterateTopic(-1)();
                        } else if (swipeDet.eX < swipeDet.sX) {
                            e.preventDefault();
                            iterateTopic(1)();
                        }
                    }

                    swipeDet = {
                        sX: 0,
                        sY: 0,
                        eX: 0,
                        eY: 0
                    }
                    swipeDirection = SwipeDirection.NONE;
                    leftTopicNavigatorDisplay.style.left = "0";
                    leftTopicNavigatorDisplay.style.width = "0px";
                    rightTopicNavigatorDisplay.style.right = "0";
                    rightTopicNavigatorDisplay.style.width = "0px";
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
                <span className="topic-label" onTouchStart={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                        onTouchMove={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                        onTouchEnd={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}}>Topic:</span>
                <div id="topic-title" className='topic-title' onTouchStart={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                        onTouchMove={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                        onTouchEnd={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} >
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

