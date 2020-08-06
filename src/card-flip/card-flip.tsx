import * as React from 'react';
import { useEffect, useState } from 'react';

import { ReactFlipCardProps } from './index';
import { NONAME } from 'dns';

const ReactCardFlip: React.FC<ReactFlipCardProps> = (props: ReactFlipCardProps) => {
    const {
        cardStyles: {
            front,
            back,
        },
        cardZIndex,
        containerStyle,
        flipDirection,
        flipSpeedFrontToBack=0.6,
        flipSpeedBackToFront=0.6,
        infinite,
    } = props;

    const [isFlipped, setFlipped] = useState(props.isFlipped);
    const [rotation, setRotation] = useState(props.isFlipped ? 180 : 0);
    const [frontCardWidth, setFrontCardWidth] = useState('100%');
    const [backCardWidth, setBackCardWidth] = useState('100%');

    useEffect(() => {
        if (props.isFlipped != isFlipped) {
            const commentsContainers = [document.getElementById("comments-container-0"), document.getElementById("comments-container-1")];
            if (commentsContainers[0] && commentsContainers[1]) {
                commentsContainers[0].style.overflow = "hidden";
                commentsContainers[1].style.overflow = "hidden";
            }
            setFlipped(props.isFlipped);
            setRotation((c) => c + 180);

            setFrontCardWidth("100%");
            setBackCardWidth("100%")
            setTimeout(() => {
                if (commentsContainers[0] && commentsContainers[1]) {
                    commentsContainers[0].style.overflow = "scroll";
                    commentsContainers[1].style.overflow = "scroll";

                    if (props.isFlipped) {
                        setFrontCardWidth("0");
                    } else {
                        setBackCardWidth("0");
                    }
                }
            }, (flipSpeedFrontToBack * 1000 + 20));
        }
    }, [props.isFlipped]);

    const getComponent = (key: 0 | 1) => {
        if (props.children.length !== 2) {
            throw new Error(
                'Component ReactCardFlip requires 2 children to function',
            );
        }
        return props.children[key];
    };

    const frontRotateY = `rotateY(${
        infinite ? rotation : isFlipped ? 180 : 0
        }deg)`;
    const backRotateY = `rotateY(${
        infinite ? rotation + 180 : isFlipped ? 0 : -180
        }deg)`;
    const frontRotateX = `rotateX(${
        infinite ? rotation : isFlipped ? 180 : 0
        }deg)`;
    const backRotateX = `rotateX(${
        infinite ? rotation + 180 : isFlipped ? 0 : -180
        }deg)`;

    const styles: any = {
        back: {
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            height: '100%',
            left: '0',
            position: isFlipped ? 'relative' : 'absolute',
            top: '0',
            transform: flipDirection === 'horizontal' ? backRotateY : backRotateX,
            transformStyle: 'preserve-3d',
            transition: `transform ${flipSpeedFrontToBack}s`,
            width: backCardWidth,
            zIndex: isFlipped ? '2' : 'unset',
            ...back,
        },
        container: {
            perspective: '1000px',
            zIndex: `${cardZIndex}`,
        },
        flipper: {
            height: '100%',
            position: 'relative',
            width: '100%',
        },
        front: {
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            height: '100%',
            left: '0',
            position: isFlipped ? 'absolute' : 'relative',
            top: '0',
            transform: flipDirection === 'horizontal' ? frontRotateY : frontRotateX,
            transformStyle: 'preserve-3d',
            transition: `transform ${flipSpeedBackToFront}s`,
            width: frontCardWidth,
            zIndex: isFlipped ? 'unset' : '2',
            ...front,
        },
    };

    return (
        <div
        className="react-card-flip"
        style={{ ...styles.container, ...containerStyle }}
        >
        <div className="react-card-flipper" style={styles.flipper}>
            <div className="react-card-front" style={styles.front}>
            {getComponent(0)}
            </div>

            <div className="react-card-back" style={styles.back}>
            {getComponent(1)}
            </div>
        </div>
        </div>
    );
};

ReactCardFlip.defaultProps = {
    cardStyles: {
        back: {},
        front: {},
    },
    cardZIndex: 'auto',
    containerStyle: {},
    flipDirection: 'horizontal',
    flipSpeedBackToFront: 0.6,
    flipSpeedFrontToBack: 0.6,
    infinite: false,
    isFlipped: false,
};

export default ReactCardFlip;
