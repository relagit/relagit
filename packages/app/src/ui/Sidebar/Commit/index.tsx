import { createStoreListener } from '@stores/index';
import { ILogCommit } from '@app/modules/git/log';
import { renderDate } from '@app/modules/time';
import LocationStore from '@stores/location';
import { debug } from '@modules/logger';

import './index.scss';

export default (props: ILogCommit) => {
	const selected = createStoreListener([LocationStore], () => LocationStore.selectedCommit);

	return (
		<div
			aria-role="button"
			aria-label={`Open Commit ${props.hash.substring(0, 7)}`}
			aria-selected={selected() === props}
			class={`sidebar__commit ${selected() === props ? 'active' : ''}`}
			data-id={props.hash}
			data-active={selected() === props}
			onClick={() => {
				debug('Transitioning to commit', props.hash);
				LocationStore.setSelectedCommit(props);
			}}
		>
			<div class="sidebar__commit__top">
				<div class="sidebar__commit__top__message">{props.message}</div>
				<div class="sidebar__commit__top__hash">{props.hash.substring(0, 7)}</div>
			</div>
			<div class="sidebar__commit__bottom">
				<div class="sidebar__commit__bottom__author">{props.author}</div>
				<div class="sidebar__commit__bottom__date">
					{renderDate(new Date(props.date).getTime())()}
				</div>
			</div>
		</div>
	);
};
