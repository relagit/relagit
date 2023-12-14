import { JSX } from 'solid-js';

import './index.scss';

export interface AnchorProps {
	onClick?: () => void;
	href?: string;
	children: JSX.Element | string | JSX.Element[];
}

export default (props: AnchorProps) => {
	return (
		<button
			aria-role="link"
			class="anchor"
			onClick={() => {
				if (props.onClick) props.onClick();
				if (props.href) {
					window.open(props.href, '_blank');
				}
			}}
		>
			{props.children}
		</button>
	);
};
