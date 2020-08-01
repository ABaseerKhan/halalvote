import React from 'react';
import { ReactComponent as AddButtonSVG } from '../../icons/add-button.svg';

// type imports
import { ModalType } from '../../types';

// styles
import './add-item.css';

interface AddItemButtonComponentProps {
    displayModal: any;
};
export const AddItemButtonComponent = (props: AddItemButtonComponentProps) => {
    const { displayModal } = props;

    return (
        <AddButtonSVG className="add-item-button" onClick={ () => { displayModal(ModalType.ADD_ITEM) } }>+</AddButtonSVG>
    );
}