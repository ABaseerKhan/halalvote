import React from 'react';
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

    return (
        <Portal>
            <div className='modal-cover' onClick={ removeModal }></div>
            <div className="modal">
                { modalType === ModalType.LOGIN && <LoginComponent removeModal={removeModal} /> }
                { modalType === ModalType.ADD_ITEM && <AddItemComponent removeModal={removeModal} fetchItems={fetchItems} /> }
            </div>
        </Portal>
    );
}