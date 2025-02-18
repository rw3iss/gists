import './Toggle.scss';

type IToggleProps = {
    label?: string;
    value?: boolean;
    onChange?: (newValue: boolean) => void;
    disabled?: boolean;
}

const Toggle = ({ label, value, onChange, disabled }: IToggleProps) => {
    const handleToggle = () => {
        if (!disabled) {
            if (onChange) onChange(!value);
        }
    };

    return (
        <div className={`toggle ${value ? 'on' : 'off'}`}>
            {label && <div class="label">{label}</div>}
            <div
                className={`toggle-switch ${disabled ? 'disabled' : ''}`}
                onClick={handleToggle}
            >
                <div className="toggle-handle" />
            </div>
        </div>
    );
};

export default Toggle;