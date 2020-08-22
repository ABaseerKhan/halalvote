import React, { useState } from 'react';
import { CommentsCardComponent } from './comments-card';
import { Judgment } from '../../types';
import { getRandomJudment } from '../../utils';
import { useMedia } from '../../hooks/useMedia';
import ReactCardFlip from '../../card-flip/card-flip';

// type imports

// styles
import './comments.css';

interface CommentsComponentProps {
    id: string,
    itemName: string, 
    numHalalComments: number,
    numHaramComments: number,
    refreshItem: (itemTofetch: string) => any,
};
export const CommentsComponent = (props: CommentsComponentProps) => {
    const { id, itemName, numHalalComments, numHaramComments, refreshItem } = props;

    const [cardToShow, setCardToShow] = useState<{ judgment: Judgment }>({ judgment: getRandomJudment() });

    const isMobile = useMedia(
      // Media queries
      ['(max-width: 600px)'],
      [true],
      // default value
      false
    );
    
    const halalCard = document.getElementById("comments-card-0");
    const haramCard = document.getElementById("comments-card-1");
    const halalCardCover = document.getElementById("comments-card-cover-0");
    const haramCardCover = document.getElementById("comments-card-cover-1");

    if (halalCard && haramCard && halalCardCover && haramCardCover) {
      haramCard.style.marginLeft = "20vw";
      haramCard.style.marginRight = "-40vw";

      if (cardToShow.judgment === Judgment.HARAM) {
        halalCard.style.zIndex = "0";
        haramCard.style.zIndex = "2";
        halalCardCover.style.display = "block";
        haramCardCover.style.display = "none";
        halalCardCover.style.opacity = "0.5";
        haramCardCover.style.opacity = "0.0";
      } else {
        halalCard.style.zIndex = "2";
        haramCard.style.zIndex = "0";
        halalCardCover.style.display = "none";
        haramCardCover.style.display = "block";
        halalCardCover.style.opacity = "0.0";
        haramCardCover.style.opacity = "0.5";
      }
    }

    const animateMoveCardsApart = (judgment: Judgment, onfinish: () => void) => {
      if (haramCard && haramCardCover && halalCardCover) {
        haramCard.animate([
          {
            marginLeft: 0 + "vw",
            marginRight: 0 + "vw"
          }
        ], {
            duration: 100,
            fill: "forwards"
        }).onfinish = onfinish

        if (judgment === Judgment.HALAL) {
          haramCardCover.animate([
            {
              opacity: "0"
            }
          ], {
            duration: 100,
            fill: "forwards"
          })
        } else {
          halalCardCover?.animate([
            {
              opacity: "0"
            }
          ], {
            duration: 100,
            fill: "forwards"
          })
        }
      }
    }

    const animateMoveCardsCloser = (judgment: Judgment, onfinish: () => void) => {
      if (haramCard && haramCardCover && halalCardCover) {
        haramCard.animate([
          {
            marginLeft: 20 + "vw",
            marginRight: -40 + "vw"
          }
        ], {
            duration: 100,
            fill: "forwards"
        }).onfinish = onfinish

        if (judgment === Judgment.HALAL) {
          haramCardCover.animate([
            {
              opacity: "0.5"
            }
          ], {
            duration: 100,
            fill: "forwards"
          })
        } else {
          halalCardCover?.animate([
            {
              opacity: "0.5"
            }
          ], {
            duration: 100,
            fill: "forwards"
          })
        }
      }
    }

    const animateSwitch = (judgment: Judgment) => {
      if (haramCard && halalCard && haramCardCover && halalCardCover) {
        animateMoveCardsApart(judgment, () => {
          if (judgment === Judgment.HALAL) {
            halalCard.style.zIndex = "2";
            haramCard.style.zIndex = "0";
            halalCardCover.style.display = "none";
            haramCardCover.style.display = "block";
            halalCardCover.style.zIndex = "1";
            haramCardCover.style.zIndex = "1";
          } else {
            halalCard.style.zIndex = "0";
            haramCard.style.zIndex = "2";
            halalCardCover.style.display = "block";
            haramCardCover.style.display = "none";
            halalCardCover.style.zIndex = "1";
            haramCardCover.style.zIndex = "1";
          }
          animateMoveCardsCloser(judgment, ()=> {})
        })
      }
    }

    const switchCards = (judgment: Judgment) => () => {
      switch (judgment) {
        case Judgment.HARAM:
          if (isMobile) {
            setCardToShow({ judgment: Judgment.HARAM });
          } else {
            cardToShow.judgment = Judgment.HARAM;
            animateSwitch(judgment)
          }
          break;
        case (Judgment.HALAL):
          if (isMobile) {
            setCardToShow({ judgment: Judgment.HALAL });
          } else {
            cardToShow.judgment = Judgment.HALAL;
            animateSwitch(judgment)
          }
        }
    }

    const MobileView = (
      <div id={id} className="comments-body">
          <ReactCardFlip isFlipped={cardToShow.judgment === Judgment.HALAL} flipDirection="horizontal" infinite={true} >
            {<CommentsCardComponent judgment={Judgment.HARAM} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={refreshItem} switchCards={switchCards}/>}
            {<CommentsCardComponent judgment={Judgment.HALAL} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={refreshItem} switchCards={switchCards}/>}
          </ReactCardFlip>
        </div>
    )

    return isMobile ? MobileView : (
        <div id={id} className="comments-body">
            <CommentsCardComponent judgment={Judgment.HARAM} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={refreshItem} switchCards={switchCards}/>
            <CommentsCardComponent judgment={Judgment.HALAL} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={refreshItem} switchCards={switchCards}/>
        </div>
    );
}