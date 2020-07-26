import React from 'react';
import { CommentsCardComponent } from './comments-card';

// type imports

// styles
import './comments.css';
import { Judgment } from '../../types';

const animationStepInVW = 0.5;
interface CommentsComponentProps {
    id: string,
    itemName: string, 
    numHalalComments: number,
    numHaramComments: number,
    randomJudgement: Judgment,
    refreshItem: (itemTofetch: string) => any,
};
export const CommentsComponent = (props: CommentsComponentProps) => {
    const { id, itemName, numHalalComments, numHaramComments, refreshItem } = props;

    let animationInterval: NodeJS.Timeout;
    let currentAnimation: Judgment | undefined = undefined;
    
    const halalCard = document.getElementById("comments-card-0");
    const haramCard = document.getElementById("comments-card-1");
    const halalCardCover = document.getElementById("comments-card-cover-0");
    const haramCardCover = document.getElementById("comments-card-cover-1");

    if (halalCard && haramCard && halalCardCover && haramCardCover) {
      halalCard.style.marginLeft = "-20vw";
      haramCard.style.marginRight = "-20vw";

      if (props.randomJudgement == Judgment.HARAM) {
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

      halalCardCover.style.zIndex = "1";
      haramCardCover.style.zIndex = "1";
    }

    const clearAnimations = () => {
      clearInterval(animationInterval);
      currentAnimation = undefined;
    }

    const moveCardsApart = (value: number) => {
      if (halalCard && haramCard && halalCardCover && haramCardCover) {
        halalCard.style.marginLeft = `${Math.min(parseFloat(halalCard.style.marginLeft) + value, 0)}vw`;
        haramCard.style.marginRight = `${Math.min(parseFloat(haramCard.style.marginRight) + value, 0)}vw`;
      }
    }

    const moveCardsCloser = (value: number) => {
      if (halalCard && haramCard && halalCardCover && haramCardCover) {
        halalCard.style.marginLeft = `${Math.max(parseFloat(halalCard.style.marginLeft) - value, -20)}vw`;
        haramCard.style.marginRight = `${Math.max(parseFloat(haramCard.style.marginRight) - value, -20)}vw`;
      }
    }
    
    const switchCardsStep = (judgment: Judgment) => {
      if (halalCard && haramCard && halalCardCover && haramCardCover && halalCard.style.marginLeft && haramCard.style.marginRight && halalCard.style.zIndex && haramCard.style.zIndex) {
        switch (judgment) {	
          case Judgment.HALAL:
            const halalCardMargin = parseFloat(halalCard.style.marginLeft);
            if (halalCard.style.zIndex === "2") {
              if (halalCardMargin > -20) {
                moveCardsCloser(animationStepInVW);
                haramCardCover.style.opacity = `${Math.min(parseFloat(haramCardCover.style.opacity) + 0.02, 0.5)}`;
              } else {
                clearAnimations();
              }
            } else {
              if (halalCardMargin < 0) {
                moveCardsApart(animationStepInVW);
                halalCardCover.style.opacity = `${Math.max(parseFloat(halalCardCover.style.opacity) - 0.02, 0.0)}`;
              } else if (halalCardMargin === 0) {
                halalCard.style.zIndex = "2";
                haramCard.style.zIndex = "0";
                halalCardCover.style.display = "none";
                haramCardCover.style.display = "block";
                halalCardCover.style.zIndex = "1";
                haramCardCover.style.zIndex = "1";
                moveCardsCloser(animationStepInVW);
              }
            }
            break;
          case Judgment.HARAM:
            const haramCardMargin = parseFloat(haramCard.style.marginRight);
            if (haramCard.style.zIndex === "2") {
              if (haramCardMargin > -20) {
                moveCardsCloser(animationStepInVW);
                halalCardCover.style.opacity = `${Math.min(parseFloat(halalCardCover.style.opacity) + 0.02, 0.5)}`;
              } else {
                clearAnimations();
              }
            } else {
              if (haramCardMargin < 0) {
                moveCardsApart(animationStepInVW);
                haramCardCover.style.opacity = `${Math.max(parseFloat(haramCardCover.style.opacity) - 0.02, 0.0)}`;
              } else if (haramCardMargin === 0) {
                halalCard.style.zIndex = "0";
                haramCard.style.zIndex = "2";
                halalCardCover.style.display = "block";
                haramCardCover.style.display = "none";
                halalCardCover.style.zIndex = "1";
                haramCardCover.style.zIndex = "1";
                moveCardsCloser(animationStepInVW);
              }
            }
        }
      }
    }

    const switchCards = (judgment: Judgment) => () => {
      switch (judgment) {
        case Judgment.HARAM:
          if (currentAnimation === Judgment.HALAL) {
            clearInterval(animationInterval);
          }
          currentAnimation = Judgment.HARAM;
          animationInterval = setInterval(() => {switchCardsStep(Judgment.HARAM)}, 5);
          break;
        case (Judgment.HALAL):
          if (currentAnimation === Judgment.HARAM) {
            clearInterval(animationInterval);
          }
          currentAnimation = Judgment.HALAL;
          animationInterval = setInterval(() => {switchCardsStep(Judgment.HALAL)}, 5);
        }
    }

    return (
        <div id={id} className="comments-body">
          <div className="comments-body-1">
            <CommentsCardComponent judgment={Judgment.HARAM} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={refreshItem} switchCards={switchCards} />
          </div>
          <div className="comments-body-0">
            <CommentsCardComponent judgment={Judgment.HALAL} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={refreshItem} switchCards={switchCards}/>
          </div>
        </div>
    );
}