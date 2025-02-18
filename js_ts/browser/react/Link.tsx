
import { router } from 'lib/Router';

const Link = ({ to, children, target = null, className = '' }) => {

    function onClick(e) {
        if (e.getModifierState('Control') || e.getModifierState('Meta')) return; // allow control-click or cmd-click (mac) to work as usual
        e?.preventDefault();
        router.navigate(to);
    }

    return (
        <a href={`${to}`} onClick={onClick} class={`${className}`}>{children}</a>
    );

}

export default Link;
