import React, { useEffect, useRef, ReactElement } from 'react';
// import { useMedia } from '../../hooks/useMedia';

// type imports

// styles
import './cards-shell.css';

const x1 = .25, y1 = .1, x2 = .25, y2 = 1;
const x1r = 1-x2, y1r = 1-y2, x2r = 1-x1, y2r = 1-y1;

const DURATION = 300;
const EASEAPART = `cubic-bezier(${x1},${y1},${x2},${y2})`;
const EASECLOSER = `cubic-bezier(${x1r},${y1r},${x2r},${y2r})`;

interface Card {
    label: string;
    body: ReactElement;
};

interface CardsShellComponentProps {
    id: string,
    cards: Card[]
};

export const CardsShellComponent = (props: CardsShellComponentProps) => {
    const { id, cards } = props;

    let positions = useRef<number[]>(cards.map( (value: Card, index: Number, array: Card[]) => {
      return index.valueOf();
    }));

    const createCardElement = (id: string, body: ReactElement, index: number) => {
      return (
        <div id={id} className="card-shell" style={{zIndex: cards.length - index.valueOf() - 1}}>
          <div id={`${id}-cover`} className="card-shell-cover" onClick={() => {selectCard(index)}} style={{display: positions.current[index] !== 0 ? 'unset' : 'none'}}></div>
          {body}
        </div>
      );
    };

    const cardElements: ReactElement[] = cards.map( (value: Card, index: Number, array: Card[]) => {
      return createCardElement(`card-element-${index}`, value.body, index.valueOf());
    });

    // const isMobile = useMedia(
    //   // Media queries
    //   ['(max-width: 600px)'],
    //   [true],
    //   // default value
    //   false
    // );

    useEffect(() => {
      setCards(() => {}); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectCard = (cardIndex: number) => {
      const card = document.getElementById(`card-element-${cardIndex}`);
      const cardCover = document.getElementById(`card-element-${cardIndex}-cover`);

      if (card && cardCover) {
        separateCard(cardIndex, () => {
          positions.current = positions.current.map( (value: number, index: number, array: number[]) => {
            const position = array[cardIndex];
            return value === position ? 0 : value < position ? value + 1 : value;;
          });

          setZIndices();
          raiseCard(cardIndex, () => {
            setCoverDisplays();
            setCards(() => {});
          });
        });
      }
    }

    const setZIndices = () => {
      for (let i = 0; i < cards.length; i++) {
        const card = document.getElementById(`card-element-${i}`);
        const position = positions.current[i];

        if (card) {
          card.style.zIndex = `${cards.length - position - 1}`;
        }
      }
    }

    const setCoverDisplays = () => {
      for (let i = 0; i < cards.length; i++) {
        const cover = document.getElementById(`card-element-${i}-cover`);
        const position = positions.current[i];

        if (cover) {
          cover.style.display = position === 0 ? 'none' : 'unset';
        }
      }
    }

    const setCards = (onfinish: () => void) => {
      for (let i = 0; i < cards.length; i++) {
        const card = document.getElementById(`card-element-${i}`);
        const cover = document.getElementById(`card-element-${i}-cover`);
        const position = positions.current[i];

        if (card && cover) {
          card.animate([
            {
              marginLeft: `${position * 5}vw`,
              transform:`scale(${position > 0 ? .95 ** position : 1})`
            }
          ], {
              duration: DURATION,
              easing: EASECLOSER,
              fill: "forwards"
          }).onfinish = onfinish;
          cover.animate([
            {
              opacity: position === 0 ? '0' : `${0.5 / ((positions.current.length) - position)}`
            }
          ], {
            duration: DURATION,
            easing: EASECLOSER,
            fill: "forwards"
          })
        }
      }
    }

    const separateCard = (cardIndex: number, onfinish: () => void) => {
      const card = document.getElementById(`card-element-${cardIndex}`);
      const cover = document.getElementById(`card-element-${cardIndex}-cover`);
      const position = positions.current[cardIndex];

      if (card && cover) {
        card.animate([
          {
            marginLeft: `${((position === 0 ? 0 : ((position - 1) * 5) + (40 * (.95 ** (position - 1)))))}vw`
          }
        ], {
            duration: DURATION,
            easing: EASEAPART,
            fill: "forwards"
        }).onfinish = onfinish;
        cover.animate([
          {
            opacity: `${0.25 / ((positions.current.length) - position)}`
          }
        ], {
            duration: DURATION,
            easing: EASECLOSER,
            fill: "forwards"
        });
      }
    }

    const raiseCard = (cardIndex: number, onfinish: () => void) => {
      const card = document.getElementById(`card-element-${cardIndex}`);
      const cover = document.getElementById(`card-element-${cardIndex}-cover`);

      if (card && cover) {
        card.animate([
          {
            transform:'scale(1)'
          }
        ], {
            duration: DURATION,
            easing: EASECLOSER,
            fill: "forwards"
        }).onfinish = onfinish;
        cover.animate([
          {
            opacity: '0'
          }
        ], {
            duration: DURATION,
            easing: EASECLOSER,
            fill: "forwards"
        });
      }
    }

    // const MobileView = (
    //   <div id={id} className="comments-body">
    //       <ReactCardFlip isFlipped={cardToShow.judgment === Judgment.HALAL} flipDirection="horizontal" infinite={true} >
    //         {<CommentsCardComponent judgment={Judgment.HARAM} topicTitle={topicTitle} numHalalComments={numHalalComments} numHaramComments={numHaramComments} specificComment={specificComment} refreshTopic={refreshTopic} switchCards={switchCards}/>}
    //         {<CommentsCardComponent judgment={Judgment.HALAL} topicTitle={topicTitle} numHalalComments={numHalalComments} numHaramComments={numHaramComments} specificComment={specificComment} refreshTopic={refreshTopic} switchCards={switchCards}/>}
    //       </ReactCardFlip>
    //     </div>
    // )

    return /*isMobile ? MobileView :*/ (
        <div id={id} className="cards-shell" children={cardElements}/>
    );
}