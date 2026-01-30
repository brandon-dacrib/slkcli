# slk — Slack CLI

Session-based Slack CLI for macOS. Extracts auth from the Slack desktop app automatically.

## How it works

1. Reads the `xoxc-` token from Slack's LevelDB (`Local Storage`)
2. Decrypts the `d` cookie from Slack's SQLite cookie store using the macOS Keychain encryption key
3. Pairs both for authenticated API calls
4. Auto-refreshes if session expires (requires Slack app to be running)

## Usage

```bash
slk auth              # Test authentication
slk channels          # List channels
slk read <channel>    # Read recent messages (name or ID)
slk send <channel> <message>  # Send a message
slk search <query>    # Search messages
slk thread <channel> <ts>     # Read a thread
slk users             # List workspace users
slk react <channel> <ts> <emoji>  # React to a message
```

## Requirements

- macOS (uses Keychain + Electron storage paths)
- Slack desktop app installed and logged in
- Node.js 18+
