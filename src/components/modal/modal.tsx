import React, { useEffect } from 'react';
import { AddItemComponent } from '../add-item/add-item';
import { Portal } from '../../index';

// type imports
import { ModalType } from '../../types';
import { LoginComponent } from '../login/login';

// styles
import './modal.css';

interface ModalComponentProps {
    removeModal: any,
    modalType: ModalType;
    fetchItems: any;
};
export const ModalComponent = (props: ModalComponentProps) => {
    const { removeModal, modalType, fetchItems } = props;

    const modalId = "modal";

    useEffect(() => {
        const modal = document.getElementById(modalId);

        if (modal) {
            modal.animate([
                {height: "min(60vh, 500px)", marginTop: "max(-30vh, -250px)", width: "min(50vw, 500px)", marginLeft: "max(-25vw, -250px)"}
            ], {
                duration: 100,
                fill: "forwards"
            })
        }
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