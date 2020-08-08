import React from 'react';
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

let SkeletonSections: JSX.Element[] = [];
for (let i = 0; i < 10; i++) {
    SkeletonSections.push(
        <section style={{ margin: '20px' }}>
            <Skeleton width={'30%'} style={{ margin: '5px', maxWidth: '200px' }} duration={.5} />
            <Skeleton count={3} width={'90%'} style={{ margin: '5px' }} duration={.5} />
        </section>
    );
}

export const SkeletonComponent = () => (
    <SkeletonTheme color="#d9d9d9" highlightColor="#e6e6e6">
        {SkeletonSections}
    </SkeletonTheme>
);