import React, { useEffect } from 'react';
import { TopicVotesComponent } from './topic-votes';
import { ReactComponent as ChevronLeftSVG } from '../../icons/chevron-left.svg';
import { ReactComponent as ChevronRightSVG } from '../../icons/chevron-right.svg';
import { useMedia } from '../../hooks/useMedia';

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
    prevTopicTitle: string | undefined,
    nextTopicTitle: string | undefined,
    topicTitle: string,
    userVote: number | undefined,
    halalPoints: number,
    haramPoints: number,
    numVotes: number,
    style?: any;
};
export const TopicCarouselComponent = (props: TopicCarouselComponentProps) => {
    const { id, iterateTopic, topicTitle, userVote, halalPoints, haramPoints, numVotes } = props;

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
            const deltaMin = 150;
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

                window.ontouchstart = (e: TouchEvent) => {
                    const t = e.touches[0]
                    swipeDet.sX = t.screenX;
                    swipeDet.sY = t.screenY;
                    swipeDet.eX = t.screenX;
                    swipeDet.eY = t.screenY;
                }

                window.ontouchmove = (e: TouchEvent) => {
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

                window.ontouchend = (e: TouchEvent) => {
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
                        <ChevronLeftSVG color={'var(--neutral-color)'} style={{position: "absolute", right: 25, top: "calc(50vh - 15px)"}}/>
                    </div>
                }
                <div id="topic-title" className='topic-title' >
                    <span className="topic-label">Topic:</span>{topicTitle}
                </div>
                {
                    !isMobile ?
                    <button id={rightCarouselButtonId} onClick={iterateTopic(1)} className='carousel-button-right'>
                        <ChevronRightSVG color={'var(--neutral-color)'} transform={"translate(0 0)"}/>
                    </button> :
                    <div id={rightTopicNavigatorDisplayId} className={rightTopicNavigatorDisplayId}>
                        <ChevronRightSVG color={'var(--neutral-color)'} style={{position: "absolute", left: 25, top: "calc(50vh - 15px)"}}/>
                    </div>
                }
            </div>
            <TopicVotesComponent topicTitle={topicTitle} userVote={userVote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes} />
        </div>
    );
}