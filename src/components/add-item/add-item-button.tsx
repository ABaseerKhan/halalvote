import React, { useState } from 'react';
import { ReactComponent as AddButtonSVG } from '../../icons/add-button.svg';
import { ModalComponent } from '../modal/modal';
import { useMedia } from '../../hooks/useMedia';

// type imports
import { ModalType } from '../../types';

// styles
import './add-item.css';

interface AddItemButtonComponentProps {
    fetchItems: any
};
export const AddItemButtonComponent = (props: AddItemButtonComponentProps) => {
    const { fetchItems } = props;

    const [state, setState] = useState<{addItemDisplayed: Boolean, isDragging: {value: boolean}  }>({
        addItemDisplayed: false,
        isDragging: {value: false}
    });

    const isMobile = useMedia(
        // Media queries
        ['(max-width: 600px)'],
        [true],
        // default value
        false
    );

    const setAddItemDisplayed = (addItemDisplayed: Boolean) => {
        setState({...state, addItemDisplayed: addItemDisplayed});
    }

    const addButtonId = "add-item-button";
    const addButton = document.getElementById(addButtonId);

    if (addButton) {
        if (isMobile) {
            addButton.ontouchmove = (event: any) => {
                // grab the location of touch
                var touchLocation = event.targetTouches[0];
                
                // assign box new coordinates based on the touch.
                addButton.style.left = touchLocation.pageX - 30 + 'px';
                addButton.style.top = touchLocation.pageY - 30 + 'px';
            }
            addButton.onclick = () => {
                setAddItemDisplayed(true);
            }
        } else {
            const onMouseMove = (event: any) => {
                state.isDragging.value = true;
                addButton.style.bottom = "0";
                addButton.style.right = "0";
                addButton.style.top = (parseInt(event.pageY) - 30).toString();
                addButton.style.left = (parseInt(event.pageX) - 30).toString();
            }
            addButton.onmousedown = () => {
                window.onmousemove = onMouseMove
            };
            addButton.onmouseup = () => {
                window.onmousemove = null;
                if (!state.isDragging.value) {
                    setAddItemDisplayed(true);
                } else {
                    state.isDragging.value = false;
                }
            }
            window.onmouseup = () => {
                state.isDragging.value = false;
                addButton.onmousemove = null;
            }
        }
    }

    return (
        <div>
            { state.addItemDisplayed &&
                <ModalComponent removeModal={() => setAddItemDisplayed(false)} modalType={ModalType.ADD_ITEM} fetchItems={fetchItems}/>
            }
            <AddButtonSVG id={addButtonId} className="add-item-button"></AddButtonSVG>
        </div>
    );
}