import React from 'react';
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useMedia } from '../../hooks/useMedia';

export const SkeletonComponent = () => {
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
            <section key={i} style={{ margin: '20px' }}>
                <Skeleton height={isMobile ? '10px' : 'unset'} width={'30%'} style={{ margin: '5px', maxWidth: '200px' }} duration={.5} />
                <Skeleton height={isMobile ? '10px' : 'unset'} count={3} width={'90%'} style={{ margin: '5px' }} duration={.5} />
            </section>
        );
    }

    return (
        <SkeletonTheme color="var(--dark-mode-secondary-text-color)" highlightColor="var(--dark-mode-text-color)">
            {SkeletonSections}
        </SkeletonTheme>
    )
};