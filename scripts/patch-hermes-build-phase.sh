#!/bin/bash
# Patch the Hermes Replace script so it doesn't hang (skip with-environment.sh and run node directly).
# Call this while xcodebuild is running; the script file is created early in the build.
set -e
SCRIPT_PATH="$1"
if [ -z "$SCRIPT_PATH" ]; then
  SCRIPT_PATH="ios/build/Build/Intermediates.noindex/Pods.build/Debug-iphonesimulator/hermes-engine.build/Script-46EB2E00030140.sh"
fi
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FULL="$ROOT/$SCRIPT_PATH"
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
  if [ -f "$FULL" ]; then
    cat > "$FULL" << 'HERMES_PATCH'
#!/bin/sh
# Patched to avoid hang from with-environment.sh (nvm/find-node) in Xcode script phase.
# Debug builds do not need to replace Hermes; exit immediately.
CONFIG="Release"
if echo "$GCC_PREPROCESSOR_DEFINITIONS" | grep -q "DEBUG=1"; then
  CONFIG="Debug"
fi
if [ "$CONFIG" = "Debug" ]; then
  exit 0
fi
export NODE_BINARY="${NODE_BINARY:-$(command -v node)}"
. "$REACT_NATIVE_PATH/scripts/xcode/with-environment.sh"
"$NODE_BINARY" "$REACT_NATIVE_PATH/sdks/hermes-engine/utils/replace_hermes_version.js" -c "$CONFIG" -r "0.79.6" -p "$PODS_ROOT"
HERMES_PATCH
    echo "Patched $FULL"
    exit 0
  fi
  sleep 3
done
echo "Script file not found after 60s"
exit 1
