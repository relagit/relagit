import { Repository } from '@stores/repository';

import { Git } from './core';
import { Fetch } from './fetch';

export type Branch = {
	gitName: string;
	name: string;
	path: string;
	relativeDate: string;
	isRemote: boolean;
	hasUpstream: boolean;
};

export const ListBranches = async (repository: Repository | undefined): Promise<Branch[]> => {
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

			const isRemote =
				branch.startsWith('  remotes/origin/') ||
				branch.startsWith('* remotes/origin/') ||
				branch.startsWith('  origin/') ||
				branch.startsWith('* origin/');
			const hasUpstream =
				res.includes(`  origin/${parts[0].replace('origin/', '').trim()} `) ||
				res.includes(`* origin/${parts[0].replace('origin/', '').trim()} `);
			const hasNonUpstream =
				res.includes(`  ${parts[0].replace('origin/', '').trim()} `) ||
				res.includes(`* ${parts[0].replace('origin/', '').trim()} `);

			if (isRemote && hasNonUpstream) return null;

			const fullName = parts[0].trim();
			const slashParts = fullName.split('/');

			const path = slashParts.slice(0, -1).join('/');
			const name = slashParts.pop();

			return {
				name: name!,
				path: path,
				gitName: fullName,
				relativeDate: parts.splice(1).join(' ').trim(),
				isRemote: isRemote,
				hasUpstream: hasUpstream
			};
		})
		.filter(Boolean);

	return map;
};

export const Checkout = async (
	repository: Repository | undefined,
	branch: string
): Promise<string> => {
	if (!repository) {
		return '';
	}

	const res = await Git({
		directory: repository.path,
		command: 'checkout',
		args: [branch]
	});

	Fetch(repository.path);

	return res;
};

export const CreateBranch = async (
	repository: Repository | undefined,
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

export const PushWithOrigin = async (
	repository: Repository | undefined,
	branch: string | undefined
): Promise<string> => {
	if (!repository || !branch) {
		return '';
	}

	const res = await Git({
		directory: repository.path,
		command: 'push',
		args: ['--set-upstream', 'origin', branch]
	});

	return res;
};

export const DeleteBranch = async (
	repository: Repository | undefined,
	branch: string
): Promise<string> => {
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
