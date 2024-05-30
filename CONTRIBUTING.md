<div align="center">
	<picture>
	  <source media="(prefers-color-scheme: dark)" width="200px" srcset="https://rela.dev/_assets/logo/rela-dark.png">
	  <source media="(prefers-color-scheme: light)" width="200px" srcset="https://rela.dev/_assets/logo/rela-light.png">
	  <img alt="Rela" width="200px" src="https://rela.dev/_assets/logo/rela-light.png">
	</picture>
</div>

# Contributing

This document outlines some important things to know and abide by while contributing to RelaGit.

## Code of Conduct

Please take a moment to read the [Code of Conduct](https://github.com/relagit/relagit/blob/main/CODE_OF_CONDUCT.md).

## Issues

If you find a bug or have a feature request, please [open an issue](https://github.com/relagit/relagit/issues/choose) and fill out a template. Please be as descriptive as possible and be sure to check if your issue has already been reported.

## Pull Requests

You are more than welcome to submit a pull request with a bug fix or feature. Please be sure to include links to related issues and follow the Pull Request Template.

## Architecture

RelaGit uses vite (via [electron-vite](https://electron-vite.org/)) as its build/dev tool, HMR is enabled by default for the renderer process only.
RelaGit is separated into 3 packages, you can access these through their import aliases.

```
packages/
  ├── app
  ├── shared
  └── main/
    └── src/
      ├── preload.ts
      └── ... (main)
```

### `app`

App is dedicated to [renderer](https://www.electronjs.org/docs/latest/tutorial/process-model#the-renderer-process) code. It is written in [TypeScript](https://www.typescriptlang.org/) and [SolidJS](https://www.solidjs.com/).

The app directory also contains all of RelaGit's styling, which is written in [SCSS](https://sass-lang.com/), any scss file which is imported into a TypeScript file will be compiled into the bundled CSS file.

```ts
import './index.scss';
```

### `shared`

The common directory contains shared code between the app and native packages. It is written in TypeScript but **not** bundled. It is imported by each file that requires it.

### `main`

Main is dedicated to [main process](https://www.electronjs.org/docs/latest/tutorial/process-model#the-main-process) and [preload](https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts) code.

## Code Style

Be sure to download the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension for VSCode and enable the `Format On Save` option. This will ensure that your code is formatted correctly. If you are using another editor, please be sure to format your code before submitting a pull request.

Be sure to also run `pnpm lint` before submitting a pull request to ensure that your code is linted correctly.

All class names should be written in the following form(s):

```scss
component
component__element
component__element modifier // the more common modifier form. (e.g. button primary)
component__element-modifier // this is mainly used if the component itself has a modifier. (e.g. layer-bare)
```

## Commit Messages

Please follow the [Relational Commits](https://github.com/relagit/commits/blob/master/spec/index.md) specification when writing commit messages.

## License

By contributing to RelaGit, you agree that your contributions will be licensed under its [LGPL License](https://github.com/relagit/relagit/blob/main/LICENSE).

Any images contributed which contain the RelaGit brand must be approved by the Rela organisation before being merged. They will thereafter be property of the Rela organisation.