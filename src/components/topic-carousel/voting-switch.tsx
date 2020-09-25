import React, { useRef, useEffect } from 'react';
import { Judgment } from '../../types';

//style imports
import './voting-switch.css';

type VotingSwitchProps = {
    submitVote: (value: number) => void,
    userVote: number | undefined,
};
export const VotingSwitch = (props: VotingSwitchProps) => {
    const { submitVote, userVote } = props;

    useEffect(() => {
        if (userVote === undefined || userVote === 0) {
            setVote(undefined);
        } else if (userVote < 0) {
            setVote(Judgment.HARAM);
        } else if (userVote > 0) {
            setVote(Judgment.HALAL);
        } // eslint-disable-next-line
    }, [userVote]);

    let canSwitch = useRef<boolean>(true);

    const votingSwitchContainerId = "voting-switch-container";
    const switchId = "voting-switch";
    const votingAreaFilledHaramId = "voting-area-filled-haram";
    const votingAreaFilledHalalId = "voting-area-filled-halal";

    const switchElement = document.getElementById(switchId);
    const votingAreaFilledHaramElement = document.getElementById(votingAreaFilledHaramId);
    const votingAreaFilledHalalElement = document.getElementById(votingAreaFilledHalalId);
    
    const switchTime = 50;
    const switchContainerWidth = 100; // pixels
    const switchContainerHeight = Math.round(switchContainerWidth / 3) // pixels (also used for switch height/width + border radius)
    const totalSwitchMarginLeft = switchContainerWidth - switchContainerHeight; // pixels
    const halfSwitchMarginLeft = Math.round(totalSwitchMarginLeft / 2); // pixels
    const switchMargins = 2; // pixels

    const moveSwitchToCenter = (onfinish: any) => {
        if (switchElement && votingAreaFilledHalalElement && votingAreaFilledHaramElement) {
            switchElement.animate([
                {
                    marginLeft: halfSwitchMarginLeft + switchMargins + "px"
                }
                ], {
                    duration: switchTime,
                    easing: 'linear',
                }).onfinish = () => {
                    switchElement.style.marginLeft = halfSwitchMarginLeft + "px";
                    onfinish();
                };
            
                votingAreaFilledHalalElement.animate([
                    {
                        width: "0"
                    }
                    ], {
                        duration: switchTime,
                        easing: 'linear',
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
                        easing: 'linear',
                    }).onfinish = () => {
                        votingAreaFilledHaramElement.style.marginLeft = haramVotingAreaMarginLeftPx;
                        votingAreaFilledHaramElement.style.width = "0";
                    };

        }
    }

    const moveSwitchToHalal = (onfinish: any) => {
        if (switchElement && votingAreaFilledHalalElement) {
            switchElement.animate([
                {
                    marginLeft: totalSwitchMarginLeft + switchMargins + "px"
                }
                ], {
                    duration: switchTime,
                    easing: 'linear',
                }).onfinish = () => {
                    switchElement.style.marginLeft = totalSwitchMarginLeft + "px";
                    onfinish();
                };
            
            const votingAreaWidthPx = Math.round(switchContainerWidth / 2) + "px";
            votingAreaFilledHalalElement.animate([
                {
                    width: votingAreaWidthPx
                }
                ], {
                    duration: switchTime,
                    easing: 'linear',
                }).onfinish = () => {
                    votingAreaFilledHalalElement.style.width = votingAreaWidthPx;
                };
        }
    }

    const moveSwitchToHaram = (onfinish: any) => {
        if (switchElement && votingAreaFilledHaramElement) {
            switchElement.animate([
                {
                    marginLeft: switchMargins + "px"
                }
                ], {
                    duration: switchTime,
                    easing: 'linear',
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
                    easing: 'linear',
                }).onfinish = () => {
                    votingAreaFilledHaramElement.style.marginLeft = "0";
                    votingAreaFilledHaramElement.style.width = votingAreaWidthPx;
                };
        }
    }

    const setVote = (judgment: Judgment | undefined) => {
        if (switchElement && votingAreaFilledHalalElement && votingAreaFilledHaramElement && canSwitch.current) {
            canSwitch.current = false;
            const switchMarginLeft = parseInt(switchElement.style.marginLeft);

            if (judgment === Judgment.HALAL) {
                if (switchMarginLeft >= halfSwitchMarginLeft) {
                    votingAreaFilledHalalElement.style.display = "unset";
                    moveSwitchToHalal(() => {canSwitch.current = true});
                } else {
                    moveSwitchToCenter(() => {
                        votingAreaFilledHaramElement.style.display = "none";
                        votingAreaFilledHalalElement.style.display = "unset";
                        moveSwitchToHalal(() => {canSwitch.current = true});
                    });
                }
            } else if (judgment === Judgment.HARAM) {
                if (switchMarginLeft <= halfSwitchMarginLeft) {
                    votingAreaFilledHaramElement.style.display = "unset";
                    moveSwitchToHaram(() => {canSwitch.current = true});
                } else {
                    moveSwitchToCenter(() => {
                        votingAreaFilledHaramElement.style.display = "unset";
                        votingAreaFilledHalalElement.style.display = "none";
                        moveSwitchToHaram(() => {canSwitch.current = true});
                    });
                }
            } else {
                moveSwitchToCenter(() => {
                    votingAreaFilledHaramElement.style.display = "none";
                    votingAreaFilledHalalElement.style.display = "none";
                    canSwitch.current = true;
                });
            }
        }
    }

    const vote = (judgment: Judgment | undefined) => {
        if (judgment === Judgment.HARAM) {
            submitVote(-100);
        } else if (judgment === Judgment.HALAL) {
            submitVote(100);
        } else {
            submitVote(0);
        }
        setVote(judgment);
    }

    const votingContainerWidthPx = switchContainerWidth + 220 + "px";

    const switchContainerWidthPx = switchContainerWidth + "px";
    const switchContainerHeightPx = switchContainerHeight + "px";

    const votingAreaWidthPx = Math.round(switchContainerWidth / 2) + "px";

    const switchDimension = switchContainerHeight - (switchMargins * 2);
    const switchDimensionPx = switchDimension + "px";
    const switchMarginTopPx = switchMargins + "px";
    const switchMarginLeftPx = halfSwitchMarginLeft + switchMargins + "px";

    const switchTextFontSize = ((switchContainerHeight - (switchMargins * 2)) / 4);
    const switchTextMarginTop = (switchDimension / 2) - (switchTextFontSize / 2);
    const switchTextFontSizePx = switchTextFontSize + "px";
    const switchTextMarginTopPx = switchTextMarginTop + "px";
    
    return (
        <div className="voting-container" style={{width: votingContainerWidthPx}}>
            <div className="voting-label" style={{ color: '#452061' }}>{'haram (حرام)'}</div>
            <div id={votingSwitchContainerId} className="voting-switch-container" style={{height: switchContainerHeightPx, width: switchContainerWidthPx, borderRadius: switchContainerHeightPx}}>
                <div className="voting-area" onClick={() => {vote(Judgment.HARAM)}} style={{height: switchContainerHeightPx, width: votingAreaWidthPx, borderRadius: `${switchContainerHeightPx} 0 0 ${switchContainerHeightPx}`}}></div>
                <div className="voting-area" onClick={() => {vote(Judgment.HALAL)}} style={{height: switchContainerHeightPx, width: votingAreaWidthPx, borderRadius: `0 ${switchContainerHeightPx} ${switchContainerHeightPx} 0`, marginLeft: votingAreaWidthPx}}></div>
                <div id={votingAreaFilledHaramId} className="voting-area-filled-haram" onClick={() => {vote(undefined)}} style={{height: switchContainerHeightPx, width: 0, borderRadius: `${switchContainerHeightPx} 0 0 ${switchContainerHeightPx}`, display:"none", marginLeft: votingAreaWidthPx}}></div>
                <div id={votingAreaFilledHalalId} className="voting-area-filled-halal" onClick={() => {vote(undefined)}} style={{height: switchContainerHeightPx, width: 0, borderRadius: `0 ${switchContainerHeightPx} ${switchContainerHeightPx} 0`, display:"none", marginLeft: votingAreaWidthPx}}></div>
                <div id={switchId} className="voting-switch" style={{height: switchDimensionPx, width: switchDimensionPx, borderRadius: switchDimensionPx, marginLeft: switchMarginLeftPx, marginTop: switchMarginTopPx}}>
                    <div className="voting-switch-text" style={{fontSize: switchTextFontSizePx, marginTop: switchTextMarginTopPx}}>VOTE</div>
                </div>
            </div>
            <div className="voting-label" style={{ color: '#1f594f' }}>{'(حلال) halal'}</div>
        </div>
    )
}