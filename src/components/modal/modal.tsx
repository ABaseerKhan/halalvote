import React, { useEffect } from 'react';
import { AddTopicComponent } from '../add-topic/add-topic';
import { ModalType } from '../../types';
import { LoginComponent } from '../login/login';
import { useMedia } from '../../hooks/useMedia';
import { AccountComponent } from '../account/account';
import { vhToPixelsWithMax, vwToPixelsWithMax, vhToPixels } from "../../utils";

// type imports

// styles
import './modal.css';
import { elementStyles } from '../..';

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

    const heightVh = 70;
    const widthVw = isMobile ? 80 : 40;
    const maxHeight = window.innerHeight - (Math.max(elementStyles.maxTopicCarouselHeightPx, vhToPixels(elementStyles.topicCarouselHeightVh)) + vhToPixels(10));
    const maxWidth = 800;

    const getModalHeight = () => {
        return vhToPixelsWithMax(heightVh, maxHeight);
    }

    const getModalWidth = () => {
        return vwToPixelsWithMax(widthVw, maxWidth);
    }

    useEffect(() => {
        const modal = document.getElementById(modalId);
        const modalCover = document.getElementById(modalCoverId);

        if (modal && modalCover) {
            if (modalType === ModalType.LOGIN) {
                modal.style.zIndex = "4";
            }

            const height = getModalHeight() + "px";
            const marginTop = `max(-${heightVh/2}vh, -${maxHeight/2}px)`;
            const width = getModalWidth() + "px";
            const marginLeft = `max(-${widthVw/2}vw, -${maxWidth/2}px)`;

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
            <div id={modalCoverId} className={modalCoverId} onClick={ closeModal }></div>
            <div id={modalId} className={modalId}>
                { modalType === ModalType.LOGIN && <LoginComponent closeModal={closeModal} onLogin={props.onLogin}/> }
                { modalType === ModalType.ADD_TOPIC && <AddTopicComponent closeModal={closeModal} fetchTopics={fetchTopics} /> }
                { modalType === ModalType.ACCOUNT && <AccountComponent closeModal={closeModal} username={accountUsername!} fetchTopics={fetchTopics} showSpecificComment={showSpecificComment} /> }
            </div>
        </div>
    );
}