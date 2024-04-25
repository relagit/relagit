import { JSX } from 'solid-js';

import './index.scss';

type PanelProps = {
	expanded?: boolean;
	children?: JSX.Element;
};

export default (props: PanelProps) => {
	return (
		<div
			classList={{
				panel: true,
				expanded: props.expanded
			}}
		>
			{props.children}
		</div>
	);
};
