import React from 'react';
import ReactTooltip from 'react-tooltip';

// styles
import './page-scroller.css';

interface PageScrollerComponentProps {
    pageZeroId: string,
    pageOneId: string,
    pageTwoId: string,
    pageThreeId: string,
    scrollToPage: any;
};
export const PageScrollerComponent = (props: PageScrollerComponentProps) => {
    const { pageZeroId, pageOneId, pageTwoId, pageThreeId, scrollToPage } = props;

    return (
        <div className='page-scroller'>
            <div className='page-scroller-button-container'>
                <div id={pageZeroId} className='page-scroller-button' onClick={() => {scrollToPage(0)}} data-tip={"Search"}/>
                <ReactTooltip effect={"solid"} />
            </div>
            <div className='page-scroller-button-container'>
                <div id={pageOneId} className='page-scroller-button-selected' onClick={() => {scrollToPage(1)}} data-tip={"Comments"}/>
                <ReactTooltip effect={"solid"} />
            </div>
            <div className='page-scroller-button-container'>
                <div id={pageTwoId} className='page-scroller-button' onClick={() => {scrollToPage(2)}} data-tip={"Description"}/>
                <ReactTooltip effect={"solid"} />
            </div>
            <div className='page-scroller-button-container'>
                <div id={pageThreeId} className='page-scroller-button' onClick={() => {scrollToPage(3)}} data-tip={"Analytics"}/>
                <ReactTooltip effect={"solid"} />
            </div>
        </div>
    );
}