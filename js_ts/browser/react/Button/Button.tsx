import { Fn } from 'lib/Types';
// interface ButtonProps {
//     className: string;
//     filled?: boolean;
//     round?: boolean;
//     color?: string;
//     textColor?: string;
//     icon?: string;
//     iconPosition?: string;
//     textPosition?: string;
//     size?: string;
// }

type IButtonProps = {
    className?: string;
    onClick?: Fn;
    disabled?: boolean
    children: any;
    color?: string;
}

export const Button = (props: IButtonProps) => {

    let cl = props.className || "";
    if (props.color) cl += `color-${props.color}`;

    return <div class={`button ${cl}`} onClick={props.onClick}>
        {props.children}
    </div>;
}
