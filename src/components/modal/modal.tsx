import React from 'react';

// type imports

// styles
import './modal.css';
import { ModalType } from '../../types';
import { LoginComponent } from '../login/login';

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
            </div>
        </div>
    );
}