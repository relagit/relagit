import Modal, { ModalBody, ModalCloseButton, ModalHeader, showErrorModal } from '..';
import { Accessor, Show, createRoot, createSignal, onMount } from 'solid-js';

import * as Git from '@app/modules/git';
import {
	GitHub,
	GitHubRepository,
	GithubResponse,
	getUser,
	initialiseOAuthFlow
} from '@app/modules/github';
import { t } from '@app/modules/i18n';
import ModalStore from '@app/stores/modal';
import Button from '@app/ui/Common/Button';
import EmptyState from '@app/ui/Common/EmptyState';
import FileSelect from '@app/ui/Common/FileSelect';
import Icon from '@app/ui/Common/Icon';
import TabView from '@app/ui/Common/TabView';
import TextArea from '@app/ui/Common/TextArea';
import * as logger from '@modules/logger';

import { showOAuthModal } from '../OAuthModal';
import { RepoList } from './components';

import './index.scss';

const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');

const isEmpty = (path: string) => {
	const files = fs.readdirSync(path);

	return files.length === 0;
};

const fileValidator = (path: string) => {
	if (path.length === 0) return null;

	const exists = fs.existsSync(path);

	if (!exists) {
		return t('ui.filepicker.doesNotExist', {
			type: t('ui.filepicker.directory')
		});
	}

	let isDirectory = false;

	try {
		fs.opendirSync(path);

		isDirectory = true;
	} catch (e) {
		isDirectory = false;
	}

	if (!isDirectory)
		return t('ui.filepicker.isNot', {
			type: t('ui.filepicker.file'),
			expected: t('ui.filepicker.directory')
		});

	if (!isEmpty(path))
		return t('ui.filepicker.notEmpty', {
			type: t('ui.filepicker.directory')
		});

	return true;
};

export interface CloneModalProps {
	url?: string;
	tab?: string | number;
}

const CloneModal = (props: CloneModalProps) => {
	const [response, setResponse] = createSignal<GithubResponse['users/:username/repos'][1] | null>(
		null
	);
	const [selected, setSelected] = createSignal<
		GithubResponse['users/:username/repos'][1][number] | null
	>();
	const [error, setError] = createSignal(false);
	const [dirError, setDirError] = createSignal<string>('');
	const [path, setPath] = createSignal('');
	const [url, setURL] = createSignal(props.url || '');
	const [tab, setTab] = createSignal<string | number>(props.tab || 'github');

	onMount(() => {
		try {
			GitHub('user/repos')
				.stream(10)
				.then((repos) => {
					setResponse(repos);
				});
		} catch (e) {
			setError(true);
		}
	});

	const Url = () => (
		<div class="clone-modal__url">
			<label class="clone-modal__url__label">{t('modal.clone.urlLabel')}</label>
			<TextArea
				label={t('modal.clone.urlLabel')}
				value={url()}
				placeholder={t('modal.clone.urlPlaceholder')}
				onChange={(val) => {
					setURL(val);
				}}
			/>
			<label class="clone-modal__url__label">{t('modal.clone.localLabel')}</label>
			<FileSelect
				input
				setError={setDirError}
				validate={fileValidator}
				initial={path()}
				properties={['openDirectory', 'createDirectory']}
				onSelect={setPath}
			/>
		</div>
	);

	const Github = (props: {
		close: () => void;
		response: Accessor<GitHubRepository[] | null>;
	}) => (
		<Show
			when={localStorage.getItem('__x_github_token')}
			fallback={
				<EmptyState
					detail={t('modal.clone.auth')}
					hint={t('modal.clone.authHint')}
					icon="shield"
					actions={[
						{
							label: t('modal.clone.authButton'),
							type: 'brand',
							onClick: () => {
								initialiseOAuthFlow().then((r) => {
									showOAuthModal(r);
								});
							}
						}
					]}
				/>
			}
		>
			<Show
				when={!error()}
				fallback={
					<EmptyState detail={t('modal.clone.error')} hint={t('modal.clone.errorHint')} />
				}
			>
				<RepoList selected={selected} setSelected={setSelected} state={props.response()} />
			</Show>
		</Show>
	);

	return (
		<Modal size={tab() === 'github' ? 'x-large' : 'medium'} dismissable id={'clone'}>
			{(props) => (
				<>
					<ModalHeader
						title={
							<>
								{t('modal.clone.title')}
								<button
									classList={{
										'clone-modal__oauth': true
									}}
									onClick={() => {
										initialiseOAuthFlow().then((r) => {
											showOAuthModal(r);
										});
									}}
								>
									<Show
										when={getUser() && localStorage.getItem('__x_github_token')}
										fallback={
											<>
												<Icon
													name={
														localStorage.getItem('__x_github_token')
															? 'verified'
															: 'shield'
													}
												/>
												{localStorage.getItem('__x_github_token')
													? t('modal.clone.authenticated')
													: t('modal.clone.authenticate')}
											</>
										}
									>
										<img
											src={getUser()?.avatar_url || ''}
											class="clone-modal__oauth__avatar"
										/>
										{getUser()?.login}
									</Show>
								</button>
							</>
						}
					>
						<ModalCloseButton {...props} />
					</ModalHeader>
					<ModalBody>
						<TabView
							signal={[tab, setTab]}
							views={[
								{
									label: t('modal.clone.github'),
									value: 'github',
									element: <Github close={props.close} response={response} />
								},
								{
									label: t('modal.clone.url'),
									value: 'url',
									element: <Url />
								}
							]}
						/>
					</ModalBody>
					<Show when={tab() === 'url' || (tab() === 'github' && selected())}>
						<div class="modal__footer clone-modal__footer">
							<Show when={tab() === 'github'} fallback={<div />}>
								<FileSelect
									input
									setError={setDirError}
									validate={fileValidator}
									initial={path()}
									properties={['openDirectory', 'createDirectory']}
									onSelect={setPath}
								/>
							</Show>
							<div class="modal__footer__buttons">
								<Button
									label={t('modal.clone.clone')}
									type="default"
									onClick={() => {
										props.close();
									}}
								>
									{t('modal.cancel')}
								</Button>
								<Button
									label={t('modal.clone.clone')}
									type="brand"
									disabled={
										!!dirError() ||
										!(
											path() &&
											((tab() === 'url' && url()) ||
												(tab() === 'github' && selected()))
										)
									}
									onClick={async () => {
										try {
											const cloneLike =
												tab() === 'url' ? url() : selected()!.clone_url!;

											await Git.Clone(cloneLike, path());

											props.close();
										} catch (e) {
											logger.error(e);

											showErrorModal(e, 'error.git');
										}
									}}
								>
									{t('modal.clone.clone')}
								</Button>
							</div>
						</div>
					</Show>
				</>
			)}
		</Modal>
	);
};

export default CloneModal;

export const showCloneModal = (tab?: string, url?: string) => {
	ModalStore.pushState(
		'clone',
		createRoot(() => <CloneModal url={url} tab={tab} />)
	);
};
