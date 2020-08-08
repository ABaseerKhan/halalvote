import React from 'react';
import ReactTooltip from 'react-tooltip';

// styles
import './page-scroller.css';

interface PageScrollerComponentProps {
    pageZeroId: string,
    pageOneId: string,
    pageTwoId: string,
    scrollToPage: any;
};
export const PageScrollerComponent = (props: PageScrollerComponentProps) => {
    const { pageZeroId, pageOneId, pageTwoId, scrollToPage } = props;

    return (
        <div className='page-scroller'>
            <div className='page-scroller-button-container'>
                <div id={pageZeroId} className='page-scroller-button' onClick={() => {scrollToPage(0)}} data-tip={pageZeroId}/>
                <ReactTooltip effect={"solid"} />
            </div>
            <div className='page-scroller-button-container'>
                <div id={pageOneId} className='page-scroller-button-selected' onClick={() => {scrollToPage(1)}} data-tip={pageOneId}/>
                <ReactTooltip effect={"solid"} />
            </div>
            <div className='page-scroller-button-container'>
                <div id={pageTwoId} className='page-scroller-button' onClick={() => {scrollToPage(2)}} data-tip={pageTwoId}/>
                <ReactTooltip effect={"solid"} />
            </div>
        </div>
    );
}