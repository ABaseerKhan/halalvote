import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ClipLoader } from 'react-spinners';
import { ReactComponent as PlayButtonSVG } from "../../icons/play-button.svg";
import { ReactComponent as UnMuteButtonSVG } from "../../icons/unmute-button.svg";
import { loaderCssOverride } from './topic-media';

import './topic-media.css';
import { muteContext } from '../app-shell';

interface VideoPlayerProps { 
    src: string; 
    inView: boolean;
    stylesOverride?: any;
}
export const _VideoPlayer = ({ src, inView, stylesOverride }: VideoPlayerProps, ref: any) => {
    const { muted, setMuted } = useContext(muteContext);

    const videoRef = useRef<HTMLVideoElement>(null);
    const [state, setState] = useState<{ isPlaying: boolean | undefined; loading: boolean; }>({ isPlaying: undefined, loading: true });

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
            setMuted(false);
        }
    };

    const playFromBeginning = async ()=> {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            try { 
                await videoRef.current.play();
            } catch(e) {
                setState(prevState => ({ ...prevState, isPlaying: false, loading: false }));
                return;
            }
            setState(prevState => ({ ...prevState, isPlaying: true }));
        }
    };

    const pausePlayback = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            setState(prevState => ({ ...prevState, isPlaying: undefined }));
        }
    };

    const unMute = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        e.stopPropagation();
        if (videoRef.current) {
            setMuted(false);
        }
    };

    return (
        <div className="video-container" onClick={togglePlayback} >
            <video 
                key={src}
                loop 
                ref={videoRef}
                className="video-player" 
                style={stylesOverride ? stylesOverride : undefined} 
                onCanPlay={() => setState(prevState => ({ ...prevState, loading: false }))} 
                webkit-playsinline={'true'} 
                muted={muted} 
                playsInline
            >
                <source src={src} type="video/mp4"/>
                Your browser doesn't support embedded videos.
            </video>
            {state.loading && <ClipLoader css={loaderCssOverride} size={50} color={"var(--light-neutral-color)"} loading={state.loading}/>}
            {state.isPlaying===false && <PlayButtonSVG className="play-button"/>}
            {muted && !state.loading && <UnMuteButtonSVG onClick={unMute} className="mute-button"/>}
        </div>
    )
}

export const VideoPlayer = forwardRef(_VideoPlayer);