# Telegram Reminders Design Notes

No Telegram integration is connected in this prototype. Do not store bot tokens in frontend files.

## Reminder events

1. **Turn assigned** — current member is told: “It is your turn. Please host or pass.”
2. **No response** — admin reminder after a configurable number of days.
3. **Host scheduled** — current host receives confirmation plus private call-list link/instructions.
4. **Family reminder** — members receive gathering reminder before the scheduled date.
5. **Admin exception** — Telegram failure, invalid chat id, cancellation, or manual override.

## Production recommendation

- Use a backend function/serverless endpoint for Telegram calls.
- Store bot token only in Netlify environment variables or another secrets manager.
- Keep chat IDs private/admin-only.
- Log reminder status without exposing private contact details publicly.
