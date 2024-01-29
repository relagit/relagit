import { For, Show } from 'solid-js';

import { openInEditor } from '@app/modules/editor';
import { statusToAlpha } from '@app/modules/git/diff';
import { t } from '@app/modules/i18n';
import { openExternal, showItemInFolder } from '@app/modules/shell';
import SettingsStore from '@app/stores/settings';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';
import RepositoryStore from '@stores/repository';

import Header from '@ui/Workspace/Header';

import Icon from '../Common/Icon';
import Menu from '../Menu';
import CodeView from './CodeView';

import './index.scss';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');

export interface WorkspaceProps {
	sidebar: boolean;
}

export default (props: WorkspaceProps) => {
	const repo = createStoreListener(
		[LocationStore, RepositoryStore],
		() => RepositoryStore.getById(LocationStore.selectedRepository?.id)?.path
	);
	const file = createStoreListener([LocationStore], () => {
		const repo = LocationStore.selectedRepository;
		const file = LocationStore.selectedFile;

		return {
			file: file,
			path: file && repo ? path.join(repo.path, file.path, file.name) : undefined
		};
	});
	const commitFiles = createStoreListener(
		[LocationStore],
		() => LocationStore.selectedCommitFiles
	);
	const commit = createStoreListener([LocationStore], () => LocationStore.selectedCommit);
	const historyOpen = createStoreListener([LocationStore], () => LocationStore.historyOpen);
	const selectedCommitFile = createStoreListener(
		[LocationStore],
		() => LocationStore.selectedCommitFile
	);

	return (
		<div classList={{ workspace: true, 'sidebar-active': props.sidebar }}>
			<Header />
			<Show when={historyOpen() && commit()}>
				<div class="workspace__commit">
					<div class="workspace__commit__message">{commit()!.message}</div>
					<div class="workspace__commit__details">
						<div class="workspace__commit__details__author">{commit()!.author}</div>
						<div class="workspace__commit__details__hash">
							{commit()!.hash.slice(0, 7)}
						</div>
						<div class="workspace__commit__details__diff">
							<Show when={commit()!.tag}>
								<div class="workspace__commit__details__diff__tag">
									<Icon name="tag" />
									{commit()!.tag}
								</div>
							</Show>
							<Show when={commit()!.files}>
								<div class="workspace__commit__details__diff__files">
									{t(
										'git.files',
										{
											count: commit()!.files
										},
										commit()!.files
									)}
								</div>
							</Show>
							<Show when={commit()!.insertions}>
								<div class="workspace__commit__details__diff__insertions">
									+{commit()!.insertions}
								</div>
							</Show>
							<Show when={commit()!.deletions}>
								<div class="workspace__commit__details__diff__deletions">
									-{commit()!.deletions}
								</div>
							</Show>
						</div>
					</div>
				</div>
			</Show>
			<div class="workspace__container">
				<Show when={historyOpen() && commitFiles()}>
					<div class="workspace__container__files">
						<For each={commitFiles()?.files}>
							{(commitFile) => (
								<Menu
									items={[
										{
											type: 'item',
											label: t('sidebar.contextMenu.viewIn', {
												name:
													window.Native.platform === 'darwin'
														? 'Finder'
														: 'Explorer'
											}),
											onClick: () => {
												showItemInFolder(
													path.join(
														LocationStore.selectedRepository!.path,
														commitFile.path,
														commitFile.filename
													)
												);
											},
											disabled: !fs.existsSync(
												path.join(
													LocationStore.selectedRepository!.path,
													commitFile.path,
													commitFile.filename
												)
											)
										},
										{
											label: t('sidebar.contextMenu.openRemote'),
											disabled: !fs.existsSync(
												path.join(
													LocationStore.selectedRepository!.path,
													commitFile.path,
													commitFile.filename
												)
											),
											type: 'item',
											onClick: () => {
												openExternal(
													LocationStore.selectedRepository?.remote.replace(
														/\.git$/,
														''
													) +
														`/blob/${LocationStore.selectedRepository?.branch}/` +
														path.join(
															commitFile.path,
															commitFile.filename
														)
												);
											}
										},
										{
											label: t('sidebar.contextMenu.openIn', {
												name: t(
													`settings.general.editor.${
														SettingsStore.getSetting(
															'externalEditor'
														) || 'code'
													}`
												)
											}),
											onClick: () => {
												openInEditor(
													path.join(
														LocationStore.selectedRepository!.path,
														commitFile.path,
														commitFile.filename
													)
												);
											},
											disabled: !fs.existsSync(
												path.join(
													LocationStore.selectedRepository!.path,
													commitFile.path,
													commitFile.filename
												)
											),
											type: 'item'
										}
									]}
								>
									<div
										tabIndex={0}
										aria-role="button"
										aria-label={t('workspace.commit.open', {
											name: commitFile.filename
										})}
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
										onKeyDown={(event) => {
											if (event.key === 'Enter') {
												LocationStore.setSelectedCommitFile(commitFile);
											}
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
											{statusToAlpha(commitFile.status)}
										</div>
									</div>
								</Menu>
							)}
						</For>
					</div>
				</Show>
				<div class="workspace__container__main">
					<div class="workspace__container__main__file">
						<div class="workspace__container__main__file__path">
							{/* {(historyOpen()
								? selectedCommitFile()?.path
								: file().file?.path
							)?.endsWith('/')
								? historyOpen()
									? selectedCommitFile()?.path
									: file().file?.path
								: ((historyOpen()
										? selectedCommitFile()?.path
										: file().file?.path) || '') + '/'} */}

							<Show
								when={(historyOpen()
									? selectedCommitFile()?.path || ''
									: file()?.file?.path || ''
								).endsWith('/')}
								fallback={
									((historyOpen()
										? selectedCommitFile()?.path
										: file()?.file?.path) || '') + '/'
								}
							>
								{historyOpen() ? selectedCommitFile()?.path : file()?.file?.path}
							</Show>
						</div>
						<div class="workspace__container__main__file__name">
							{historyOpen() ? selectedCommitFile()?.filename : file()?.file?.name}
						</div>
					</div>
					<CodeView file={file()?.path || ''} repository={repo()!} />
				</div>
			</div>
		</div>
	);
};
