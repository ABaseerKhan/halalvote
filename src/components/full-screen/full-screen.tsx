import React, { ReactElement, useState } from 'react';
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

export const FullScreenComponent = (props: FullScreenComponentProps) => {
    const { MediaCard, CommentsCard, AnalyticsCard, TopicCarousel } = props;

    const history = useHistory();
    const query = useQuery();
    const topCard = query.get("card")?.toUpperCase() || mediaCardId;
    // eslint-disable-next-line
    const [state, setState] = useState({});

    let underlineTranslationPx;
    switch(topCard) {
      case mediaCardId:
        underlineTranslationPx = 0;
        break;
      case commentsCardId:
        underlineTranslationPx = -115;
        break;
      case analyticsCardId:
        underlineTranslationPx = 115;
        break;
      default:
        underlineTranslationPx = 0;
    }

    return (
        <div className="full-screen-container" >
          <div className={"topic-carousel-container-fs"}>
            {TopicCarousel}
          </div>
          <div className={"feature-selector"}>
            <span onClick={() => setCardQueryParam(history, query, commentsCardId)} className={topCard === commentsCardId ? "feature-selector-selected" : "feature-selector-unselected"}>Arguments</span>
            <span onClick={() => setCardQueryParam(history, query, mediaCardId)} className={topCard === mediaCardId ? "feature-selector-selected" : "feature-selector-unselected"}>Canvas</span>
            <span onClick={() => setCardQueryParam(history, query, analyticsCardId)} className={topCard === analyticsCardId ? "feature-selector-selected" : "feature-selector-unselected"}>Analytics</span>
          </div>
          <div className={"selector-underline"} style={{ transform: `translate(${underlineTranslationPx}px, 0)` }}></div>
          {(topCard === mediaCardId) && MediaCard}
          {(topCard === commentsCardId) && CommentsCard}
          {(topCard === analyticsCardId) && AnalyticsCard}
        </div>
    );
}