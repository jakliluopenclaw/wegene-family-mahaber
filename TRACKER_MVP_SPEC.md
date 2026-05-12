# Wegene Family Mahaber Tracker MVP Spec

## Goal

Enhance/rebuild the current hosting tracker while preserving the family’s existing automatic rotation logic.

## Current Tracker Understanding

- Lists head members by assigned order.
- Shows member names and photos.
- Current active member can choose **Host** or **Pass**.
- If hosting, member selects a date at least 3 weeks from today.
- Member call list / phone numbers are removed from the member MVP for now.
- If passing, member goes to a pass list.
- After someone hosts, the next turn should come from the pass list first, then return to assigned order if pass list is empty.
- Telegram reminders should be added.
- Admin page is needed for Jay/Meridian to fix and manage issues.

## Observed Current Site Details

Main tracker: https://wegene-jaklilu.pythonanywhere.com/

Visible members:

1. Mengistu
2. Yoni
3. Hana
4. Eyob
5. Mekurab
6. Derege
7. Alem
8. Menelik
9. Yehayes
10. Samson
11. Adefres
12. Haimanot
13. Kebede
14. Mimi
15. Woubshet
16. Wosene

Current observed state:

- Mengistu: Hosted, 2026-06-01
- Yoni: Get Ready

## Rotation Rule

Use a two-queue model:

- Main assigned order
- Pass queue

Algorithm:

```text
When current member chooses HOST:
  validate selected_date >= today + 21 days
  set status = scheduled
  save scheduled_date

When hosting is confirmed complete:
  set status = hosted
  add hosting history record

  if pass_queue is not empty:
    next_member = pass_queue.pop_oldest()
  else:
    next_member = next active member in assigned order

  set next_member = get_ready

When current member chooses PASS:
  set status = passed
  append member to pass_queue
  next_member = next active member in assigned order
  set next_member = get_ready
```

## Admin Page Justification

Jay does need an admin page because family/community workflows need human override.

Admin should support:

- Add/edit/deactivate members
- Upload/update member photos
- Edit phone/contact info
- Set assigned rotation order
- View/manage pass list
- Manually set current/get-ready host
- Mark hosted/pass/skip/cancel
- Edit hosting date
- View/correct history
- Export CSV/JSON backup
- Telegram reminder settings/test/status
- Audit log of changes

Member-only behind shared password:

- Member names, hosting status, pass list, and history are visible to logged-in members.
- Member call list / phone numbers are removed from the member MVP for now.

Admin-only / not public:

- Admin controls
- Delete/clear history actions
- Telegram bot tokens/chat IDs
- Payment/invoice admin data
- Private notes
- Audit logs
- Any state-changing action

## Risks To Fix From Current Site

- Current public history page appears to include a clear-history POST button; destructive controls must be admin-only.
- Host/pass POST endpoints should be behind the member password and protected against accidental/unauthorized state changes.
- Current host button/date input appear disabled in rendered HTML.
- Phone/call list should not be visible in the member MVP for now.
- Pass list is core behavior and may show names to logged-in members.
- No obvious audit trail.
- No obvious Telegram reminder control/status.
- History has Email column; avoid exposing contact info outside the member site.

## MVP Pages

- `/` member dashboard/tracker behind shared member password
- `/history` member-visible hosting history
- `/members` member-visible list, without call list for now
- `/admin` separately protected admin area
- `/host` or current-member action flow behind member password
- `/payments` placeholder/link to existing invoice/payment site later, behind member password

## MVP Features

Member-visible behind shared password:

- Member photos and names in assigned order
- Status badges: Hosted, Get Ready, Scheduled, Passed, Waiting
- Current host/get-ready card
- Scheduled hosting date
- Hosting history
- Passed members labeled in the main tracker; no separate pass queue section on the member page
- No member call list for now

Current member flow:

- I will host
- Date picker with minimum today + 21 days
- I will pass
- Confirmation before pass
- Success message after action

Admin-only, separately protected:

- Manage members/photos/order/contact info
- Manage current turn and pass queue
- Mark hosted and edit dates
- Correct mistakes
- Export backups
- Telegram reminder controls
- Delete/clear actions, audit logs, payment admin data, private notes, and secrets

Telegram reminders:

- Reminder to current Get Ready member
- Reminder after scheduling
- Reminder to all members before the event
- Reminder to admin if no response after X days


## Access Control Update

The site should be member-only behind a password/login instead of fully public.

MVP approach recommendation:

1. Start with simple site-wide/shared member password protection for all tracker pages.
2. Keep admin controls behind a separate stronger admin password/login.
3. Pass-list names may be visible to members.
4. Member call list / phone numbers are removed from the member MVP for now.
5. Do not expose admin tools, delete actions, Telegram settings, audit logs, private notes, or contact details to regular members.
6. Later upgrade to per-member login if needed.
