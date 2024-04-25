import pkj from '../../../../../package.json';
import type { GithubRelease } from '../github/types';
import { error } from '../logger';

const api = 'https://api.github.com/repos/relagit/relagit/releases/latest';

export const getLatestRelease = async (): Promise<GithubRelease | null> => {
	try {
		const response = await fetch(api);
		const data = await response.json();

		return data as GithubRelease;
	} catch (e) {
		error('Unable to check for updates', e);

		return null;
	}
};

export const currentTag = pkj.version;

export const semanticCompare = (latest: string, current: string): 'equal' | 'behind' | 'ahead' => {
	const aParts = latest.split('.').map(Number);
	const bParts = current.split('.').map(Number);

	for (let i = 0; i < aParts.length; i++) {
		if (aParts[i] > bParts[i]) return 'ahead';
		if (aParts[i] < bParts[i]) return 'behind';
	}

	return 'equal';
};
