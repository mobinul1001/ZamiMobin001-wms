// Owner's wording, 2026-11-01: healthcare note, staging claim, repair times and the repair promise.
export const HEALTH_NOTE = 'Healthcare websites: we keep patient information off the website. Forms that collect health details go through a HIPAA-eligible form provider that signs a BAA with your practice.';
const HEALTH_NOTE_PT = 'Sites de saúde: mantemos as informações de pacientes fora do site. Formulários que coletam dados de saúde passam por um provedor seguro de formulários que atende à LGPD e assina um acordo de processamento de dados com sua clínica.';
export const PORTAL_NOTE = 'Patient & client portals: we build them as a separate, secured system — your marketing website stays free of patient data. Patient portals run on HIPAA-eligible hosting (US) or hosting that meets local privacy law, and we build and maintain them under a signed BAA (US) or data processing agreement (UK, EU, Canada, Australia, Brazil).';
const PORTAL_NOTE_PT = 'Portais de pacientes e clientes: nós os construímos como um sistema separado e protegido — o site de marketing fica livre de dados de pacientes. Os portais de pacientes rodam em hospedagem elegível à HIPAA (EUA) ou em hospedagem que atende à lei local de privacidade, e nós os construímos e mantemos sob um BAA assinado (EUA) ou um acordo de processamento de dados (Reino Unido, UE, Canadá, Austrália, Brasil).';
const BOOKING = "We connect your practice's booking system to your website, or build a booking feature inside your patient portal.";
const countryNote = (law) => `Healthcare websites: we keep patient information off the website. Forms that collect health details go through a secure form provider that meets ${law} and signs a data processing agreement with your practice.`;
const COUNTRY_NOTES = {
  '/website-maintenance-services-for-uk/': countryNote('UK GDPR'),
  '/website-maintenance-services-for-france/': countryNote('GDPR'),
  '/website-maintenance-services-for-ireland/': countryNote('GDPR'),
  '/website-maintenance-services-for-canada/': countryNote('PIPEDA'),
  '/website-maintenance-services-for-australia/': countryNote('the Privacy Act'),
};
export const healthNoteFor = (path) => COUNTRY_NOTES[path] ?? HEALTH_NOTE;
const BLOCK = `${HEALTH_NOTE}\n\n${PORTAL_NOTE}`;
const STAGING = 'Staging-tested updates on the Business plan.';
export const REPAIR_TIME = 'Small fixes are usually done within 24 hours; bigger repairs within 24–48 hours.';
export const NO_FIX = "No fix, no fee: we check your site and quote before we start. If we can't fix the issue, you don't pay. (Excludes problems caused by your hosting provider's outage or by third-party services we don't control.)";

const after = (text, note = BLOCK) => [text, `${text}\n\n${note}`];
const afterLine = (re, note = BLOCK) => [re, (m) => `${m}\n\n${note}`];
const industries = (path) => [/^### Industries We Serve[^\n]*$/m, (m) => `${m}\n\n${healthNoteFor(path)}\n\n${PORTAL_NOTE}`];

export const HEALTH_PAGES = ['about-us', 'website-design-services', 'website-hacked-recovery-services', 'website-maintenance-case-study', 'website-migration-services', 'website-redesign-services', 'website-repair-services', 'website-seo-services', 'website-speed-optimization-services', 'website-support-services', 'website-update-services', 'white-label-website-maintenance-services-for-agencies', 'wordpress-backup-services', 'wordpress-malware-removal-service', 'works', 'website-maintenance-services-for-usa', 'website-maintenance-services-for-uk', 'website-maintenance-services-for-canada', 'website-maintenance-services-for-australia', 'website-maintenance-services-for-france', 'website-maintenance-services-for-ireland'].map((n) => `/${n}/`);

export const EXTRA_CHANGES = {
  '/about-us/': [afterLine(/^Small & Local Businesses Service Businesses[^\n]*$/m)],
  '/website-design-services/': [
    ['**Healthcare website design** and **medical website design**. We build patient trust, doctor directories, and secure online appointment booking.', `**Healthcare website design** and **medical website design**. We build patient trust and doctor directories. ${BOOKING}\n\n${BLOCK}`],
    ['requiring patient booking funnels', 'requiring clear booking paths'],
  ],
  '/website-hacked-recovery-services/': [after('Recovery handled with care for sensitive patient data.')],
  '/website-maintenance-case-study/': [afterLine(/^We help clinics, therapists[^\n]*$/m)],
  '/website-migration-services/': [['**Challenge:** Large patient booking database and heavy media assets needing migration from slow shared hosting to a high-speed VPS without patient service interruption.', BLOCK]],
  '/website-redesign-services/': [
    ['We preserve local SEO maps, doctor profiles, and patient portals while protecting appointment forms.', `We preserve local SEO maps, doctor profiles, and patient portals. ${BOOKING}`],
    afterLine(/^Executing specialized \*\*healthcare website redesign\*\*[^\n]*$/m),
  ],
  '/website-seo-services/': [afterLine(/^Executing specialized \*\*healthcare seo\*\*[^\n]*$/m)],
  '/website-speed-optimization-services/': [
    ['Fast LCP load speeds for clinic portals, doctor directories, and patient online appointment booking forms.', `Fast LCP load speeds for clinic websites and doctor directories. ${BOOKING}\n\n${BLOCK}`],
    [/^Fast Patient Appointment UX$/m, 'Fast Patient UX'],
  ],
  '/website-support-services/': [after('Patient portals, form submissions, and booking systems require consistent uptime and strict security measures.')],
  '/wordpress-backup-services/': [
    ['Patient-facing appointment forms and medical content need clean,', 'Medical content needs clean,'],
    afterLine(/^Medical content needs clean,[^\n]*$/m),
  ],
  '/wordpress-malware-removal-service/': [afterLine(/^Patient privacy requirements make immediate[^\n]*$/m)],
  '/works/': [['#### Healthcare & Medical', `#### Healthcare & Medical\n\n${BLOCK}`]],
  '/website-maintenance-services-for-usa/': [industries('/website-maintenance-services-for-usa/')],
  '/website-maintenance-services-for-uk/': [industries('/website-maintenance-services-for-uk/')],
  '/website-maintenance-services-for-canada/': [industries('/website-maintenance-services-for-canada/')],
  '/website-maintenance-services-for-australia/': [industries('/website-maintenance-services-for-australia/')],
  '/website-maintenance-services-for-france/': [industries('/website-maintenance-services-for-france/')],
  '/website-maintenance-services-for-ireland/': [industries('/website-maintenance-services-for-ireland/')],
  '/website-maintenance-services-for-brazil/': [[/^### Indústrias que Atendemos$/m, (m) => `${m}\n\n${HEALTH_NOTE_PT}\n\n${PORTAL_NOTE_PT}`]],
  '/best-website-maintenance-for-small-business/': [after('law firms and medical practices, startups and coaches.'), ['We configure backups, security scanning, staging, and monitoring for your site.', 'We configure backups, security scanning and monitoring for your site.']],

  // Staging
  '/': [
    ['WordPress core, themes, and plugins are updated safely on a staging copy first, so new versions never break your live site or its design.', `WordPress core, themes, and plugins are updated safely. ${STAGING}`],
    [/No\. Updates and tests are performed on a staging copy first, then deployed to your live site[^\n]*/, `Normally, no. Work is planned to avoid disruption for your visitors. ${STAGING}`],
  ],
  '/monthly-website-maintenance-packages/': [['Backups, security tools, monitoring, and staging environments are configured.', 'Backups, security tools and monitoring are configured.']],
  '/wordpress-website-maintenance-packages/': [['We configure backups, security scanning, staging, and monitoring for your site.', 'We configure backups, security scanning and monitoring for your site.']],
  '/website-update-services/': [
    afterLine(/^Patient trust starts with[^\n]*$/m),
    ['Staging Environment Testing Functionality & QA Checked', `${STAGING.slice(0, -1)} Functionality & QA Checked`],
    ['#### Staging Environment Testing', '#### Staging-Tested Updates on the Business Plan'],
    [/^Tested on critical sites$/m, 'Business plan'],
    ['**Our Fix:** Pre-update backups & staging environment testing.', `**Our Fix:** Pre-update backups. ${STAGING}`],
    ['Major core updates are audited on a staging copy before touches live servers.', STAGING],
    ['### Step 2: Staging Environment Testing', '### Step 2: Staging-Tested Updates on the Business Plan'],
    ['For business-critical websites, we apply updates to a staging copy', 'On the Business plan, we apply updates to a staging copy'],
    ['## We Test on a Staging Copy Before Touching Your Live Site', '## Staging-Tested Updates on the Business Plan'],
    ['where we apply and test every update before it goes anywhere near your real visitors.', `where updates are tested before they reach your real visitors. ${STAGING}`],
  ],
  '/white-label-website-maintenance-services-for-agencies/': [
    [/^(?:HIPAA-compliant site|Site) security and maintenance for clinic portals[^\n]*$/m, () => `Site security and maintenance for clinic portals, doctor sites, and health blogs. ${BOOKING}\n\n${BLOCK}`],
    ['#### Execution & Staging QA', '#### Execution & QA'],
    ['Task executed, tested on an isolated staging server, and verified for quality', 'Task executed and verified for quality'],
    ['Every plugin, theme, and core update in our **white label wordpress maintenance** routine goes through isolated staging testing before touching live servers.', 'Updates in our **white label wordpress maintenance** routine follow a careful order: snapshot first, then the update, then checks.'],
    ['Isolated Staging Clone', 'Pre-Update Snapshot'],
    [/We clone your client's live website onto an isolated \*\*staging environment\*\* first[^\n]*/, "We take a snapshot of your client's website before any update, so a change can be rolled back."],
    [/^Zero Live Server Risk$/m, 'Rollback Ready'],
    ['### Visual Regression QA', '### Safe Live Deployment'],
    [/^Automated and manual \*\*QA testing\*\* verifying[^\n]*$/m, 'Updates are applied to the live site during off-peak hours, with a rollback snapshot ready.'],
    [/^Desktop & Mobile Verified$/m, 'Off-Peak Updates'],
    [/^### Safe Live Deployment(?=\n\nOnce verified on staging)/m, '### Post-Update Checks'],
    [/^Once verified on staging, updates are deployed[^\n]*$/m, 'Automated and manual **QA testing** checks font rendering, button layouts, checkout forms, and mobile responsive alignment after the update.'],
    [/^Off-Peak Offsite Snapshot$/m, 'Desktop & Mobile Verified'],
  ],
  '/white-label-wordpress-maintenance-support/': [['-   WordPress core, plugin & theme updates (safely tested on staging)', '-   WordPress core, plugin & theme updates']],
  '/how-much-does-wordpress-website-maintenance-cost/': [['On managed plans, updates are tested on staging first so they never break your live site.', STAGING]],
  '/what-does-website-maintenance-include/': [
    ['software, plugin and theme updates tested on staging, security monitoring', 'software, plugin and theme updates, security monitoring'],
    ['Software, plugin, and theme updates (tested on staging first)', 'Software, plugin, and theme updates'],
    ['We handle the whole stack — updates tested on staging, security monitoring', 'We handle the whole stack — updates, with staging-tested updates on the Business plan, security monitoring'],
  ],
  '/ecommerce-website-redesign/': [['Ongoing maintenance — updates tested on staging, security monitoring', 'Ongoing maintenance — updates, security monitoring']],
  '/wordpress-security-checklist/': [['Managed WordPress security and maintenance: updates tested on staging,', 'Managed WordPress security and maintenance: updates,'],['for you: updates tested on staging, continuous security monitoring', 'for you: updates, with staging-tested updates on the Business plan, continuous security monitoring']],
  '/nonprofit-website-maintenance/': [
    ['Applied promptly and tested on a staging copy first, so an update never breaks your live donation form in front of a ready donor.', 'Applied promptly, with staging-tested updates on the Business plan, to protect your donation form.'],
    ['Software and plugin updates (tested on staging)', 'Software and plugin updates'],
  ],
  '/how-long-does-website-maintenance-take/': [
    ['Near-zero downtime. Tested on staging, then pushed live in seconds.', `Near-zero downtime. ${STAGING}`],
    ['Most routine maintenance causes no visible downtime because updates are tested on a staging copy first.', `Most routine maintenance causes no visible downtime. ${STAGING}`],
  ],
  '/sitecare-alternative/': [
    ['that want the same hosting-included, staging-tested, fully managed care', 'that want the same hosting-included, fully managed care'],
    ['The same hosting-included, staging-tested, fully managed care as SiteCare', 'The same hosting-included, fully managed care as SiteCare'],
    ['both do the fundamentals well — staging-tested updates, daily backups, security monitoring, and performance work.', 'both do the fundamentals well — backups, security monitoring, and performance work, with staging-tested updates on our Business plan.'],
  ],
  '/website-maintenance-services-for-repair-placeholder/': [],

  // Repair
  '/website-repair-services/': [
    after('Technical repair work that respects compliance, patient form security, and data sensitivity.'),
    ['Most issues are fixed within 24 hours.', REPAIR_TIME],
    [/^24-Hour Avg Turnaround$/m, 'Small fixes usually within 24 hours'],
    [/^24 hrs$/m, '24–48 hrs'],
    ['Average turnaround for standard repairs', REPAIR_TIME],
    ['| Urgency | Same-day to 48-hour repair |', '| Urgency | Small fixes within 24 hours; bigger repairs within 24–48 hours |'],
    [/^Repair work usually starts the same business day\.$/m, (m) => `${m}\n\n${NO_FIX}`],
    [/^Repair work usually starts the same business day\. • Serving[^\n]*$/m, (m) => `${m}\n\n${NO_FIX}`],
  ],
};
delete EXTRA_CHANGES['/website-maintenance-services-for-repair-placeholder/'];
