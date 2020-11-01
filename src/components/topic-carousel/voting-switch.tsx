import React, { useEffect, useRef } from 'react';
import { useCookies } from 'react-cookie';
import ReactTooltip from 'react-tooltip';

//type imports
import { Judgment } from '../../types';

//style imports
import './voting-switch.css';

type VotingSwitchProps = {
    submitVote: (value: number) => void,
    userVote: number | undefined,
    halalPoints: number | undefined,
    haramPoints: number | undefined,
    numVotes: number | undefined
};
export const VotingSwitch = (props: VotingSwitchProps) => {
    const [cookies] = useCookies(['username', 'sessiontoken']);

    const { username, sessiontoken } = cookies;
    const { submitVote, userVote, halalPoints, haramPoints, numVotes } = props;

    const haramLightsAnimationTimeout = useRef<any>(undefined);
    const halalLightsAnimationTimeout = useRef<any>(undefined);

    useEffect(() => {
        if (userVote === undefined || userVote === 0 || !(username && sessiontoken)) {
            setVote(undefined);
        } else if (userVote < 0) {
            setVote(Judgment.HARAM);
        } else if (userVote > 0) {
            setVote(Judgment.HALAL);
        } // eslint-disable-next-line
    }, [userVote, username, sessiontoken]);

    useEffect(() => {
        if (haramLightsAnimationTimeout.current) {
            clearTimeout(haramLightsAnimationTimeout.current);
        }
        if (halalLightsAnimationTimeout) {
            clearTimeout(halalLightsAnimationTimeout.current);
        }

        const randomBit = Math.floor(Math.random() * 2);

        let haramOffset = randomBit === 0 ? 500 : 0;
        let halalOffset = randomBit === 1 ? 500 : 0;
    
        if (haramPoints !== undefined && halalPoints !== undefined && !isNaN(haramPoints) && !isNaN(halalPoints)) {
            if (haramPoints > halalPoints) {
                haramOffset = 0;
                halalOffset = 500;
            } else if (haramPoints < halalPoints) {
                haramOffset = 500;
                halalOffset = 0;
            }
        }

        const votingAreaLightHaramElementZero = getVotingAreaLightHaramElement(0);
        const votingAreaLightHaramElementOne = getVotingAreaLightHaramElement(1);
        const votingAreaLightHaramElementTwo = getVotingAreaLightHaramElement(2);
    
        setLightAnimations(votingAreaLightHaramElementZero, votingAreaLightHaramElementOne, votingAreaLightHaramElementTwo, 
                                "#9A8FA3", "#B59EC7", "#D0ADEB", haramOffset, Judgment.HARAM);
    
        const votingAreaLightHalalElementZero = getVotingAreaLightHalalElement(0);
        const votingAreaLightHalalElementOne = getVotingAreaLightHalalElement(1);
        const votingAreaLightHalalElementTwo = getVotingAreaLightHalalElement(2);
    
        setLightAnimations(votingAreaLightHalalElementZero, votingAreaLightHalalElementOne, votingAreaLightHalalElementTwo, 
                                "#8D9F9C", "#9BBEB9", "#A9DDD6", halalOffset, Judgment.HALAL);// eslint-disable-next-line
    }, [halalPoints, haramPoints, username, sessiontoken])

    const votingSwitchContainerId = "voting-switch-container";
    const switchId = "voting-switch";
    const votingAreaFilledHaramId = "voting-area-filled-haram";
    const votingAreaFilledHalalId = "voting-area-filled-halal";
    const votingAreaLightHalalId = "voting-area-light-halal";
    const votingAreaLightHaramId = "voting-area-light-haram";

    const getVotingSwitchContainerElement = () => {return document.getElementById(votingSwitchContainerId);}
    const getSwitchElement = () => {return document.getElementById(switchId);}
    const getVotingAreaFilledHaramElement = () => {return document.getElementById(votingAreaFilledHaramId);}
    const getVotingAreaFilledHalalElement = () => {return document.getElementById(votingAreaFilledHalalId);}
    const getVotingAreaLightHaramElement = (index: number) => {return document.getElementById(`${votingAreaLightHaramId}-${index}`);}
    const getVotingAreaLightHalalElement = (index: number) => {return document.getElementById(`${votingAreaLightHalalId}-${index}`);}

    const switchElement = getSwitchElement();
    const votingSwitchContainerElement = getVotingSwitchContainerElement();
    const votingAreaFilledHalalElement = getVotingAreaFilledHalalElement();
    const votingAreaFilledHaramElement = getVotingAreaFilledHaramElement();

    if (switchElement && votingSwitchContainerElement && votingAreaFilledHalalElement && votingAreaFilledHaramElement) {
        let containerRects = votingSwitchContainerElement.getClientRects();
        let dragging = false;

        switchElement.onmousedown = () => {
            dragging = true;
            containerRects = votingSwitchContainerElement.getClientRects();
        }

        document.onmouseup = (e: MouseEvent) => {
            if (dragging && containerRects.length > 0) {
                dragging = false;

                const containerLeft = containerRects[0].x;
                const containerLeftMid = containerLeft + (switchContainerWidth / 4);
                const containerMid = containerLeft + (switchContainerWidth / 2);
                const containerRightMid = containerMid + (switchContainerWidth / 4);
                
                if (e.x <= containerLeftMid) {
                    setVote(Judgment.HARAM);
                } else if (e.x >= containerRightMid) {
                    setVote(Judgment.HALAL);
                } else {
                    setVote(undefined);
                }
            }
        }

        document.onmousemove = (e: MouseEvent) => {
            if (dragging && containerRects.length > 0) {
                displayLights(false);

                const containerLeft = containerRects[0].x;
                const containerLeftMid = containerLeft + (switchContainerWidth / 4);
                const containerMid = containerLeft + (switchContainerWidth / 2);
                const containerRightMid = containerMid + (switchContainerWidth / 4);
                const switchCenterX = e.x - (switchDimension / 2);

                switchElement.style.marginLeft = Math.min(totalSwitchMarginLeft + switchMargins, (Math.max(switchMargins, switchCenterX - containerLeft))) + "px";

                if (e.x > containerMid) {
                    const halalFillWidth = e.x + (switchDimension / 2) + switchMargins - containerMid;

                    votingAreaFilledHalalElement.style.display = "unset";
                    votingAreaFilledHaramElement.style.display = "none";
                    votingAreaFilledHalalElement.style.width = Math.min(switchContainerWidth / 2, halalFillWidth) + "px";

                    if (e.x >= containerRightMid && (!userVote || userVote <= 0)) {
                        dragging = false;
                        vote(Judgment.HALAL);
                    } else if (e.x < containerMid + (switchDimension / 2) && userVote && userVote !== 0) {
                        dragging = false;
                        vote(undefined);
                    }
                } else {
                    const haramFillWidth = containerMid - e.x + (switchDimension / 2) + switchMargins;
                    const haramFillMarginLeft = e.x - (switchDimension / 2) - switchMargins - containerLeft;

                    votingAreaFilledHalalElement.style.display = "none";
                    votingAreaFilledHaramElement.style.display = "unset";
                    votingAreaFilledHaramElement.style.width = Math.min(switchContainerWidth / 2, haramFillWidth) + "px";
                    votingAreaFilledHaramElement.style.marginLeft = Math.max(0, haramFillMarginLeft) + "px";

                    if (e.x <= containerLeftMid && (!userVote || userVote >= 0)) {
                        dragging = false;
                        vote(Judgment.HARAM);
                    } else if (e.x > containerMid - (switchDimension / 2) && userVote && userVote !== 0) {
                        dragging = false;
                        vote(undefined);
                    }
                }
            }
        }
    }

    const setInfiniteFunctionHelper = (fn: () => void, interval: number, judgment: Judgment) => {
        if (judgment === Judgment.HARAM) {
            haramLightsAnimationTimeout.current = setTimeout(() => {
                fn();
                setInfiniteFunctionHelper(fn, interval, Judgment.HARAM);
            }, interval);
        } else if (judgment === Judgment.HALAL) {
            halalLightsAnimationTimeout.current = setTimeout(() => {
                fn();
                setInfiniteFunctionHelper(fn, interval, Judgment.HALAL);
            }, interval);
        }
    }

    const setInfiniteFunction = (fn: () => void, interval: number, judgment: Judgment) => {
        fn();
        setInfiniteFunctionHelper(fn, interval, judgment);
    }

    const setLightAnimations = (elementZero: HTMLElement | null, elementOne: HTMLElement | null, elementTwo: HTMLElement | null, 
                                    colorZero: string, colorOne: string, colorTwo: string, offset: number, judgment: Judgment) => {
        const switchElement = getSwitchElement();

        if (switchElement && elementZero && elementOne && elementTwo) {
            setInfiniteFunction(() => {
                if (switchElement.style.marginLeft === halfSwitchMarginLeft + switchMargins + "px") {
                    elementZero.animate([
                        {
                            background: colorZero
                        }
                        ], {
                            duration: 500,
                            easing: "ease-in",
                            delay: offset
                        }).onfinish = () => {
                            elementZero.animate([
                                {
                                    background: colorZero
                                }
                                ], {
                                    duration: 500,
                                    direction: "reverse",
                                    easing: "ease-out"
                                })
                        }
                    elementOne.animate([
                        {
                            background: colorOne
                        }
                        ], {
                            duration: 500,
                            delay: 250 + offset
                        }).onfinish = () => {
                            elementOne.animate([
                                {
                                    background: colorOne
                                }
                                ], {
                                    duration: 500,
                                    direction: "reverse",
                                    easing: "ease-out"
                                })
                        }
                    elementTwo.animate([
                        {
                            background: colorTwo
                        }
                        ], {
                            duration: 500,
                            delay: 500 + offset
                        }).onfinish = () => {
                            elementTwo.animate([
                                {
                                    background: colorTwo
                                }
                                ], {
                                    duration: 500,
                                    direction: "reverse",
                                    easing: "ease-out"
                                })
                        }   
                }
            }, 3000, judgment);
        }
    }
    
    const switchTime = 50;
    const switchContainerWidth = 225; // pixels
    const switchContainerHeight = Math.round(switchContainerWidth / 5) // pixels
    const totalSwitchMarginLeft = switchContainerWidth - switchContainerHeight; // pixels
    const halfSwitchMarginLeft = Math.round(totalSwitchMarginLeft / 2); // pixels
    const switchMargins = 2; // pixels
    const switchDimension = switchContainerHeight - (switchMargins * 2);

    const moveSwitchToCenter = (onfinish: any) => {
        const switchElement = getSwitchElement();
        const votingAreaFilledHalalElement = getVotingAreaFilledHalalElement();
        const votingAreaFilledHaramElement = getVotingAreaFilledHaramElement();

        if (switchElement && votingAreaFilledHalalElement && votingAreaFilledHaramElement) {
            switchElement.animate([
                {
                    marginLeft: halfSwitchMarginLeft + switchMargins + "px"
                }
                ], {
                    duration: switchTime,
                }).onfinish = () => {
                    switchElement.style.marginLeft = halfSwitchMarginLeft + switchMargins + "px";
                    onfinish();
                };
            
                votingAreaFilledHalalElement.animate([
                    {
                        width: "0"
                    }
                    ], {
                        duration: switchTime,
                    }).onfinish = () => {
                        votingAreaFilledHalalElement.style.width = "0";
                    };

                const haramVotingAreaMarginLeftPx = Math.round(switchContainerWidth / 2) + "px";
                votingAreaFilledHaramElement.animate([
                    {
                        marginLeft: haramVotingAreaMarginLeftPx,
                        width: "0"
                    }
                    ], {
                        duration: switchTime,
                    }).onfinish = () => {
                        votingAreaFilledHaramElement.style.marginLeft = haramVotingAreaMarginLeftPx;
                        votingAreaFilledHaramElement.style.width = "0";
                    };

        }
    }

    const moveSwitchToHalal = (onfinish: any) => {
        const switchElement = getSwitchElement();
        const votingAreaFilledHalalElement = getVotingAreaFilledHalalElement();

        if (switchElement && votingAreaFilledHalalElement) {
            switchElement.animate([
                {
                    marginLeft: totalSwitchMarginLeft + switchMargins + "px"
                }
                ], {
                    duration: switchTime,
                }).onfinish = () => {
                    switchElement.style.marginLeft = totalSwitchMarginLeft + switchMargins + "px";
                    onfinish();
                };
            
            const votingAreaWidthPx = Math.round(switchContainerWidth / 2) + "px";
            votingAreaFilledHalalElement.animate([
                {
                    width: votingAreaWidthPx
                }
                ], {
                    duration: switchTime,
                }).onfinish = () => {
                    votingAreaFilledHalalElement.style.width = votingAreaWidthPx;
                };
        }
    }

    const moveSwitchToHaram = (onfinish: any) => {
        const switchElement = getSwitchElement();
        const votingAreaFilledHaramElement = getVotingAreaFilledHaramElement();

        if (switchElement && votingAreaFilledHaramElement) {
            switchElement.animate([
                {
                    marginLeft: switchMargins + "px"
                }
                ], {
                    duration: switchTime,
                }).onfinish = () => {
                    switchElement.style.marginLeft = switchMargins + "px";
                    onfinish();
                };
            
            const votingAreaWidthPx = Math.round(switchContainerWidth / 2) + "px";
            votingAreaFilledHaramElement.animate([
                {
                    marginLeft: "0",
                    width: votingAreaWidthPx
                }
                ], {
                    duration: switchTime,
                }).onfinish = () => {
                    votingAreaFilledHaramElement.style.marginLeft = "0";
                    votingAreaFilledHaramElement.style.width = votingAreaWidthPx;
                };
        }
    }

    const displayLights = (display: boolean) => {
        const displayString = display ? "unset" : "none";

        const votingAreaLightHaramElementZero = getVotingAreaLightHaramElement(0);
        const votingAreaLightHaramElementOne = getVotingAreaLightHaramElement(1);
        const votingAreaLightHaramElementTwo = getVotingAreaLightHaramElement(2);
    
        const votingAreaLightHalalElementZero = getVotingAreaLightHalalElement(0);
        const votingAreaLightHalalElementOne = getVotingAreaLightHalalElement(1);
        const votingAreaLightHalalElementTwo = getVotingAreaLightHalalElement(2);

        if (votingAreaLightHaramElementZero && votingAreaLightHaramElementOne && votingAreaLightHaramElementTwo && 
            votingAreaLightHalalElementZero && votingAreaLightHalalElementOne && votingAreaLightHalalElementTwo) {
                votingAreaLightHaramElementZero.style.display = displayString;
                votingAreaLightHaramElementOne.style.display = displayString;
                votingAreaLightHaramElementTwo.style.display = displayString;
        
                votingAreaLightHalalElementZero.style.display = displayString;
                votingAreaLightHalalElementOne.style.display = displayString;
                votingAreaLightHalalElementTwo.style.display = displayString;
        }
    }

    const setVote = (judgment: Judgment | undefined) => {
        const switchElement = getSwitchElement();
        const votingAreaFilledHalalElement = getVotingAreaFilledHalalElement();
        const votingAreaFilledHaramElement = getVotingAreaFilledHaramElement();

        if (switchElement && votingAreaFilledHalalElement && votingAreaFilledHaramElement) {
            const switchMarginLeft = parseInt(switchElement.style.marginLeft) - switchMargins;

            if (judgment === Judgment.HALAL) {
                displayLights(false);
                if (switchMarginLeft >= halfSwitchMarginLeft) {
                    votingAreaFilledHaramElement.style.display = "none";
                    votingAreaFilledHalalElement.style.display = "unset";
                    moveSwitchToHalal(() => {
                        displayLights(false);
                    });
                } else {
                    moveSwitchToCenter(() => {
                        votingAreaFilledHaramElement.style.display = "none";
                        votingAreaFilledHalalElement.style.display = "unset";
                        moveSwitchToHalal(() => {
                            displayLights(false);
                        });
                    });
                }
            } else if (judgment === Judgment.HARAM) {
                displayLights(false);
                if (switchMarginLeft <= halfSwitchMarginLeft) {
                    votingAreaFilledHaramElement.style.display = "unset";
                    votingAreaFilledHalalElement.style.display = "none";
                    moveSwitchToHaram(() => {
                        displayLights(false);
                    });
                } else {
                    moveSwitchToCenter(() => {
                        votingAreaFilledHaramElement.style.display = "unset";
                        votingAreaFilledHalalElement.style.display = "none";
                        moveSwitchToHaram(() => {
                            displayLights(false);
                        });
                    });
                }
            } else {
                moveSwitchToCenter(() => {
                    displayLights(true);
                });
            }
        }
    }

    const vote = (judgment: Judgment | undefined) => {
        setVote(judgment);
        if (judgment === Judgment.HARAM && (userVote === undefined || userVote >= 0)) {
            submitVote(-1);
        } else if (judgment === Judgment.HALAL && (userVote === undefined || userVote <= 0)) {
            submitVote(1);
        } else if (userVote) {
            submitVote(0);
        }
    }

    const clickHalalVotingArea = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const votingSwitchContainerElement = getVotingSwitchContainerElement();

        if (votingSwitchContainerElement) {
            const containerRects = votingSwitchContainerElement.getClientRects();
            const containerLeft = containerRects[0].x;
            const containerMid = containerLeft + (switchContainerWidth / 2);

            if (e.screenX < containerMid + (switchDimension / 2)) {
                vote(undefined);
            } else {
                vote(Judgment.HALAL);
            }
        }
    }

    const clickHaramVotingArea = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const votingSwitchContainerElement = getVotingSwitchContainerElement();

        if (votingSwitchContainerElement) {
            const containerRects = votingSwitchContainerElement.getClientRects();
            const containerLeft = containerRects[0].x;
            const containerMid = containerLeft + (switchContainerWidth / 2);

            if (e.screenX > containerMid - (switchDimension / 2)) {
                vote(undefined);
            } else {
                vote(Judgment.HARAM);
            }
        }
    }

    const switchContainerWidthPx = switchContainerWidth + "px";
    const switchContainerHeightPx = switchContainerHeight + "px";

    const votingAreaWidth = Math.round(switchContainerWidth / 2);
    const votingAreaWidthPx = votingAreaWidth + "px";

    const switchDimensionPx = switchDimension + "px";
    const switchMarginTopPx = switchMargins + "px";
    const switchMarginLeftPx = halfSwitchMarginLeft + switchMargins + "px";

    let haramPercentage = 0;
    let halalPercentage = 0;

    if (haramPoints !== undefined && halalPoints !== undefined && !isNaN(haramPoints) && 
            !isNaN(halalPoints) && (halalPoints > 0 || haramPoints > 0)) {
        haramPercentage = Math.round((haramPoints / (halalPoints + haramPoints)) * 100);
        halalPercentage = 100 - haramPercentage;
    }

    const haramPercentageString = haramPercentage + "%";
    const halalPercentageString = halalPercentage + "%";

    const numVotesCalc = numVotes !== undefined ? numVotes : 0;
    
    return (
        <div className="voting-container" >
            <div className="number-haram">{haramPoints}</div>
            <div className="voting-label" style={{ color: '#452061' }}>{'Haram'}<br/>{'حرام'}</div>
            <div id={votingSwitchContainerId} className="voting-switch-container" style={{height: switchContainerHeightPx, width: switchContainerWidthPx, borderRadius: switchContainerHeightPx}} data-tip={`Votes: ${numVotes}, Haram: ${numVotesCalc > 0 ? haramPercentageString : "N/A"}, Halal: ${numVotesCalc > 0 ? halalPercentageString : "N/A"}`} data-for="vote-breakdown-switch">
                <div className="voting-area" onClick={clickHaramVotingArea} style={{height: switchContainerHeightPx, width: votingAreaWidthPx, borderRadius: `${switchContainerHeightPx} 0 0 ${switchContainerHeightPx}`}}>
                    <div id={`${votingAreaLightHaramId}-2`} style={{
                        height: `${switchContainerHeight * .5}px`, 
                        width: `${switchContainerHeight * .5}px`, 
                        borderRadius: `${switchContainerHeight * .5}px`, 
                        marginTop: `${switchContainerHeight * .25}px`,
                        marginLeft: `${votingAreaWidth * .1}px`,
                        float: "left"
                    }}/>
                    <div id={`${votingAreaLightHaramId}-1`} style={{
                        height: `${switchContainerHeight * .33}px`, 
                        width: `${switchContainerHeight * .33}px`, 
                        borderRadius: `${switchContainerHeight * .33}px`, 
                        marginTop: `${switchContainerHeight * .33}px`,
                        marginLeft: `${votingAreaWidth * .1}px`,
                        float: "left"
                    }}/>
                    <div id={`${votingAreaLightHaramId}-0`} style={{
                        height: `${switchContainerHeight * .167}px`, 
                        width: `${switchContainerHeight * .167}px`, 
                        borderRadius: `${switchContainerHeight * .167}px`, 
                        marginTop: `${switchContainerHeight * .417}px`,
                        marginLeft: `${votingAreaWidth * .1}px`,
                        float: "left"
                    }}/>
                </div>
                <div className="voting-area" onClick={clickHalalVotingArea} style={{height: switchContainerHeightPx, width: votingAreaWidthPx, borderRadius: `0 ${switchContainerHeightPx} ${switchContainerHeightPx} 0`, marginLeft: votingAreaWidthPx}}>
                <div id={`${votingAreaLightHalalId}-2`} style={{
                        height: `${switchContainerHeight * .5}px`, 
                        width: `${switchContainerHeight * .5}px`, 
                        borderRadius: `${switchContainerHeight * .5}px`, 
                        marginTop: `${switchContainerHeight * .25}px`,
                        marginRight: `${votingAreaWidth * .1}px`,
                        float: "right"
                    }}/>
                    <div id={`${votingAreaLightHalalId}-1`} style={{
                        height: `${switchContainerHeight * .33}px`, 
                        width: `${switchContainerHeight * .33}px`, 
                        borderRadius: `${switchContainerHeight * .33}px`, 
                        marginTop: `${switchContainerHeight * .33}px`,
                        marginRight: `${votingAreaWidth * .1}px`,
                        float: "right"
                    }}/>
                    <div id={`${votingAreaLightHalalId}-0`} style={{
                        height: `${switchContainerHeight * .167}px`, 
                        width: `${switchContainerHeight * .167}px`, 
                        borderRadius: `${switchContainerHeight * .167}px`, 
                        marginTop: `${switchContainerHeight * .417}px`,
                        marginRight: `${votingAreaWidth * .1}px`,
                        float: "right"
                    }}/>
                </div>
                <div id={votingAreaFilledHaramId} className="voting-area-filled-haram" onClick={() => {vote(undefined)}} style={{height: switchContainerHeightPx, width: 0, borderRadius: `${switchContainerHeightPx} 0 0 ${switchContainerHeightPx}`, display: userVote && userVote < 0 ? "unsert" : "none", marginLeft: votingAreaWidthPx}}></div>
                <div id={votingAreaFilledHalalId} className="voting-area-filled-halal" onClick={() => {vote(undefined)}} style={{height: switchContainerHeightPx, width: 0, borderRadius: `0 ${switchContainerHeightPx} ${switchContainerHeightPx} 0`, display: userVote && userVote > 0 ? "unsert" : "none", marginLeft: votingAreaWidthPx}}></div>
                <div id={switchId} className="voting-switch" style={{height: switchDimensionPx, width: switchDimensionPx, borderRadius: switchDimensionPx, marginLeft: switchMarginLeftPx, marginTop: switchMarginTopPx}}>
                    <div className="voting-switch-text">VOTE</div>
                </div>
                <ReactTooltip className="vote-breakdown-tooltip" id="vote-breakdown-switch" place="bottom" delayShow={100} effect="solid"/>
            </div>
            <div className="voting-label" style={{ color: '#1f594f' }}>{'Halal'}<br/>{'حلال'}</div>
            <div className="number-halal">{halalPoints}</div>
        </div>
    )
}