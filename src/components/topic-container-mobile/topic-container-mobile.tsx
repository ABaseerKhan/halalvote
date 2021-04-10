import React, { ReactElement, useRef, useEffect, useContext, useState, useLayoutEffect } from 'react';
import { topicsContext, topicMediaContext } from '../app-shell';
import { TabScroll } from '../tab-scroll/tab-scroll';
import { useQuery } from '../../hooks/useQuery';
import { setCardQueryParam } from '../../utils';
import { useHistory } from 'react-router-dom';
import { commentsCardId, mediaCardId } from '../topic-container/topic-container';
import { TopicMediaComponent } from '../topic-media/topic-media';

// styles
import './topic-container-mobile.css';
import { elementStyles } from '../..';
import { TutorialComponent } from '../tutorial/tutorial';


const TOPIC_SWITCHING_DURATION = 300;
const topicPerspectivePx = 2000;
var prevHeight = 0;
let positionsMap = [0,1,2];

interface TopicContainerMobileComponentProps {
    fetchTopics: (topicTofetch?: string | undefined, newIndex?: number | undefined) => Promise<void>;
    CommentsCard: ReactElement,
    AnalyticsCard: ReactElement,
    TopicCarousel: ReactElement,
    TopicNavigator: ReactElement
};
export const TopicContainerMobileComponent = (props: TopicContainerMobileComponentProps) => {
    const { CommentsCard, AnalyticsCard, TopicCarousel, TopicNavigator, fetchTopics } = props;

    const query = useQuery();
    const history = useHistory();

    const FSContainerRef = useRef<HTMLDivElement>(null);
    const FSFooterRef = useRef<HTMLDivElement>(null);

    const { topicsState } = useContext(topicsContext);
    const { topics, topicIndex } = topicsState;

    const { topicMediaState, } = useContext(topicMediaContext);

    const topicMediaScaleDivRef = useRef<HTMLDivElement>(null);
    const prevTopicMediaContainer = useRef<HTMLDivElement>(null);
    const currentTopicMediaContainer = useRef<HTMLDivElement>(null);
    const nextTopicMediaContainer = useRef<HTMLDivElement>(null);
    const [rotatingMediaStructure, setRotatingMediaStructure] = useState<Array<{ ref: React.RefObject<HTMLDivElement>; staticTopicIndex: number; position: number; style: any; }>>([
        { ref: prevTopicMediaContainer, staticTopicIndex: Math.max(topicIndex - 1, 0), position: 0, style: getCubeFaceStyle(0) }, 
        { ref: currentTopicMediaContainer, staticTopicIndex: topicIndex, position: 1, style: getCubeFaceStyle(1) },
        { ref: nextTopicMediaContainer, staticTopicIndex: 1, position: 2, style: getCubeFaceStyle(2) },
    ]);
    const [prevCardQuery, setPrevCardQuery] = useState<any>(undefined);

    const handleClick = (e: any) => {
        if (
            (FSFooterRef.current && FSFooterRef.current.contains(e.target)) || 
            (document.getElementById("modal-cover") && document.getElementById("modal-cover")!.contains(e.target)) ||
            (document.getElementById("modal") && document.getElementById("modal")!.contains(e.target))
        ) {
          // inside click
            return;
        }
    };

    useLayoutEffect(() => {
        prevHeight = window.innerHeight;
        function updateSize(e?: UIEvent) {
            if (e?.srcElement) {
                if (FSContainerRef.current) {
                    if (window.innerHeight < prevHeight) {
                        FSContainerRef.current.style.height = `${prevHeight}px`;
                        FSContainerRef.current.style.transform = `translate(0, -${prevHeight - window.innerHeight}px)`;
                    } else {
                        FSContainerRef.current.style.height = `${window.innerHeight}px`;
                        FSContainerRef.current.style.transform = `translate(0, 0)`;
                    }
                }
            }
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        if (topicIndex !== rotatingMediaStructure[positionsMap[1]].staticTopicIndex) {
            const prevTopicMediaContainerElement = rotatingMediaStructure[positionsMap[0]].ref.current;
            const currentTopicMediaContainerElement = rotatingMediaStructure[positionsMap[1]].ref.current;
            const nextTopicMediaContainerElement = rotatingMediaStructure[positionsMap[2]].ref.current;

            if (topicIndex > rotatingMediaStructure[positionsMap[1]].staticTopicIndex) {
                if (currentTopicMediaContainerElement && nextTopicMediaContainerElement) {
                    currentTopicMediaContainerElement.animate(
                    {
                        transform: `perspective(${topicPerspectivePx}px) rotateY(-89deg) translateZ(100vw)`,
                    }, {
                        duration: TOPIC_SWITCHING_DURATION,
                        easing: 'linear',
                        fill: 'forwards',
                    });
                    nextTopicMediaContainerElement.animate(
                    {
                        transform: `perspective(${topicPerspectivePx}px) rotateY(0deg) translateX(0) translateZ(0)`,
                    }, {
                        duration: TOPIC_SWITCHING_DURATION,
                        easing: 'linear',
                        fill: 'forwards',
                    }).onfinish = () => {
                        setRotatingMediaStructure(prevState => {
                            if (prevState[positionsMap[0]].staticTopicIndex !== prevState[positionsMap[1]].staticTopicIndex) {
                                delete topicMediaState[topicsState.topics[prevState[positionsMap[0]].staticTopicIndex].topicTitle];
                            }
                            prevState[0].position = getNewPosition(prevState[0].position, 1);
                            prevState[0].staticTopicIndex = getStaticTopicIndex(prevState[0].position, topicIndex, topics.length);
                            prevState[0].style = getCubeFaceStyle(prevState[0].position);

                            prevState[1].position = getNewPosition(prevState[1].position, 1);
                            prevState[1].staticTopicIndex = getStaticTopicIndex(prevState[1].position, topicIndex, topics.length);
                            prevState[1].style = getCubeFaceStyle(prevState[1].position);

                            prevState[2].position = getNewPosition(prevState[2].position, 1);
                            prevState[2].staticTopicIndex = getStaticTopicIndex(prevState[2].position, topicIndex, topics.length);
                            prevState[2].style = getCubeFaceStyle(prevState[2].position);

                            const temp = prevState.map(i=>i.position);
                            positionsMap = [temp.indexOf(0),temp.indexOf(1),temp.indexOf(2)];
                            return [...prevState];
                        });
                    };
                }
            } else if (topicIndex < rotatingMediaStructure[positionsMap[1]].staticTopicIndex) {
                if (currentTopicMediaContainerElement && prevTopicMediaContainerElement) {
                    currentTopicMediaContainerElement.animate(
                    {
                        transform: `perspective(${topicPerspectivePx}px) rotateY(89deg) translateZ(100vw)`,
                    }, {
                        duration: TOPIC_SWITCHING_DURATION,
                        easing: 'linear',
                        fill: 'forwards',
                    });
                    prevTopicMediaContainerElement.animate(
                    {
                        transform: `perspective(${topicPerspectivePx}px) rotateY(0deg) translateX(0) translateZ(0)`,
                    }, {
                        duration: TOPIC_SWITCHING_DURATION,
                        easing: 'linear',
                        fill: 'forwards',
                    }).onfinish = () => {
                        setRotatingMediaStructure(prevState => {
                            if (prevState[positionsMap[2]].staticTopicIndex !== prevState[positionsMap[1]].staticTopicIndex) {
                                delete topicMediaState[topicsState.topics[prevState[positionsMap[2]].staticTopicIndex].topicTitle];
                            }
                            prevState[0].position = getNewPosition(prevState[0].position, -1);
                            prevState[0].staticTopicIndex = getStaticTopicIndex(prevState[0].position, topicIndex, topics.length);
                            prevState[0].style = getCubeFaceStyle(prevState[0].position);

                            prevState[1].position = getNewPosition(prevState[1].position, -1);
                            prevState[1].staticTopicIndex = getStaticTopicIndex(prevState[1].position, topicIndex, topics.length);
                            prevState[1].style = getCubeFaceStyle(prevState[1].position);

                            prevState[2].position = getNewPosition(prevState[2].position, -1);
                            prevState[2].staticTopicIndex = getStaticTopicIndex(prevState[2].position, topicIndex, topics.length);
                            prevState[2].style = getCubeFaceStyle(prevState[2].position);

                            const temp = prevState.map(i=>i.position);
                            positionsMap = [temp.indexOf(0),temp.indexOf(1),temp.indexOf(2)];
                            return [...prevState];
                        });
                    };
                }
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
            prevX: any,
            prevY: any,
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
                prevX = touchobj.pageX;
                prevY = touchobj.pageY;
                startX = touchobj.pageX;
                startY = touchobj.pageY;
                startTime = new Date().getTime(); // record time when finger first makes contact with surface
            };
            const touchMoveCB = function(e: any){
                var touchobj = e.changedTouches[0];
                distX = touchobj.pageX - prevX; // get horizontal dist traveled by finger while in contact with surface
                distY = touchobj.pageY - prevY; // get vertical dist traveled by finger while in contact with surface
                prevX = touchobj.pageX;
                prevY = touchobj.pageY;

                if (Math.abs(distY) < Math.abs(distX) + 1) { // only work on true vertical swipes
                    return;
                }

                const translation = getTranslateY(FSFooterRef.current) + distY;
                const travelledRatio = (translation - (elementStyles.maxTopicCarouselHeightPx * -1)) / (((FSContainerRef.current?.clientHeight || 0) * -1) - (elementStyles.maxTopicCarouselHeightPx * -1));
                if ((translation > (FSContainerRef.current?.clientHeight || 0) * -0.8) && (translation < (elementStyles.maxTopicCarouselHeightPx * -1))) {
                    FSFooterRef.current!.animate([{
                        transform: `translate(0, ${translation}px)`
                    }
                    ], {
                        duration: 0,
                        fill: "forwards",
                    }).onfinish = () => { FSFooterRef.current!.style.transform = `translate(0, ${translation}px)`; };

                    topicMediaScaleDivRef.current!.animate([{
                        transform: `scale(${(1 - travelledRatio)})`
                    }
                    ], {
                        duration: 0,
                        fill: "forwards",
                    }).onfinish = () => { topicMediaScaleDivRef.current!.style.transform = `scale(${(1 - travelledRatio)})`; };
                }
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
                        const travelledRatio = (translation - (elementStyles.maxTopicCarouselHeightPx * -1)) / (((FSContainerRef.current?.clientHeight || 0) * -1) - (elementStyles.maxTopicCarouselHeightPx * -1));
                        FSFooterRef.current!.animate([{
                                transform: `translate(0, ${translation}px)`
                            }
                            ], {
                                duration: 300,
                                fill: "forwards",
                                easing: "ease",
                        }).onfinish = () => { FSFooterRef.current!.style.transform = `translate(0, ${translation}px)`; setCardQueryParam(history, query, commentsCardId.toLowerCase()); };

                        topicMediaScaleDivRef.current!.animate([{
                                transform: `scale(${(1 - travelledRatio)})`
                            }
                            ], {
                                duration: 300,
                                fill: "forwards",
                                easing: "ease",
                        }).onfinish = () => { topicMediaScaleDivRef.current!.style.transform = `scale(${(1 - travelledRatio)})` };
                        break;
                    case 'down':
                        FSFooterRef.current!.animate([{
                                transform: `translate(0, calc(-1 * var(--max-topic-carousel-height-px)))`
                            }
                            ], {
                                duration: 300,
                                fill: "forwards",
                                easing: "ease"
                        }).onfinish = () => { FSFooterRef.current!.style.transform = `translate(0, calc(-1 * var(--max-topic-carousel-height-px)))`; setCardQueryParam(history, query, mediaCardId.toLowerCase()); };
                        
                        topicMediaScaleDivRef.current!.animate([{
                                transform: `scale(1)`
                            }
                            ], {
                                duration: 300,
                                fill: "forwards",
                                easing: "ease",
                        }).onfinish = () => { topicMediaScaleDivRef.current!.style.transform = `scale(1)`; };
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
    }, [query]);

    useEffect(() => {
        const cardQuery = query.get('card');
        if (cardQuery === 'arguments' && cardQuery !== prevCardQuery) {
            const translation = (FSContainerRef.current?.clientHeight || 0) * -0.8;
            const travelledRatio = (translation - (elementStyles.maxTopicCarouselHeightPx * -1)) / (((FSContainerRef.current?.clientHeight || 0) * -1) - (elementStyles.maxTopicCarouselHeightPx * -1));
            FSFooterRef.current!.animate([{
                    transform: `translate(0, ${translation}px)`
                }
                ], {
                    duration: 300,
                    fill: "forwards",
                    easing: "ease",
            }).onfinish = () => { FSFooterRef.current!.style.transform = `translate(0, ${translation}px)`; };

            topicMediaScaleDivRef.current!.animate([{
                    transform: `scale(${(1 - travelledRatio)})`
                }
                ], {
                    duration: 300,
                    fill: "forwards",
                    easing: "ease",
            }).onfinish = () => { topicMediaScaleDivRef.current!.style.transform = `scale(0.25)`; };
        }
        setPrevCardQuery(cardQuery); // eslint-disable-next-line
    }, [query]);

    const displayMediaCard = (position: number) => {
        return (
            (position === 1) || 
            ((topicIndex > rotatingMediaStructure[positionsMap[1]].staticTopicIndex) && (position === 2)) ||
            ((topicIndex < rotatingMediaStructure[positionsMap[1]].staticTopicIndex) && (position === 0))
        );
    }

    return (
        <div ref={FSContainerRef} className="topic-container-mobile">
            {TopicNavigator}
            <div ref={topicMediaScaleDivRef} className="topic-media-scale-div">
                {displayMediaCard(rotatingMediaStructure[0].position) && <div id={'1'} ref={rotatingMediaStructure[0].ref} className="topic-media-container" style={{ transformOrigin: (topicIndex > rotatingMediaStructure[positionsMap[1]].staticTopicIndex) ? 'right' : 'left', ...rotatingMediaStructure[0].style }}>
                    <TopicMediaComponent topicIndexOverride={rotatingMediaStructure[0].staticTopicIndex} />
                </div>}
                {displayMediaCard(rotatingMediaStructure[1].position) && <div id={'2'} ref={rotatingMediaStructure[1].ref} className="topic-media-container" style={{ transformOrigin: (topicIndex > rotatingMediaStructure[positionsMap[1]].staticTopicIndex) ? 'right' : 'left', ...rotatingMediaStructure[1].style }}>
                    <TopicMediaComponent topicIndexOverride={rotatingMediaStructure[1].staticTopicIndex} />
                </div>}
                {displayMediaCard(rotatingMediaStructure[2].position) && <div id={'3'} ref={rotatingMediaStructure[2].ref} className="topic-media-container" style={{ transformOrigin: (topicIndex > rotatingMediaStructure[positionsMap[1]].staticTopicIndex) ? 'right' : 'left', ...rotatingMediaStructure[2].style }}>
                    <TopicMediaComponent topicIndexOverride={rotatingMediaStructure[2].staticTopicIndex} />
                </div>}
                <TutorialComponent />
            </div>
            <div></div>
            <div id="topic-container-footer" ref={FSFooterRef} className={'topic-container-footer'}>
                <div className="pull-up-container"><div className="pull-up-tab"></div></div>
                <div className="topic-container-footer-content">
                    {React.cloneElement(TopicCarousel, {voteFeedbackElement: FSFooterRef.current})}
                    <TabScroll 
                        tabNames={["Arguments", "Analytics"]}
                        Sections={[
                            CommentsCard,
                            AnalyticsCard
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}

function getTranslateY(myElement: any) {
    var style = window.getComputedStyle(myElement);
    var matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m42;
}

const getNewPosition = (position: number, iteration: number) => {
    return customMod((position - iteration), 3);
};

const getStaticTopicIndex = (position: number, topicIndex: number, totalNumOfTopics: number) => {
    switch(position) {
        case 0:
            return Math.max(topicIndex - 1, 0);
        case 1:
            return topicIndex;
        case 2:
            return Math.min(topicIndex + 1, totalNumOfTopics - 1);
        default:
            return topicIndex;
    }
}

const getCubeFaceStyle = (position: number) => {
    switch(position) {
        case 0:
            return { transform: `perspective(${topicPerspectivePx}px) rotateY(-89deg) translateZ(100vw)`, transformOrigin: "right", zIndex: 1 };
        case 1:
            return { transform: `perspective(${topicPerspectivePx}px) rotateY(0) translateX(0) translateZ(0)`, zIndex: 2 };
        case 2:
            return { transform: `perspective(${topicPerspectivePx}px) rotateY(89deg) translateZ(100vw)`, transformOrigin: "left", zIndex: 1 };
    }
};

const customMod = (n: number, m: number) => {
    return ((n % m) + m) % m;
};