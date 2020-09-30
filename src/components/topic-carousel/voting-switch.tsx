import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';

//type imports
import { Judgment } from '../../types';

//style imports
import './voting-switch.css';

type VotingSwitchProps = {
    submitVote: (value: number) => void,
    userVote: number | undefined,
};
export const VotingSwitch = (props: VotingSwitchProps) => {
    const [cookies] = useCookies(['username', 'sessiontoken']);

    const { username, sessiontoken } = cookies;
    const { submitVote, userVote } = props;

    useEffect(() => {
        if (userVote === undefined || userVote === 0 || !(username && sessiontoken)) {
            setVote(undefined);
        } else if (userVote < 0) {
            setVote(Judgment.HARAM);
        } else if (userVote > 0) {
            setVote(Judgment.HALAL);
        } // eslint-disable-next-line
    }, [userVote, username, sessiontoken]);

    const votingSwitchContainerId = "voting-switch-container";
    const switchId = "voting-switch";
    const votingAreaFilledHaramId = "voting-area-filled-haram";
    const votingAreaFilledHalalId = "voting-area-filled-halal";

    const votingSwitchContainerElement = document.getElementById(votingSwitchContainerId);
    const switchElement = document.getElementById(switchId);
    const votingAreaFilledHaramElement = document.getElementById(votingAreaFilledHaramId);
    const votingAreaFilledHalalElement = document.getElementById(votingAreaFilledHalalId);
    
    const switchTime = 50;
    const switchContainerWidth = 150; // pixels
    const switchContainerHeight = Math.round(switchContainerWidth / 4) // pixels
    const totalSwitchMarginLeft = switchContainerWidth - switchContainerHeight; // pixels
    const halfSwitchMarginLeft = Math.round(totalSwitchMarginLeft / 2); // pixels
    const switchMargins = 2; // pixels
    const switchDimension = switchContainerHeight - (switchMargins * 2);

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
                    vote(Judgment.HARAM);
                } else if (e.x >= containerRightMid) {
                    vote(Judgment.HALAL);
                } else {
                    vote(undefined);
                }
            }
        }
        document.onmousemove = (e: MouseEvent) => {
            if (dragging && containerRects.length > 0) {
                const containerLeft = containerRects[0].x;
                const containerMid = containerLeft + (switchContainerWidth / 2);
                const switchCenterX = e.x - (switchDimension / 2);

                switchElement.style.marginLeft = Math.min(totalSwitchMarginLeft + switchMargins, (Math.max(switchMargins, switchCenterX - containerLeft))) + "px";

                if (e.x > containerMid) {
                    const halalFillWidth = e.x + (switchDimension / 2) + switchMargins - containerMid;

                    votingAreaFilledHalalElement.style.display = "unset";
                    votingAreaFilledHaramElement.style.display = "none";
                    votingAreaFilledHalalElement.style.width = Math.min(switchContainerWidth / 2, halalFillWidth) + "px";
                } else {
                    const haramFillWidth = containerMid - e.x + (switchDimension / 2) + switchMargins;
                    const haramFillMarginLeft = e.x - (switchDimension / 2) - switchMargins - containerLeft;

                    votingAreaFilledHalalElement.style.display = "none";
                    votingAreaFilledHaramElement.style.display = "unset";
                    votingAreaFilledHaramElement.style.width = Math.min(switchContainerWidth / 2, haramFillWidth) + "px";
                    votingAreaFilledHaramElement.style.marginLeft = Math.max(0, haramFillMarginLeft) + "px";
                }
            }
        }
    }

    const moveSwitchToCenter = (onfinish: any) => {
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

    const setVote = (judgment: Judgment | undefined) => {
        if (switchElement && votingAreaFilledHalalElement && votingAreaFilledHaramElement) {
            const switchMarginLeft = parseInt(switchElement.style.marginLeft) - switchMargins;

            if (judgment === Judgment.HALAL) {
                if (switchMarginLeft >= halfSwitchMarginLeft) {
                    votingAreaFilledHaramElement.style.display = "none";
                    votingAreaFilledHalalElement.style.display = "unset";
                    moveSwitchToHalal(() => {});
                } else {
                    moveSwitchToCenter(() => {
                        votingAreaFilledHaramElement.style.display = "none";
                        votingAreaFilledHalalElement.style.display = "unset";
                        moveSwitchToHalal(() => {});
                    });
                }
            } else if (judgment === Judgment.HARAM) {
                if (switchMarginLeft <= halfSwitchMarginLeft) {
                    votingAreaFilledHaramElement.style.display = "unset";
                    votingAreaFilledHalalElement.style.display = "none";
                    moveSwitchToHaram(() => {});
                } else {
                    moveSwitchToCenter(() => {
                        votingAreaFilledHaramElement.style.display = "unset";
                        votingAreaFilledHalalElement.style.display = "none";
                        moveSwitchToHaram(() => {});
                    });
                }
            } else {
                moveSwitchToCenter(() => {
                    votingAreaFilledHaramElement.style.display = "none";
                    votingAreaFilledHalalElement.style.display = "none";
                });
            }
        }
    }

    const vote = (judgment: Judgment | undefined) => {
        setVote(judgment);
        if (judgment === Judgment.HARAM && (userVote === undefined || userVote >= 0)) {
            submitVote(-100);
        } else if (judgment === Judgment.HALAL && (userVote === undefined || userVote <= 0)) {
            submitVote(100);
        } else if (userVote) {
            submitVote(0);
        }
    }

    const clickHalalVotingArea = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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

    const votingContainerWidthPx = switchContainerWidth + 220 + "px";

    const switchContainerWidthPx = switchContainerWidth + "px";
    const switchContainerHeightPx = switchContainerHeight + "px";

    const votingAreaWidthPx = Math.round(switchContainerWidth / 2) + "px";

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
                <div className="voting-area" onClick={clickHaramVotingArea} style={{height: switchContainerHeightPx, width: votingAreaWidthPx, borderRadius: `${switchContainerHeightPx} 0 0 ${switchContainerHeightPx}`}}></div>
                <div className="voting-area" onClick={clickHalalVotingArea} style={{height: switchContainerHeightPx, width: votingAreaWidthPx, borderRadius: `0 ${switchContainerHeightPx} ${switchContainerHeightPx} 0`, marginLeft: votingAreaWidthPx}}></div>
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