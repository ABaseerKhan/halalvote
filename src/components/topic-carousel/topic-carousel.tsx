import React, { useEffect } from 'react';
import { TopicVotesComponent } from './topic-votes';
import { ReactComponent as ChevronLeftSVG } from '../../icons/chevron-left.svg';
import { ReactComponent as ChevronRightSVG } from '../../icons/chevron-right.svg';
import { useMedia } from '../../hooks/useMedia';

// type imports

// styles
import './topic-carousel.css';

interface TopicCarouselComponentProps {
    id: string,
    iterateTopic: any,
    prevTopicTitle: string | undefined,
    nextTopicTitle: string | undefined,
    topicTitle: string,
    userVote: number | undefined,
    halalPoints: number,
    haramPoints: number,
    numVotes: number,
    style?: any;
};
export const TopicCarouselComponent = (props: TopicCarouselComponentProps) => {
    const { id, iterateTopic, topicTitle, userVote, halalPoints, haramPoints, numVotes } = props;

    const isMobile = useMedia(
        // Media queries
        ['(max-width: 600px)'],
        [true],
        // default value
        false
    );

    const leftCarouselButtonId = "left-carousel-button";
    const rightCarouselButtonId = "right-carousel-button";

    useEffect(() => {
        if (!isMobile) {
            const leftCarouselButton = document.getElementById(leftCarouselButtonId);
            const rightCarouselButton = document.getElementById(rightCarouselButtonId);
            if (leftCarouselButton && rightCarouselButton) {
                leftCarouselButton.classList.add("carousel-button-computer");
                rightCarouselButton.classList.add("carousel-button-computer");
            }
        } // eslint-disable-next-line
    }, []);

    return (
        <div id={id} style={props.style} className='topic-carousel'>
            <div className="topic-navigator">
                <button id={leftCarouselButtonId} onClick={iterateTopic(-1)} className='carousel-button-left'>
                    {!isMobile && <ChevronLeftSVG color={'var(--neutral-color)'} transform={"translate(0 0)"}/>}
                </button>
                <div id="topic-title" className='topic-title' >
                        {topicTitle}
                </div>
                <button id={rightCarouselButtonId} onClick={iterateTopic(1)} className='carousel-button-right'>
                    {!isMobile && <ChevronRightSVG color={'var(--neutral-color)'} transform={"translate(0 0)"}/>}
                </button>
            </div>
            <TopicVotesComponent topicTitle={topicTitle} userVote={userVote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes} />
        </div>
    );
}