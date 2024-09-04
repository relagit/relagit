import { Repository } from 'nodegit';

const nodegit = window.Native.DANGEROUS__NODE__REQUIRE('nodegit');

export const Analyse = async (repo: Repository) => {
	const branch = await repo.getCurrentBranch();
	const commit = await repo.getHeadCommit();
	const remote = await repo.getRemote('origin');
	const dirname = repo.workdir().split('/').pop();

	const aheadBehind = (await nodegit.Graph.aheadBehind(
		repo,
		branch.target(),
		(await nodegit.Branch.upstream(branch)).target()
	)) as unknown as {
		ahead: number;
		behind: number;
	};

	return {
		branch: branch,
		commit: commit,
		dirname,
		remote: remote,
		ahead: aheadBehind.ahead,
		behind: aheadBehind.behind
	};
};
