import React, { useState } from 'react';
import { ReactComponent as AddButtonSVG } from '../../icons/add-button.svg';
import { ModalComponent } from '../modal/modal';

// type imports
import { ModalType } from '../../types';

// styles
import './add-item.css';

interface AddItemButtonComponentProps {
    fetchItems: any
};
export const AddItemButtonComponent = (props: AddItemButtonComponentProps) => {
    const { fetchItems } = props;
    const [state, setState] = useState<{addItemDisplayed: Boolean  }>({
        addItemDisplayed: false
    });

    const setAddItemDisplayed = (addItemDisplayed: Boolean) => {
        setState({addItemDisplayed: addItemDisplayed});
    }

    return (
        <div>
            { state.addItemDisplayed &&
                <ModalComponent removeModal={() => setAddItemDisplayed(false)} modalType={ModalType.ADD_ITEM} fetchItems={fetchItems}/>
            }
            <AddButtonSVG className="add-item-button" onClick={ () => setAddItemDisplayed(true) }></AddButtonSVG>
        </div>
    );
}