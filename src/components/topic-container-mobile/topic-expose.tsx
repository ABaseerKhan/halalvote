import React, { ReactElement, useState, useRef, useEffect, useLayoutEffect, useContext, Fragment } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { 
    useHistory,
} from "react-router-dom";
import { setCardQueryParam } from '../../utils';
import { commentsCardId, analyticsCardId } from '../cards-shell/cards-shell';
import { topicsContext } from '../app-shell';
// import { useMedia } from '../../hooks/useMedia';

// type imports

// styles
import './topic-expose.css';

interface FullScreenComponentProps {
    CommentsCard: ReactElement,
    AnalyticsCard: ReactElement,
    FSTopicIndex: number,
};

const underlineTravelDistance = 135;
var isScrolling: any;

export const TopicExposeComponent = (props: FullScreenComponentProps) => {
    const { CommentsCard, AnalyticsCard, FSTopicIndex } = props;

    const topicExposeRef = useRef<HTMLDivElement>(null);

    const history = useHistory();
    const query = useQuery();
    const topCard = query.get("card")?.toUpperCase() || commentsCardId;

    const { topicsState: { topicIndex } } = useContext(topicsContext);

    const [underlineTranslationPx, setUnderlineTranslationPx] = useState<number>(0);

    useLayoutEffect(() => {
        if (topicExposeRef.current) {
            let scrollPosition: number;
        switch(topCard) {
            case analyticsCardId:
                scrollPosition = topicExposeRef.current!.clientWidth;
                break;
            case commentsCardId:
                scrollPosition = 0;
                break;
            default:
                scrollPosition = 0;
        }
            topicExposeRef.current.scrollLeft = scrollPosition;
            setUnderlineTranslationPx((underlineTravelDistance * ((topicExposeRef.current!.scrollLeft) / topicExposeRef.current!.clientWidth))+15);
        };
    }, [topCard]);

    useEffect(() => {
        if (topicExposeRef.current) {
            topicExposeRef.current.onscroll = (e: Event) => {
                if (topicExposeRef.current) {
                    setUnderlineTranslationPx((underlineTravelDistance * ((topicExposeRef.current!.scrollLeft) / topicExposeRef.current!.clientWidth))+15);
                    clearTimeout(isScrolling);
                    isScrolling = setTimeout(function() {
                        if (topicExposeRef.current) {
                            const index = Math.floor((topicExposeRef.current!.scrollLeft + (topicExposeRef.current!.clientWidth/2)) / topicExposeRef.current!.clientWidth);
                            switch(index) {
                                case 0:
                                    setCardQueryParam(history, query, commentsCardId.toLowerCase());
                                    break;
                                case 1:
                                    setCardQueryParam(history, query, analyticsCardId.toLowerCase())
                                    break;
                                default:
                                    setCardQueryParam(history, query, commentsCardId.toLowerCase());
                            };
                        }
                    }, 66);
                }
            }
      } // eslint-disable-next-line
    }, []);

    return (
        <div className="topic-expose-container" ref={topicExposeRef} onTouchStart={(e) => { e.stopPropagation(); }} onTouchMove={(e) => { e.stopPropagation(); }} >
            {(FSTopicIndex === topicIndex) && (
                <Fragment>
                    <div className={"feature-selector"}>
                        <span onClick={() => setCardQueryParam(history, query, commentsCardId.toLowerCase())} className={(underlineTranslationPx <= 42) ? "feature-selector-selected" : "feature-selector-unselected"}>Arguments</span>
                        <span onClick={() => setCardQueryParam(history, query, analyticsCardId.toLowerCase())} className={(underlineTranslationPx > 42) ? "feature-selector-selected" : "feature-selector-unselected"}>Analytics</span>
                    </div>
                    <div className={"selector-underline"} style={{ transform: `translate(${underlineTranslationPx}px, 2.5em)` }}></div>
                </Fragment>
            )}
            <div className={"expose-item"} style={{ transform: 'translate(0, 0)' }}>
                {React.cloneElement(CommentsCard)}
            </div>
            <div className={"expose-item"} style={{ transform: 'translate(100%, 0)' }}>
                {AnalyticsCard}
            </div>
        </div>
    );
}