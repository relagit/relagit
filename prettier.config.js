/** @type {import('prettier').Config} */
const config = {
	plugins: ['@trivago/prettier-plugin-sort-imports'],
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	tabWidth: 4,
	importOrderParserPlugins: ['importAssertions', 'typescript', 'jsx', 'json'],
	bracketSpacing: true,
	importOrder: [
		'^(~\\/|@)((?!ui)app|common|modules|stores)',
		'^@ui/(.+)$',
		'^(\\.+)\\/(?!index\\.scss|app\\.scss).+',
		'^(\\.+)\\/.+css'
	],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true
};

export default config;
