import { Accessor, For, Setter, Show } from 'solid-js';

import { GitHubRepository, GithubResponse, getUser } from '@app/modules/github';
import { t } from '@app/modules/i18n';
import { openExternal } from '@app/modules/shell';
import EmptyState from '@app/ui/Common/EmptyState';
import Icon from '@app/ui/Common/Icon';
import Menu from '@app/ui/Menu';

let languageFile: Record<string, { color: string }>;

fetch('https://raw.githubusercontent.com/ozh/github-colors/master/colors.json')
	.then((r) => r.json())
	.then((r) => (languageFile = r as Record<string, { color: string }>));

const getLanguageColor = (language: string) => {
	return languageFile[language]?.color || '#000';
};

const makeSorter = () => {
	return (
		a: GithubResponse['users/:username/repos'][1][0],
		b: GithubResponse['users/:username/repos'][1][0]
	) => {
		if (a.stargazers_count > b.stargazers_count) {
			return -1;
		}

		if (a.stargazers_count < b.stargazers_count) {
			return 1;
		}

		return 0;
	};
};

export const RepoList = (props: {
	state: GitHubRepository[] | null;
	setSelected: Setter<GitHubRepository | null | undefined>;
	selected: Accessor<GitHubRepository | null | undefined>;
}) => {
	return (
		<Show
			when={props.state?.length}
			fallback={
				<EmptyState
					detail={t('modal.clone.loading')}
					hint={t('modal.clone.loadingHint')}
					spinner
				/>
			}
		>
			<div class="clone-modal__list">
				<For each={props.state?.sort(makeSorter())}>
					{(repo) => (
						<Menu
							items={[
								{
									type: 'item',
									label: t('sidebar.contextMenu.openRemote'),
									onClick: () => {
										openExternal(repo.html_url);
									}
								}
							]}
						>
							<div
								aria-role="button"
								aria-label={`${t('modal.clone.clone')} ${repo.name}`}
								tabIndex={0}
								onClick={() => {
									props.setSelected(repo);
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										props.setSelected(repo);
									}
								}}
								classList={{
									'clone-modal__list__item': true,
									active: props.selected()?.id === repo.id
								}}
							>
								<h3 class="clone-modal__list__item__name">
									<Show when={repo.owner.login !== getUser().login}>
										<img
											src={`https://avatars.githubusercontent.com/u/${repo.owner.id}?v=4`}
											alt="owner icon"
											class="clone-modal__list__item__name__image"
										/>
										<div class="clone-modal__list__item__name__part">
											{repo.owner.login}
										</div>
										<div class="clone-modal__list__item__name__slash">/</div>
									</Show>
									<div class="clone-modal__list__item__name__part">
										{repo.name}
									</div>
								</h3>
								<p class="clone-modal__list__item__description">
									{repo.description}
								</p>
								<div class="clone-modal__list__item__details">
									<div class="clone-modal__list__item__details__social">
										<Show when={repo.stargazers_count}>
											<div class="clone-modal__list__item__details__social__stars">
												<Icon name="star" />
												{repo.stargazers_count}
											</div>
										</Show>
										<Show when={repo.forks_count}>
											<div class="clone-modal__list__item__details__social__forks">
												<Icon name="git-branch" />
												{repo.forks_count}
											</div>
										</Show>
									</div>
									<Show when={repo.language}>
										<div class="clone-modal__list__item__details__language">
											<div
												class="clone-modal__list__item__details__language__indicator"
												style={{
													'background-color': getLanguageColor(
														repo.language
													)
												}}
											></div>
											{repo.language}
										</div>
									</Show>
								</div>
							</div>
						</Menu>
					)}
				</For>
			</div>
		</Show>
	);
};
