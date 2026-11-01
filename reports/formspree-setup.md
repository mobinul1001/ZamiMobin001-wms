# Formspree setup

## Plan
**Personal** is the plan we need, because a custom thank-you page is not on Free. Checked on 2026-11-01 at formspree.io/plans.

| Plan | Price | Submissions a month | Custom thank-you page | Spam filtering, reCAPTCHA, honeypot |
|---|---|---|---|---|
| Free | $0 | 50 | No | Yes |
| **Personal** | $15/month, or $120/year | 200 | Yes | Yes |
| Professional | $30/month, or $240/year | 2,000 | Yes | Yes |

The plans page shows $10 a month on its cards, which matches the yearly price. Check the price at checkout.

On Free, forms still work, but visitors land on Formspree's own thank-you page instead of /thank-you/. Move to Professional if submissions pass 200 a month.

## Steps
1. In Formspree, create the forms. You can create one form and use it for every page, or one per row below.
2. Put each ID in `src/data/forms.json`. The ID is the part after `/f/` in the form's address. If `default` is filled, any form with an empty ID uses it.
3. In each form's **Settings** tab, set the redirect to `https://websitemaintenanceservices.org/thank-you/`.
4. Leave reCAPTCHA on. The honeypot field `_gotcha` is already in every form.
5. On the preview, send one test through each form.

A real Netlify production build stops if a form has no ID. Every email includes `form_name`, so you can see which page it came from even with one shared ID.

## Forms
| Name in forms.json | Page | Plan pre-fill |
|---|---|---|
| quote | /get-a-free-quote/ | Yes: plan, currency, package |
| contact | /contact/ | No |
| audit | /free-website-maintenance-audit/ | No |
| website-design-services | /website-design-services/ | No |
| website-redesign-services | /website-redesign-services/ | No |
| website-seo-services | /website-seo-services/ | No |
| website-speed-optimization-services | /website-speed-optimization-services/ | No |
| website-speed-optimization-services-2 | /website-speed-optimization-services/ (second form) | No |
| white-label-website-maintenance-services-for-agencies | /white-label-website-maintenance-services-for-agencies/ | No |
| wms-partner-program | /wms-partner-program/ | No |
| wordpress-backup-services | /wordpress-backup-services/ | No |
| wordpress-malware-removal-service | /wordpress-malware-removal-service/ | No |

The malware scanner page has no form to send: its scan runs in the visitor's browser and sends nothing to us, so it needs no ID.

## Sources
- https://formspree.io/plans
- https://help.formspree.io/hc/en-us/articles/360012378333--Thank-You-redirect
- https://help.formspree.io/hc/en-us/articles/360013580813-Honeypot-spam-filtering
