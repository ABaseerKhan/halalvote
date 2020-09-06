import React, { useEffect } from 'react';
import { AddTopicComponent } from '../add-topic/add-topic';
import { ModalType } from '../../types';
import { LoginComponent } from '../login/login';
import { useMedia } from '../../hooks/useMedia';

// type imports

// styles
import './modal.css';
import { DescriptionComponent } from '../description/description';
import { AccountComponent } from '../account/account';

interface ModalComponentProps {
    removeModal: any,
    modalType: ModalType;
    fetchTopics?: any;
    topicTitle?: string | null;
    onLogin?: any;
};
export const ModalComponent = (props: ModalComponentProps) => {
    const { removeModal, modalType, fetchTopics, topicTitle } = props;

    const isMobile = useMedia(
        // Media queries
        ['(max-width: 600px)'],
        [true],
        // default value
        false
    );

    const modalId = "modal";
    const modalCoverId = "modal-cover";

    useEffect(() => {
        const modal = document.getElementById(modalId);
        const modalCover = document.getElementById(modalCoverId);

        if (modal && modalCover) {
            if (modalType === ModalType.LOGIN) {
                modal.style.zIndex = "6";
                modalCover.style.zIndex = "5";
            }

            let heightVh = 60;
            let widthVh = 50;
            const maxHeight = 750;
            const maxWidth = 500;

            if (isMobile) {
                heightVh = 50;
                widthVh = 70;
            }

            const height = `min(${heightVh}vh, ${maxHeight}px)`;
            const marginTop = `max(-${heightVh/2}vh, -${maxHeight/2}px)`;
            const width = `min(${widthVh}vw, ${maxWidth}px)`;
            const marginLeft = `max(-${widthVh/2}vw, -${maxWidth/2}px)`;

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
                { modalType === ModalType.ADD_ITEM && <AddTopicComponent closeModal={closeModal} fetchTopics={fetchTopics} /> }
                { modalType === ModalType.DESCRIPTION && topicTitle != null && <DescriptionComponent topicTitle={topicTitle} /> }
                { modalType === ModalType.ACCOUNT && <AccountComponent /> }
            </div>
        </div>
    );
}