import React, { ReactElement, useRef, useEffect, useContext } from 'react';
import { topicsContext } from '../app-shell';
import { Topic } from '../../types';
import { FullScreenComponent } from './full-screen';

import './full-screen.css';

var isScrollingFSContainer: any;

interface FullScreenComponentProps {
    fetchTopics: (topicTofetch?: string | undefined, backgroundFetch?: boolean | undefined) => Promise<void>;
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

    useEffect(() => {
        if (FSContainerRef.current) {
            FSContainerRef.current!.onscroll = (e: Event) => {
                clearTimeout(isScrollingFSContainer);
                isScrollingFSContainer = setTimeout(function() {
                    const index = Math.floor((FSContainerRef.current!.scrollTop + 10)/FSContainerRef.current!.clientHeight);
                    if (index >= topics.length - 2) {
                        topicsState.topicIndex = index;
                        fetchTopics(undefined, true);
                    } else {
                        setTopicsContext(topics, index);
                    }
                }, 30);
            };
        }; // eslint-disable-next-line
    }, [topics]);

    useEffect(() => {
        if (FSContainerRef.current) {
            FSContainerRef.current!.scrollTop = FSContainerRef.current!.clientHeight * topicIndex;
        }; // eslint-disable-next-line
    }, []);

    return (
        <div ref={FSContainerRef} className="full-screen-container">
            {topics.map((topic: Topic, i: number) => {
                return <FullScreenComponent
                    key={i}
                    MediaCard={MediaCard}
                    CommentsCard={CommentsCard}
                    AnalyticsCard={AnalyticsCard}
                    TopicCarousel={TopicCarousel}
                    FSTopicIndex={i}
                />
                })
            }
        </div>
    );
}