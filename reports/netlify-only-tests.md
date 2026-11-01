# Tests that need Netlify (run after the owner pushes)

Local builds cannot prove these. Each one gets real `curl` output or a screenshot.

| # | Test | Pass means |
|---|---|---|
| 1 | Editorial Workflow: draft, PR, deploy preview, publish | A draft opens a PR with its own preview; publish merges and goes live; production is unchanged until then |
| 2 | Sveltia `max_file_size` | Note whether a large upload is blocked or only warned |
| 3 | Sveltia `maxlength` on SEO title and description | Note whether saving is blocked or only warned |
| 4 | `/?p=2431` and other query rules on `/` | One 301 to the final page, with no loop on `/` |
| 5 | `/Site` (capital letter) | One 301 to `/` |
| 6 | No-slash URLs, for example `/about-us`, `/plan-packages-and-costs` | One 301 straight to the final URL, no chain |
| 7 | `/contact?plan=growth` | One 301 to `/contact/`; query harmless |
| 8 | `/feed/` | 200 with RSS content (rewrite to `/feed.xml`) |
| 9 | 404 rows and a made-up URL | Real HTTP 404, not a redirect |
| 10 | Preview and `netlify.app` production address | `X-Robots-Tag: noindex, nofollow` on every path |
| 11 | Failed build | Previous deploy stays live; failure email arrives |
| 12 | Hosts on the live domain (launch) | `http://`, `www.` and `http://www.` reach the main host in one hop |
| 13 | Firewall and bot access | The named search and AI bots are not blocked |

## Added with the page templates (Batch 4)
- After adding the Formspree ID: submit each form. Confirm the email arrives, shows the right form_name, and the browser lands on /thank-you/. Repeat once with JavaScript off and confirm Formspree's own thank-you page appears.
- Open /get-a-free-quote/#growth. Confirm Growth is selected. Open /get-a-free-quote/#starter-design. Confirm "Other or not sure" is selected and the email shows package = starter-design.
- Fill the _gotcha field through dev tools. Confirm Formspree ignores the submission.
- Open a missing URL on the live build. Confirm HTTP 404, and a page_not_found event in Google Analytics.
- Confirm the Google tag and Clarity load only on the production domain.
