import React from 'react';
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useMedia } from '../../hooks/useMedia';

export const TopicSkeletonComponent = () => {
    const isMobile = useMedia(
        // Media queries
        ['(max-width: 600px)'],
        [true],
        // default value
        false
    );

    let SkeletonSections: JSX.Element[] = [];
    for (let i = 0; i < 10; i++) {
        SkeletonSections.push(
            <section key={i} style={{ margin: '3.5em 20px -1.4em 20px' }}>
                <Skeleton height={isMobile ? '14px' : 'unset'} width={'75%'} style={{ margin: '5px', maxWidth: '200px' }} duration={.5} />
                <Skeleton height={isMobile ? '10px' : 'unset'} count={1} width={'50%'} style={{ margin: '5px' }} duration={.5} />
            </section>
        );
    }

    return (
        <SkeletonTheme color="var(--dark-mode-secondary-text-color)" highlightColor="var(--dark-mode-text-color)">
            {SkeletonSections}
        </SkeletonTheme>
    )
};