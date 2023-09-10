const shell = window.Native.DANGEROUS__NODE__REQUIRE(
	'electron:shell'
) as typeof import('electron').shell;

export const openExternal = (url: string) => {
	shell.openExternal(url);
};

export const showItemInFolder = (path: string) => {
	shell.showItemInFolder(path);
};
