import { JSX } from 'solid-js';

import './index.scss';

export interface IAnchorProps {
	onClick?: () => void;
	href?: string;
	children: JSX.Element | string | JSX.Element[];
}

export default (props: IAnchorProps) => {
	return (
		<button
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
