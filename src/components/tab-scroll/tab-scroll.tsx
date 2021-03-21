import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

import './tab-scroll.css';

var isScrolling: any;
interface TabScrollProps {
    tabNames: string[],
    Sections: any[],
    tabChangedCallback?: any,
    sectionFillsContainer?: boolean,
};
export const TabScroll = (props: TabScrollProps) => {
    const { tabNames, Sections, tabChangedCallback, sectionFillsContainer } = props;

    const [tabIndex, setTabIndex] = useState<number>(0);
    const [underlineTranslationPx, setUnderlineTranslationPx] = useState<number>(0);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.onscroll = (e: Event) => {
                if (containerRef.current) {
                    setUnderlineTranslationPx(((containerRef.current.clientWidth / tabNames.length) * ((containerRef.current!.scrollLeft) / containerRef.current!.clientWidth)));
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
    }, [tabNames]);

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
    }, [tabIndex, tabChangedCallback]);

    return (
        <div className="tabs-scroll-container" ref={containerRef} onTouchStart={(e) => { e.stopPropagation(); }} onTouchMove={(e) => { e.stopPropagation(); }} >
            <>
                <div className={"tabs-container"}>
                    {tabNames.map((tab, idx) => {
                        return (
                            <span key={`${tab}-${idx}`} onClick={() => setTabIndex(idx)} className={((idx === 0) ? underlineTranslationPx <= 42 : underlineTranslationPx > 42) ? "tab-selected" : "tab-unselected"}>{tab}</span>
                        )
                    })}
                </div>
                <div className={"tabs-underline"} style={{ left: `calc(${50 / tabNames.length}% - .75em)`, transform: `translate(${underlineTranslationPx}px, 28px)` }}></div>
            </>
            {Sections.map((section, idx) => {
                return (
                    <div key={`section-${idx}`} className={"tabs-scroll-section"} style={{ transform: `translate(${idx * 100}%, 0)`, ...(sectionFillsContainer ? { height: '100%', marginTop: 0 } : { }) }}>
                        {section}
                    </div>
                )
            })}
        </div>
    )
}