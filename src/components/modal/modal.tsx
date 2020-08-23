import React, { useEffect } from 'react';
import { AddItemComponent } from '../add-item/add-item';
import { ModalType } from '../../types';
import { LoginComponent } from '../login/login';
import { useMedia } from '../../hooks/useMedia';

// type imports

// styles
import './modal.css';
import { DescriptionComponent } from '../description/description';

interface ModalComponentProps {
    removeModal: any,
    modalType: ModalType;
    fetchItems?: any;
    itemName?: string | null;
    onLogin?: any;
};
export const ModalComponent = (props: ModalComponentProps) => {
    const { removeModal, modalType, fetchItems, itemName } = props;

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
                { modalType === ModalType.ADD_ITEM && <AddItemComponent closeModal={closeModal} fetchItems={fetchItems} /> }
                { modalType === ModalType.DESCRIPTION && itemName != null && <DescriptionComponent itemName={itemName} /> }
            </div>
        </div>
    );
}