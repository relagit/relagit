<div align="center">
	<picture>
	  <source media="(prefers-color-scheme: dark)" width="200px" srcset="https://rela.dev/assets/relagit-light.png">
	  <source media="(prefers-color-scheme: light)" width="200px" srcset="https://rela.dev/assets/relagit-dark.png">
	  <img alt="Rela" width="200px" src="https://rela.dev/assets/relagit-dark.png">
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

RelaGit is separated into 3 packages, you can access these through the `~/package` import alias.

```
packages/
  ├── app
  ├── common
  └── native/
    ├── main
    └── preload
```

### `app`

App is dedicated to [renderer](https://www.electronjs.org/docs/latest/tutorial/process-model#the-renderer-process) code. It is written in [TypeScript](https://www.typescriptlang.org/) and [SolidJS](https://www.solidjs.com/). Both it and native contain their own `rollup.config.js` files which control how the code is bundled.

The app directory also contains all of RelaGit's styling, which is written in [SCSS](https://sass-lang.com/), any scss file which is imported into a TypeScript file will be compiled into the bundled CSS file. 

```ts
import './index.scss'
```

### `common`

The common directory contains shared code between the app and native packages. It is written in TypeScript but **not** bundled. It is imported by each file that requires it.

### `native`

Native is dedicated to [main](https://www.electronjs.org/docs/latest/tutorial/process-model#the-main-process) and [preload](https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts) code.

## Code Style

Be sure to download the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension for VSCode and enable the `Format On Save` option. This will ensure that your code is formatted correctly. If you are using another editor, please be sure to format your code before submitting a pull request.

Be sure to also run `pnpm lint` before submitting a pull request to ensure that your code is linted correctly.

All class names should be written in the following form(s):

```scss
component
component__element
component__element-modifier // this is mainly used if the component itself has a modifier. (e.g. layer-bare)
component__element modifier // the more common modifier form
```

## Commit Messages

Please follow the [Relational Commits](https://github.com/relagit/commits/blob/master/spec/index.md) specification when writing commit messages.

## License

By contributing to RelaGit, you agree that your contributions will be licensed under its [RLPL License](https://github.com/relagit/relagit/blob/main/LICENSE).
