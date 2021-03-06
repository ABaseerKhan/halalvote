import React, { useEffect, useRef, ReactElement, useState, useContext } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { 
  useHistory,
} from "react-router-dom";
import { setCardQueryParam } from '../../utils';
import { topicsContext } from '../app-shell';

// type imports

// styles
import './topic-container.css';

const x1 = .25, y1 = .1, x2 = .25, y2 = 1;
const x1r = 1-x2, y1r = 1-y2, x2r = 1-x1, y2r = 1-y1;

const CARD_SWITCHING_DURATION = 300;
const EASEAPART = `cubic-bezier(${x1},${y1},${x2},${y2})`;
const EASECLOSER = `cubic-bezier(${x1r},${y1r},${x2r},${y2r})`;

const TOPIC_SWITCHING_DURATION = 300;

export const mediaCardId = "CANVAS";
export const commentsCardId = "ARGUMENTS";
export const analyticsCardId = "ANALYTICS";

interface TopicContainerComponentProps {
    mediaCard: ReactElement,
    commentsCard: ReactElement,
    analyticsCard: ReactElement,
    TopicCarousel: ReactElement,
    TopicNavigator: ReactElement
};

export const TopicContainerComponent = (props: TopicContainerComponentProps) => {
    const { mediaCard, commentsCard, analyticsCard, TopicCarousel, TopicNavigator } = props;

    const { topicsState } = useContext(topicsContext);
    const { topicIndex } = topicsState;

    const currentTopicContainer = useRef<HTMLDivElement>(null);
    const nextTopicContainer = useRef<HTMLDivElement>(null);
    const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(topicIndex);

    const history = useHistory();
    const query = useQuery();
    const topCard = query.get("card") || undefined;

    // eslint-disable-next-line
    const [state, setState] = useState({});

    let orderedCards;

    switch(topCard?.toUpperCase()) {
      case mediaCardId:
        orderedCards = [mediaCardId, commentsCardId, analyticsCardId];
        break;
      case commentsCardId:
        orderedCards = [commentsCardId, analyticsCardId, mediaCardId];
        break;
      case analyticsCardId:
        orderedCards = [analyticsCardId, mediaCardId, commentsCardId];
        break;
      default:
        orderedCards = [mediaCardId, commentsCardId, analyticsCardId];
    };

    let positions = useRef<string[]>(orderedCards);
    let canFlip = useRef<boolean>(false);

    const createCardElement = (id: string, body: ReactElement, index: number) => {
      return (
        <div key={id} id={id} className="card-shell" style={{zIndex: 2 - index}}>
          <div id={`${id}-label`} className="card-shell-cover-label" style={{display: index === 0 ? 'none' : 'unset'}}>{id[0] + id.substr(1).toLowerCase()}</div>
          <div id={`${id}-cover`} className="card-shell-cover" onClick={() => {selectCard(id)}} style={{display: index === 0 ? 'none' : 'unset'}}></div>
          {body}
        </div>
      );
    };

    const currentMediaCardElement: ReactElement = createCardElement(mediaCardId, React.cloneElement(mediaCard, { shown: positions.current[0] === mediaCardId, topicIndexOverride: currentTopicIndex }), positions.current.indexOf(mediaCardId));
    const currentCommentsCardElement: ReactElement = createCardElement(commentsCardId, React.cloneElement(commentsCard, { topicIndexOverride: currentTopicIndex }), positions.current.indexOf(commentsCardId));
    const currentAnalyticsCardElement: ReactElement = createCardElement(analyticsCardId, React.cloneElement(analyticsCard, { topicIndexOverride: currentTopicIndex }), positions.current.indexOf(analyticsCardId));

    const nextMediaCardElement: ReactElement = createCardElement(mediaCardId, React.cloneElement(mediaCard, { shown: positions.current[0] === mediaCardId }), positions.current.indexOf(mediaCardId));
    const nextCommentsCardElement: ReactElement = createCardElement(commentsCardId, commentsCard, positions.current.indexOf(commentsCardId));
    const nextAnalyticsCardElement: ReactElement = createCardElement(analyticsCardId, analyticsCard, positions.current.indexOf(analyticsCardId));

    useEffect(() => {
      setTimeout(() => {
        setCards();
      }, 300) // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      setCards(); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTopicIndex]);

    useEffect(() => {
      if (topicIndex !== currentTopicIndex) {
        const currentTopicContainerElement = currentTopicContainer.current;
        const nextTopicContainerElement = nextTopicContainer.current;
        const leftCard = document.getElementById(positions.current[1]);
        const rightCard = document.getElementById(positions.current[2]);

        if (currentTopicContainerElement && nextTopicContainerElement && leftCard && rightCard) {
          currentTopicContainerElement.animate(
          {
              marginLeft: topicIndex > currentTopicIndex ? "-100%" : "100%"
          }, {
              duration: TOPIC_SWITCHING_DURATION
          });
          nextTopicContainerElement.animate(
          {
              marginLeft: "0"
          }, {
              duration: TOPIC_SWITCHING_DURATION
          }).onfinish = () => {
            leftCard.animate(
              {
                  marginLeft: "0"
              }, {
                  duration: 0,
                  fill: "forwards"
              });
              rightCard.animate(
              {
                  marginLeft: "0"
              }, {
                  duration: 0,
                  fill: "forwards"
              });
            setCurrentTopicIndex(topicIndex);
          };
        }
      } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicIndex]);

    useEffect(() => {
      const cardId = query.get('card')?.toUpperCase();
      if (cardId && cardId !== positions.current[0]) {
        canFlip.current = false;
        makeRoom(cardId, () => {
          rotate(cardId, () => {
            canFlip.current = true;
          })
        });
      }// eslint-disable-next-line
    }, [query])

    const leftCardMarginLeft =  -5;
    const rightCardMarginLeft = 5;

    const setCards = () => {
      const leftCard = document.getElementById(positions.current[1]);
      const rightCard = document.getElementById(positions.current[2]);

      const leftCardCover = document.getElementById(`${positions.current[1]}-cover`);
      const rightCardCover = document.getElementById(`${positions.current[2]}-cover`);

      const leftCardLabel = document.getElementById(`${positions.current[1]}-label`);
      const rightCardLabel = document.getElementById(`${positions.current[2]}-label`);

      if (leftCard && rightCard && leftCardCover && rightCardCover && leftCardLabel && rightCardLabel) {
        leftCardLabel.style.right = 'unset';
        leftCardLabel.style.left = '1vw';
        leftCardLabel.style.transform = 'rotate(-180deg)';

        rightCardLabel.style.right = '1vw';
        rightCardLabel.style.left = 'unset';
        rightCardLabel.style.transform = 'unset';

        leftCard.animate([
          {
            marginLeft: `${leftCardMarginLeft.toString()}vw`,
            transform:'scale(.95)'
          }
        ], {
            duration: CARD_SWITCHING_DURATION,
            easing: EASEAPART,
            fill: "forwards"
        }).onfinish = () => {
          canFlip.current = true;
        };
        rightCard.animate([
          {
            marginLeft: `${rightCardMarginLeft.toString()}vw`,
            transform:'scale(.95)'
          }
        ], {
            duration: CARD_SWITCHING_DURATION,
            easing: EASEAPART,
            fill: "forwards"
        });
        leftCardCover.animate([
          {
            opacity: '1'
          }
        ], {
            duration: CARD_SWITCHING_DURATION,
            easing: EASEAPART,
            fill: "forwards"
        });
        rightCardCover.animate([
          {
            opacity: '1'
          }
        ], {
            duration: CARD_SWITCHING_DURATION,
            easing: EASEAPART,
            fill: "forwards"
        });
      }
    }

    const selectCard = (cardId: string) => {
      if (canFlip.current) {
        setCardQueryParam(history, query, cardId.toLowerCase());
      }
    };

    const makeRoom = (cardId: string, onfinish: () => void) => {
      const position = positions.current.indexOf(cardId);
      const selected = document.getElementById(cardId);
      const front = document.getElementById(positions.current[0]);
      const back = document.getElementById(positions.current[position === 1 ? 2 : 1]);

      const selectedCover = document.getElementById(`${cardId}-cover`);
      const frontCover = document.getElementById(`${positions.current[0]}-cover`);

      const selectedLabel = document.getElementById(`${cardId}-label`);

      if (selected && front && back && selectedCover && frontCover && selectedLabel) {
        const marginLeftVw = 23;
        back.style.zIndex = '0';
        selected.style.zIndex = '1';
        selectedLabel.style.display = 'none';
        frontCover.style.display = 'unset';

        front.animate([
          {
            marginLeft: `${position === 1 ? marginLeftVw : position === 2 ? -marginLeftVw : 0}vw`,
            transform:'scale(.975)'
          }
        ], {
            duration: CARD_SWITCHING_DURATION,
            easing: EASEAPART,
            fill: "forwards"
        });
        back.animate([
          {
            marginLeft: '0vw'
          }
        ], {
            duration: CARD_SWITCHING_DURATION,
            easing: EASECLOSER,
            fill: "forwards"
        });
        selectedCover.animate([
          {
            opacity: '0.5'
          }
        ], {
            duration: CARD_SWITCHING_DURATION,
            easing: EASEAPART,
            fill: "forwards"
        });
        frontCover.animate([
          {
            opacity: '0.5'
          }
        ], {
            duration: CARD_SWITCHING_DURATION,
            easing: EASEAPART,
            fill: "forwards"
        });
        switch (position) {
          case 1:
            selected.animate([
              {
                marginLeft: `-${marginLeftVw}vw`,
                transform:'scale(.975)'
              }
            ], {
                duration: CARD_SWITCHING_DURATION,
                easing: EASEAPART,
                fill: "forwards"
            }).onfinish = () => {
              selected.style.zIndex = '2';
              front.style.zIndex = '1';
              selectedCover.style.display = 'none';
              onfinish();
            }
            break;
          case 2:
            selected.animate([
              {
                marginLeft: `${marginLeftVw}vw`,
                transform:'scale(.975)'
              }
            ], {
                duration: CARD_SWITCHING_DURATION,
                easing: EASEAPART,
                fill: "forwards"
            }).onfinish = () => {
              selected.style.zIndex = '2';
              front.style.zIndex = '1';
              selectedCover.style.display = 'none';
              onfinish();
            }
            break;
        }
      }
    };

    const rotate = (cardId: string, onfinish: () => void) => {
      const position = positions.current.indexOf(cardId);
      const selected = document.getElementById(cardId);
      const front = document.getElementById(positions.current[0]);
      const back = document.getElementById(positions.current[position === 1 ? 2 : 1]);

      const selectedCover = document.getElementById(`${cardId}-cover`);
      const frontCover = document.getElementById(`${positions.current[0]}-cover`);

      const frontLabel = document.getElementById(`${positions.current[0]}-label`);
      const backLabel = document.getElementById(`${positions.current[position === 1 ? 2 : 1]}-label`);

      if (selected && front && back && selectedCover && frontCover && frontLabel && backLabel) {
        
        selected.animate([
          {
            marginLeft: '0vw',
            transform:'scale(1)'
          }
        ], {
            duration: CARD_SWITCHING_DURATION,
            easing: EASECLOSER,
            fill: "forwards"
        });
        selectedCover.animate([
          {
            opacity: '0'
          }
        ], {
            duration: CARD_SWITCHING_DURATION,
            easing: EASEAPART,
            fill: "forwards"
        });
        frontCover.animate([
          {
            opacity: '1'
          }
        ], {
            duration: CARD_SWITCHING_DURATION,
            easing: EASEAPART,
            fill: "forwards"
        });
        switch (position) {
          case 1:
            front.animate([
              {
                marginLeft: `${rightCardMarginLeft}vw`,
                transform:'scale(.95)'
              }
            ], {
                duration: CARD_SWITCHING_DURATION,
                easing: EASECLOSER,
                fill: "forwards"
            }).onfinish = () => {
              backLabel.style.right = 'unset';
              backLabel.style.left = '1vw';
              backLabel.style.transform = 'rotate(-180deg)';

              frontLabel.style.right = '1vw';
              frontLabel.style.left = 'unset';
              frontLabel.style.transform = 'unset';
              frontLabel.style.display = 'unset';

              const positionsCopy = [...positions.current];
              positionsCopy.push(positionsCopy.shift()!);
              positions.current = positionsCopy;

              onfinish();
            };
            back.animate([
              {
                marginLeft: `${leftCardMarginLeft}vw`,
                transform:'scale(.95)'
              }
            ], {
                duration: CARD_SWITCHING_DURATION,
                easing: EASECLOSER,
                fill: "forwards"
            });
            break;
          case 2:
            front.animate([
              {
                marginLeft: `${leftCardMarginLeft}vw`,
                transform:'scale(.95)'
              }
            ], {
                duration: CARD_SWITCHING_DURATION,
                easing: EASECLOSER,
                fill: "forwards"
            }).onfinish = () => {
              backLabel.style.right = '1vw';
              backLabel.style.left = 'unset';
              backLabel.style.transform = 'unset';

              frontLabel.style.right = 'unset';
              frontLabel.style.left = '1vw';
              frontLabel.style.transform = 'rotate(-180deg)';
              frontLabel.style.display = 'unset';


              const positionsCopy = [...positions.current];
              positionsCopy.unshift(positionsCopy.pop()!);
              positions.current = positionsCopy;

              onfinish();
            };
            back.animate([
              {
                marginLeft: `${rightCardMarginLeft}vw`,
                transform:'scale(.95)'
              }
            ], {
                duration: CARD_SWITCHING_DURATION,
                easing: EASECLOSER,
                fill: "forwards"
            });
            break;
        }
      }
    };

    return (
      <div>
        <div ref={currentTopicContainer} style={{marginLeft: "0"}}>
          <div className="cards-shell" children={[currentMediaCardElement, currentCommentsCardElement, currentAnalyticsCardElement]}/>
        </div>
        {
          topicIndex !== currentTopicIndex &&
          <div ref={nextTopicContainer} style={{marginLeft: topicIndex > currentTopicIndex ? "100%" : "-100%"}}>
            <div className="cards-shell" children={[nextMediaCardElement, nextCommentsCardElement, nextAnalyticsCardElement]}/>
          </div>
        }
        {TopicCarousel}
        {TopicNavigator}
      </div>
    );
}