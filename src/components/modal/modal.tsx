import React, { useEffect } from 'react';
import { AddItemComponent } from '../add-item/add-item';
import { Portal } from '../../index';
import { ModalType } from '../../types';
import { LoginComponent } from '../login/login';
import { useMedia } from '../../hooks/useMedia';

// type imports

// styles
import './modal.css';

interface ModalComponentProps {
    removeModal: any,
    modalType: ModalType;
    fetchItems: any;
};
export const ModalComponent = (props: ModalComponentProps) => {
    const { removeModal, modalType, fetchItems } = props;

    const isMobile = useMedia(
        // Media queries
        ['(max-width: 600px)'],
        [true],
        // default value
        false
    );

    const modalId = "modal";

    useEffect(() => {
        const modal = document.getElementById(modalId);

        if (modal) {
            let height = "min(60vh, 500px)";
            let marginTop = "max(-30vh, -250px)";
            let width = "min(50vw, 500px)";
            let marginLeft = "max(-25vw, -250px)";

            if (isMobile) {
                height = "50vh";
                marginTop = "-25vh";
                width = "70vw";
                marginLeft = "-35vw";
            }

            modal.animate([
                {height: height, marginTop: marginTop, width: width, marginLeft: marginLeft}
            ], {
                duration: 100,
                fill: "forwards"
            });
        } // eslint-disable-next-line
    }, []);

    const closeModal = () => {
        const modal = document.getElementById(modalId);

        if (modal) {
            const animation: Animation = modal.animate([
                {height: "0", marginTop: "0", width: "0", marginLeft: "0"}
            ], {
                duration: 100,
                fill: "forwards"
            });
            animation.onfinish = removeModal;
        }
    }

    return (
        <Portal>
            <div className='modal-cover' onClick={ closeModal }></div>
            <div id={modalId} className="modal">
                { modalType === ModalType.LOGIN && <LoginComponent closeModal={closeModal} /> }
                { modalType === ModalType.ADD_ITEM && <AddItemComponent closeModal={closeModal} fetchItems={fetchItems} /> }
            </div>
        </Portal>
    );
}