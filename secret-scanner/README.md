# Secret Scanner

A CLI security tool that scans files and directories to detect accidentally exposed sensitive information like API keys, passwords, tokens, and credentials.

## How to use

```bash
# scan a directory
node scanner.js <path-to-scan>

# scan the included test files
node scanner.js test-files
```

## What it detects

The scanner checks for 18 different secret patterns:

| Type | Severity |
|------|----------|
| AWS Access Key | HIGH |
| AWS Secret Key | HIGH |
| GitHub Token | HIGH |
| Generic API Key | MEDIUM |
| Generic Secret | MEDIUM |
| Password in Code | HIGH |
| Private Key (RSA/DSA/EC) | CRITICAL |
| Slack Webhook URL | HIGH |
| Stripe Key (live/test) | HIGH |
| JWT Token | MEDIUM |
| Database Connection String | HIGH |
| Bearer Token | MEDIUM |
| Google API Key | HIGH |
| Heroku API Key | HIGH |
| SendGrid API Key | HIGH |
| Twilio API Key | MEDIUM |
| Hardcoded IP with Port | LOW |
| Email/SMTP Credentials | HIGH |

## Features

- Scans entire directories recursively
- Skips binary files and common non-code directories (node_modules, .git, etc)
- Color-coded terminal output with severity levels
- Masks detected secrets in the output for safety
- Shows exact file path, line number, and code context
- Groups findings by file for easy reading
- Exits with code 1 if secrets found (useful for CI/CD pipelines)
- Zero dependencies — pure Node.js

## Testing

Run the scanner against the included test files:

```bash
node scanner.js test-files
```

The `test-files/` directory contains intentionally planted fake secrets to demonstrate detection.

## Tech

- Node.js (no external dependencies)
- Regex-based pattern matching
