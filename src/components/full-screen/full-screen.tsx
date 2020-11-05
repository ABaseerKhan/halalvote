import React, { ReactElement, useState, useRef, useEffect, useLayoutEffect } from 'react';
import './full-screen.css';
import { useQuery } from '../../hooks/useQuery';
import { 
  useHistory,
} from "react-router-dom";
import { setCardQueryParam } from '../../utils';
import { mediaCardId, commentsCardId, analyticsCardId } from '../cards-shell/cards-shell';
// import { useMedia } from '../../hooks/useMedia';

// type imports

// styles

interface FullScreenComponentProps {
    MediaCard: ReactElement,
    CommentsCard: ReactElement,
    AnalyticsCard: ReactElement,
    TopicCarousel: ReactElement,
};

const underlineTravelDistance = 85;
var isScrolling: any;

export const FullScreenComponent = (props: FullScreenComponentProps) => {
    const { MediaCard, CommentsCard, AnalyticsCard, TopicCarousel } = props;

    const FSContainerRef = useRef<HTMLDivElement>(null);
    const topicCarouselRef = useRef<HTMLDivElement>(null);
    const history = useHistory();
    const query = useQuery();
    const topCard = query.get("card")?.toUpperCase() || mediaCardId;
    // eslint-disable-next-line
    const [underlineTranslationPx, setUnderlineTranslationPx] = useState(0); 

    useLayoutEffect(() => {
      if (FSContainerRef.current) {
        let scrollPosition: number;
        switch(topCard) {
          case mediaCardId:
            scrollPosition = FSContainerRef.current!.clientWidth;
            break;
          case commentsCardId:
            scrollPosition = 0;
            break;
          case analyticsCardId:
            scrollPosition = 2 * FSContainerRef.current!.clientWidth;
            break;
          default:
            scrollPosition = FSContainerRef.current!.clientWidth;
        }
        FSContainerRef.current.scrollLeft = scrollPosition;
        setUnderlineTranslationPx(underlineTravelDistance * ((FSContainerRef.current!.scrollLeft - FSContainerRef.current!.clientWidth) / FSContainerRef.current!.clientWidth));
      };
    }, [topCard]);

    useEffect(() => {
      if (FSContainerRef.current) {
          FSContainerRef.current.onscroll = () => {
            setUnderlineTranslationPx(underlineTravelDistance * ((FSContainerRef.current!.scrollLeft - FSContainerRef.current!.clientWidth) / FSContainerRef.current!.clientWidth));
            clearTimeout(isScrolling);
            isScrolling = setTimeout(function() {
                const index = Math.floor((FSContainerRef.current!.scrollLeft+10) / FSContainerRef.current!.clientWidth);
                switch(index) {
                  case 0:
                    setCardQueryParam(history, query, commentsCardId.toLowerCase());
                    break;
                  case 1:
                    setCardQueryParam(history, query, mediaCardId.toLowerCase());
                    break;
                  case 2:
                    setCardQueryParam(history, query, analyticsCardId.toLowerCase())
                    break;
                  default:
                    setCardQueryParam(history, query, mediaCardId.toLowerCase());
                };
            }, 100);
          }
      }
    });

    return (
        <div className="full-screen-container" ref={FSContainerRef} >
          <div className={"topic-carousel-container-fs"} ref={topicCarouselRef}>
            {TopicCarousel}
          </div>
          <div className={"feature-selector"}>
            <span onClick={() => setCardQueryParam(history, query, commentsCardId.toLowerCase())} className={topCard === commentsCardId ? "feature-selector-selected" : "feature-selector-unselected"}>Arguments</span>
            <span onClick={() => setCardQueryParam(history, query, mediaCardId.toLowerCase())} className={topCard === mediaCardId ? "feature-selector-selected" : "feature-selector-unselected"}>Canvas</span>
            <span onClick={() => setCardQueryParam(history, query, analyticsCardId.toLowerCase())} className={topCard === analyticsCardId ? "feature-selector-selected" : "feature-selector-unselected"}>Analytics</span>
          </div>
          <div className={"selector-underline"} style={{ transform: `translate(${underlineTranslationPx}px, 0)` }}></div>
          <div className={"fs-1"} style={{ transform: 'translate(0, 0)' }}>
            {CommentsCard}
          </div>
          <div className={"fs-2"} style={{ transform: 'translate(100%, 0)' }} >
            {MediaCard}
          </div>
          <div className={"fs-3"} style={{ transform: 'translate(200%, 0)' }}>
            {AnalyticsCard}
          </div>
        </div>
    );
}