# CI/CD Pipeline Challenge

A fully automated Continuous Integration pipeline built with GitHub Actions that validates code quality on every push and pull request.

## Pipeline Overview

The workflow (`.github/workflows/ci.yml`) triggers automatically on:
- **Push** to `main` or `master` branches
- **Pull Requests** targeting `main` or `master` branches

### Pipeline Steps
| Step | Tool | Purpose |
|------|------|---------|
| Install Dependencies | `npm ci` | Clean, reproducible install from lockfile |
| Security Scanning | `npm audit` | Detects known vulnerabilities in dependencies |
| Linting | ESLint v10 | Enforces code formatting and style rules |
| Automated Testing | Jest v30 | Validates all business logic with unit tests |

### Matrix Strategy
The pipeline runs across **two Node.js versions** (20.x, 22.x) simultaneously to ensure broad compatibility.

## Setup Instructions
1. Navigate into the project directory:
   ```bash
   cd ci-cd-challenge
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run tests locally:
   ```bash
   npm test
   ```
4. Run linter locally:
   ```bash
   npm run lint
   ```

## How to Test
1. Push any change to the `main` branch.
2. Go to the **Actions** tab on GitHub.
3. Watch the pipeline execute all 4 steps and pass with a green checkmark.
