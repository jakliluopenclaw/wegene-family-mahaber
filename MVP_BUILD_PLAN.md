# Wegene Tracker MVP Build Plan

## Confirmed MVP Direction

- Site access: shared/site-wide member password for the regular member site.
- Member visibility: pass-list names are visible to logged-in members.
- Call list: member names and phone numbers can be visible inside the password-protected member site for MVP.
- Admin: admin tools remain separately protected and are not accessible with only the member password.
- Secrets: no passwords, tokens, account credentials, or private service keys should be stored in repo files.

## First 5 Implementation Steps

1. **Create the production MVP shell**
   - Convert the local prototype into the Netlify-ready app structure.
   - Add a member-password gate before tracker, history, members/call-list, and payments placeholder pages.

2. **Model the member data safely**
   - Keep current visible member names and rotation order as starter data.
   - Add phone/call-list fields only when Jay provides approved private data.
   - Keep real phone numbers out of demo fixtures until approved.

3. **Implement the tracker state flow**
   - Preserve the pass-list-first rule after completed hosting.
   - Enforce the 21-day minimum host date.
   - Store current turn, scheduled host, pass queue, and history in a production-safe data store instead of localStorage.

4. **Separate member and admin surfaces**
   - Member site: view tracker, history, pass list, member list/call list, and allowed host/pass actions.
   - Admin site: manage members, order, current turn, pass queue, history corrections, exports, and future reminders.
   - Ensure clear/delete/audit/payment-admin/Telegram controls are admin-only.

5. **Add deployment-safe configuration and review gate**
   - Add environment-variable placeholders for passwords/secrets, without committing values.
   - Add basic backup/export path for tracker data.
   - Run local review, then ask Jay/Meridian for approval before any Netlify/GitHub login or deployment.
