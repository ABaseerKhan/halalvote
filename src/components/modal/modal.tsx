import React, { useEffect } from 'react';
import { AddTopicComponent } from '../add-topic/add-topic';
import { ModalType } from '../../types';
import { LoginComponent } from '../login/login';
import { useMedia } from '../../hooks/useMedia';
import { ProfileComponent } from '../profile/profile';
import { vhToPixels, vwToPixelsWithMax } from "../../utils";
import { modalHeightVh, modalMaxWidth, modalWidthVw } from '../..';
import { AccountComponent } from '../account/account';
import { ContactComponent } from "../contact/contact";

// type imports

// styles
import './modal.css';
import { AboutComponent } from '../about/about';

interface ModalComponentProps {
    removeModal: any,
    modalType: ModalType;
    accountUsername?: string;
    fetchTopics?: any;
    onLogin?: any;
};
export const ModalComponent = (props: ModalComponentProps) => {
    const { removeModal, modalType, accountUsername, fetchTopics } = props;

    const isMobile = useMedia(
        // Media queries
        ['(max-width: 600px)'],
        [true],
        // default value
        false
    );

    const modalId = "modal";
    const modalCoverId = "modal-cover";

    const getModalHeight = () => {
        return vhToPixels(modalHeightVh);
    }

    const getModalWidth = () => {
        return vwToPixelsWithMax(modalWidthVw(isMobile), modalMaxWidth);
    }

    useEffect(() => {
        const modal = document.getElementById(modalId);
        const modalCover = document.getElementById(modalCoverId);

        if (modal && modalCover) {
            if (modalType === ModalType.LOGIN) {
                modal.style.zIndex = "4";
            }

            const height = getModalHeight() + "px";
            const width = getModalWidth() + "px";

            modal.animate([
                {height: height, width: width}
            ], {
                duration: 100,
                fill: "forwards"
            }).onfinish = () => {
                modal.style.overflow = "visible";
                modal.style.height = height;
                modal.style.width = width;
            };
        } // eslint-disable-next-line
    }, []);

    const closeModal = (callback?: any) => {
        const modal = document.getElementById(modalId);

        if (modal) {
            modal.style.overflow = "hidden";

            modal.animate([
                {height: "0", marginTop: "0", width: "0", marginLeft: "0"}
            ], {
                duration: 100,
                fill: "forwards"
            }).onfinish = callback ? callback : removeModal;
        }
    }

    return (
        <div style={{ position: 'absolute', left: '50%', height: '100%' }}>
            <closeModalContext.Provider value={{ closeModal: closeModal }}>
                <div id={modalCoverId} className={modalCoverId} onClick={() => closeModal(removeModal)} onTouchStart={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                            onTouchMove={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                            onTouchEnd={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}}></div>
                <div id={modalId} className={modalId} onTouchStart={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                            onTouchMove={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                            onTouchEnd={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}}>
                    {
                        modalType === ModalType.LOGIN ?
                            <LoginComponent onLogin={props.onLogin}/> :
                        modalType === ModalType.ADD_TOPIC ?
                            <AddTopicComponent fetchTopics={fetchTopics} /> :
                        modalType === ModalType.PROFILE ?
                            <ProfileComponent username={accountUsername!} fetchTopics={fetchTopics} /> :
                        modalType === ModalType.CONTACT ?
                            <ContactComponent /> :
                        modalType === ModalType.ACCOUNT ?
                            <AccountComponent /> :
                        modalType === ModalType.ABOUT &&
                            <AboutComponent />
                    }
                </div>
            </closeModalContext.Provider>
        </div>
    );
};

export const closeModalContext = React.createContext<{closeModal: (callback?: any) => void}>({
    closeModal: () => undefined
});