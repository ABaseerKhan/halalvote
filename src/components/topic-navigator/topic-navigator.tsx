import React, { useEffect } from 'react';
import { ReactComponent as ChevronLeftSVG } from '../../icons/chevron-left.svg';
import { ReactComponent as ChevronRightSVG } from '../../icons/chevron-right.svg';
import { useMedia } from '../../hooks/useMedia';

// type imports

// styles
import './topic-navigator.css';

enum SwipeDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    NONE
}

interface TopicNavigatorComponentProps {
    iterateTopic: any
};
export const TopicNavigatorComponent = (props: TopicNavigatorComponentProps) => {
    const {iterateTopic} = props;

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
        <div className="topic-navigator">
            {
                !isMobile ?
                <button id={leftCarouselButtonId} onClick={iterateTopic(-1)} className='carousel-button-left'>
                    <ChevronLeftSVG color={'var(--neutral-color)'} transform={"translate(0 0)"}/>
                </button> :
                <div id={leftTopicNavigatorDisplayId} className={leftTopicNavigatorDisplayId}>
                    <ChevronLeftSVG color={'var(--neutral-color)'} style={{position: "absolute", right: 15, top: "calc(50% - 15px)"}}/>
                </div>
            }
            {
                !isMobile ?
                <button id={rightCarouselButtonId} onClick={iterateTopic(1)} className='carousel-button-right'>
                    <ChevronRightSVG color={'var(--neutral-color)'} transform={"translate(0 0)"}/>
                </button> :
                <div id={rightTopicNavigatorDisplayId} className={rightTopicNavigatorDisplayId}>
                    <ChevronRightSVG color={'var(--neutral-color)'} style={{position: "absolute", left: 15, top: "calc(50% - 15px)"}}/>
                </div>
            }
        </div>
    );
}