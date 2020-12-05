import React, { useEffect, useRef, ReactElement, useState } from 'react';
import './cards-shell.css';
import { useQuery } from '../../hooks/useQuery';
import { 
    useHistory,
} from "react-router-dom";
import { setCardQueryParam, setExpandedQuery } from '../../utils';

// type imports

// styles

const x1 = .25, y1 = .1, x2 = .25, y2 = 1;
const x1r = 1-x2, y1r = 1-y2, x2r = 1-x1, y2r = 1-y1;

const DURATION = 300;
const EASEAPART = `cubic-bezier(${x1},${y1},${x2},${y2})`;
const EASECLOSER = `cubic-bezier(${x1r},${y1r},${x2r},${y2r})`;

export const mediaCardId = "CANVAS";
export const commentsCardId = "ARGUMENTS";
export const analyticsCardId = "ANALYTICS";

interface CardsShellMobileComponentProps {
    mediaCard: ReactElement,
    commentsCard: ReactElement,
    analyticsCard: ReactElement
};

export const CardsShellMobileComponent = (props: CardsShellMobileComponentProps) => {
    const { mediaCard, commentsCard, analyticsCard } = props;

    const history = useHistory();
    const query = useQuery();
    const topCard = query.get("card") || undefined;
    const isExpanded = query.get("expanded");

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
    let canExpand = useRef<boolean>(false);

    const cardExpanded = (cardId: string) => {
        return isExpanded === "true" && topCard === cardId.toLowerCase();
    }

    const createCardElement = (id: string, body: ReactElement, index: number) => {
        const isCardExpanded = cardExpanded(id);
        return (
            <div key={id} id={id} className="card-shell" style={{zIndex: 2 - index, height: isCardExpanded ? "100%" : "50%", width: isCardExpanded ? "100%" : "75%", top: isCardExpanded ? "0" : "25%", marginLeft: isCardExpanded ? "-12.5%" : "unset", borderRadius: isCardExpanded ? "25px 25px 0 0" : "25px"}} onClick={() => {expandCard(index, id)}} onDoubleClick={() => {collapseCard(index, id)}}>
            <div id={`${id}-label`} className="card-shell-cover-label" style={{display: isCardExpanded ? "none" : "unset"}}>{id}</div>
            <div id={`${id}-cover`} className="card-shell-cover" style={{opacity: isCardExpanded ? "0" : index === 0 ? '0.75' : '1', display: isCardExpanded ? "none" : "unset"}} onClick={() => {selectCard(index, id)}}></div>
            {body}
            </div>
        );
    };

    const mediaCardElement = createCardElement(mediaCardId, React.cloneElement(mediaCard, { shown: positions.current[0] === mediaCardId }), positions.current.indexOf(mediaCardId));
    const commentsCardElement = createCardElement(commentsCardId, commentsCard, positions.current.indexOf(commentsCardId));
    const analyticsCardElement = createCardElement(analyticsCardId, analyticsCard, positions.current.indexOf(analyticsCardId));

    useEffect(() => {
        setTimeout(() => {
            setCards();
        }, 300); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setCardDragging(); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const setCardDragging = () => {
        const draggableCard = document.getElementById(positions.current[0]);
        const topCard = document.getElementById(positions.current[1]);
        const bottomCard = document.getElementById(positions.current[2]);

        const draggableCover = document.getElementById(`${positions.current[0]}-cover`);
        const topCover = document.getElementById(`${positions.current[1]}-cover`);
        const bottomCover = document.getElementById(`${positions.current[2]}-cover`);

        const topLabel = document.getElementById(`${positions.current[1]}-label`);
        const bottomLabel = document.getElementById(`${positions.current[2]}-label`);

        if (draggableCard && topCard && bottomCard && draggableCover && topCover && bottomCover && topLabel && bottomLabel) {
            if (!cardExpanded(positions.current[0])) {
                let swipeDet = {
                    sX: 0,
                    sY: 0,
                    eX: 0,
                    eY: 0
                }

                draggableCard.ontouchstart = (e: TouchEvent) => {
                    canFlip.current = false;
                    const t = e.touches[0]
                    swipeDet.sX = t.screenX;
                    swipeDet.sY = t.screenY;
                    swipeDet.eX = t.screenX;
                    swipeDet.eY = t.screenY;
                }
    
                draggableCard.ontouchmove = (e: TouchEvent) => {
                    const prevY = swipeDet.eY;
                    const t = e.touches[0]
                    swipeDet.eX = t.screenX;
                    swipeDet.eY = t.screenY;
                    const deltaX = Math.abs(swipeDet.eX - swipeDet.sX);
                    const deltaY = Math.abs(swipeDet.eY - swipeDet.sY);

                    if (deltaY > (deltaX)/2) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const currentY = swipeDet.eY;
                        const partialScreenRatio = (prevY - currentY) / window.innerHeight;
                        draggableCard.style.top = `${Math.max(0, Math.min(50, parseFloat(draggableCard.style.top) - (partialScreenRatio * 100)))}%`;
                        topCard.style.top = `${12.5 - ((parseFloat(draggableCard.style.top) - 25) / 2)}%`;
                        bottomCard.style.top = `${37.5 + ((25 - parseFloat(draggableCard.style.top)) / 2)}%`;
    
                        const draggedRatio = (parseFloat(draggableCard.style.top) - 25) / 25;
    
                        topCard.style.zIndex = `${draggedRatio > 0 ? 1 : 0}`;
                        bottomCard.style.zIndex = `${draggedRatio < 0 ? 1 : 0}`;
    
                        draggableCard.style.transform = `scale(${1 -  Math.abs(draggedRatio * .05)})`;
                        topCard.style.transform = `scale(${draggedRatio > 0 ? .9 + (draggedRatio * .05) : .9})`;
                        bottomCard.style.transform = `scale(${draggedRatio < 0 ? .9 - (draggedRatio * .05) : .9})`;
    
                        draggableCover.style.opacity = `${.75 + Math.abs(draggedRatio * .125)}`;
                        topCover.style.opacity = `${draggedRatio > 0 ? 1 - Math.abs(draggedRatio * .125) : 1}`;
                        bottomCover.style.opacity = `${draggedRatio < 0 ? 1 - Math.abs(draggedRatio * .125): 1}`;
    
                        topLabel.style.top = `${draggedRatio > 0 ? 5 + Math.abs(draggedRatio * 45) : 5}%`;
                        bottomLabel.style.top = `${draggedRatio < 0 ? 85 - Math.abs(draggedRatio * 35) : 85}%`;
                    }
                }
    
                draggableCard.ontouchend = () => {
                    const cardTop = parseFloat(draggableCard.style.top);
                    if (cardTop > 25) {
                        if (cardTop === 50) {
                            draggableCard.style.zIndex = "1";
                            topCard.style.zIndex = '2';
                            bottomLabel.style.top = "5%";
    
                            const cardId = positions.current[1];
                            setCardQueryParam(history, query, cardId.toLowerCase());
    
                            rotate(cardId, () => {
                                canFlip.current = true;
                                setState(prevState => ({ ...prevState }));
                            });
                        } else {
                            const duration = ((cardTop - 25) / 25) * DURATION;
                            setCards(duration);
                        }
                    } else if (cardTop < 25) {
                        if (cardTop === 0) {
                            draggableCard.style.zIndex = "1";
                            bottomCard.style.zIndex = '2';
                            topLabel.style.top = "85%";
    
                            const cardId = positions.current[2];
                            setCardQueryParam(history, query, cardId.toLowerCase());
    
                            rotate(cardId, () => {
                                canFlip.current = true;
                                setState(prevState => ({ ...prevState }));
                            });
                        } else {
                            const duration = ((25 - cardTop) / 25) * DURATION;
                            setCards(duration);
                        }
                    } else {
                        setCards(0);
                    }
                }
            } else {
                draggableCard.ontouchstart = undefined;
                draggableCard.ontouchmove = undefined;
                draggableCard.ontouchend = undefined;
            }

            topCard.ontouchstart = undefined;
            bottomCard.ontouchstart = undefined;

            topCard.ontouchmove = undefined;
            bottomCard.ontouchmove = undefined;

            topCard.ontouchend = undefined;
            bottomCard.ontouchend = undefined;
        }
    }

    const setCards = (duration: number | null = null) => {
        const frontCard = document.getElementById(positions.current[0]);
        const topCard = document.getElementById(positions.current[1]);
        const bottomCard = document.getElementById(positions.current[2]);

        const frontCardCover = document.getElementById(`${positions.current[0]}-cover`);
        const topCardCover = document.getElementById(`${positions.current[1]}-cover`);
        const bottomCardCover = document.getElementById(`${positions.current[2]}-cover`);

        const topCardLabel = document.getElementById(`${positions.current[1]}-label`);
        const bottomCardLabel = document.getElementById(`${positions.current[2]}-label`);

        if (frontCard && topCard && bottomCard && frontCardCover && topCardCover && bottomCardCover && topCardLabel && bottomCardLabel) {
            const frontCardTop = cardExpanded(positions.current[0]) ? "0" : "25%";
            const usedDuration = duration !== null ? duration : DURATION;
            
            frontCard.animate([
                {
                    top: frontCardTop,
                    transform:'scale(1)'
                }
                ], {
                    duration: usedDuration,
                    easing: EASEAPART,
                }).onfinish = () => {
                    frontCard.style.top = frontCardTop;
                    frontCard.style.transform = "scale(1)";
                    topCard.style.top = "12.5%";
                    topCard.style.transform = "scale(.9)";
                    bottomCard.style.top = "37.5%";
                    bottomCard.style.transform = "scale(.9)";

                    frontCardCover.style.opacity = ".75";
                    topCardCover.style.opacity = "1";
                    bottomCardCover.style.opacity = "1";

                    topCardLabel.style.top = "5%";
                    bottomCardLabel.style.top = "85%";

                    canFlip.current = true;
                    canExpand.current = true;
                };

            frontCardCover.animate([
                {
                    opacity: ".75",
                }
                ], {
                    duration: usedDuration,
                    easing: EASEAPART,
                });

            topCard.animate([
                {
                    top: "12.5%",
                    transform:'scale(.9)'
                }
                ], {
                    duration: usedDuration,
                    easing: EASEAPART
                });

            topCardCover.animate([
                {
                    opacity: "1",
                }
                ], {
                    duration: usedDuration,
                    easing: EASEAPART,
                });

            topCardLabel.animate([
                {
                    top: "5%"
                }
                ], {
                    duration: usedDuration,
                    easing: EASEAPART,
                });

            bottomCard.animate([
                {
                    top: "37.5%",
                    transform:'scale(.9)'
                }
                ], {
                    duration: usedDuration,
                    easing: EASEAPART
                });

            bottomCardCover.animate([
                {
                    opacity: "1",
                }
                ], {
                    duration: usedDuration,
                    easing: EASEAPART,
                });
            
            bottomCardLabel.animate([
                {
                    top: "85%"
                }
                ], {
                    duration: usedDuration,
                    easing: EASEAPART,
                });
        }
    }

    const selectCard = (index: number, cardId: string) => {
        if (index !== 0 && canFlip.current) {
            setCardQueryParam(history, query, cardId.toLowerCase());
            canFlip.current = false;
            canExpand.current = false;
            makeRoom(cardId, () => {
                rotate(cardId, () => {
                    canFlip.current = true;
                    canExpand.current = true;
                    setState(prevState => ({ ...prevState }));
                });
            });
        }
    };

    const expandCard = (index: number, id: string) => {
        if (index === 0 && !cardExpanded(id) && canExpand.current) {
            const currentCardCover = document.getElementById(`${id}-cover`);
            const currentCardCoverLabel = document.getElementById(`${id}-label`);
            const currentCard = document.getElementById(id);
            
            if (currentCardCover && currentCardCoverLabel && currentCard) {
                currentCardCoverLabel.style.display = "none";

                currentCardCover.animate([
                    {
                        opacity: "0"
                    }
                    ], {
                        duration: DURATION,
                        easing: EASEAPART,
                    });

                currentCard.animate([
                    {
                        height: "100%",
                        width: "100%",
                        top: "0",
                        marginLeft: "-12.5%",
                        borderRadius: "25px 25px 0 0",
                    }
                    ], {
                        duration: DURATION,
                        easing: EASEAPART,
                    }).onfinish = () => {
                        currentCardCover.style.opacity = "0";
                        currentCardCover.style.display = 'none';

                        currentCard.style.height = "100%";
                        currentCard.style.width = "100%";
                        currentCard.style.top = "0";
                        currentCard.style.marginLeft = "-12.5%";
                        currentCard.style.borderRadius= "25px 25px 0 0";

                        setExpandedQuery(history, query, true);
                    };
            }
        }
    }

    const collapseCard = (index: number, id: string) => {
        if (index === 0 && cardExpanded(id)) {
            const currentCardCover = document.getElementById(`${id}-cover`);
            const currentCardCoverLabel = document.getElementById(`${id}-label`);
            const currentCard = document.getElementById(id);
            
            if (currentCardCover && currentCardCoverLabel && currentCard) {
                currentCardCover.style.display = 'unset';
                
                currentCardCover.animate([
                    {
                        opacity: "0.75"
                    }
                    ], {
                        duration: DURATION,
                        easing: EASEAPART
                    });

                currentCard.animate([
                    {
                        height: "50%",
                        width: "75%",
                        top: "25%",
                        marginLeft: "0",
                        borderRadius: "25px",
                    }
                    ], {
                        duration: DURATION,
                        easing: EASEAPART
                    }).onfinish = () => {
                        currentCardCover.style.opacity = "0.75";

                        currentCard.style.height = "50%";
                        currentCard.style.width = "75%";
                        currentCard.style.top = "25%";
                        currentCard.style.marginLeft = "0";
                        currentCard.style.borderRadius= "25px";

                        currentCardCoverLabel.style.display = "unset";

                        setExpandedQuery(history, query, false);
                    };
            }
        }
    }

    const makeRoom = (cardId: string, onfinish: () => void) => {
        const selectedPosition = positions.current.indexOf(cardId);
        const selectedCard = document.getElementById(cardId);
        const frontCard = document.getElementById(positions.current[0]);
        const backCard = document.getElementById(positions.current[selectedPosition === 1 ? 2 : 1]);

        const selectedCover = document.getElementById(`${cardId}-cover`);
        const frontCover = document.getElementById(`${positions.current[0]}-cover`);

        const selectedLabel = document.getElementById(`${cardId}-label`);

        if (selectedCard && frontCard && backCard && selectedCover && frontCover && selectedLabel) {
            backCard.style.zIndex = '0';
            selectedCard.style.zIndex = '1';

            frontCard.animate([
                {
                    top: `${selectedPosition === 1 ? 50 : 0}%`,
                    transform: 'scale(.95)'
                }
                ], {
                    duration: DURATION,
                    easing: EASEAPART
                });

            frontCover.animate([
                {
                    opacity: "0.875"
                }
                ], {
                    duration: DURATION,
                    easing: EASEAPART
                });
            
            backCard.animate([
                {
                    top: "25%",
                }
                ], {
                    duration: DURATION,
                    easing: EASEAPART
                });

            selectedCard.animate([
                {
                    top: `${selectedPosition === 1 ? 0 : 50}%`,
                    transform: 'scale(.95)'
                }
                ], {
                    duration: DURATION,
                    easing: EASEAPART
                }).onfinish = () => {
                    frontCard.style.top = `${selectedPosition === 1 ? 50 : 0}%`;
                    frontCard.style.transform = "scale(.95)";
                    frontCard.style.zIndex = "1";

                    frontCover.style.opacity = "0.875";

                    backCard.style.top = "25%";
                    
                    selectedCard.style.top = `${selectedPosition === 1 ? 0 : 50}%`;
                    selectedCard.style.transform = "scale(.95)";
                    selectedCard.style.zIndex = "2";

                    selectedCover.style.opacity = "0.875";

                    selectedLabel.style.top = "50%";

                    onfinish();
                };

            selectedCover.animate([
                {
                    opacity: "0.875"
                }
                ], {
                    duration: DURATION,
                    easing: EASEAPART
                });

            selectedLabel.animate([
                {
                    top: "50%",
                }
                ], {
                    duration: DURATION,
                    easing: EASEAPART
                });
        }
    };

    const rotate = (cardId: string, onfinish: () => void) => {
        const selectedPosition = positions.current.indexOf(cardId);
        const selectedCard = document.getElementById(cardId);
        const frontCard = document.getElementById(positions.current[0]);
        const backCard = document.getElementById(positions.current[selectedPosition === 1 ? 2 : 1]);

        const selectedCover = document.getElementById(`${cardId}-cover`);
        const frontCover = document.getElementById(`${positions.current[0]}-cover`);

        const frontLabel = document.getElementById(`${positions.current[0]}-label`);
        const backLabel = document.getElementById(`${positions.current[selectedPosition === 1 ? 2 : 1]}-label`);

        if (selectedCard && frontCard && backCard && selectedCover && frontCover && frontLabel && backLabel) {
            frontCard.animate([
                {
                    top: `${selectedPosition === 1 ? 37.5 : 12.5}%`,
                    transform:'scale(.9)'
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER
                });

            frontCover.animate([
                {
                    opacity: "1"
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER
                });

            frontLabel.animate([
                {
                    top: `${selectedPosition === 1 ? 85 : 5}%`
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER
                });
            
            backCard.animate([
                {
                    top: `${selectedPosition === 1 ? 12.5 : 37.5}%`,
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER
                });

            selectedCard.animate([
                {
                    top: "25%",
                    transform:'scale(1)'
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER
                }).onfinish = () => {
                    frontCard.style.top = `${selectedPosition === 1 ? 37.5 : 12.5}%`;
                    frontCard.style.transform = "scale(.9)";

                    frontCover.style.opacity = "1";

                    frontLabel.style.top = `${selectedPosition === 1 ? 85 : 5}%`;

                    backCard.style.top = `${selectedPosition === 1 ? 12.5 : 37.5}%`;

                    backLabel.style.top = `${selectedPosition === 1 ? 5 : 85}%`;
                    
                    selectedCard.style.top = "25%";
                    selectedCard.style.transform = "scale(1)";

                    selectedCover.style.opacity = ".75";

                    if (selectedPosition === 1) {
                        const first = positions.current[0];
                        positions.current.shift();
                        positions.current.push(first);
                    } else {
                        const last = positions.current[positions.current.length - 1];
                        positions.current.pop();
                        positions.current.unshift(last);
                    }

                    onfinish();
                };

            selectedCover.animate([
                {
                    opacity: "0.75"
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER
                });
        }
    };

    return (
        <div id="cards-shell" className="cards-shell" children={[mediaCardElement, commentsCardElement, analyticsCardElement]}/>
    );
}