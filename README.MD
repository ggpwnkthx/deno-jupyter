<!-- deno-maintenance-notice:start -->
> **Maintenance notice**
>
> This project is no longer actively maintained and remains available for reference and community forks.
>
> On October 9, 2026, [Deno announced that its team is joining Cloudflare](https://deno.com/blog/cloudflare). The team will provide monthly Deno runtime bug fixes and security updates for one year following that announcement, then end its development of the runtime. Deno remains open source, and community development may continue.
>
> Separately, Deno Deploy will shut down six months after the announcement. JSR will continue operating, with its infrastructure moving to Cloudflare.
>
> These changes prompted my decision to discontinue maintenance of this project. Existing code may continue to work, but future compatibility and fixes are not guaranteed.
<!-- deno-maintenance-notice:end -->

# Deno 2 with Jupyter in VSCode
This repository provides a streamlined development environment to use **Deno 2** with **Jupyter Notebooks** in **VSCode**. Whether you are new to programming or looking to explore TypeScript with Deno, this setup enables an easy-to-use, containerized environment that requires no command-line setup.

## Features
- **Deno 2 Integration**: Easily use Deno 2 in Jupyter Notebooks to run TypeScript code.
- **VSCode DevContainer and Extensions**: All necessary tools are pre-installed, eliminating the need for additional setup.

## Getting Started
### Requirements
- **VSCode**: Download and install [VSCode](https://code.visualstudio.com/).
- **Remote - Containers Extension**: Install the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension in VSCode.
- **Docker Desktop**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) to enable containerized development.

### Setup Instructions
- **Clone the Repository**: Open the Command Palette in VSCode (⇧⌘P on macOS, Ctrl+Shift+P on Windows/Linux) and select:
   - `Remote-Containers: Clone Repository in Container Volume…`
   - Paste the repository URL and hit enter.
- **Wait for Setup**: VSCode will automatically build the Docker container.

Happy coding with TypeScript and Deno in Jupyter!
