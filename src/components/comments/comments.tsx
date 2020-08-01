import React, { useRef } from 'react';
import { CommentsCardComponent } from './comments-card';
import { Judgment } from '../../types';
import { getRandomJudment } from '../../utils';

// type imports

// styles
import './comments.css';

const animationStepInVW = 0.5;
interface CommentsComponentProps {
    id: string,
    itemName: string, 
    numHalalComments: number,
    numHaramComments: number,
    refreshItem: (itemTofetch: string) => any,
};
export const CommentsComponent = (props: CommentsComponentProps) => {
    const { id, itemName, numHalalComments, numHaramComments, refreshItem } = props;

    const cardToShow = useRef<Judgment>(getRandomJudment());

    let animationInterval: NodeJS.Timeout;
    let currentAnimation: Judgment | undefined = undefined;
    
    const halalCard = document.getElementById("comments-card-0");
    const haramCard = document.getElementById("comments-card-1");
    const halalCardCover = document.getElementById("comments-card-cover-0");
    const haramCardCover = document.getElementById("comments-card-cover-1");

    if (halalCard && haramCard && halalCardCover && haramCardCover) {
      haramCard.style.marginLeft = "20vw";
      haramCard.style.marginRight = "-40vw";

      if (cardToShow.current === Judgment.HARAM) {
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

    const clearAnimations = () => {
      clearInterval(animationInterval);
      currentAnimation = undefined;
    }

    const moveCardsApart = (value: number) => {
      if (haramCard && haramCardCover) {
        haramCard.style.marginLeft = `${Math.max(parseFloat(haramCard.style.marginLeft) - value, 0)}vw`;
        haramCard.style.marginRight = `${Math.min(parseFloat(haramCard.style.marginRight) + (2 * value), 0)}vw`;
      }
    }

    const moveCardsCloser = (value: number) => {
      if (haramCard && haramCardCover) {
        haramCard.style.marginLeft = `${Math.min(parseFloat(haramCard.style.marginLeft) + value, 20)}vw`;
        haramCard.style.marginRight = `${Math.max(parseFloat(haramCard.style.marginRight) - (2 * value), -40)}vw`;
      }
    }
    
    const switchCardsStep = (judgment: Judgment) => {
      if (halalCard && haramCard && halalCardCover && haramCardCover && haramCard.style.marginLeft && haramCard.style.marginRight && halalCard.style.zIndex && haramCard.style.zIndex) {
        const haramCardMarginLeft = parseFloat(haramCard.style.marginLeft);
        switch (judgment) {	
          case Judgment.HALAL:
            if (halalCard.style.zIndex === "2") {
              if (haramCardMarginLeft < 20) {
                moveCardsCloser(animationStepInVW);
                haramCardCover.style.opacity = `${Math.min(parseFloat(haramCardCover.style.opacity) + 0.02, 0.5)}`;
              } else {
                clearAnimations();
              }
            } else {
              if (haramCardMarginLeft > 0) {
                moveCardsApart(animationStepInVW);
                halalCardCover.style.opacity = `${Math.max(parseFloat(halalCardCover.style.opacity) - 0.02, 0.0)}`;
              } else if (haramCardMarginLeft === 0) {
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
            if (haramCard.style.zIndex === "2") {
              if (haramCardMarginLeft < 20) {
                moveCardsCloser(animationStepInVW);
                halalCardCover.style.opacity = `${Math.min(parseFloat(halalCardCover.style.opacity) + 0.02, 0.5)}`;
              } else {
                clearAnimations();
              }
            } else {
              if (haramCardMarginLeft > 0) {
                moveCardsApart(animationStepInVW);
                haramCardCover.style.opacity = `${Math.max(parseFloat(haramCardCover.style.opacity) - 0.02, 0.0)}`;
              } else if (haramCardMarginLeft === 0) {
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
          cardToShow.current = Judgment.HARAM;
          if (currentAnimation === Judgment.HALAL) {
            clearInterval(animationInterval);
          }
          currentAnimation = Judgment.HARAM;
          animationInterval = setInterval(() => {switchCardsStep(Judgment.HARAM)}, 5);
          break;
        case (Judgment.HALAL):
          cardToShow.current = Judgment.HALAL;
          if (currentAnimation === Judgment.HARAM) {
            clearInterval(animationInterval);
          }
          currentAnimation = Judgment.HALAL;
          animationInterval = setInterval(() => {switchCardsStep(Judgment.HALAL)}, 5);
        }
    }

    return (
        <div id={id} className="comments-body">
            <CommentsCardComponent judgment={Judgment.HARAM} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={refreshItem} switchCards={switchCards} />
            <CommentsCardComponent judgment={Judgment.HALAL} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={refreshItem} switchCards={switchCards}/>
        </div>
    );
}