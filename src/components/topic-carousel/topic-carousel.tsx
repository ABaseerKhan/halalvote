import React, { useEffect, useContext, useRef } from 'react';
import { TopicVotesComponent } from './topic-votes';
import { topicsContext } from '../app-shell';

// type imports

// styles
import './topic-carousel.css';

interface TopicCarouselMobileComponentProps {
    id: string,
    fetchTopics: any,
    style?: any,
};
export const TopicCarouselMobileComponent = (props: TopicCarouselMobileComponentProps) => {
    const { id, fetchTopics } = props;

    const topicTitleRefs = useRef<any>([]);

    const { topicsState: { topics, topicIndex }, setTopicsContext } = useContext(topicsContext);
    const topicTitles = topics.map((topic) => topic.topicTitle);
    const topic = topics?.length ? topics[topicIndex] : undefined;
    const topicTitle = topic?.topicTitle || "";
    const halalPoints = topic?.halalPoints !== undefined ? topic.halalPoints : 0;
    const haramPoints = topic?.haramPoints !== undefined ? topic.haramPoints : 0;
    const numVotes = topic?.numVotes !== undefined ? topic.numVotes : 0;
    const userVote = topic?.vote;

    const topicTitleAndVotingSwitch = "topic-title-and-voting-switch";

    return (
        <div id={id} className='topic-carousel-mobile'>
            <div id={topicTitleAndVotingSwitch} className="topic-title-and-voting-switch">
                <span className="topic-label">Topic:</span>
                <div id="topic-title" className='topic-titles-container' >
                            {topicTitles.map((topicTitle: string, idx: number) => {
                                const distance = idx - topicIndex;

                                let onClick;
                                let className: string;
                                let translationVW;
                                if (distance < 0) {
                                    translationVW = ((distance * 16) + 17);
                                    className = "prev-topic-titles";
                                    if (distance === -1) {
                                        onClick = () => { 
                                            if ((topicIndex - 1) >= 0) setTopicsContext(topics, topicIndex-1);
                                        };
                                    }
                                } else if (distance > 0) {
                                    translationVW = ((distance * 16) + 70);
                                    className = "next-topic-titles";
                                    if (distance === 1) {
                                        onClick = () => {
                                            if ((topicIndex + 1) >= topics.length - 2) {
                                                fetchTopics(undefined, topicIndex+1);
                                            } else {
                                                setTopicsContext(topics, topicIndex+1);
                                            };
                                        };
                                    }
                                } else {
                                    translationVW = 15;
                                    className = "topic-title-mobile";
                                }

                                return <div ref={(el) => topicTitleRefs.current.push(el)} className={className} style={{ transform: `translate(${translationVW}vw, 0)` }} onClick={onClick} >
                                    <span>{topicTitles[idx]}</span>
                                </div>
                            })}
                </div>
                <TopicVotesComponent topicTitle={topicTitle} userVote={userVote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes} />
            </div>
        </div>
    );
}

interface TopicCarouselComponentProps {
    id: string,
    iterateTopic: any,
    style?: any;
};
export const TopicCarouselComponent = (props: TopicCarouselComponentProps) => {
    const { id, iterateTopic } = props;

    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);

    const topic = topics?.length ? topics[topicIndex] : undefined;
    const topicTitle = topic?.topicTitle || "";
    const halalPoints = topic?.halalPoints !== undefined ? topic.halalPoints : 0;
    const haramPoints = topic?.haramPoints !== undefined ? topic.haramPoints : 0;
    const numVotes = topic?.numVotes !== undefined ? topic.numVotes : 0;
    const userVote = topic?.vote;

    const leftCarouselButtonId = "left-carousel-button";
    const rightCarouselButtonId = "right-carousel-button";

    useEffect(() => {
        const leftCarouselButton = document.getElementById(leftCarouselButtonId);
        const rightCarouselButton = document.getElementById(rightCarouselButtonId);
        if (leftCarouselButton && rightCarouselButton) {
            leftCarouselButton.classList.add("carousel-button-computer");
            rightCarouselButton.classList.add("carousel-button-computer");
        }
    }, [iterateTopic]);

    return (
        <div id={id} style={props.style} className='topic-carousel'>
            <div>
                <span className="topic-label">Topic:</span>
                <div id="topic-title" className='topic-title'>
                    {topicTitle}
                </div>
            </div>
            <TopicVotesComponent topicTitle={topicTitle} userVote={userVote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes} />
        </div>
    );
}