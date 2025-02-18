
import { useState } from 'preact/hooks';

interface CheckButtonProps {
    label: string;
    onClick?: (e, isChecked: boolean) => void;
    onCheck: (isChecked: boolean) => void;
    checkOnClick?: boolean; // toggle the check when the button is clicked
    checked: boolean;
}

import { FunctionalComponent } from 'preact';

export const CheckButton: FunctionalComponent<CheckButtonProps> = ({ label, onClick, onCheck, checkOnClick, checked }) => {
    // Use local state to manage the checkbox state
    const [isChecked, setIsChecked] = useState(checked);

    // Handle click on the button
    const handleClick = (e) => {
        console.log(`click`, e.target);
        let _checked = isChecked;
        if (e.target.type == 'checkbox') return;
        if (checkOnClick) {
            // find checkbox
            let target = e.target;
            if (target.classList.contains('label')) target = e.target.parentNode;
            const checkbox = target.children[1] as HTMLInputElement;
            checkbox.checked = _checked = !checkbox.checked;
            handleCheck(checkbox);
        }
        console.log(`isChecked?`, _checked)
        if (onClick) onClick(e, _checked);
    };

    // Handle change on the checkbox
    const handleCheck = (el: HTMLInputElement) => {
        console.log(`CB?`, el)
        if (el) {
            setIsChecked(el.checked);
            onCheck(el.checked);
        }
    };

    return (
        <div class="check-button button" onClick={handleClick}>
            <div class="label">{label}</div>
            <input class="checkbox"
                type="checkbox"
                checked={isChecked}
                onChange={(e) => handleCheck(e.target)}
            />
        </div>
    );
};