import type { GitDiff } from 'parse-git-diff';

import FileStore, { GitFile } from '@stores/files';
import { Repository } from '@stores/repository';
import SettingsStore from '@stores/settings';
import StageStore from '@stores/stage';

import { BINARY_EXTENSIONS, IMAGE_EXTENSIONS } from '@ui/Workspace/CodeView/constants';

import { CommitStyle } from '../commits';
import * as Git from '../git';
import { DIFF } from '../git/constants';
import { parseDiff } from '../git/parse-diff';
import { ignoredPaths } from './shared';

const nodepath = window.Native.DANGEROUS__NODE__REQUIRE('path');

export const generatePrompt = async (repo: Repository) => {
	const paths = StageStore.getStagedFilePaths(repo.path) || [];

	const files: { diff: GitDiff; file: GitFile }[] = [];

	let prompt =
		'Please create a git commit message from the following git diff of modified files. You must only respond with a short and concise message summarizing the changes. Do not improvise or guess anything outside of what has been changed. Here is the git diff:';

	for (const path of paths) {
		if (path.endsWith('.lock') || ignoredPaths.some((p) => path.includes(p))) {
			prompt += `${path} is ignored and will should be included in the commit message.\n`;

			continue;
		}

		const file = FileStore.getByPath(repo.path, path)!;
		const diff = await Git.Diff(nodepath.join(repo.path, path), repo.path);

		if (BINARY_EXTENSIONS.some((ext) => path.endsWith(ext))) {
			prompt += `\n\n-- ${path} may not be included in the commit message as it is a binary file.\n`;

			continue;
		}

		if (IMAGE_EXTENSIONS.some((ext) => path.endsWith(ext))) {
			prompt += `\n\n-- ${path} was changed and is an image file.`;

			continue;
		}

		const parsed = parseDiff(diff);

		if (diff === DIFF.ADD_ALL || diff === DIFF.REMOVE_ALL) {
			prompt += `\n\n-- ${path}:\n${(await Git.Content(nodepath.join(repo.path, path), repo.path)).substring(0, 400)}\n`;

			continue;
		}

		files.push({ diff: parsed, file });

		prompt += `\n\n-- ${path}:\n`;

		for (const chunk of parsed.files[0]?.chunks || []) {
			prompt += `\n${chunk.changes
				.map((c) => {
					if (c.type === 'AddedLine') {
						return `+ ${c.content}`;
					} else if (c.type === 'DeletedLine') {
						return `- ${c.content}`;
					} else if (c.type !== 'MessageLine') {
						return `  ${c.content}`;
					}

					return c.content;
				})
				.join('\n')}\n`;
		}

		prompt += '\n';
	}

	const parens = SettingsStore.settings.commit?.preferParens ? ['(', ')'] : ['[', ']'];

	if (prompt.length > 4000) {
		prompt = prompt.substring(0, 3000) + '-- There were too many changes to display. --';
	}

	prompt += `
Your answer MUST be in the following format:

${
	SettingsStore.settings.commit?.styles?.[repo.path] === CommitStyle.relational ?
		`${parens[0]}scope${parens[1]} <type>: <description>`
	:	`<type>${parens[0]}optional scope${parens[1]}: <description>`
}
[optional body]

Some types that can be used:fix,feat,chore,ci,docs,style,refactor,perf,test,and others.
The <type> and <description> fields are mandatory, the <scope> field is ${
		SettingsStore.settings.commit?.styles?.[repo.path] === CommitStyle.relational ?
			'required'
		:	'optional'
	}, and the <body> field is **optional**.
The <scope> should be the name(s) of files changed. e.g. if "/src/modules/example/index.ts" was changed, the scope should be "modules/example" or if "/src/modules/example/test.ts" and "/src/modules/anotherexample/index.ts" were changed, the scope should be "modules", you MUST also include the parenthesis/brackets around the scope.
You may add a body ONLY if you feel the changes are complex and need more explanation. If you do, it MUST be separated from the description by a blank line and MUST not just be a repetition or summary of the description, but provide additional context. Remember that the body is OPTIONAL, and can be omitted if the change is not big enough to warrant it.
The body should be maximum 150 characters long. The summary should be maximum 72 characters long.
The summary and body should be in the imperative tense, and describe what the commit does, not what it did. For example, use "change" instead of "changed" or "changes".
The summary MUST also be lowercase, and not end with a period.
`;

	return prompt;
};
