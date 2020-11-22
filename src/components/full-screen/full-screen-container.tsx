import React, { ReactElement, useRef, useEffect, useContext } from 'react';
import { topicsContext } from '../app-shell';
import { TopicVotesComponent } from '../topic-carousel/topic-votes';
import { FullScreenComponent } from './full-screen';

import './full-screen.css';


interface FullScreenComponentProps {
    fetchTopics: (topicTofetch?: string | undefined, newIndex?: number | undefined) => Promise<void>;
    MediaCard: ReactElement,
    CommentsCard: ReactElement,
    AnalyticsCard: ReactElement,
    TopicCarousel: ReactElement,
};
export const FullScreenContainer = (props: FullScreenComponentProps) => {
    const { MediaCard, CommentsCard, AnalyticsCard, TopicCarousel, fetchTopics } = props;

    const FSContainerRef = useRef<HTMLDivElement>(null);

    const { topicsState, setTopicsContext } = useContext(topicsContext);
    const { topics, topicIndex } = topicsState;
    const topic = topics?.length ? topics[topicIndex] : undefined;
    const topicTitle = topic?.topicTitle || "";
    const halalPoints = topic?.halalPoints !== undefined ? topic.halalPoints : 0;
    const haramPoints = topic?.haramPoints !== undefined ? topic.haramPoints : 0;
    const numVotes = topic?.numVotes !== undefined ? topic.numVotes : 0;
    const userVote = topic?.vote;

    useEffect(() => {
        if (FSContainerRef.current) {
            FSContainerRef.current!.onscroll = (e: Event) => {
                const scrollRatio = (FSContainerRef.current!.scrollTop - (FSContainerRef.current!.clientHeight * topicIndex))/FSContainerRef.current!.clientHeight;
                const indexDelta = scrollRatio < -0.5 ? -1 : (scrollRatio > 0.5 ? 1 : 0);
                if (indexDelta !== 0) {
                    if ((topicIndex + indexDelta) >= topics.length - 2) {
                        fetchTopics(undefined, topicIndex+indexDelta);
                    } else {
                        setTopicsContext(topics, topicIndex+indexDelta);
                    }
                    FSContainerRef.current!.onscroll = () => { };
                };
            };
        }; // eslint-disable-next-line
    }, [topicsState]);

    useEffect(() => {
        if (topics.length === 1) {
            fetchTopics();
        };
        if (FSContainerRef.current) {
            FSContainerRef.current!.scrollTop = FSContainerRef.current!.clientHeight * topicIndex;
        }; // eslint-disable-next-line
    }, []);

    return (
        <div ref={FSContainerRef} className="full-screen-container">
            <FullScreenComponent
                fetchTopics={fetchTopics}
                MediaCard={MediaCard}
                CommentsCard={CommentsCard}
                AnalyticsCard={AnalyticsCard}
                TopicCarousel={TopicCarousel}
                FSTopicIndex={topicIndex}
            />
            <div className={'full-screen-footer'}>
                <div style={{ margin: 'auto' }}>
                    <TopicVotesComponent topicTitle={topicTitle} userVote={userVote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes} />
                </div>
            </div>
        </div>
    );
}