import type { GitDiff } from 'parse-git-diff';

import FileStore, { GitFile } from '@stores/files';
import { Repository } from '@stores/repository';
import SettingsStore from '@stores/settings';
import StageStore from '@stores/stage';

import { BINARY_EXTENSIONS, IMAGE_EXTENSIONS } from '@ui/Workspace/CodeView';

import { CommitStyle } from '../commits';
import * as Git from '../git';
import { DIFF_CODES } from '../git/constants';
import { parseDiff } from '../git/parse-diff';
import { ignoredPaths } from './shared';

const nodepath = window.Native.DANGEROUS__NODE__REQUIRE('path');

export const generatePrompt = async (repo: Repository) => {
	const paths = StageStore.getStagedFilePaths(repo.path) || [];

	const files: { diff: GitDiff; file: GitFile }[] = [];

	let prompt =
		'You are an AI embedded inside of a git client called relagit. Create a "COMMIT MESSAGE" from the following git diff of modified files. You will be presented with a list of files and their changed content and must only respond with a short and concise message summarizing the changes. Do not improvse or guess anything outside of what has been changed. A "+" before the line content indicates an added line, while a "-" indicates a removed line. Remember to take each chunk into account, chunks are separated by "--CHUNK--: ---"';

	for (const path of paths) {
		if (path.endsWith('.lock') || ignoredPaths.some((p) => path.includes(p))) {
			prompt += `\n\n--FILE--: ${path} WAS CHANGED\n--ENDFILE--`;

			continue;
		}

		const file = FileStore.getByPath(repo.path, path)!;
		const diff = await Git.Diff(nodepath.join(repo.path, path), repo.path);

		if (BINARY_EXTENSIONS.some((ext) => path.endsWith(ext))) {
			prompt += `\n\n--FILE--: ${path} IS A BINARY FILE\n--ENDFILE--`;

			continue;
		}

		if (IMAGE_EXTENSIONS.some((ext) => path.endsWith(ext))) {
			prompt += `\n\n--FILE--: ${path} IS AN IMAGE FILE\n--ENDFILE--`;

			continue;
		}

		const parsed = parseDiff(diff);

		if (diff === DIFF_CODES.ADD_ALL || diff === DIFF_CODES.REMOVE_ALL) {
			prompt += `\n\n--FILE--: ${path}\n--CHANGES--: {--ALL_${
				diff === DIFF_CODES.ADD_ALL ? 'ADDED' : 'REMOVED'
			}--}: ${(await Git.Content(nodepath.join(repo.path, path), repo.path)).substring(
				0,
				400
			)}\n--ENDFILE--`;

			continue;
		}

		if (diff === DIFF_CODES.ADD_ALL) {
			prompt += `\n\n--FILE--: ${path}\n--CHANGES--: {--ALL_ADDED--}: ${(
				await Git.Content(nodepath.join(repo.path, path), repo.path)
			).substring(0, 400)}\n--ENDFILE--`;

			continue;
		}

		files.push({ diff: parsed, file });

		prompt += `\n\n--FILE--: ${path}\n--CHANGES--: \n`;

		for (const chunk of parsed.files[0]?.chunks || []) {
			prompt += `--CHUNK--: ---\n${chunk.changes
				.map((c) => {
					if (c.type === 'AddedLine') {
						return `+ ${c.content}`;
					} else if (c.type === 'DeletedLine') {
						return `- ${c.content}`;
					} else if (c.type !== 'MessageLine') {
						return `  ${c.content}`;
					}
				})
				.join('\n')}\n---\n`;
		}

		prompt += '\n--ENDFILE--';
	}

	const parens = SettingsStore.settings.commit?.preferParens ? ['(', ')'] : ['[', ']'];

	if (prompt.length > 4000) {
		prompt = prompt.substring(0, 3000) + '---{...and more changes}---';
	}

	prompt += `
--ENDPROMPT--
Your answer MUST be in the following format:

${
	SettingsStore.settings.commit?.styles?.[repo.path] === CommitStyle.relational
		? `${parens[0]}scope${parens[1]} <type> <description>`
		: `<type>${parens[0]}optional scope${parens[1]}: <description>`
}
[optional body]

Some types that can be used:fix:, feat:, chore:, ci:, docs:, style:, refactor:, perf:, test:, and others.
The <type> and <description> fields are mandatory, the <scope> field is ${
		SettingsStore.settings.commit?.styles?.[repo.path] === CommitStyle.relational
			? 'required'
			: 'optional'
	}, and the (optional) <body> field is allowed.
The <scope> should be the name(s) of files changed. e.g. if "/src/modules/ai/prompt.ts" was changed, the scope should be "modules/ai/prompt" or if "/src/modules/ai/prompt.ts" and "/src/modules/ai/index.ts" were changed, the scope should be "modules/ai".
You may add a BODY ONLY if you feel the changes are complex and need more explanation. If you do, it must be separated from the description by a blank line.
The BODY should be maximum 150 characters long. The COMMIT MESSAGE should be maximum 72 characters long.
The COMMIT MESSAGE and BODY should be in the imperative tense, and describe what the commit does, not what it did. For example, use "change" instead of "changed" or "changes".
The COMMIT MESSAGE must also be lowercase, and not end with a period.
The BODY should not just be a repetition or summary of the description, but provide additional context. Note that the BODY is optional, and can be omitted if the description is sufficient.
`;

	return prompt;
};
