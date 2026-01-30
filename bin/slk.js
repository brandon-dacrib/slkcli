#!/usr/bin/env node

/**
 * slk — Slack CLI with auto-auth from macOS Slack desktop app.
 */

import * as cmd from "../src/commands.js";
import * as drafts from "../src/drafts.js";

const args = process.argv.slice(2);
const command = args[0];

const supportsEmoji = !process.env.NO_EMOJI && !process.argv.includes("--no-emoji");
const e = (emoji, fallback = "") => supportsEmoji ? emoji + " " : fallback;

const HELP = `${e("💬")}slk — Slack CLI for macOS (auto-auth from Slack desktop app)

Commands:
  slk auth                                Test auth, show user/team info
  slk channels          (ch)              List channels with member counts
  slk users             (u)               List workspace users with statuses
  slk read <ch> [n]     (r)               Read last n messages (default: 20)
  slk send <ch> <msg>   (s)               Send a message
  slk search <query> [n]                  Search messages across workspace
  slk thread <ch> <ts> [n]  (t)           Read thread replies (default: 50)
  slk react <ch> <ts> <emoji>             Add emoji reaction
  slk activity          (a)               Channel activity with unread/mention counts
  slk unread            (ur)              Channels with unreads (excludes muted)
  slk starred           (star)            VIP users + starred items
  slk pins <ch>         (pin)             Pinned items in a channel

Drafts (synced to Slack UI):
  slk draft <ch> <msg>                    Draft a channel message
  slk draft thread <ch> <ts> <msg>        Draft a thread reply
  slk draft user <user_id> <msg>          Draft a DM
  slk drafts                              List active drafts
  slk draft drop <id>                     Delete a draft

Settings:
  --no-emoji                              Disable emoji output (or set NO_EMOJI=1)

Channels: name ("general") or ID ("C08A8AQ2AFP"). Aliases shown in parens.

Examples:
  slk read general 50                     Last 50 messages from #general
  slk send engineering "build passed"     Send to #engineering
  slk search "deploy failed" 10           Search with limit
  slk thread general 1706000000.000000    Read a thread
  slk react general 1706000000.000000 eyes  React with :eyes:
  slk draft general "PR summary..."       Save draft in Slack UI
  slk unread                              What needs attention?

Auth: reads credentials from the Slack desktop app automatically.
Cache: ~/.local/slk/token-cache.json (auto-validated, auto-refreshed).
Docs:  https://github.com/therohitdas/slkcli`;

async function main() {
  try {
    switch (command) {
      case "auth":
        await cmd.auth();
        break;

      case "channels":
      case "ch":
        await cmd.channels();
        break;

      case "read":
      case "r":
        if (!args[1]) { console.error("Usage: slk read <channel> [count]"); process.exit(1); }
        await cmd.read(args[1], parseInt(args[2]) || 20);
        break;

      case "send":
      case "s":
        if (!args[1] || !args[2]) { console.error("Usage: slk send <channel> <message>"); process.exit(1); }
        await cmd.send(args[1], args.slice(2).join(" "));
        break;

      case "search":
        if (!args[1]) { console.error("Usage: slk search <query> [count]"); process.exit(1); }
        await cmd.search(args.slice(1).join(" "), parseInt(args[args.length - 1]) || 20);
        break;

      case "thread":
      case "t":
        if (!args[1] || !args[2]) { console.error("Usage: slk thread <channel> <ts>"); process.exit(1); }
        await cmd.thread(args[1], args[2], parseInt(args[3]) || 50);
        break;

      case "users":
      case "u":
        await cmd.users();
        break;

      case "react":
        if (!args[1] || !args[2] || !args[3]) {
          console.error("Usage: slk react <channel> <ts> <emoji>");
          process.exit(1);
        }
        await cmd.react(args[1], args[2], args[3]);
        break;

      case "activity":
      case "a":
        await cmd.activity(false);
        break;

      case "unread":
      case "ur":
        await cmd.activity(true);
        break;

      case "starred":
      case "star":
        await cmd.starred();
        break;

      case "pins":
      case "pin":
        if (!args[1]) { console.error("Usage: slk pins <channel>"); process.exit(1); }
        await cmd.pins(args[1]);
        break;

      case "drafts":
        await drafts.listDrafts();
        break;

      case "draft": {
        const sub = args[1];
        if (sub === "thread") {
          if (!args[2] || !args[3] || !args[4]) {
            console.error("Usage: slk draft thread <channel> <ts> <message>");
            process.exit(1);
          }
          await drafts.draftThread(args[2], args[3], args.slice(4).join(" "));
        } else if (sub === "user") {
          if (!args[2] || !args[3]) {
            console.error("Usage: slk draft user <user_id> <message>");
            process.exit(1);
          }
          await drafts.draftUser(args[2], args.slice(3).join(" "));
        } else if (sub === "drop") {
          if (!args[2]) { console.error("Usage: slk draft drop <draft_id>"); process.exit(1); }
          await drafts.dropDraft(args[2]);
        } else {
          // slk draft <channel> <message>
          if (!sub || !args[2]) {
            console.error("Usage: slk draft <channel> <message>");
            process.exit(1);
          }
          await drafts.draftChannel(sub, args.slice(2).join(" "));
        }
        break;
      }

      case "help":
      case "-h":
      case "--help":
      case undefined:
        console.log(HELP);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log(HELP);
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
