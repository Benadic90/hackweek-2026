const fs = require('fs');
const path = require('path');

// Find the .git directory by walking up from the current directory
let currentDir = __dirname;
let gitDir = null;

while (currentDir !== path.parse(currentDir).root) {
  const checkPath = path.join(currentDir, '.git');
  if (fs.existsSync(checkPath) && fs.statSync(checkPath).isDirectory()) {
    gitDir = checkPath;
    break;
  }
  currentDir = path.dirname(currentDir);
}

if (!gitDir) {
  console.error('❌ Error: Could not find .git directory. Are you in a git repository?');
  process.exit(1);
}

const hooksDir = path.join(gitDir, 'hooks');
const preCommitPath = path.join(hooksDir, 'pre-commit');

// Create hooks directory if it doesn't exist (unlikely but possible)
if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir);
}

// The shell script for the git hook
const hookScript = `#!/bin/sh
# pre-commit hook installed by Secret Scanner

echo ""
echo "🔍 Running Secret Scanner before commit..."

# Run the node script
# We use 'node secret-scanner/scanner.js .' assuming we commit from repo root,
# but to be safe we'll find the scanner relative to the git root.
GIT_ROOT=$(git rev-parse --show-toplevel)
SCANNER_PATH="$GIT_ROOT/secret-scanner/scanner.js"

if [ -f "$SCANNER_PATH" ]; then
  node "$SCANNER_PATH" "$GIT_ROOT"
  
  # Capture the exit code of the scanner
  STATUS=$?
  
  if [ $STATUS -ne 0 ]; then
    echo ""
    echo "❌ Commit blocked! Secret Scanner found potential secrets in your code."
    echo "Please remove the secrets before committing, or use 'git commit --no-verify' to bypass."
    exit 1
  fi
else
  echo "⚠️ Warning: Secret scanner not found at $SCANNER_PATH"
fi

echo "✅ Secret scan passed. Proceeding with commit."
exit 0
`;

try {
  fs.writeFileSync(preCommitPath, hookScript);
  // Make it executable (for Unix-like systems, Git Bash on Windows respects this)
  try {
    fs.chmodSync(preCommitPath, '755');
  } catch (e) {
    // chmod might fail on pure windows, that's fine
  }
  
  console.log('✅ Successfully installed Secret Scanner pre-commit hook!');
  console.log(`   Hook location: ${preCommitPath}`);
  console.log('   The scanner will now automatically run every time you commit code.');
} catch (error) {
  console.error('❌ Failed to install hook:', error.message);
}
