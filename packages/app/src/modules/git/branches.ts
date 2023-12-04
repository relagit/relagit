import { IRepository } from '@stores/repository';

import { Git } from './core';

export type Branch = {
	name: string;
	relativeDate: string;
	isRemote: boolean;
	hasUpstream: boolean;
};

export const ListBranches = async (repository: IRepository): Promise<Branch[]> => {
	if (!repository) {
		return [];
	}

	const res = await Git({
		directory: repository.path,
		command: 'branch',
		args: ['-a', '--no-color', '"--format=%(HEAD) %(refname:short) %(committerdate:relative)"']
	});

	const map = res
		.split('\n')
		.map((branch) => {
			if (branch.includes('origin/HEAD')) return null;
			if (!branch.trim()) return null;

			const parts = branch.split(' ').filter((b) => b.replace('*', '').trim());

			const isRemote = branch.includes('origin/');
			const hasUpstream = res.includes(` origin/${parts[0].trim()}`);
			const hasNonUpstream = res.includes(` ${parts[0].replace('/origin', '').trim()}`);

			if (isRemote && hasNonUpstream) return null;

			return {
				name: parts[0].trim(),
				relativeDate: parts.splice(1).join(' ').trim(),
				isRemote,
				hasUpstream
			};
		})
		.filter(Boolean);

	return map;
};

export const Checkout = async (repository: IRepository, branch: string): Promise<string> => {
	if (!repository) {
		return '';
	}

	const res = await Git({
		directory: repository.path,
		command: 'checkout',
		args: [branch]
	});

	return res;
};

export const CreateBranch = async (
	repository: IRepository,
	branch: string,
	checkout = true
): Promise<string> => {
	if (!repository) {
		return '';
	}

	const res = await Git({
		directory: repository.path,
		command: 'branch',
		args: [branch]
	});

	if (checkout) {
		await Checkout(repository, branch);
	}

	return res;
};

export const PushWithOrigin = async (repository: IRepository, branch: string): Promise<string> => {
	if (!repository) {
		return '';
	}

	const res = await Git({
		directory: repository.path,
		command: 'push',
		args: ['--set-upstream', 'origin', branch]
	});

	return res;
};

export const DeleteBranch = async (repository: IRepository, branch: string): Promise<string> => {
	if (!repository) {
		return '';
	}

	const res = await Git({
		directory: repository.path,
		command: 'branch',
		args: ['-D', branch]
	});

	return res;
};
