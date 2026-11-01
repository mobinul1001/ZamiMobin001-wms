// Owner, 2026-11-02: company facts and contact details, sitewide. Values for layouts are in src/data/site.json.
export const CONTACT = { phone: '+1 212-496-1637', phoneHref: 'tel:+12124961637', email: 'contact@websitemaintenanceservices.org', address: '14 Wall St Ste 2036, New York, NY 10005, United States' };
const FULL_REACH = 'the USA, Canada, the UK, Australia, the Netherlands, Ireland, France, Spain, Switzerland and the Caribbean';

export const FACT_CHANGES = {
  '/': [
    ['Trusted by businesses in the USA, UK, Canada, Australia & Europe', 'Trusted by businesses in the USA, Canada, the UK, Australia and Europe'],
    ['to businesses across these key regions — with support ready in your time zone.', `to businesses in ${FULL_REACH}, with support ready in your time zone.`],
  ],
  '/contact/': [
    [/-   WhatsApp \/ Phone\s+\[\+8801815840813\]\(https:\/\/wa\.me\/8801815840813\)/, `-   Phone\n    [${CONTACT.phone}](${CONTACT.phoneHref})\n\n-   Address\n    ${CONTACT.address}`],
  ],
  '/website-hacked-recovery-services/': [
    ['[Chat on WhatsApp](https://wa.me/8801815840813)', `[Call ${CONTACT.phone}](${CONTACT.phoneHref})`],
  ],
};

// Old contact details left inside page schema.
export const fixContactText = (s) => s.replaceAll('+8801815840813', CONTACT.phone.replace(/ /g, '')).replaceAll('info@websitemaintenanceservices.org', CONTACT.email);
