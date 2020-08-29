import React, { useState } from 'react';
import Linkify from 'react-linkify';
import { TopicVotesComponent } from './topic-votes';
import { ReactComponent as ChevronLeftSVG } from '../../icons/chevron-left.svg';
import { ReactComponent as ChevronRightSVG } from '../../icons/chevron-right.svg';
import { useMedia } from '../../hooks/useMedia';
import { ModalComponent } from '../modal/modal';
import { Portal } from '../../index';

// type imports
import { ModalType } from '../../types';

// styles
import './topic-carousel.css';

interface TopicCarouselComponentProps {
    id: string,
    iterateTopic: any,
    topicTitle: string,
    userVote: number | undefined,
    halalPoints: number,
    haramPoints: number,
    numVotes: number,
    style?: any;
};
interface TopicCarouselComponentState {
    descriptionDisplayed: boolean
}
export const TopicCarouselComponent = (props: TopicCarouselComponentProps) => {
    const { id, iterateTopic, topicTitle, userVote, halalPoints, haramPoints, numVotes } = props;
    const [state, setState] = useState<TopicCarouselComponentState>({
        descriptionDisplayed: false
    });

    const isMobile = useMedia(
        // Media queries
        ['(max-width: 600px)'],
        [true],
        // default value
        false
    );

    const leftCarouselButtonId = "left-carousel-button";
    const rightCarouselButtonId = "right-carousel-button";

    if (!isMobile) {
        const leftCarouselButton = document.getElementById(leftCarouselButtonId);
        const rightCarouselButton = document.getElementById(rightCarouselButtonId);
        if (leftCarouselButton && rightCarouselButton) {
            leftCarouselButton.classList.add("carousel-button-computer");
            rightCarouselButton.classList.add("carousel-button-computer");
        }
    }

    const setDescriptionDisplayed = (descriptionDisplayed: boolean) => {
        setState({...state, descriptionDisplayed: descriptionDisplayed})
    }

    return (
        <div id={id} style={props.style} className='topic-carousel'>
            { state.descriptionDisplayed &&
                <Portal><ModalComponent removeModal={() => {setDescriptionDisplayed(false)}} modalType={ModalType.DESCRIPTION} fetchTopics={null} topicTitle={props.topicTitle}/></Portal>
            }
            <div className="topic-navigator">
                <button id={leftCarouselButtonId} onClick={iterateTopic(-1)} className='carousel-button'>
                    <ChevronLeftSVG className={"arrow-icon-left"}/>
                </button>
                <div id="topic-title" className='topic-title' onClick={() => {setDescriptionDisplayed(true)}} >
                    <Linkify>{topicTitle}</Linkify>
                </div>
                <button id={rightCarouselButtonId} onClick={iterateTopic(1)} className='carousel-button'>
                    <ChevronRightSVG className={"arrow-icon-right"}/>
                </button>
            </div>
            <TopicVotesComponent topicTitle={topicTitle} userVote={userVote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes} />
        </div>
    );
}