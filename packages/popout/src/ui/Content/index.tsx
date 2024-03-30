import { For, Show, createEffect, createSignal } from 'solid-js';

import type { RecursivePartial } from '@app/shared';
import { createStoreListener } from '@app/stores';
import FileStore from '@app/stores/files';
import SettingsStore, { type Settings } from '@app/stores/settings';
import { openInEditor } from '~/app/src/modules/editor';
import { Git } from '~/app/src/modules/git/core';
import { statusToAlpha } from '~/app/src/modules/git/diff';
import { GitHub, commitFormatsForProvider, repoParams } from '~/app/src/modules/github';
import { openExternal } from '~/app/src/modules/shell';
import { renderDate } from '~/app/src/modules/time';
import RepositoryStore, { Repository } from '~/app/src/stores/repository';
import Icon from '~/app/src/ui/Common/Icon';

import { runsToStatus, sortRuns } from '../../util/github';
import Panel from '../Panel';
import Separator from '../Separator';

import './index.scss';

const nodepath = window.Native.DANGEROUS__NODE__REQUIRE('path');

const formatNumber = (num: number) => {
	if (num < 1000) return num;

	if (num < 10000) return `${Math.floor(num / 100) / 10}k`;

	if (num < 100000) return `${Math.floor(num / 1000)}k`;

	if (num < 1000000) return `${Math.floor(num / 100) / 10}m`;

	return `${Math.floor(num / 100000) / 10}m`;
};

export default (props: { expanded?: boolean; repo: Repository | undefined }) => {
	const settings = createStoreListener<RecursivePartial<Settings>>(
		[SettingsStore],
		() => SettingsStore.settings
	);
	const files = createStoreListener([FileStore], () =>
		FileStore.getByRepositoryPath(settings()?.activeRepository || '')
	);
	const repositories = createStoreListener([RepositoryStore], () => RepositoryStore.repositories);

	const [insertionsDeletions, setInsertionsDeletions] = createSignal<{
		insertions: number;
		deletions: number;
	}>({ insertions: 0, deletions: 0 });
	const [commitRuns, setCommitRuns] = createSignal<ReturnType<typeof sortRuns>>({});
	const [commits, setCommits] = createSignal<
		{
			date: Date;
			sha: string;
			message: string;
		}[]
	>([]);

	createEffect(() => {
		if (!props.repo?.path) return;

		Git({
			directory: props.repo?.path || '',
			command: 'diff',
			args: ['--shortstat']
		}).then((res) => {
			const [, insertions, deletions] = res
				.split(',')
				.map((x) => x.trim())
				.map((x) => parseInt(x.replace(/\D/g, '')));

			setInsertionsDeletions({ insertions, deletions });
		});

		Git({
			directory: props.repo?.path || '',
			command: 'log',
			args: ['--since="1 week ago"', '"--pretty=format:<%cd|%h> %s"']
		}).then((res) => {
			const commits = res
				.split('\n')
				.map((x) => x.trim())
				.filter((x) => x)
				.map((x) => {
					const [date, ...message] = x.split('> ');

					return {
						date: new Date(date.split('|')[0].slice(1)),
						sha: date.split('|')[1],
						message: message.join('> ')
					};
				});

			setCommits(commits);
		});

		if (props.repo.remote.includes('://github.com')) {
			try {
				GitHub('repos/:username/:repo/actions/runs')
					.query({
						created: '>' + new Date(Date.now() - 604800000).toISOString()
					})
					.headers({
						Accept: 'application/vnd.github.v3+json'
					})
					.get(...repoParams(props.repo.remote))
					.then((res) => {
						setCommitRuns(sortRuns(res.workflow_runs));
					});
			} catch (e) {
				console.error(e);
			}
		}
	});

	return (
		<>
			<Panel expanded={props.expanded}>
				<div class="header">
					{files()?.length ? `${files()?.length} Files Modified` : 'No Pending Changes'}
					<div class="diff">
						<Show when={insertionsDeletions().insertions}>
							<span class="insertions">
								<span class="symbol">+</span>
								{formatNumber(insertionsDeletions().insertions)}
							</span>
						</Show>
						<Show when={insertionsDeletions().deletions}>
							<span class="deletions">
								<span class="symbol">-</span>
								{formatNumber(insertionsDeletions().deletions)}
							</span>
						</Show>
					</div>
				</div>
				<div class="scroller">
					<For each={files()}>
						{(file) => (
							<button
								class="scroller-item"
								title={nodepath.join(file.path || '', file.name)}
								onClick={() => {
									const path = nodepath.join(
										settings()?.activeRepository || '',
										file.path,
										file.name
									);

									openInEditor(path);
								}}
							>
								<div class="content">
									<span class="path" title={file.path}>
										{file.path.endsWith('/') ?
											file.path.slice(0, -1)
										:	file.path}
									</span>
									<span class="name">
										<Show when={file.path}>
											<span class="separator">/</span>
										</Show>
										{file.name}
									</span>
								</div>
								<div classList={{ 'file-status': true, [file.status]: true }}>
									{statusToAlpha(file.status)}
								</div>
							</button>
						)}
					</For>
				</div>
			</Panel>
			<Separator />
			<Panel>
				<div class="header">
					<select
						value={props.repo?.path}
						onChange={(e) => {
							SettingsStore.setSetting('activeRepository', e.target.value);
						}}
					>
						<For each={Array.from(repositories()?.values() || [])}>
							{(repo) => <option value={repo.path}>{repo.name}</option>}
						</For>
					</select>
					<div class="branch">{props.repo?.branch}</div>
				</div>
				<div class="scroller">
					<For each={commits()}>
						{(commit) => (
							<button
								class="scroller-item"
								title={commit.message}
								onClick={() => {
									const remote = props.repo?.remote.replace(/\.git$/, '');

									if (remote) {
										const url = `${remote}${commitFormatsForProvider(remote, commit.sha)}`;

										openExternal(url);
									}
								}}
							>
								<div class="content message">
									<Show
										when={
											runsToStatus(
												commitRuns()[commit.sha.substring(0, 7)]
											) !== 'skipped'
										}
									>
										<div
											classList={{
												'commit-status': true,
												[runsToStatus(
													commitRuns()[commit.sha.substring(0, 7)]
												)]: true
											}}
										>
											<Icon
												name={
													// eslint-disable-next-line no-nested-ternary
													(
														runsToStatus(
															commitRuns()[commit.sha.substring(0, 7)]
														) === 'pending'
													) ?
														'clock'
													: (
														runsToStatus(
															commitRuns()[commit.sha.substring(0, 7)]
														) === 'success'
													) ?
														'check'
													:	'x'
												}
											/>
										</div>
									</Show>
									<span>{commit.message}</span>
								</div>
								<div
									class="date"
									title={Intl.DateTimeFormat('en-US', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										hour: 'numeric',
										minute: 'numeric',
										second: 'numeric'
									}).format(commit.date.getTime())}
								>
									{renderDate(commit.date.getTime())()}
								</div>
							</button>
						)}
					</For>
				</div>
			</Panel>
		</>
	);
};
