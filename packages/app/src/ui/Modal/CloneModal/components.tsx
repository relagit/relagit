import { Accessor, For, Setter, Show, createEffect, createSignal, untrack } from 'solid-js';

import { CodebergRepository } from '@app/modules/codeberg';
import { GitHubRepository } from '@app/modules/github';
import { GitLabProject } from '@app/modules/gitlab';
import { t } from '@app/modules/i18n';
import { openExternal } from '@app/modules/shell';
import { relative } from '@app/modules/time';
import { NormalProviderAccount, Provider } from '@app/stores/shared';
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

const makeSorter = (provider: Provider, sort: 'stars' | 'updated' | 'name') => {
	return (
		a: GitHubRepository | GitLabProject | CodebergRepository,
		b: GitHubRepository | GitLabProject | CodebergRepository
	) => {
		const normalA = makeNormal(provider, a);
		const normalB = makeNormal(provider, b);

		switch (sort) {
			case 'stars':
				return normalB.stargazers_count - normalA.stargazers_count;
			case 'updated':
				return normalB.updated - normalA.updated;
			case 'name':
				return normalA.name.localeCompare(normalB.name);
		}

		return 0;
	};
};

const match = (
	repo: ReturnType<typeof makeNormal>,
	account: NormalProviderAccount<Provider>,
	search: string
) => {
	for (const part of search.split(' ')) {
		const nameMatch = repo.name?.toLowerCase().includes(part.toLowerCase());
		const ownerMatch =
			repo.owner?.login?.toLowerCase().includes(part.toLowerCase()) &&
			repo.owner?.login !== account.username;
		const descriptionMatch = repo.description?.toLowerCase().includes(part.toLowerCase());

		if (nameMatch || ownerMatch || descriptionMatch) {
			return true;
		}
	}

	return false;
};

export const RepoList = <T extends Provider>(props: {
	provider: T;
	done: boolean;
	account: NormalProviderAccount<T>;
	state: T extends 'github' ? GitHubRepository[]
	: T extends 'gitlab' ? GitLabProject[]
	: CodebergRepository[] | null;
	setUrl: Setter<string>;
	setSelected: Setter<GitHubRepository | GitLabProject | CodebergRepository | null | undefined>;
	selected: Accessor<
		T extends 'github' ? GitHubRepository
		: T extends 'gitlab' ? GitLabProject
		: CodebergRepository | null | undefined
	>;
	search: string;
	sort: 'stars' | 'updated' | 'name';
}) => {
	const [showing, setShowing] = createSignal<
		(GitHubRepository | GitLabProject | CodebergRepository)[] | null
	>(null);

	createEffect(() => {
		for (const repo of props.state || []) {
			if (match(makeNormal(props.provider, repo), props.account, props.search)) {
				if (!untrack(showing)?.includes(repo))
					setShowing([...(untrack(showing) || []), repo]);
			} else {
				setShowing(untrack(showing)?.filter((r) => r.id !== repo.id) || []);
			}
		}
	});

	return (
		<Show
			when={props.done}
			fallback={
				<EmptyState
					detail={t('modal.clone.loading')}
					hint={t('modal.clone.loadingHint')}
					spinner
				/>
			}
		>
			<Show
				when={showing()?.length}
				fallback={
					<EmptyState
						detail={t('modal.clone.noRepos')}
						hint={t('modal.clone.noReposHint')}
						actions={[
							{
								label: t('modal.clone.noReposButton'),
								type: 'brand',
								onClick: () => {
									let url = '';

									switch (props.provider) {
										case 'github':
											url = 'https://github.com/new';
											break;
										case 'gitlab':
											url = 'https://gitlab.com/projects/new';
											break;
										case 'codeberg':
											url = 'https://codeberg.org/repo/create';
											break;
									}

									openExternal(url);
								}
							}
						]}
					/>
				}
			>
				<div class="clone-modal__list">
					<For each={showing()?.sort(makeSorter(props.provider, props.sort))}>
						{(repo) => {
							const normalRepo = makeNormal(props.provider, repo);

							return (
								<Menu
									level={2}
									interfaceId="clone-modal-item"
									items={[
										{
											type: 'item',
											label: t('sidebar.contextMenu.openRemote'),
											onClick: () => {
												openExternal(normalRepo.html_url);
											}
										}
									]}
								>
									<div
										role="button"
										aria-label={`${t('modal.clone.clone')} ${repo.name}`}
										tabIndex={0}
										onClick={() => {
											props.setSelected(repo);

											let url = '';

											switch (props.provider) {
												case 'github':
													url = (repo as GitHubRepository).clone_url;
													break;
												case 'gitlab':
													url = (repo as GitLabProject).http_url_to_repo;
													break;
												case 'codeberg':
													url = (repo as CodebergRepository).clone_url;
													break;
												default:
													break;
											}

											props.setUrl(url);
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
											<Show
												when={
													normalRepo.owner.login !==
													props.account?.username
												}
											>
												<img
													src={normalRepo.owner.avatar_url}
													alt="owner icon"
													class="clone-modal__list__item__name__image"
												/>
												<div class="clone-modal__list__item__name__part">
													{normalRepo.owner.login}
												</div>
												<div class="clone-modal__list__item__name__slash">
													/
												</div>
											</Show>
											<div class="clone-modal__list__item__name__part">
												{normalRepo.name}
											</div>
											<div class="clone-modal__list__item__name__visibility">
												<Show when={normalRepo.private}>
													<Icon name="lock" />
												</Show>
											</div>
										</h3>
										<p class="clone-modal__list__item__description">
											{normalRepo.description}
										</p>
										<div class="clone-modal__list__item__details">
											<div class="clone-modal__list__item__details__social">
												<Show when={normalRepo.stargazers_count}>
													<div class="clone-modal__list__item__details__social__stars">
														<Icon name="star" />
														{normalRepo.stargazers_count}
													</div>
												</Show>
												<Show when={repo.forks_count}>
													<div class="clone-modal__list__item__details__social__forks">
														<Icon name="git-branch" />
														{normalRepo.forks_count}
													</div>
												</Show>
											</div>
											<Show
												when={normalRepo.language}
												fallback={relative(normalRepo.updated)}
											>
												<div class="clone-modal__list__item__details__language">
													<div
														class="clone-modal__list__item__details__language__indicator"
														style={{
															'background-color': getLanguageColor(
																normalRepo.language
															)
														}}
													></div>
													{normalRepo.language}
												</div>
											</Show>
										</div>
									</div>
								</Menu>
							);
						}}
					</For>
				</div>
			</Show>
		</Show>
	);
};

const makeNormal = (
	provider: Provider,
	repo: GitHubRepository | GitLabProject | CodebergRepository
) => {
	const normalRepo: {
		owner: { login: string; avatar_url: string };
		name: string;
		description: string;
		stargazers_count: number;
		forks_count: number;
		language: string;
		html_url: string;
		updated: number;
		private: boolean;
	} = {
		owner: { login: '', avatar_url: '' },
		name: '',
		description: '',
		stargazers_count: 0,
		forks_count: 0,
		language: '',
		html_url: '',
		updated: 0,
		private: false
	};

	switch (provider) {
		case 'github': {
			const _repo = repo as GitHubRepository;

			normalRepo.owner.login = _repo.owner.login;
			normalRepo.owner.avatar_url = _repo.owner.avatar_url;
			normalRepo.name = _repo.name;
			normalRepo.description = _repo.description;
			normalRepo.stargazers_count = _repo.stargazers_count;
			normalRepo.forks_count = _repo.forks_count;
			normalRepo.language = _repo.language;
			normalRepo.html_url = _repo.html_url;
			normalRepo.updated = new Date(_repo.updated_at).getTime();
			normalRepo.private = _repo.private;
			break;
		}
		case 'gitlab': {
			const _repo = repo as GitLabProject;

			normalRepo.owner.login = _repo.namespace?.full_path;
			normalRepo.owner.avatar_url = _repo.avatar_url || _repo.owner?.avatar_url;
			normalRepo.name = _repo.name;
			normalRepo.description = _repo.description;
			normalRepo.stargazers_count = _repo.star_count;
			normalRepo.forks_count = _repo.forks_count;
			normalRepo.language = '';
			normalRepo.html_url = _repo.web_url;
			normalRepo.updated = new Date(_repo.last_activity_at).getTime();
			normalRepo.private = _repo.visibility === 'private';
			break;
		}
		case 'codeberg': {
			const _repo = repo as CodebergRepository;

			normalRepo.owner.login = _repo.owner.login;
			normalRepo.owner.avatar_url = _repo.owner.avatar_url;
			normalRepo.name = _repo.name;
			normalRepo.description = _repo.description;
			normalRepo.stargazers_count = _repo.stars_count;
			normalRepo.forks_count = _repo.forks_count;
			normalRepo.language = _repo.language;
			normalRepo.html_url = _repo.html_url;
			normalRepo.updated = new Date(_repo.updated_at).getTime();
			normalRepo.private = _repo.private;
			break;
		}
	}

	return normalRepo;
};
