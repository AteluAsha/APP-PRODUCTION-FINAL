# Invite link and website (soulschool.app/invite)

The app generates invite links in the form:

`https://soulschool.app/invite?ref=...&start=...`

- **ref**: Inviter's Soul School ID (so the invitee can be linked in Tribe when they open the app).
- **start**: Inviter's journey start date (YYYY-MM-DD) so the invitee can sync to the same week.

You do **not** need to build a separate `/invite` page. Options for your website:

1. **Redirect**: Configure the server so `soulschool.app/invite` (and `/invite?...`) redirects (e.g. 302) to `soulschool.app`. Users see the same main page with store buttons at the top.
2. **Same content**: Serve the same HTML for `/` and `/invite` (e.g. same template; store buttons at top).

The app does not need to change; only your website routing or content. When the link is opened in a browser, the invitee can download from the main page; when opened with the app installed (Universal Links / App Links), the app receives the URL and applies ref + start.
