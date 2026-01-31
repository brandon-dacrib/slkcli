---
name: slack-personal
description: Read, send, search, and manage Slack messages via the slk CLI. Use when the user asks to check Slack, read channels, send Slack messages, search Slack, check unreads, manage drafts, view saved items, or interact with Slack workspace. Also use for heartbeat Slack checks. Triggers on "check slack", "any slack messages", "send on slack", "slack unreads", "search slack", "slack threads", "draft on slack".
homepage: https://www.npmjs.com/package/slkcli
metadata: {"moltbot":{"emoji":"💬","requires":{"bins":["slk"]},"install":[{"id":"npm","kind":"node","package":"slkcli","bins":["slk"],"label":"Install slk (npm)"}],"os":["darwin"]}}
---

# slk — Slack CLI

Session-based Slack CLI for macOS. Auto-authenticates from the Slack desktop app — no tokens, no OAuth, no app installs needed. Zero dependencies, zero setup.

Built for AI agents and terminal workflows. Acts as your user (session-based `xoxc-` tokens).

## Auth

Automatic — extracts session token from Slack desktop app's LevelDB + decrypts cookie from macOS Keychain.

**First run:** macOS will show a Keychain dialog asking to allow access to "Slack Safe Storage":
- **Allow** — one-time access, prompted again next time
- **Always Allow** — permanent, no future prompts (convenient but any process running as your user can extract credentials silently)
- **Deny** — blocks access, slk cannot authenticate

**Credential flow:** Keychain password → derive AES key → decrypt `d` cookie from Slack's SQLite store → extract `xoxc-` token from LevelDB → validate against `auth.test` → cache.

**Token cache:** `~/.local/slk/token-cache.json` — validated tokens cached to avoid re-extraction. Auto-refreshes on `invalid_auth`.

If auth fails (token rotated, Slack logged out):
```bash
rm ~/.local/slk/token-cache.json
slk auth
```

Slack desktop app must be installed and logged in. Does not need to be running if token is cached.

## Commands

```bash
# Auth
slk auth                              # Test authentication, show user/team

# Read
slk channels                          # List channels with member counts (alias: ch)
slk read <channel> [count]            # Read recent messages, default 20 (alias: r)
slk thread <channel> <ts> [count]     # Read thread replies, default 50 (alias: t)
slk search <query> [count]            # Search messages across workspace
slk users                             # List workspace users with statuses (alias: u)

# Activity
slk activity                          # All channels with unread/mention counts (alias: a)
slk unread                            # Only channels with unreads, excludes muted (alias: ur)
slk starred                           # VIP users + starred items (alias: star)
slk saved [count] [--all]             # Saved for later items, active by default (alias: sv)
slk pins <channel>                    # Pinned items in a channel (alias: pin)

# Write
slk send <channel> <message>          # Send a message (alias: s)
slk react <channel> <ts> <emoji>      # React to a message

# Drafts (synced to Slack editor UI)
slk draft <channel> <message>         # Draft a channel message
slk draft thread <ch> <ts> <message>  # Draft a thread reply
slk draft user <user_id> <message>    # Draft a DM
slk drafts                            # List active drafts
slk draft drop <draft_id>             # Delete a draft
```

Channel accepts name (`general`, `ai-coding`) or ID (`C08A8AQ2AFP`).

### Flags

- `--ts` — show raw Slack timestamps (needed for thread/react commands)
- `--no-emoji` — disable emoji in output (or set `NO_EMOJI=1`)
- `--all` — include completed items in `slk saved`

```bash
# Get timestamps, then read that thread
slk read general 10 --ts
slk thread general 1769753479.788949
```

## Agent Workflows

### Heartbeat / Cron — Periodic Slack Check
Use `slk unread` during heartbeat or cron to check what needs attention. Follow up with `slk read` for important channels.

```bash
# Quick unread scan
slk unread
# Read channels that matter
slk read engineering 30
slk read alerts 10
```

### Save & Pick Up Later
The human saves important threads or messages in Slack ("Save for later"). During a cron job or heartbeat, the agent checks saved items, reads the full threads, and processes them — summarizing, extracting action items, or updating task lists.

```bash
# Agent checks what the human saved
slk saved                              # List saved-for-later items
slk thread <channel> <ts>              # Read the full saved thread
# Process: summarize, extract action items, update task lists
```

### Daily Channel Digests
Craft daily summaries for channels — read the day's messages, summarize key discussions, decisions, and action items.

```bash
# Read today's activity
slk read engineering 100
slk read product 50
# Compile digest: key decisions, open questions, action items, FYIs
# Send to a digest channel or DM
slk send daily-digest "📋 *Engineering Digest — Jan 31*\n..."
```

### Thread Monitoring
Watch specific threads for updates (e.g., incident threads, PR reviews, important discussions).

```bash
slk thread engineering 1769753479.788949 50
# Compare with previous read — surface new replies
```

### Draft for Human Review
When the agent wants to post something important, draft it first so the human can review in Slack before sending.

```bash
# Agent drafts, human reviews in Slack UI
slk draft engineering "Here's the weekly status update I compiled..."
slk draft user U08ABC123 "Summary of the meeting notes from today..."
```

### Search-Driven Context
Pull context from Slack history before answering questions or making decisions.

```bash
slk search "deployment process" 10
slk search "from:@alice budget" 5
slk pins engineering                   # Check pinned docs/processes
```

### Cross-Channel Awareness
Monitor multiple channels to build a holistic picture of what's happening.

```bash
slk activity                           # Overview of all channel activity
slk unread                             # What specifically needs attention
slk starred                            # VIP users and starred items
```

## Limitations

- **macOS only** — uses Keychain + Electron storage paths specific to macOS
- **Session-based** — acts as your user (`xoxc-` tokens), not a bot. Be mindful of what you send
- **Draft drop** may fail with `draft_has_conflict` if Slack desktop has that conversation open — navigate away in Slack first
- **Session token** expires if user logs out of Slack — keep app running or rely on cached token
- **Mute-aware** — `activity` and `unread` respect your mute settings (this is a feature, not a bug)

## Exit Codes

`0` on success, `1` on error. Errors print to stderr.

## Missing Features & Issues

Found a bug or want a feature? Create an issue or PR: https://github.com/therohitdas/slkcli
