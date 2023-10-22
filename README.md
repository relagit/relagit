[![CI](https://github.com/relagit/relagit/actions/workflows/ci.yml/badge.svg)](https://github.com/relagit/relagit/actions/workflows/ci.yml)

> [!NOTE]
> RelaGit is far from stable, **DO NOT** use it for production projects yet.

<div align="center">
	<picture>
	  <source media="(prefers-color-scheme: dark)" srcset="https://rela.dev/assets/projects/client-dark.png#">
	  <source media="(prefers-color-scheme: light)" srcset="https://rela.dev/assets/projects/client-light.png#">
	  <img alt="RelaGit client" src="https://rela.dev/assets/projects/client-dark.png#">
	</picture>
</div>

# relagit

A next-generation git client. Enables you to take back control over your git workflow.

## Download

Builds are generated automatically upon [release](https://github.com/relagit/relagit/releases).

- [macOS](https://github.com/relagit/relagit/releases/latest)[^1]
- [Windows](https://github.com/relagit/relagit/releases/latest)
- ~~Linux~~[^2]

[^1]: macOS prebuilds are not yet available for Apple Silicon. You can build it yourself following the instructions above.
[^2]: We have temporarily dropped support for linux in our release pipeline due to numerous ambiguities.

## Building

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)

### Instructions

```bash
git clone https://github.com/relagit/relagit relagit

cd relagit

pnpm i
pnpm build
pnpm make:{platform}
```

Replace `platform` with one of the [supported platforms](https://github.com/relagit/relagit/blob/main/package.json#L19-L21) (e.g. `make:mac`).

You will find an executable in the `out` folder.