import { JSX } from 'solid-js';

import { openExternal } from '@app/modules/shell';

import './index.scss';

export interface AnchorProps {
	onClick?: () => void;
	href?: string;
	children: JSX.Element | string | JSX.Element[];
}

export default (props: AnchorProps) => {
	return (
		<button
			role="link"
			class="anchor"
			onClick={() => {
				if (props.onClick) props.onClick();
				if (props.href) {
					openExternal(props.href);
				}
			}}
		>
			{props.children}
		</button>
	);
};
