# Formspree setup

Owner's decision, 2026-11-01: **Free plan** (50 submissions a month), **one shared form ID** for all forms.

## How it works
1. With JavaScript, `public/forms.js` sends the form with `fetch` and an `Accept: application/json` header. On success the visitor goes to `/thank-you/`, so the Google Analytics page view still counts.
2. A validation error (422) or rate limit (429) shows a message on the form.
3. Any other failure, such as a blocked request or a reCAPTCHA refusal, falls back to a normal post, so the message is not lost.
4. Without JavaScript, the form posts normally and the visitor sees Formspree's own thank-you page.

Every submission includes `form_name`, so each email shows which form it came from.

## What Formspree's docs say (checked 2026-11-01)
| Question | Answer |
|---|---|
| AJAX on Free? | Yes. The AJAX library page says "Available on: All plans", and the plans page lists AJAX forms on every plan. |
| Custom thank-you page on Free? | No. It starts at Personal. Our own page works here because our script opens it, not Formspree. |
| Honeypot on Free? | Yes, all plans. |
| Turn reCAPTCHA off on Free? | The article says "All plans". It does not name Free. |
| reCAPTCHA together with fetch? | The docs do not say what happens with the default reCAPTCHA. Test this. |

The plans page has an old date in its metadata, so check the limits in your account.

## Steps
1. In Formspree, create one form.
2. Put its ID in `src/data/forms.json` as `default`. The ID is the part after `/f/`.
3. In the form's **Settings**, under Spam protection, leave reCAPTCHA on for the first test. If the first test lands on Formspree's own page instead of `/thank-you/`, turn reCAPTCHA off; the honeypot `_gotcha` stays on.
4. On the preview, send one test from each of the 12 forms and confirm the email shows the right `form_name`.

A real Netlify production build stops while the ID is empty.

## Forms and form_name
quote, contact, audit, website-design-services, website-redesign-services, website-seo-services, website-speed-optimization-services, website-speed-optimization-services-2, white-label-website-maintenance-services-for-agencies, wms-partner-program, wordpress-backup-services, wordpress-malware-removal-service.

The malware scanner has no form to send; its scan runs in the visitor's browser.

## Limit to watch
50 submissions a month is shared across all 12 forms. Check what Formspree does at the limit before launch, and move to a paid plan if the site gets close.

## Sources
- https://formspree.io/plans
- https://formspree.io/blog/formspree-ajax/
- https://help.formspree.io/hc/en-us/articles/360013470814-Submit-forms-with-JavaScript-AJAX
- https://help.formspree.io/hc/en-us/articles/115008379328-reCAPTCHA-settings
- https://help.formspree.io/hc/en-us/articles/360012378333--Thank-You-redirect
- https://help.formspree.io/hc/en-us/articles/360013580813-Honeypot-spam-filtering
