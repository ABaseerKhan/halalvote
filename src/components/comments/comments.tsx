import React from 'react';
import { CommentsCardComponent } from './comments-card';

// type imports

// styles
import './comments.css';
import { Judgment } from '../../types';

interface CommentsComponentProps {
    id: string,
    itemName: string, 
    numHalalComments: number,
    numHaramComments: number,
    refreshItem: (itemsTofetch: string[]) => any,
};
export const CommentsComponent = (props: CommentsComponentProps) => {
    const { id, itemName, numHalalComments, numHaramComments, refreshItem } = props;

    const halalCard = document.getElementById("comments-card-0");
    const haramCard = document.getElementById("comments-card-1");

    const separateCards = (value: number) => {
      if (halalCard && haramCard) {
        halalCard.style.marginLeft = `${Math.min(parseInt(halalCard.style.marginLeft) + value, 0)}vw`;
        haramCard.style.marginRight = `${Math.min(parseInt(haramCard.style.marginRight) + value, 0)}vw`;
      }
    }

    const mergeCards = (value: number) => {
      if (halalCard && haramCard) {
        halalCard.style.marginLeft = `${Math.max(parseInt(halalCard.style.marginLeft) - value, -20)}vw`;
        haramCard.style.marginRight = `${Math.max(parseInt(haramCard.style.marginRight) - value, -20)}vw`;
      }
    }
    
    const revealCard = (judgment: Judgment) => {
      if (halalCard && haramCard) {
        if (halalCard.style.marginLeft && haramCard.style.marginRight && halalCard.style.zIndex && haramCard.style.zIndex) {
          switch (judgment) {	
            case Judgment.HALAL:
              const halalCardMargin = parseInt(halalCard.style.marginLeft);
              if (halalCard.style.zIndex === "1") {
                if (halalCardMargin > -20) {
                  mergeCards(2);
                }
              } else {
                if (halalCardMargin < 0) {
                  separateCards(2)
                } else if (halalCardMargin === 0) {
                  halalCard.style.zIndex = "1";
                  haramCard.style.zIndex = "0";
                }
              }
              break;
            case Judgment.HARAM:
              const haramCardMargin = parseInt(haramCard.style.marginRight);
              if (haramCard.style.zIndex === "1") {
                if (haramCardMargin > -20) {
                  mergeCards(2);
                }
              } else {
                if (haramCardMargin < 0) {
                  separateCards(2)
                } else if (haramCardMargin === 0) {
                  halalCard.style.zIndex = "0";
                  haramCard.style.zIndex = "1";
                }
              }
          }
        } else {
          halalCard.style.marginLeft = "-20vw";
          haramCard.style.marginRight = "-20vw";
          halalCard.style.zIndex = "1";
          haramCard.style.zIndex = "0";
        }
      }
    }

    window.onkeydown = (event: any) => {
      switch (event.keyCode) {	
        case 37:
          revealCard(Judgment.HARAM);
          break;
        case 39:
          revealCard(Judgment.HALAL);
        }
    }

    return (
        <div id={id} className="comments-body">
          <div className="comments-body-1">
            <CommentsCardComponent judgment={Judgment.HARAM} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={refreshItem} />
          </div>
          <div className="comments-body-0">
            <CommentsCardComponent judgment={Judgment.HALAL} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={refreshItem} />
          </div>
        </div>
    );
}