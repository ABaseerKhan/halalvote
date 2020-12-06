import React, { useEffect, useRef, ReactElement, useState, useContext } from 'react';
import './cards-shell.css';
import { useQuery } from '../../hooks/useQuery';
import { 
    useHistory,
} from "react-router-dom";
import { setCardQueryParam, setExpandedQuery } from '../../utils';
import { muteContext } from '../app-shell';

// type imports

// styles

const x1 = .25, y1 = .1, x2 = .25, y2 = 1;
const x1r = 1-x2, y1r = 1-y2, x2r = 1-x1, y2r = 1-y1;

const DURATION = 300;
const EASEAPART = `cubic-bezier(${x1},${y1},${x2},${y2})`;
const EASECLOSER = `cubic-bezier(${x1r},${y1r},${x2r},${y2r})`;

const BACK_COVER_OPACITY = 1;
const FRONT_COVER_OPACITY = .5;
const COVER_OPACITY_STEP = .25;

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
    const { setMuted } = useContext(muteContext);

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
    let canSelectCard = useRef<boolean>(false);
    let canDragCard = useRef<boolean>(false);
    let canExpandCard = useRef<boolean>(false);

    const cardExpanded = (cardId: string) => {
        return isExpanded === "true" && topCard === cardId.toLowerCase();
    }

    const createCardElement = (id: string, body: ReactElement, index: number) => {
        const isCardExpanded = cardExpanded(id);
        return (
            <div key={id} id={id} className="card-shell" style={{zIndex: 2 - index, height: isCardExpanded ? "100%" : "50%", width: isCardExpanded ? "100%" : "75%", top: isCardExpanded ? "0" : "25%", marginLeft: isCardExpanded ? "-12.5%" : "unset", borderRadius: isCardExpanded ? "25px 25px 0 0" : "25px"}} onClick={() => {expandCard(index, id)}} onDoubleClick={() => {collapseCard(index, id)}}>
            <div id={`${id}-label`} className="card-shell-cover-label" style={{opacity: index === 0 ? '0' : '1', display: isCardExpanded ? "none" : "unset"}}>{id}</div>
            <div id={`${id}-cover`} className="card-shell-cover" style={{opacity: isCardExpanded ? "0" : index === 0 ? `${FRONT_COVER_OPACITY}` : `${BACK_COVER_OPACITY}`, display: isCardExpanded ? "none" : "unset"}} onClick={() => {selectCard(index, id)}}></div>
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

        const draggableLabel = document.getElementById(`${positions.current[0]}-label`);
        const topLabel = document.getElementById(`${positions.current[1]}-label`);
        const bottomLabel = document.getElementById(`${positions.current[2]}-label`);

        if (draggableCard && topCard && bottomCard && draggableCover && topCover && bottomCover && draggableLabel && topLabel && bottomLabel) {
            if (!cardExpanded(positions.current[0])) {
                let swipeDet = {
                    sX: 0,
                    sY: 0,
                    e1X: 0,
                    e1Y: 0,
                    e1Milliseconds: 0,
                    e2X: 0,
                    e2Y: 0,
                    e2Milliseconds: 0
                }
                let correctDirection: boolean | undefined = undefined;

                draggableCard.ontouchstart = (e: TouchEvent) => {
                    if (canDragCard.current) {
                        canSelectCard.current = false;
                        canExpandCard.current = false;
    
                        const milliseconds = new Date().getMilliseconds();
                        const t = e.touches[0];
    
                        swipeDet.sX = t.screenX;
                        swipeDet.sY = t.screenY;
    
                        swipeDet.e1X = t.screenX;
                        swipeDet.e1Y = t.screenY;
                        swipeDet.e1Milliseconds = milliseconds;
    
                        swipeDet.e2X = t.screenX;
                        swipeDet.e2Y = t.screenY;
                        swipeDet.e2Milliseconds = milliseconds;
                    }
                }
    
                draggableCard.ontouchmove = (e: TouchEvent) => {
                    if (canDragCard.current) {
                        swipeDet.e1X = swipeDet.e2X;
                        swipeDet.e1Y = swipeDet.e2Y;
                        swipeDet.e1Milliseconds = swipeDet.e2Milliseconds;
    
                        const t = e.touches[0];
                        swipeDet.e2X = t.screenX;
                        swipeDet.e2Y = t.screenY;
                        swipeDet.e2Milliseconds = new Date().getMilliseconds();
    
                        if (correctDirection === undefined) {
                            const deltaX = Math.abs(swipeDet.e2X - swipeDet.sX);
                            const deltaY = Math.abs(swipeDet.e2Y - swipeDet.sY);
                            correctDirection = deltaY > (deltaX)/2;
                        }
    
                        if (correctDirection) {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            const currentY = swipeDet.e2Y;
                            const partialScreenRatio = (swipeDet.e1Y - currentY) / window.innerHeight;
                            draggableCard.style.top = `${Math.max(0, Math.min(50, parseFloat(draggableCard.style.top) - (partialScreenRatio * 100)))}%`;
                            topCard.style.top = `${12.5 - ((parseFloat(draggableCard.style.top) - 25) / 2)}%`;
                            bottomCard.style.top = `${37.5 + ((25 - parseFloat(draggableCard.style.top)) / 2)}%`;
        
                            const draggedRatio = (parseFloat(draggableCard.style.top) - 25) / 25;
        
                            topCard.style.zIndex = `${draggedRatio > 0 ? 1 : 0}`;
                            bottomCard.style.zIndex = `${draggedRatio < 0 ? 1 : 0}`;
        
                            draggableCard.style.transform = `scale(${1 -  Math.abs(draggedRatio * .05)})`;
                            topCard.style.transform = `scale(${draggedRatio > 0 ? .9 + (draggedRatio * .05) : .9})`;
                            bottomCard.style.transform = `scale(${draggedRatio < 0 ? .9 - (draggedRatio * .05) : .9})`;
        
                            draggableCover.style.opacity = `${FRONT_COVER_OPACITY + Math.abs(draggedRatio * COVER_OPACITY_STEP)}`;
                            topCover.style.opacity = `${draggedRatio > 0 ? BACK_COVER_OPACITY - Math.abs(draggedRatio * COVER_OPACITY_STEP) : BACK_COVER_OPACITY}`;
                            bottomCover.style.opacity = `${draggedRatio < 0 ? BACK_COVER_OPACITY - Math.abs(draggedRatio * COVER_OPACITY_STEP): BACK_COVER_OPACITY}`;
                            draggableLabel.style.opacity = `${Math.abs(draggedRatio)}`
        
                            topLabel.style.top = `${draggedRatio > 0 ? 5 + Math.abs(draggedRatio * 45) : 5}%`;
                            bottomLabel.style.top = `${draggedRatio < 0 ? 85 - Math.abs(draggedRatio * 35) : 85}%`;
                        }
                    }
                }
    
                draggableCard.ontouchend = () => {
                    if (canDragCard.current && correctDirection) {
                        canDragCard.current = false;

                        const cardTop = parseFloat(draggableCard.style.top);
                        const milliseconds = new Date().getMilliseconds();
                        const acceleration = .0001;
    
                        if (cardTop > 25) {
                            if (swipeDet.e2Y > swipeDet.e1Y && (cardTop !== 50 || (milliseconds - swipeDet.e1Milliseconds) < 50)) {
                                const distanceDiff = ((swipeDet.e2Y - swipeDet.e1Y) / window.innerHeight) * 100;
                                const millisecondsDiff = milliseconds - swipeDet.e1Milliseconds;
                                const velocity = Math.max(0, distanceDiff / millisecondsDiff);
    
                                let duration = velocity / acceleration;
                                let distance = (velocity * duration) - (.5 * (acceleration * (duration ** 2)));
    
                                if (cardTop + distance > 50) {
                                    const overflowRatio = (50 - cardTop) / distance;
                                    duration = duration * overflowRatio;
                                    distance = distance * overflowRatio;
                                }
    
                                const completionRatio = (cardTop + distance - 25) / 25;
    
                                makeRoom(positions.current[1], () => {
                                    if (completionRatio < 1) {
                                        const duration = completionRatio * DURATION;
                                        setCards(duration);
                                    } else {
                                        draggableCard.style.zIndex = "1";
                                        topCard.style.zIndex = '2';
                                        bottomLabel.style.top = "5%";
                
                                        const cardId = positions.current[1];
                                        setCardQueryParam(history, query, cardId.toLowerCase());
                
                                        rotate(cardId, () => {
                                            canSelectCard.current = true;
                                            canDragCard.current = true;
                                            canExpandCard.current = true;

                                            setState(prevState => ({ ...prevState }));
                                        });
                                    }
                                }, duration, completionRatio);
                            } else {
                                const duration = ((cardTop - 25) / 25) * DURATION;
                                setCards(duration);
                            }
                        } else if (cardTop < 25) {
                            if (swipeDet.e2Y < swipeDet.e1Y && (cardTop !== 0 || (milliseconds - swipeDet.e1Milliseconds) < 50)) {
                                const distanceDiff = ((swipeDet.e1Y - swipeDet.e2Y) / window.innerHeight) * 100;
                                const millisecondsDiff = milliseconds - swipeDet.e1Milliseconds;
                                const velocity = Math.max(0, distanceDiff / millisecondsDiff);
    
                                let duration = velocity / acceleration;
                                let distance = (velocity * duration) - (.5 * (acceleration * (duration ** 2)));
    
                                if (distance > cardTop) {
                                    const overflowRatio = cardTop / distance;
                                    duration = duration * overflowRatio;
                                    distance = distance * overflowRatio;
                                }
    
                                const completionRatio = (25 - cardTop + distance) / 25;
    
                                makeRoom(positions.current[2], () => {
                                    if (completionRatio < 1) {
                                        const duration = completionRatio * DURATION;
                                        setCards(duration);
                                    } else {
                                        draggableCard.style.zIndex = "1";
                                        bottomCard.style.zIndex = '2';
                                        topLabel.style.top = "85%";
                
                                        const cardId = positions.current[2];
                                        setCardQueryParam(history, query, cardId.toLowerCase());
                
                                        rotate(cardId, () => {
                                            canSelectCard.current = true;
                                            canDragCard.current = true;
                                            canExpandCard.current = true;

                                            setState(prevState => ({ ...prevState }));
                                        });
                                    }
                                }, duration, completionRatio);
                            } else {
                                const duration = ((25 - cardTop) / 25) * DURATION;
                                setCards(duration);
                            }
                        } else {
                            setCards(0);
                        }
                    } else {
                        canSelectCard.current = true;
                        canExpandCard.current = true;
                    }

                    correctDirection = undefined;
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

    const setCards = (duration: number = DURATION) => {
        const frontCard = document.getElementById(positions.current[0]);
        const topCard = document.getElementById(positions.current[1]);
        const bottomCard = document.getElementById(positions.current[2]);

        const frontCardCover = document.getElementById(`${positions.current[0]}-cover`);
        const topCardCover = document.getElementById(`${positions.current[1]}-cover`);
        const bottomCardCover = document.getElementById(`${positions.current[2]}-cover`);

        const frontCardLabel = document.getElementById(`${positions.current[0]}-label`);
        const topCardLabel = document.getElementById(`${positions.current[1]}-label`);
        const bottomCardLabel = document.getElementById(`${positions.current[2]}-label`);

        if (frontCard && topCard && bottomCard && frontCardCover && topCardCover && bottomCardCover && frontCardLabel && topCardLabel && bottomCardLabel) {
            const frontCardTop = cardExpanded(positions.current[0]) ? "0" : "25%";
            
            frontCard.animate([
                {
                    top: frontCardTop,
                    transform:'scale(1)'
                }
                ], {
                    duration: duration,
                    easing: EASEAPART,
                }).onfinish = () => {
                    frontCard.style.top = frontCardTop;
                    frontCard.style.transform = "scale(1)";
                    topCard.style.top = "12.5%";
                    topCard.style.transform = "scale(.9)";
                    bottomCard.style.top = "37.5%";
                    bottomCard.style.transform = "scale(.9)";

                    frontCardCover.style.opacity = `${FRONT_COVER_OPACITY}`;
                    topCardCover.style.opacity = `${BACK_COVER_OPACITY}`;
                    bottomCardCover.style.opacity = `${BACK_COVER_OPACITY}`;
                    frontCardLabel.style.opacity = "0";

                    topCardLabel.style.top = "5%";
                    bottomCardLabel.style.top = "85%";

                    canSelectCard.current = true;
                    canDragCard.current = true;
                    canExpandCard.current = true;
                };

            frontCardCover.animate([
                {
                    opacity: `${FRONT_COVER_OPACITY}`,
                }
                ], {
                    duration: duration,
                    easing: EASEAPART,
                });
            
            frontCardLabel.animate([
                {
                    opacity: "0",
                }
                ], {
                    duration: duration,
                    easing: EASEAPART,
                });

            topCard.animate([
                {
                    top: "12.5%",
                    transform:'scale(.9)'
                }
                ], {
                    duration: duration,
                    easing: EASEAPART
                });

            topCardCover.animate([
                {
                    opacity: `${BACK_COVER_OPACITY}`,
                }
                ], {
                    duration: duration,
                    easing: EASEAPART,
                });

            topCardLabel.animate([
                {
                    top: "5%"
                }
                ], {
                    duration: duration,
                    easing: EASEAPART,
                });

            bottomCard.animate([
                {
                    top: "37.5%",
                    transform:'scale(.9)'
                }
                ], {
                    duration: duration,
                    easing: EASEAPART
                });

            bottomCardCover.animate([
                {
                    opacity: `${BACK_COVER_OPACITY}`,
                }
                ], {
                    duration: duration,
                    easing: EASEAPART,
                });
            
            bottomCardLabel.animate([
                {
                    top: "85%"
                }
                ], {
                    duration: duration,
                    easing: EASEAPART,
                });
        }
    }

    const selectCard = (index: number, cardId: string) => {
        if (index !== 0 && canSelectCard.current) {
            canSelectCard.current = false;
            canDragCard.current = false;
            canExpandCard.current = false;

            setCardQueryParam(history, query, cardId.toLowerCase());
            makeRoom(cardId, () => {
                rotate(cardId, () => {
                    canSelectCard.current = true;
                    canDragCard.current = true;
                    canExpandCard.current = true;

                    setState(prevState => ({ ...prevState }));
                });
            });
        }
    };

    const expandCard = (index: number, id: string) => {
        if (index === 0 && !cardExpanded(id) && canExpandCard.current) {
            if(id===mediaCardId) setMuted(false);
            canSelectCard.current = false;
            canDragCard.current = false;
            canExpandCard.current = false;

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

                        canSelectCard.current = true;
                        canDragCard.current = true;
                        canExpandCard.current = true;
                    };
            }
        }
    }

    const collapseCard = (index: number, id: string) => {
        if (index === 0 && cardExpanded(id)) {
            setMuted(true);
            canSelectCard.current = false;
            canDragCard.current = false;
            canExpandCard.current = false;
            
            const currentCardCover = document.getElementById(`${id}-cover`);
            const currentCardCoverLabel = document.getElementById(`${id}-label`);
            const currentCard = document.getElementById(id);
            
            if (currentCardCover && currentCardCoverLabel && currentCard) {
                currentCardCover.style.display = 'unset';
                
                currentCardCover.animate([
                    {
                        opacity: `${FRONT_COVER_OPACITY}`
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
                        currentCardCover.style.opacity = `${FRONT_COVER_OPACITY}`;

                        currentCard.style.height = "50%";
                        currentCard.style.width = "75%";
                        currentCard.style.top = "25%";
                        currentCard.style.marginLeft = "0";
                        currentCard.style.borderRadius= "25px";

                        currentCardCoverLabel.style.display = "unset";

                        setExpandedQuery(history, query, false);

                        canSelectCard.current = true;
                        canDragCard.current = true;
                        canExpandCard.current = true;
                    };
            }
        }
    }

    const makeRoom = (cardId: string, onfinish: () => void, duration: number | null = null, completionRatio: number = 1) => {
        const selectedPosition = positions.current.indexOf(cardId);
        const selectedCard = document.getElementById(cardId);
        const frontCard = document.getElementById(positions.current[0]);
        const backCard = document.getElementById(positions.current[selectedPosition === 1 ? 2 : 1]);

        const selectedCover = document.getElementById(`${cardId}-cover`);
        const frontCover = document.getElementById(`${positions.current[0]}-cover`);

        const frontLabel = document.getElementById(`${positions.current[0]}-label`);
        const selectedLabel = document.getElementById(`${cardId}-label`);

        if (selectedCard && frontCard && backCard && selectedCover && frontCover && frontLabel && selectedLabel) {
            backCard.style.zIndex = '0';
            selectedCard.style.zIndex = '1';

            const usedDuration = duration !== null ? duration : DURATION;
            const easing = duration !== null ? 'cubic-bezier(0, 0, 0, 1)' : EASEAPART;

            const frontCardTop = `${25 + (selectedPosition === 1 ? (25 * completionRatio) : -(25 * completionRatio))}%`;
            const frontCardScale = `scale(${1 - (.05 * completionRatio)})`;
            const frontCoverOpacity = `${FRONT_COVER_OPACITY + (COVER_OPACITY_STEP * completionRatio)}`;
            const frontLabelOpacity = `${1 * completionRatio}`;

            const backCardTop = `${selectedPosition === 1 ? 37.5 - (12.5 * completionRatio) : 12.5 + (12.5 * completionRatio)}%`;

            const selectedCardTop = `${selectedPosition === 1 ? 12.5 - (12.5 * completionRatio) : 37.5 + (12.5 * completionRatio)}%`;
            const selectedCardScale = `scale(${.9 + (.05 * completionRatio)})`;
            const selectedCoverOpacity = `${BACK_COVER_OPACITY - (COVER_OPACITY_STEP * completionRatio)}`;
            const selectedLabelTop = `${selectedPosition === 1 ? 5 + (45 * completionRatio) : 85 - (35 * completionRatio)}%`;

            frontCard.animate([
                {
                    top: frontCardTop,
                    transform: frontCardScale
                }
                ], {
                    duration: usedDuration,
                    easing: easing
                });

            frontCover.animate([
                {
                    opacity: frontCoverOpacity
                }
                ], {
                    duration: usedDuration,
                    easing: easing
                });

            frontLabel.animate([
                {
                    opacity: frontLabelOpacity
                }
                ], {
                    duration: usedDuration,
                    easing: easing
                });
            
            backCard.animate([
                {
                    top: backCardTop,
                }
                ], {
                    duration: usedDuration,
                    easing: easing
                });

            selectedCard.animate([
                {
                    top: selectedCardTop,
                    transform: selectedCardScale
                }
                ], {
                    duration: usedDuration,
                    easing: easing
                }).onfinish = () => {
                    frontCard.style.top = frontCardTop;
                    frontCard.style.transform = frontCardScale;

                    frontCover.style.opacity = frontCoverOpacity;

                    frontLabel.style.opacity = frontLabelOpacity;

                    backCard.style.top = backCardTop;
                    
                    selectedCard.style.top = selectedCardTop;
                    selectedCard.style.transform = selectedCardScale;

                    selectedCover.style.opacity = selectedCoverOpacity;

                    selectedLabel.style.top = selectedLabelTop;

                    if (completionRatio === 1) {
                        frontCard.style.zIndex = "1";
                        selectedCard.style.zIndex = "2";
                    }

                    onfinish();
                };

            selectedCover.animate([
                {
                    opacity: selectedCoverOpacity
                }
                ], {
                    duration: usedDuration,
                    easing: easing
                });

            selectedLabel.animate([
                {
                    top: selectedLabelTop,
                }
                ], {
                    duration: usedDuration,
                    easing: easing
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

        const selectedLabel = document.getElementById(`${cardId}-label`);
        const frontLabel = document.getElementById(`${positions.current[0]}-label`);
        const backLabel = document.getElementById(`${positions.current[selectedPosition === 1 ? 2 : 1]}-label`);

        if (selectedCard && frontCard && backCard && selectedCover && frontCover && selectedLabel && frontLabel && backLabel) {
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
                    opacity: `${BACK_COVER_OPACITY}`
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

                    frontCover.style.opacity = `${BACK_COVER_OPACITY}`;

                    frontLabel.style.top = `${selectedPosition === 1 ? 85 : 5}%`;

                    backCard.style.top = `${selectedPosition === 1 ? 12.5 : 37.5}%`;

                    backLabel.style.top = `${selectedPosition === 1 ? 5 : 85}%`;
                    
                    selectedCard.style.top = "25%";
                    selectedCard.style.transform = "scale(1)";

                    selectedCover.style.opacity = `${FRONT_COVER_OPACITY}`;

                    selectedLabel.style.opacity = "0";

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
                    opacity: `${FRONT_COVER_OPACITY}`
                }
                ], {
                    duration: DURATION,
                    easing: EASECLOSER
                });

            selectedLabel.animate([
                {
                    opacity: "0"
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