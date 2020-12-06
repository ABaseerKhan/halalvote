import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ReactComponent as PlayButtonSVG } from "../../icons/play-button.svg";

import './topic-images.css';

export const _VideoPlayer = ({ src, inView, stylesOverride }: { src: string; inView: boolean; stylesOverride?: any }, ref: any) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [state, setState] = useState<{ isPlaying: boolean | undefined }>({ isPlaying: undefined });

    useEffect(() => {
        if (!inView) {
            pausePlayback();
        };
        if (inView) {
            playFromBeginning();
        }
    }, [inView])

    useImperativeHandle(ref, () => ({
        playFromBeginning: playFromBeginning,
    }));

    const togglePlayback = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                setState(prevState => ({ ...prevState, isPlaying: true }));
                videoRef.current.play();
            } else {
                setState(prevState => ({ ...prevState, isPlaying: false }));
                videoRef.current.pause();
            }
        }
    };

    const playFromBeginning = async ()=> {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            try { 
                await videoRef.current.play(); 
            } catch(e) {
                setState(prevState => ({ ...prevState, isPlaying: false }));
                console.log(e);
                return;
            }
            setState(prevState => ({ ...prevState, isPlaying: true }));
        }
    };

    const pausePlayback = () => {
        if (videoRef.current) {
            if (!videoRef.current.paused) {
                videoRef.current.pause();
                setState(prevState => ({ ...prevState, isPlaying: undefined }));
            }
        }
    };

    return (
        <div className="video-container" onClick={togglePlayback} >
            <video ref={videoRef} className="video-player" style={stylesOverride ? stylesOverride : undefined} loop playsInline>
                <source src={src} type="video/mp4"/>
            </video>
            {state.isPlaying===false && <PlayButtonSVG className="play-button"/>}
        </div>
    )
}

export const VideoPlayer = forwardRef(_VideoPlayer);