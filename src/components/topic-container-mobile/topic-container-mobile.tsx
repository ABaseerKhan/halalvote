import React, { ReactElement, useRef, useEffect, useContext, useState } from 'react';
import { topicsContext } from '../app-shell';
import { TopicExposeComponent } from './topic-expose';

// styles
import './topic-container-mobile.css';


const TOPIC_SWITCHING_DURATION = 350;
const topicPerspectivePx = 3000;
interface TopicContainerMobileComponentProps {
    fetchTopics: (topicTofetch?: string | undefined, newIndex?: number | undefined) => Promise<void>;
    MediaCard: ReactElement,
    CommentsCard: ReactElement,
    AnalyticsCard: ReactElement,
    TopicCarousel: ReactElement,
    TopicNavigator: ReactElement
};
export const TopicContainerMobileComponent = (props: TopicContainerMobileComponentProps) => {
    const { MediaCard, CommentsCard, AnalyticsCard, TopicCarousel, TopicNavigator, fetchTopics } = props;

    const FSContainerRef = useRef<HTMLDivElement>(null);
    const FSFooterRef = useRef<HTMLDivElement>(null);

    const { topicsState } = useContext(topicsContext);
    const { topics, topicIndex } = topicsState;

    const currentTopicMediaContainer = useRef<HTMLDivElement>(null);
    const nextTopicMediaContainer = useRef<HTMLDivElement>(null);
    const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(topicIndex);

    const handleClick = (e: any) => {
        if (FSFooterRef.current && FSFooterRef.current.contains(e.target)) {
          // inside click
            return;
        }
        // outside click 
        if (FSFooterRef.current) {
            FSFooterRef.current!.style.transform = `translate(0, calc(-1 * var(--max-topic-carousel-height-px)))`;
        }
    };

    useEffect(() => {
        if (topicIndex !== currentTopicIndex) {
            const currentTopicMediaContainerElement = currentTopicMediaContainer.current;
            const nextTopicMediaContainerElement = nextTopicMediaContainer.current;

            if (currentTopicMediaContainerElement && nextTopicMediaContainerElement) {
                currentTopicMediaContainerElement.animate(
                {
                    transform: topicIndex > currentTopicIndex ? `perspective(${topicPerspectivePx}px) rotateY(-89deg) translateZ(100vw)` : `perspective(${topicPerspectivePx}px) rotateY(89deg) translateZ(100vw)`,
                }, {
                    duration: TOPIC_SWITCHING_DURATION,
                    easing: 'linear'
                });
                nextTopicMediaContainerElement.animate(
                {
                    transform: `perspective(${topicPerspectivePx}px) rotateY(0deg) translateX(0) translateZ(0)`,
                    easing: 'linear'
                }, {
                    duration: TOPIC_SWITCHING_DURATION
                }).onfinish = () => {
                    setCurrentTopicIndex(topicIndex);
                };
            }
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicIndex]);

    useEffect(() => {
        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, []);
    
    useEffect(() => {
        if (topics.length === 1) {
            fetchTopics();
        };
        if (FSContainerRef.current) {
            FSContainerRef.current!.scrollTop = FSContainerRef.current!.clientHeight * topicIndex;
        };
        if (FSFooterRef.current) {
            var touchsurface = FSFooterRef.current,
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
                        const translation = (FSContainerRef.current?.clientHeight || 0) * -0.8;
                        FSFooterRef.current!.style.transform = `translate(0, ${translation}px)`;
                        break;
                    case 'down':
                        FSFooterRef.current!.style.transform = `translate(0, calc(-1 * var(--max-topic-carousel-height-px)))`;
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

    return (
        <div ref={FSContainerRef} className="topic-container-mobile">
            {TopicNavigator}
            <div ref={currentTopicMediaContainer} className="topic-media-container" style={{transform: `perspective(${topicPerspectivePx}px) rotateY(0) translateX(0) translateZ(0)`, transformOrigin: topicIndex > currentTopicIndex ? 'right' : 'left' }}>
                {React.cloneElement(MediaCard, {topicIndexOverride: currentTopicIndex})}
            </div>
            {
                topicIndex !== currentTopicIndex &&
                <div ref={nextTopicMediaContainer} className="topic-media-container" style={topicIndex > currentTopicIndex ? {transform: `perspective(${topicPerspectivePx}px) rotateY(89deg) translateZ(100vw)`, transformOrigin: "left"} :  {transform: `perspective(${topicPerspectivePx}px) rotateY(-89deg) translateZ(100vw)`, transformOrigin: "right"}}>
                    {MediaCard}
                </div>
            }
            <div>

            </div>
            <div id="topic-container-footer" ref={FSFooterRef} className={'topic-container-footer'}>
                <div className="topic-container-footer-content">
                    {TopicCarousel}
                    <TopicExposeComponent
                        CommentsCard={CommentsCard}
                        AnalyticsCard={AnalyticsCard}
                        FSTopicIndex={topicIndex}
                    />
                </div>
            </div>
        </div>
    );
}