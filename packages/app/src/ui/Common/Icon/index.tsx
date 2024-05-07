import octicons from '@primer/octicons';
import { JSX } from 'solid-js';

import './index.scss';

export type IconName = keyof typeof octicons;

export interface IconProps {
	name: IconName;
	variant?: 12 | 16 | 24;
	className?: string;
	size?: number;
	style?: JSX.HTMLAttributes<HTMLSpanElement>['style'];
}

export default (props: IconProps) => {
	if (!props.name) return null;

	return (
		<span
			{...props}
			classList={{
				icon: true,
				[props.className!]: true
			}}
			aria-label={props.name}
			role="img"
			innerHTML={
				props.variant ?
					`<svg width=${props.size || props.variant} height=${
						props.size || props.variant
					} viewBox="0 0 ${props.size || props.variant} ${
						props.size || props.variant
					}" fill="none" xmlns="http://www.w3.org/2000/svg">
                        ${octicons[props.name as IconName].heights[props.variant]!.path}
                    </svg>`
				:	octicons[props.name as IconName].toSVG({
						width: props.size || props.variant || 16
					})
			}
		></span>
	);
};
