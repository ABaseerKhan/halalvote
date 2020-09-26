import React from 'react';
import ReactTooltip from 'react-tooltip';

//style imports
import './votes-bar.css';

type VotesBarProps = {
    halalPoints: number,
    haramPoints: number,
    numVotes: number,
};
export const VotesBar = (props: VotesBarProps) => {
    const {halalPoints, haramPoints, numVotes } = props;
    
    const votesBarWidth = 340; // pixels
    const votesBarHeight = Math.round(votesBarWidth / 50) // pixels
    let haramPercentage = 0;
    let halalPercentage = 0;

    if (!isNaN(haramPoints) && !isNaN(halalPoints) && (halalPoints > 0 || haramPoints > 0)) {
        haramPercentage = Math.round((haramPoints / (halalPoints + haramPoints)) * 100);
        halalPercentage = 100 - haramPercentage;
    }

    const votesBarWidthPx = votesBarWidth + "px";
    const votesBarHeightPx = votesBarHeight + "px";
    const haramPercentageString = haramPercentage + "%";
    const halalPercentageString = halalPercentage + "%";
    
    return (
        <div className="votes-bar" style={{height: votesBarHeightPx, width: votesBarWidthPx, borderRadius: votesBarHeightPx}} data-tip={`Votes: ${numVotes}, Haram: ${numVotes > 0 ? haramPercentageString : "N/A"}, Halal: ${numVotes > 0 ? halalPercentageString : "N/A"}`} data-for="vote-breakdown">
            <div className="voting-bar-haram" style={{height: votesBarHeightPx, width: haramPercentageString, borderRadius: `${votesBarHeightPx} 0 0 ${votesBarHeightPx}`}}></div>
            <div className="voting-bar-halal" style={{height: votesBarHeightPx, width: halalPercentageString, borderRadius: `0 ${votesBarHeightPx} ${votesBarHeightPx} 0`}}></div>
            <ReactTooltip className="vote-breakdown-tooltip" id="vote-breakdown" place="top" delayShow={100} effect="solid"/>
        </div>
)
}