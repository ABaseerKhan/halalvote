import React from 'react';
import ReactTooltip from 'react-tooltip';

//style imports
import './votes-bar.css';

type VotesBarProps = {
    halalPoints: number,
    haramPoints: number,
    numVotes: number
};
export const VotesBar = (props: VotesBarProps) => {
    const {halalPoints, haramPoints, numVotes } = props;
    
    const votesBarWidth = 390; // pixels
    const votesBarHeight = Math.round(votesBarWidth / 100) // pixels
    let haramPercentage = 0;
    let halalPercentage = 0;

    if (!isNaN(haramPoints) && !isNaN(halalPoints) && (halalPoints > 0 || haramPoints > 0)) {
        haramPercentage = Math.round((haramPoints / (halalPoints + haramPoints)) * 100);
        halalPercentage = 100 - haramPercentage;
    }

    const votesBarHeightPx = votesBarHeight + "px";
    const haramPercentageString = haramPercentage + "%";
    const halalPercentageString = halalPercentage + "%";
    
    return (
        <div className="votes-bar" style={{height: votesBarHeightPx, borderRadius: votesBarHeightPx}} data-tip={`Votes: ${numVotes}, Haram: ${numVotes > 0 ? haramPercentageString : "N/A"}, Halal: ${numVotes > 0 ? halalPercentageString : "N/A"}`} data-for="vote-breakdown-bar">
            <div className="voting-bar-haram" style={{height: votesBarHeightPx, width: haramPercentageString, borderRadius: `${votesBarHeightPx} ${halalPercentage === 0 ? votesBarHeightPx : 0} ${halalPercentage === 0 ? votesBarHeightPx : 0} ${votesBarHeightPx}`}}></div>
            <div className="voting-bar-halal" style={{height: votesBarHeightPx, width: halalPercentageString, borderRadius: `${haramPercentage === 0 ? votesBarHeightPx : 0} ${votesBarHeightPx} ${votesBarHeightPx} ${haramPercentage === 0 ? votesBarHeightPx : 0}`}}></div>
            <ReactTooltip className="vote-breakdown-tooltip" id="vote-breakdown-bar" place="top" delayShow={100} effect="solid"/>
        </div>
)
}