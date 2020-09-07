import React, { useState, useEffect } from 'react';
import { CommentsCardComponent } from './comments-card';
import { Judgment, Comment } from '../../types';
import { getRandomJudment } from '../../utils';
import { useMedia } from '../../hooks/useMedia';
import ReactCardFlip from '../../card-flip/card-flip';

// type imports

// styles
import './comments.css';

const x1 = .25, y1 = .1, x2 = .25, y2 = 1;
const x1r = 1-x2, y1r = 1-y2, x2r = 1-x1, y2r = 1-y1;

const DURATION = 300;
const EASEAPART = `cubic-bezier(${x1},${y1},${x2},${y2})`;
const EASECLOSER = `cubic-bezier(${x1r},${y1r},${x2r},${y2r})`;
const EASESTANDARD = "ease-in"
interface CommentsComponentProps {
    id: string,
    topicTitle: string,
    numHalalComments: number,
    numHaramComments: number,
    specificComment?: Comment,
    refreshTopic: (topicTofetch: string) => any,
};
export const CommentsComponent = (props: CommentsComponentProps) => {
    const { id, topicTitle, numHalalComments, numHaramComments, specificComment, refreshTopic } = props;

    const [cardToShow, setCardToShow] = useState<{ judgment: Judgment; specificCommentId?: number }>({ judgment: getRandomJudment(), specificCommentId: undefined });

    const isMobile = useMedia(
      // Media queries
      ['(max-width: 600px)'],
      [true],
      // default value
      false
    );

    useEffect(() => {
      if (specificComment) {
        setCardToShow({ judgment: specificComment.commentType === "HALAL" ? Judgment.HALAL : Judgment.HARAM, specificCommentId: specificComment.id });
      }
    }, [specificComment])
    
    const halalCard = document.getElementById("comments-card-0");
    const haramCard = document.getElementById("comments-card-1");
    const halalCardCover = document.getElementById("comments-card-cover-0");
    const haramCardCover = document.getElementById("comments-card-cover-1");

    if (halalCard && haramCard && halalCardCover && haramCardCover) {
      haramCard.style.marginLeft = "23vw";
      haramCard.style.marginRight = "-40vw";

      if (cardToShow.judgment === Judgment.HARAM) {
        halalCard.style.zIndex = "0";
        haramCard.style.zIndex = "2";
        halalCardCover.style.display = "block";
        haramCardCover.style.display = "none";
        halalCardCover.style.opacity = "0.5";
        haramCardCover.style.opacity = "0.0";
        halalCard.style.transform = "scale(0.95)";
        haramCard.style.transform = "scale(1)";
      } else {
        halalCard.style.zIndex = "2";
        haramCard.style.zIndex = "0";
        halalCardCover.style.display = "none";
        haramCardCover.style.display = "block";
        halalCardCover.style.opacity = "0.0";
        haramCardCover.style.opacity = "0.5";
        haramCard.style.transform = "scale(0.95)";
        halalCard.style.transform = "scale(1)";
      }
    }

    const animateMoveCardsApart = (judgment: Judgment, onfinish: () => void) => {
      if (haramCard && haramCardCover && halalCardCover && halalCard) {
        haramCard.animate([
          {
            marginLeft: 3 + "vw",
            marginRight: 1 + "vw"
          }
        ], {
            duration: DURATION,
            easing: EASEAPART,
            fill: "forwards"
        }).onfinish = onfinish

        if (judgment === Judgment.HALAL) {
          halalCardCover.animate([
            {
              opacity: "0",
            }
          ], {
            duration: DURATION,
            easing: EASEAPART,
            fill: "forwards"
          });
          halalCard.animate([
            {
              transform: 'scale(1)'
            }
          ], {
            duration: DURATION,
            easing: EASESTANDARD,
            fill: "forwards"
          });
        } else {
          haramCardCover.animate([
            {
              opacity: "0",
            }
          ], {
            duration: DURATION,
            easing: EASEAPART,
            fill: "forwards"
          });
          haramCard.animate([
            {
              transform: 'scale(1)'
            }
          ], {
            duration: DURATION,
            easing: EASESTANDARD,
            fill: "forwards"
          });
        }
      }
    }

    const animateMoveCardsCloser = (judgment: Judgment, onfinish: () => void) => {
      if (haramCard && haramCardCover && halalCardCover && halalCard) {
        haramCard.animate([
          {
            marginLeft: 23 + "vw",
            marginRight: -40 + "vw"
          }
        ], {
            duration: DURATION,
            easing: EASECLOSER,
            fill: "forwards"
        }).onfinish = onfinish

        if (judgment === Judgment.HALAL) {
          haramCardCover.animate([
            {
              opacity: "0.5"
            }
          ], {
            duration: DURATION,
            easing: EASESTANDARD,
            fill: "forwards"
          });
          haramCard.animate([
            {
              transform: 'scale(0.95)'
            }
          ], {
            duration: DURATION,
            easing: EASESTANDARD,
            fill: "forwards"
          })
        } else {
          halalCardCover?.animate([
            {
              opacity: "0.5"
            }
          ], {
            duration: DURATION,
            easing: EASESTANDARD,
            fill: "forwards"
          });
          halalCard.animate([
            {
              transform: 'scale(0.95)'
            }
          ], {
            duration: DURATION,
            easing: EASESTANDARD,
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
            {<CommentsCardComponent judgment={Judgment.HARAM} topicTitle={topicTitle} numHalalComments={numHalalComments} numHaramComments={numHaramComments} specificCommentId={cardToShow.specificCommentId} refreshTopic={refreshTopic} switchCards={switchCards}/>}
            {<CommentsCardComponent judgment={Judgment.HALAL} topicTitle={topicTitle} numHalalComments={numHalalComments} numHaramComments={numHaramComments} specificCommentId={cardToShow.specificCommentId} refreshTopic={refreshTopic} switchCards={switchCards}/>}
          </ReactCardFlip>
        </div>
    )

    return isMobile ? MobileView : (
        <div id={id} className="comments-body">
            <CommentsCardComponent judgment={Judgment.HARAM} topicTitle={topicTitle} numHalalComments={numHalalComments} numHaramComments={numHaramComments} specificCommentId={cardToShow.specificCommentId} refreshTopic={refreshTopic} switchCards={switchCards}/>
            <CommentsCardComponent judgment={Judgment.HALAL} topicTitle={topicTitle} numHalalComments={numHalalComments} numHaramComments={numHaramComments} specificCommentId={cardToShow.specificCommentId} refreshTopic={refreshTopic} switchCards={switchCards}/>
        </div>
    );
}