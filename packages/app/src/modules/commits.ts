export enum CommitStyle {
	conventional = 'conventional',
	relational = 'relational',
	none = 'none'
}

// temporary
// (was not temporary)
export interface IDraftCommit {
	files: string[];
}

export interface ICommit {
	message: string;
	description: string;
	files: string[];
}

const getScope = (files: string[]): string => {
	const directories = files.map((file: string) => file.split('/'));

	let out = '';

	for (let i = 0; i < directories[0].length; i++) {
		const directory = directories[0][i];

		if (
			directories.every((directoryList: string[]) => {
				const current = directoryList[i];

				if (current !== directory) return false;

				if (
					[
						'node_modules',
						'packages',
						'app',
						'src',
						'lib',
						'index.js',
						'index.ts',
						'index.tsx',
						'index.jsx',
						'index.mjs',
						'index.cjs',
						'index'
					].includes(current)
				)
					return false;

				return true;
			})
		) {
			out += `${directory.split('.')[0]}/`;
		}
	}

	return out.endsWith('/') ? out.slice(0, -1) : out;
};

export const getCommitStyledMessage = (
	commit: IDraftCommit,
	style?: CommitStyle,
	parens?: boolean,
	type?: string
): ICommit => {
	if (!commit.files?.length) return;

	const scope = getScope(commit.files);

	if (!style)
		return {
			message: '',
			description: '',
			files: commit.files
		};

	if (!scope) return;

	switch (style) {
		case CommitStyle.conventional:
			return {
				message: `${type || ''}(${scope}): `,
				description: '',
				files: commit.files
			};
		case CommitStyle.relational:
			return {
				message: `${parens ? '(' : '['}${scope}${parens ? ')' : ']'} ${
					type ? `${type}: ` : ''
				}`,
				description: '',
				files: commit.files
			};
	}
};

const CONVENTIONAL_REGEX = /^(?<type>\w+)(\((?<scope>\w+)\))?: (?<message>.+)$/;
const RELATIONAL_REGEX = /^\[(?<scope>.+)\] (?:(?<type>.+): )?(?<message>.+)$/;

export const validateCommitMessage = (message: string, style?: CommitStyle): boolean => {
	switch (style) {
		case CommitStyle.conventional:
			return CONVENTIONAL_REGEX.test(message);

		case CommitStyle.relational:
			return RELATIONAL_REGEX.test(message);
	}
};
