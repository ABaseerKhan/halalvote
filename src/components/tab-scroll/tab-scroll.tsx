import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

import './tab-scroll.css';

var isScrolling: any;
interface TabScrollProps {
    tabNames: string[],
    Sections: any[],
    tabChangedCallback?: any,
};
export const TabScroll = (props: TabScrollProps) => {
    const { tabNames, Sections, tabChangedCallback } = props;

    const [tabIndex, setTabIndex] = useState<number>(0);
    const [underlineTranslationPx, setUnderlineTranslationPx] = useState<number>(0);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.onscroll = (e: Event) => {
                if (containerRef.current) {
                    setUnderlineTranslationPx(((containerRef.current.clientWidth / 2) * ((containerRef.current!.scrollLeft) / containerRef.current!.clientWidth)));
                    clearTimeout(isScrolling);
                    isScrolling = setTimeout(function() {
                        if (containerRef.current) {
                            const index = Math.floor((containerRef.current!.scrollLeft + (containerRef.current!.clientWidth/2)) / containerRef.current!.clientWidth);
                            switch(index) {
                                case 0:
                                    setTabIndex(0);
                                    break;
                                case 1:
                                    setTabIndex(1);
                                    break;
                                default:
                                    setTabIndex(0);
                            };
                        }
                    }, 66);
                }
            }
      } // eslint-disable-next-line
    }, []);

    useLayoutEffect(() => {
        tabChangedCallback && tabChangedCallback(tabIndex);
        if (containerRef.current) {
            let scrollPosition: number;
            switch(tabIndex) {
                case 0:
                    scrollPosition = 0;
                    break;
                case 1:
                    scrollPosition = containerRef.current!.clientWidth;
                    break;
                default:
                    scrollPosition = 0;
            }
            containerRef.current.scrollLeft = scrollPosition;
            setUnderlineTranslationPx(((containerRef.current.clientWidth / 2) * ((containerRef.current!.scrollLeft) / containerRef.current!.clientWidth)));
        };
    }, [tabIndex]);

    return (
        <div className="tabs-scroll-container" ref={containerRef} onTouchStart={(e) => { e.stopPropagation(); }} onTouchMove={(e) => { e.stopPropagation(); }} >
            <>
                <div className={"tabs-container"}>
                    <span onClick={() => setTabIndex(0)} className={(underlineTranslationPx <= 42) ? "tab-selected" : "tab-unselected"}>{tabNames[0]}</span>
                    <span onClick={() => setTabIndex(1)} className={(underlineTranslationPx > 42) ? "tab-selected" : "tab-unselected"}>{tabNames[1]}</span>
                </div>
                <div className={"tabs-underline"} style={{ transform: `translate(${underlineTranslationPx}px, 28px)` }}></div>
            </>
            <div className={"tabs-scroll-section"} style={{ transform: 'translate(0, 0)' }}>
                {Sections[0]}
            </div>
            <div className={"tabs-scroll-section"} style={{ transform: 'translate(100%, 0)' }}>
                {Sections[1]}
            </div>
        </div>
    )
}