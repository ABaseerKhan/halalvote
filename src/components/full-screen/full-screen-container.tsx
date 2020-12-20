import React, { ReactElement, useRef, useEffect, useContext, useState, useLayoutEffect } from 'react';
import { topicsContext } from '../app-shell';
import { FullScreenComponent } from './full-screen';

import './full-screen.css';


interface FullScreenComponentProps {
    fetchTopics: (topicTofetch?: string | undefined, newIndex?: number | undefined) => Promise<void>;
    MediaCard: ReactElement,
    CommentsCard: ReactElement,
    AnalyticsCard: ReactElement,
    TopicCarousel: ReactElement,
    Search: ReactElement,
};
export const FullScreenContainer = (props: FullScreenComponentProps) => {
    const { MediaCard, CommentsCard, AnalyticsCard, TopicCarousel, Search, fetchTopics } = props;

    const [displayTopicCover, setDisplayTopicCover] = useState(false);
    const [, setDisplayTopicCarousel] = useState(true);

    const FSContainerRef = useRef<HTMLDivElement>(null);
    const FSFooterRef = useRef<HTMLDivElement>(null);
    const topicCarouselRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const { topicsState } = useContext(topicsContext);
    const { topics, topicIndex } = topicsState;
    const topic = topics?.length ? topics[topicIndex] : undefined;
    const topicTitle = topic?.topicTitle || "";
    const halalPoints = topic?.halalPoints !== undefined ? topic.halalPoints : 0;
    const haramPoints = topic?.haramPoints !== undefined ? topic.haramPoints : 0;
    const topicCoverColor = halalPoints === haramPoints ? 'rgba(136, 136, 136)' : (halalPoints > haramPoints ? 'var(--halal-compliment-color)' : 'var(--haram-compliment-color)')

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
            threshold = 90, //required min distance traveled to be considered swipe
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
                e.preventDefault(); // prevent scrolling when inside DIV
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
                        FSFooterRef.current!.style.transform = 'translate(0, -350px)';
                        if (topicCarouselRef.current) topicCarouselRef.current.style.transform = 'translate(0, -110px)';
                        if (searchRef.current) searchRef.current.style.transform = 'translate(0, -110px)';
                        setDisplayTopicCarousel(false);
                        e.preventDefault()
                        break;
                    case 'down':
                        FSFooterRef.current!.style.transform = 'translate(0, 0)';
                        if (topicCarouselRef.current) topicCarouselRef.current.style.transform = 'translate(0, 0)';
                        if (searchRef.current) searchRef.current.style.transform = 'translate(0, 0)';
                        setDisplayTopicCarousel(true);
                        e.preventDefault()
                        break;
                };
                // e.preventDefault()
            };
            touchsurface.addEventListener('touchstart', touchStartCB, { passive: true });
            touchsurface.addEventListener('touchmove', touchMoveCB);
            touchsurface.addEventListener('touchend', touchendCB, { passive: true });

            return () => {
                touchsurface.removeEventListener('touchstart', touchStartCB);
                touchsurface.removeEventListener('touchmove', touchMoveCB);
                touchsurface.removeEventListener('touchend', touchendCB);
            };
        }; // eslint-disable-next-line
    }, []);

    useLayoutEffect(() => {
        setDisplayTopicCover(true);
        setTimeout(() => setDisplayTopicCover(false), 600);
    }, [topicTitle]);

    return (
        <div ref={FSContainerRef} className="full-screen-container">
            {!displayTopicCover && <FullScreenComponent
                MediaCard={MediaCard}
                CommentsCard={CommentsCard}
                AnalyticsCard={AnalyticsCard}
                TopicCarousel={TopicCarousel}
                FSTopicIndex={topicIndex}
            />}
            <div className={"topic-cover"} style={displayTopicCover ? { opacity: 1, zIndex: 1, background: topicCoverColor } : { opacity: 0, zIndex: -1 }}><span className="topic-cover-label">{topicTitle}</span></div>
            <div ref={FSFooterRef} className={'full-screen-footer'}>
                <div className="full-screen-footer-content">
                    <div ref={topicCarouselRef} className={"topic-carousel-container"}>{React.cloneElement(TopicCarousel, { setDisplayTopicCover: () => { setDisplayTopicCover(true); setTimeout(() => setDisplayTopicCover(false), 600); }})}</div>
                    <div ref={searchRef} className={"search-container"}>{React.cloneElement(Search)}</div>
                </div>
            </div>
        </div>
    );
}