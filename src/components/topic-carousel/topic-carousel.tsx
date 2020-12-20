import React, { useEffect, useContext, useRef } from 'react';
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
                let correctDirection: boolean | undefined = undefined;

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

                    if (correctDirection === undefined) {
                        correctDirection = deltaX > (deltaY)/2;
                    }

                    if (correctDirection) {
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

                    if (correctDirection && deltaX >= deltaMin) {
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
    fetchTopics: any;
};
export const TopicCarouselComponentFS = (props: TopicCarouselComponentFSProps) => {
    let { id, fetchTopics } = props;

    const topicCarouselRef = useRef<HTMLDivElement>(null);
    const topicTitleRefs = useRef<any>([]);

    const { topicsState: { topics, topicIndex }, setTopicsContext } = useContext(topicsContext);
    const topicTitles = topics.map((topic) => topic.topicTitle);
    const topic = topics?.length ? topics[topicIndex] : undefined;
    const topicTitle = topic?.topicTitle || "";
    const halalPoints = topic?.halalPoints !== undefined ? topic.halalPoints : 0;
    const haramPoints = topic?.haramPoints !== undefined ? topic.haramPoints : 0;
    const numVotes = topic?.numVotes !== undefined ? topic.numVotes : 0;
    const userVote = topic?.vote;

    useEffect(() => {
        if (topicCarouselRef.current) {
            var touchsurface = topicCarouselRef.current,
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
                e.preventDefault();
            };
            const touchMoveCB = function(e: any){
                e.preventDefault() // prevent scrolling when inside DIV
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
                    case 'left':
                        if ((topicIndex + 1) >= topics.length - 2) {
                            fetchTopics(undefined, topicIndex+1);
                        } else {
                            setTopicsContext(topics, topicIndex+1);
                        };
                        break;
                    case 'right':
                        if ((topicIndex - 1) >= 0) setTopicsContext(topics, topicIndex-1);
                };
                e.preventDefault()
            };
            touchsurface.addEventListener('touchstart', touchStartCB, { passive: true });
            touchsurface.addEventListener('touchmove', touchMoveCB, { passive: true });
            touchsurface.addEventListener('touchend', touchendCB, { passive: true });

            return () => {
                touchsurface.removeEventListener('touchstart', touchStartCB);
                touchsurface.removeEventListener('touchmove', touchMoveCB);
                touchsurface.removeEventListener('touchend', touchendCB);
            };
        };
    }, [topicIndex, fetchTopics, setTopicsContext, topics]);

    return (
        <div id={id} ref={topicCarouselRef} style={props.style} className='topic-carousel-fs'>
            <span className="topic-label" onTouchStart={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                    onTouchMove={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                    onTouchEnd={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}}>Topic:</span>
            <div id="topic-title" className='topic-titles-container' onTouchStart={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                    onTouchMove={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                    onTouchEnd={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} >
                        {topicTitles.map((topicTitle: string, idx: number) => {
                            const distance = idx - topicIndex;

                            const className: string = (idx === topicIndex) ? "topic-title" : "prev-next-topic-titles";

                            let translationVW;
                            if (distance < 0) {
                                translationVW = ((distance * 16) + 17);
                            } else if (distance > 0) {
                                translationVW = ((distance * 16) + 68);
                            } else {
                                translationVW = 16;
                            }

                            return <div ref={(el) => topicTitleRefs.current.push(el)} className={className} style={{ transform: `translate(${translationVW}vw, 0)` }} >
                                {topicTitles[idx]}
                            </div>
                        })}
            </div>
            <TopicVotesComponent topicTitle={topicTitle} userVote={userVote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes} />
        </div>
    );
}

