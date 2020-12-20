import React, { useRef, ReactElement, useContext } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { 
    useHistory,
} from "react-router-dom";
import { setCardQueryParam } from '../../utils';
import { muteContext } from '../app-shell';
import { frozenContext } from '../app-shell';

// type imports

// styles
import './cards-shell.css';

const x1 = .25, y1 = .1, x2 = .25, y2 = 1;
const x1r = 1-x2, y1r = 1-y2, x2r = 1-x1, y2r = 1-y1;

const DURATION = 200;
const EASEAPART = `cubic-bezier(${x1},${y1},${x2},${y2})`;
const EASECLOSER = `cubic-bezier(${x1r},${y1r},${x2r},${y2r})`;

export const mediaCardId = "CANVAS";
export const commentsCardId = "ARGUMENTS";
export const analyticsCardId = "ANALYTICS";

const COLLAPSED_CARD_WIDTH = 25;
const COLLAPSED_CARDS_DISTANCE = (100 - (COLLAPSED_CARD_WIDTH * 3))/4;
const TWO_COLLAPSED_CARDS_MARGINS = (100 - ((COLLAPSED_CARD_WIDTH * 2) + COLLAPSED_CARDS_DISTANCE)) / 2;

interface CardsShellMobileComponentProps {
    mediaCard: ReactElement,
    commentsCard: ReactElement,
    analyticsCard: ReactElement
};

export const CardsShellMobileComponent = (props: CardsShellMobileComponentProps) => {
    const { mediaCard, commentsCard, analyticsCard } = props;
    const { setMuted } = useContext(muteContext);
    const {setFrozen} = useContext(frozenContext);

    const history = useHistory();
    const query = useQuery();
    const expandedCard = query.get("card")?.toUpperCase() || undefined;

    let orderedCards;

    switch(expandedCard?.toUpperCase()) {
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
    let canSwitchCards = useRef<boolean>(true);

    const createCardElement = (id: string, body: ReactElement, index: number) => {
        const cardShellStyle = {
            height: index === 0 ? "90%" : "7.5%",
            width: index === 0 ? "100%" : `${COLLAPSED_CARD_WIDTH}%`,
            top: index === 0 ? "0" : "91.25%",
            marginLeft: `${index === 0 ? 0 : TWO_COLLAPSED_CARDS_MARGINS + (index === 1 ? 0 : COLLAPSED_CARD_WIDTH + COLLAPSED_CARDS_DISTANCE)}%`
        };
        const cardShellCoverLabelStyle = {
            opacity: index === 0 ? '0' : '1',
            display: index === 0 ? "none" : "unset",
            fontSize: `${window.innerWidth * .035}px`
        };
        const cardShellCoverStyle = {
            opacity: index === 0 ? "0" : "1",
            display: index === 0 ? "none" : "unset"
        };
        return (
            <div key={id} id={id} className="card-shell" style={cardShellStyle}>
            <div id={`${id}-label`} className="card-shell-cover-label" style={cardShellCoverLabelStyle}>{id}</div>
            <div id={`${id}-cover`} className="card-shell-cover" style={cardShellCoverStyle} onClick={() => {selectCard(index)}}></div>
                {body}
            </div>
        );
    };

    const mediaCardElement = createCardElement(mediaCardId, React.cloneElement(mediaCard, { shown: positions.current[0] === mediaCardId }), positions.current.indexOf(mediaCardId));
    const commentsCardElement = createCardElement(commentsCardId, commentsCard, positions.current.indexOf(commentsCardId));
    const analyticsCardElement = createCardElement(analyticsCardId, analyticsCard, positions.current.indexOf(analyticsCardId));

    const selectCard = (selectedIndex: number) => {
        if (canSwitchCards.current) {
            canSwitchCards.current = false;
            setFrozen(true);
            if (positions.current[0] === mediaCardId) {
                setMuted(true);
            }
            setTimeout(function() {
                makeRoom(selectedIndex, () => {
                    expandSelected(selectedIndex, () => {
                        canSwitchCards.current = true;
                    });
                }); 
            }, 0);
        }
    }

    const getCardIdsFromPositions = () => {
        return [positions.current[0], positions.current[1], positions.current[2]];
    }

    const makeRoom = (selectedIndex: number, onfinish: () => void) => {
        const [positionZeroCardId, positionOneCardId, positionTwoCardId] = getCardIdsFromPositions();

        const expandedCard = document.getElementById(positionZeroCardId);
        const leftCollapsedCard = document.getElementById(positionOneCardId);
        const rightCollapsedCard = document.getElementById(positionTwoCardId);

        const expandedCardCover = document.getElementById(positionZeroCardId + "-cover");
        const expandedCardLabel = document.getElementById(positionZeroCardId + "-label");

        if (expandedCard && expandedCardCover && expandedCardLabel && leftCollapsedCard && rightCollapsedCard) {
            const marginLeftDifference = (selectedIndex === 1 ? COLLAPSED_CARDS_DISTANCE : COLLAPSED_CARD_WIDTH + (COLLAPSED_CARDS_DISTANCE * 2)) - TWO_COLLAPSED_CARDS_MARGINS;

            const expandedCardMarginLeft = `${selectedIndex === 1 ? (COLLAPSED_CARDS_DISTANCE * 3) + (COLLAPSED_CARD_WIDTH * 2) : COLLAPSED_CARDS_DISTANCE}%`;
            const leftCollapsedCardMarginLeft = `${parseInt(leftCollapsedCard.style.marginLeft) + marginLeftDifference}%`;
            const rightCollapsedCardMarginLeft = `${parseInt(rightCollapsedCard.style.marginLeft) + marginLeftDifference}%`;

            expandedCardCover.style.display = "unset";
            expandedCardLabel.style.display = "unset";

            expandedCard.animate([
                {
                    height: "7.5%",
                    width: `${COLLAPSED_CARD_WIDTH}%`,
                    top: "91.25%",
                    marginLeft: expandedCardMarginLeft
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER,
                }
            ).onfinish = () => {
                expandedCard.style.height = "7.5%";
                expandedCard.style.width = `${COLLAPSED_CARD_WIDTH}%`;
                expandedCard.style.top = "91.25%";
                expandedCard.style.marginLeft = expandedCardMarginLeft;

                onfinish();
            };

            expandedCardCover.animate([
                {
                    opacity: "1"
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER,
                }
            ).onfinish = () => {
                expandedCardCover.style.opacity = "1";
            };

            expandedCardLabel.animate([
                {
                    opacity: "1"
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER,
                }
            ).onfinish = () => {
                expandedCardLabel.style.opacity = "1";
            };

            leftCollapsedCard.animate([
                {
                    marginLeft: leftCollapsedCardMarginLeft
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER,
                }
            ).onfinish = () => {
                leftCollapsedCard.style.marginLeft = leftCollapsedCardMarginLeft;
            };

            rightCollapsedCard.animate([
                {
                    marginLeft: rightCollapsedCardMarginLeft
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER,
                }
            ).onfinish = () => {
                rightCollapsedCard.style.marginLeft = rightCollapsedCardMarginLeft;
            };
        }
    }

    const expandSelected = (selectedIndex: number, onfinish: () => void) => {
        const [positionZeroCardId, positionOneCardId, positionTwoCardId] = getCardIdsFromPositions();

        const prevExpandedCard = document.getElementById(positionZeroCardId);
        const prevLeftCollapsedCard = document.getElementById(positionOneCardId);
        const prevRightCollapsedCard = document.getElementById(positionTwoCardId);

        const selectedCardId = selectedIndex === 1 ? positionOneCardId : positionTwoCardId;
        const selectedCardCover = document.getElementById(selectedCardId + "-cover");
        const selectedCardLabel = document.getElementById(selectedCardId + "-label");

        if (prevExpandedCard && prevLeftCollapsedCard && prevRightCollapsedCard && selectedCardCover && selectedCardLabel) {
            const newLeftCollapsedCardMarginLeft = `${TWO_COLLAPSED_CARDS_MARGINS}%`;
            const newRightCollapsedCardMarginLeft = `${TWO_COLLAPSED_CARDS_MARGINS + COLLAPSED_CARD_WIDTH + COLLAPSED_CARDS_DISTANCE}%`;
            const newPrevExpandedCardMarginLeft = selectedIndex === 1 ? newRightCollapsedCardMarginLeft : newLeftCollapsedCardMarginLeft;

            if (selectedIndex === 1) {
                prevRightCollapsedCard.animate([
                    {
                        marginLeft: newLeftCollapsedCardMarginLeft
                    }
                    ], {
                        duration: DURATION,
                        easing: EASEAPART,
                    }
                ).onfinish = () => {
                    prevRightCollapsedCard.style.marginLeft = newLeftCollapsedCardMarginLeft;
                };

                prevLeftCollapsedCard.animate([
                    {
                        height: "90%",
                        width: "100%",
                        top: "0",
                        marginLeft: "0"
                    }
                    ], {
                        duration: DURATION,
                        easing: EASEAPART,
                    }
                ).onfinish = () => {
                    prevLeftCollapsedCard.style.height = "90%";
                    prevLeftCollapsedCard.style.width = "100%";
                    prevLeftCollapsedCard.style.top = "0";
                    prevLeftCollapsedCard.style.marginLeft = "0";

                    const first = positions.current[0];
                    positions.current.shift();
                    positions.current.push(first);

                    setCardQueryParam(history, query, positionOneCardId.toLowerCase());
                };
            } else if (selectedIndex === 2) {
                prevLeftCollapsedCard.animate([
                    {
                        marginLeft: newRightCollapsedCardMarginLeft
                    }
                    ], {
                        duration: DURATION,
                        easing: EASEAPART,
                    }
                ).onfinish = () => {
                    prevLeftCollapsedCard.style.marginLeft = newRightCollapsedCardMarginLeft;
                };

                prevRightCollapsedCard.animate([
                    {
                        height: "90%",
                        width: "100%",
                        top: "0",
                        marginLeft: "0"
                    }
                    ], {
                        duration: DURATION,
                        easing: EASEAPART,
                    }
                ).onfinish = () => {
                    prevRightCollapsedCard.style.height = "90%";
                    prevRightCollapsedCard.style.width = "100%";
                    prevRightCollapsedCard.style.top = "0";
                    prevRightCollapsedCard.style.marginLeft = "0";

                    const last = positions.current[positions.current.length - 1];
                    positions.current.pop();
                    positions.current.unshift(last);

                    setCardQueryParam(history, query, positionTwoCardId.toLowerCase());
                };
            }

            selectedCardCover.animate([
                {
                    opacity: "0"
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER,
                }
            ).onfinish = () => {
                selectedCardCover.style.opacity = "0";
                selectedCardCover.style.display = "none";

                if (selectedCardId === mediaCardId) {
                    setFrozen(false);
                }
            };

            selectedCardLabel.animate([
                {
                    opacity: "0"
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER,
                }
            ).onfinish = () => {
                selectedCardLabel.style.opacity = "0";
                selectedCardLabel.style.display = "none";
            };

            prevExpandedCard.animate([
                {
                    marginLeft: newPrevExpandedCardMarginLeft
                }
                ], {
                    duration: DURATION,
                    easing: EASEAPART,
                }
            ).onfinish = () => {
                prevExpandedCard.style.marginLeft = newPrevExpandedCardMarginLeft;
                
                onfinish();
            };
        }
    }

    return (
        <div id="cards-shell" className="cards-shell" children={[mediaCardElement, commentsCardElement, analyticsCardElement]}/>
    );
}