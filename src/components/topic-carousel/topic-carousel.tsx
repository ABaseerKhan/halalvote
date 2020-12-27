import React, { useContext, useRef } from 'react';
import { TopicVotesComponent } from './topic-votes';
import { topicsContext } from '../app-shell';

// type imports

// styles
import './topic-carousel.css';

interface TopicCarouselComponentProps {
    id: string,
    fetchTopics: any,
    style?: any,
};
export const TopicCarouselComponent = (props: TopicCarouselComponentProps) => {
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

                                return <div 
                                    key={`title-${idx}`} 
                                    ref={(el) => topicTitleRefs.current.push(el)}
                                    className={className} style={{ transform: `translate(${translationVW}vw, 0)` }}
                                    onTouchStart={(e) => {e.stopPropagation()}}
                                    onTouchMove={(e) => {e.stopPropagation()}}
                                    onTouchEnd={(e) => {e.stopPropagation()}}
                                    onClick={onClick} 
                                    >
                                        <span>{topicTitles[idx]}</span>
                                </div>
                            })}
                </div>
                <TopicVotesComponent topicTitle={topicTitle} userVote={userVote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes} />
            </div>
        </div>
    );
}