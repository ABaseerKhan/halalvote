import React, { useContext, useEffect } from 'react';
import { ReactComponent as SwipeLeftIcon } from '../../icons/swipe-left.svg';
import { tutorialContext } from '../app-shell';

import './tutorial.css';

export const TutorialComponent = () => {
    const { tutorialShown, setTutorialContext } = useContext(tutorialContext);

    useEffect(() => {
        setTimeout(() => {
            setTutorialContext(true);
            setTimeout(() => {
              setTutorialContext(false);
            }, 1000);
          }, 1000); // eslint-disable-next-line
    }, []);

    return (
        tutorialShown ?
        <div className="next-topic-tutorial-container">
            <SwipeLeftIcon className="swipe-icon" />
            <div className={"next-topic-streak"}>{`Next topic`}</div>
        </div> : null
    )
}