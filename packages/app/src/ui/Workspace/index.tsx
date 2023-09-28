const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');

import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';

import Header from '@ui/Workspace/Header';
import CodeView from './CodeView';

import './index.scss';
import { For, Show, createEffect } from 'solid-js';

export interface IWorkspaceProps {
	sidebar: boolean;
}

export default (props: IWorkspaceProps) => {
	const repo = createStoreListener([LocationStore], () => LocationStore.selectedRepository?.path);
	const file = createStoreListener([LocationStore], () => {
		const repo = LocationStore.selectedRepository;
		const file = LocationStore.selectedFile;

		return {
			file: file,
			path: file && repo ? path.join(repo.path, file.path, file.name) : undefined
		};
	});
	const commit = createStoreListener([LocationStore], () => LocationStore.selectedCommitFiles);
	const historyOpen = createStoreListener([LocationStore], () => LocationStore.historyOpen);
	const selectedCommitFile = createStoreListener(
		[LocationStore],
		() => LocationStore.selectedCommitFile
	);

	createEffect(() => {
		console.log('commit', commit());
	});

	return (
		<div classList={{ workspace: true, 'sidebar-active': props.sidebar }}>
			<Header />
			<div class="workspace__container">
				<Show when={historyOpen() && commit()}>
					<div class="workspace__container__files">
						<For each={commit()?.files}>
							{(commitFile) => (
								<div
									aria-role="button"
									aria-label={`Open ${commitFile.filename}`}
									aria-selected={selectedCommitFile() === commitFile}
									data-active={selectedCommitFile() === commitFile}
									data-status={selectedCommitFile()?.status}
									classList={{
										workspace__container__files__file: true,
										active: selectedCommitFile() === commitFile
									}}
									onClick={() => {
										LocationStore.setSelectedCommitFile(commitFile);
									}}
								>
									<div class="workspace__container__files__file__filename">
										<span
											class="workspace__container__files__file__filename__path"
											title={commitFile.path}
										>
											{commitFile.path}
										</span>
										<span class="workspace__container__files__file__filename__name">
											<span class="workspace__container__files__file__filename__name__separator">
												{commitFile.path.length ? '/' : ''}
											</span>
											{commitFile.filename}
										</span>
									</div>
									<div
										classList={{
											workspace__container__files__file__status: true,
											[commitFile.status]: true
										}}
									>
										{commitFile.status === 'modified'
											? 'M'
											: commitFile.status === 'added'
											? 'A'
											: commitFile.status === 'deleted'
											? 'D'
											: commitFile.status === 'renamed'
											? 'R'
											: commitFile.status === 'copied'
											? 'C'
											: commitFile.status === 'unmerged'
											? 'U'
											: '??'}
									</div>
								</div>
							)}
						</For>
					</div>
				</Show>
				<div class="workspace__container__main">
					<div class="workspace__container__main__file">
						<div class="workspace__container__main__file__path">
							{file().file?.path}/
						</div>
						<div class="workspace__container__main__file__name">
							{file().file?.name}
						</div>
					</div>
					<CodeView file={file().path} repository={repo()} />
				</div>
			</div>
		</div>
	);
};
