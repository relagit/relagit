<div align="center">
	<img src="./build/icon.png" alt="RelaGit logo" width="128">
	<h1>RelaGit</h1>
	<p>The elegant solution to graphical version control.</p>
	<div><a href="https://git.rela.dev">git.rela.dev</a></div>
	<br>
 	<div style="margin-bottom: 16px">
		<a href="https://github.com/relagit/relagit/actions/workflows/ci.yml">
			<img src="https://github.com/relagit/relagit/actions/workflows/ci.yml/badge.svg" alt="CI" />
		</a>
		<a href="https://github.com/relagit/relagit/actions/workflows/release.yml">
			<img src="https://github.com/relagit/relagit/actions/workflows/release.yml/badge.svg" alt="Release" />
		</a>
 	</div>
	<br>
	<picture>
	  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/relagit/relagit/main/public/assets/preview-dark.png">
	  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/relagit/relagit/main/public/assets/preview-light.png">
	  <img alt="RelaGit client" src="https://raw.githubusercontent.com/relagit/relagit/main/public/assets/preview-dark.png#">
	</picture>
</div>

---

> [!NOTE]
> RelaGit is in an early beta stage. Please report any issues you encounter [on our issue tracker](https://github.com/relagit/relagit/issues/new)

## Download

Builds are generated automatically upon [release](https://github.com/relagit/relagit/releases).

-   [macOS (Intel)](https://github.com/relagit/relagit/releases/latest/download/RelaGit-mac-x64.dmg)
-   [macOS (Apple Silicon)](https://github.com/relagit/relagit/releases/latest/download/RelaGit-mac-arm64.dmg)
-   [Windows](https://github.com/relagit/relagit/releases/latest/download/RelaGit-win.zip)
-   [Linux (rpm)](https://github.com/relagit/relagit/releases/latest/download/RelaGit-linux.rpm)
-   [Linux (tar.gz)](https://github.com/relagit/relagit/releases/latest/download/RelaGit-linux.tar.gz)
-   [Linux (deb)](https://github.com/relagit/relagit/releases/latest/download/RelaGit-linux.deb)

## Roadmap

Before we hit the first stable release, the following features should be implemented:

-   [x] Support for git submodules.
-   [x] Optimisation of git processes and operations, currently there is noticable CPU strain on startup.
-   [x] Commit graph in information modal.
-   [ ] Use libgit2 for git operations instead of the git CLI. (?)

## Building

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or higher)
-   [pnpm](https://pnpm.io/)
-   [Git](https://git-scm.com/)

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

## Creating Workflows

Please refer to the [Creating Workflows](https://git.rela.dev/docs/workflows/creating-workflows) tutorial.
