import { CodebergUser } from '@app/modules/codeberg';
import { GithubUser } from '@app/modules/github';
import { GitLabUser } from '@app/modules/gitlab';

export type Provider = 'github' | 'gitlab' | 'codeberg' | 'url';

export type ProviderAccount<T extends Provider> = T extends 'gitlab'
	? GitLabUser
	: T extends 'github'
		? GithubUser
		: T extends 'codeberg'
			? CodebergUser
			: T extends 'url'
				? never
				: never;

export type NormalProviderAccount<T extends Provider> = {
	provider: T;
	avatar: string;
	username: string;
	displayName?: string | null;
	email?: string | null;
	bio?: string | null;
};
