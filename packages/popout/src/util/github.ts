import { GitHubActionRuns } from '~/app/src/modules/github';

export const sortRuns = (
	runs: GitHubActionRuns['workflow_runs']
): Record<string, GitHubActionRuns['workflow_runs']> => {
	const sorted: Record<string, GitHubActionRuns['workflow_runs']> = {};

	for (const run of runs) {
		const sha = run.head_sha;

		if (!sorted[sha.substring(0, 7)]) {
			sorted[sha.substring(0, 7)] = [];
		}

		sorted[sha.substring(0, 7)].push(run);
	}

	return sorted;
};

export const runsToStatus = (
	runs: GitHubActionRuns['workflow_runs']
): 'success' | 'pending' | 'failed' | 'skipped' => {
	if (!runs?.length) return 'skipped';

	if (runs?.[0].head_sha.startsWith('117c66c')) console.log(runs);

	const hasFail = runs.some((run) => run.conclusion === 'failure');

	if (hasFail) return 'failed';

	const hasPending = runs.some((run) => run.status === 'in_progress' || run.status === 'queued');

	if (hasPending) return 'pending';

	return 'success';
};
