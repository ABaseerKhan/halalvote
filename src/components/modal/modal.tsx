import React from 'react';

// type imports
import { ModalType } from '../../types';
import { LoginComponent } from '../login/login';

// styles
import './modal.css';
import { AddItemComponent } from '../add-item/add-item';

interface ModalComponentProps {
    modalType: ModalType;
    displayModal: any;
    setUserDetails: any;
};
export const ModalComponent = (props: ModalComponentProps) => {
    const { modalType, displayModal, setUserDetails } = props;

    return (
        <div>
            <div className='modal-cover' onClick={ () => { displayModal(ModalType.NONE) } }></div>
            <div className="modal">
                { modalType == ModalType.LOGIN && <LoginComponent displayModal={displayModal} setUserDetails={setUserDetails} /> }
                { modalType == ModalType.ADD_ITEM && <AddItemComponent displayModal={displayModal} /> }
            </div>
        </div>
    );
}