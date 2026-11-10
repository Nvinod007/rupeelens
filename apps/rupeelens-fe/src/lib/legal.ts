/**
 * Single source of truth for legal copy. Bump `version` whenever the Privacy
 * Policy or Terms change materially: returning users are asked to consent again.
 */
export const SUPPORT_EMAIL = 'vinodkumar.nelanakula@gmail.com';

export const LEGAL = {
  contactEmail: SUPPORT_EMAIL,
  domain: 'rupeelens.appkits.in',
  effectiveDate: '9 November 2026',
  grievanceOfficer: 'Grievance Officer, RupeeLens',
  minAge: 18,
  productName: 'RupeeLens',
  /** Set to a postal address to have it printed in the contact sections. */
  registeredAddress: null as string | null,
  url: 'https://rupeelens.appkits.in',
  version: '2026-11-09',
} as const;

export const LEGAL_ROUTES = {
  privacy: '/privacy',
  terms: '/terms',
} as const;
