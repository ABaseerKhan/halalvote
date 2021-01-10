import React, { useEffect } from 'react';
import { AddTopicComponent } from '../add-topic/add-topic';
import { ModalType } from '../../types';
import { LoginComponent } from '../login/login';
import { useMedia } from '../../hooks/useMedia';
import { ProfileComponent } from '../profile/profile';
import { vhToPixels, vwToPixelsWithMax } from "../../utils";
import { modalHeightVh, modalMaxWidth, modalWidthVw } from '../..';
import { AccountComponent } from '../account/account';

// type imports

// styles
import './modal.css';

interface ModalComponentProps {
    removeModal: any,
    modalType: ModalType;
    accountUsername?: string;
    showSpecificComment?: any;
    fetchTopics?: any;
    onLogin?: any;
};
export const ModalComponent = (props: ModalComponentProps) => {
    const { removeModal, modalType, accountUsername, fetchTopics, showSpecificComment } = props;

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
            const marginTop = `-${modalHeightVh/2}vh`;
            const width = getModalWidth() + "px";
            const marginLeft = `max(-${modalWidthVw(isMobile)/2}vw, -${modalMaxWidth/2}px)`;

            modal.animate([
                {height: height, marginTop: marginTop, width: width, marginLeft: marginLeft}
            ], {
                duration: 100,
                fill: "forwards"
            }).onfinish = () => {
                modal.style.overflow = "visible";
            };
        } // eslint-disable-next-line
    }, []);

    const closeModal = () => {
        const modal = document.getElementById(modalId);

        if (modal) {
            modal.style.overflow = "hidden";

            modal.animate([
                {height: "0", marginTop: "0", width: "0", marginLeft: "0"}
            ], {
                duration: 100,
                fill: "forwards"
            }).onfinish = removeModal;
        }
    }

    return (
        <div>
            <div id={modalCoverId} className={modalCoverId} onClick={closeModal} onTouchStart={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                        onTouchMove={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                        onTouchEnd={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}}></div>
            <div id={modalId} className={modalId} onTouchStart={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                        onTouchMove={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}} 
                        onTouchEnd={(event: React.TouchEvent<HTMLDivElement>) => {event.stopPropagation()}}>
                {
                    modalType === ModalType.LOGIN ?
                        <LoginComponent closeModal={closeModal} onLogin={props.onLogin}/> :
                    modalType === ModalType.ADD_TOPIC ?
                        <AddTopicComponent closeModal={closeModal} fetchTopics={fetchTopics} /> :
                    modalType === ModalType.PROFILE ?
                        <ProfileComponent closeModal={closeModal} username={accountUsername!} fetchTopics={fetchTopics} showSpecificComment={showSpecificComment} /> :
                    modalType === ModalType.ACCOUNT &&
                        <AccountComponent/>
                }
            </div>
        </div>
    );
};
