import React, { ReactElement, useState, useRef, useEffect, useLayoutEffect, useContext, Fragment } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { 
  useHistory,
} from "react-router-dom";
import { setCardQueryParam } from '../../utils';
import { mediaCardId, commentsCardId, analyticsCardId } from '../cards-shell/cards-shell';
import { topicsContext } from '../app-shell';
// import { useMedia } from '../../hooks/useMedia';

// type imports

// styles
import './full-screen.css';

interface FullScreenComponentProps {
    MediaCard: ReactElement,
    CommentsCard: ReactElement,
    AnalyticsCard: ReactElement,
    TopicCarousel: ReactElement,
    FSTopicIndex: number,
};

const underlineTravelDistance = 85;
var isScrolling: any;

export const FullScreenComponent = (props: FullScreenComponentProps) => {
    const { MediaCard, CommentsCard, AnalyticsCard, TopicCarousel, FSTopicIndex } = props;

    const FSTopicRef = useRef<HTMLDivElement>(null);
    const topicCarouselRef = useRef<HTMLDivElement>(null);

    const history = useHistory();
    const query = useQuery();
    const topCard = query.get("card")?.toUpperCase() || mediaCardId;

    const { topicsState: { topicIndex } } = useContext(topicsContext);

    const [underlineTranslationPx, setUnderlineTranslationPx] = useState<number>(0);

    useLayoutEffect(() => {
      if (FSTopicRef.current) {
        let scrollPosition: number;
        switch(topCard) {
          case mediaCardId:
            scrollPosition = FSTopicRef.current!.clientWidth;
            break;
          case commentsCardId:
            scrollPosition = 0;
            break;
          case analyticsCardId:
            scrollPosition = 2 * FSTopicRef.current!.clientWidth;
            break;
          default:
            scrollPosition = FSTopicRef.current!.clientWidth;
        }
        FSTopicRef.current.scrollLeft = scrollPosition;
        setUnderlineTranslationPx(underlineTravelDistance * ((FSTopicRef.current!.scrollLeft - FSTopicRef.current!.clientWidth) / FSTopicRef.current!.clientWidth));
      };
    }, [topCard]);

    useEffect(() => {
      if (FSTopicRef.current) {
          FSTopicRef.current.onscroll = (e: Event) => {
            if (FSTopicRef.current) {
              setUnderlineTranslationPx(underlineTravelDistance * ((FSTopicRef.current!.scrollLeft - FSTopicRef.current!.clientWidth) / FSTopicRef.current!.clientWidth));
              clearTimeout(isScrolling);
              isScrolling = setTimeout(function() {
                const index = Math.floor((FSTopicRef.current!.scrollLeft+10) / FSTopicRef.current!.clientWidth);
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
              }, 66);
            }
          }
      } // eslint-disable-next-line
    }, []);

    return (
        <div className="full-screen-topic" ref={FSTopicRef} >
          {(FSTopicIndex === topicIndex) && (
            <Fragment>
              <div className={'topic-carousel-container-fs-fixed'} ref={topicCarouselRef}>
                {React.cloneElement(TopicCarousel, { topicIndexOverride: FSTopicIndex })}
              </div>
              <div className={"feature-selector"}>
                <span onClick={() => setCardQueryParam(history, query, commentsCardId.toLowerCase())} className={(underlineTranslationPx < -42) ? "feature-selector-selected" : "feature-selector-unselected"}>Arguments</span>
                <span onClick={() => setCardQueryParam(history, query, mediaCardId.toLowerCase())} className={(underlineTranslationPx > -42 && underlineTranslationPx < 42) ? "feature-selector-selected" : "feature-selector-unselected"}>Canvas</span>
                <span onClick={() => setCardQueryParam(history, query, analyticsCardId.toLowerCase())} className={(underlineTranslationPx > 42) ? "feature-selector-selected" : "feature-selector-unselected"}>Analytics</span>
              </div>
              <div className={"selector-underline"} style={{ transform: `translate(${underlineTranslationPx}px, 0)` }}></div>
            </Fragment>
          )}
          <div className={"fs-1"} style={{ transform: 'translate(0, 0)' }}>
            {React.cloneElement(CommentsCard, { topicIndexOverride: FSTopicIndex })}
          </div>
          <div className={"fs-2"} style={{ transform: 'translate(100%, 0)' }} >
            {React.cloneElement(MediaCard, { topicIndexOverride: FSTopicIndex })}
          </div>
          <div className={"fs-3"} style={{ transform: 'translate(200%, 0)' }}>
            {AnalyticsCard}
          </div>
        </div>
    );
}