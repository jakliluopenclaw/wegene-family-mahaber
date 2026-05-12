# Wegene Family Mahaber Tracker Prototype

Local, Netlify-ready static prototype for the enhanced hosting tracker. It does **not** log in to Netlify, GitHub, PayPal, Telegram, or any external account. It does **not** store secrets.

## What is included

- Member list using the current visible head-member names.
- Placeholder photo avatars; real photo migration is pending approval/source files.
- Assigned rotation order.
- Current/Get Ready member simulation.
- Host/pass flow in browser-only localStorage.
- 21-day minimum host date validation.
- Pass queue behavior: after hosting is confirmed, pass queue gets priority.
- Member-site-safe history table.
- MVP direction notes: all tracker/member pages behind a shared member password; admin tools separately protected.
- Admin mock page explaining controls and protected data.
- Telegram reminders design notes only; no live integration.
- `netlify.toml` for simple static publish configuration.

## How to run locally

From this folder:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

Do not open `index.html` directly with `file://` because browser security blocks loading JSON files that way.

## Files

```text
index.html                  Main tracker prototype
admin.html                  Admin mock/protection placeholder
assets/styles.css           Styling
assets/app.js               Browser-only rotation simulation
data/members.json           Starter member list
data/state.json             Starter rotation state
data/history.json           Starter hosting history
telegram-reminders.md       Reminder design, no integration
netlify.toml                Static Netlify publish config
```

## Confirmed MVP access direction

- Use a shared/site-wide member password for the member site MVP.
- Show pass-list names to logged-in members.
- Show member call list / phone numbers inside the password-protected member site for MVP.
- Keep admin tools behind separate admin protection.
- Do not store passwords, account secrets, Telegram tokens, or private credentials in repo files.

## Pending decisions

- Provide approved member photos and private phone list, if/when ready.
- Choose backend/data store for production state changes; static localStorage is prototype-only.
- Decide exact admin auth implementation for production.
