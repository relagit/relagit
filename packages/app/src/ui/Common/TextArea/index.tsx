import { IconName, customIcons } from '../Icon';

import './index.scss';

interface ITextareaProps {
	value: string;
	label: string;
	onChange: (value: string) => void;
	onContextMenu?: (e: MouseEvent) => void;
	onKeyDown?: (e: KeyboardEvent) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	expanded?: boolean;
	wysiwyg?: boolean;
	icon?: IconName | keyof typeof customIcons;
}

export default (props: ITextareaProps) => {
	return (
		<textarea
			aria-label={props.label}
			class={`textarea ${props.className || ''} ${props.expanded ? 'expanded' : ''}`}
			value={props.value}
			onInput={(e: Event) => {
				const proposedValue = (e.target as HTMLTextAreaElement).value;

				if (!props.expanded && proposedValue.includes('\n')) {
					(e.target as HTMLTextAreaElement).value = proposedValue.replace('\n', '');

					return props.onChange(proposedValue.replace('\n', ''));
				}

				props.onChange(proposedValue);
			}}
			onContextMenu={props.onContextMenu}
			onKeyDown={props.onKeyDown}
			placeholder={props.placeholder}
			disabled={props.disabled}
			style={{ height: props.expanded ? '100%' : '' }}
		/>
	);
};
