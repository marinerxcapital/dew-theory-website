/**
 * Central registry for Dew Theory FIXED V2 legal PDFs.
 * HTML legal pages remain canonical for public policies; PDFs are downloadable/print copies.
 * Do not invent business terms here — visibility flags only.
 */

/** @typedef {'PUBLIC'|'CONDITIONAL'|'PRE_LAUNCH'|'INTERNAL'} LegalVisibility */

/**
 * @typedef {object} LegalDocument
 * @property {string} id
 * @property {string} title
 * @property {string} fileName
 * @property {string|null} pdfPath - public URL path, or null when not web-served
 * @property {string|null} route - HTML page route when applicable
 * @property {LegalVisibility} visibility
 * @property {string} feature
 * @property {boolean} showInFooter
 * @property {boolean} showInCheckout
 * @property {boolean} showInBooking
 * @property {boolean} showInVirtualConsultation
 * @property {boolean} showInMembership
 * @property {boolean} internalOnly
 * @property {string} [repoPath] - non-public filesystem path for INTERNAL docs
 */

/** Fail-closed: consumer health is stored but not published in nav until explicitly enabled. */
export const CONSUMER_HEALTH_POLICY_PUBLISHED = false;

/** Fail-closed: minor booking/consent is not enabled site-wide. */
export const MINOR_CLIENT_BOOKING_ENABLED = false;

export const LEGAL_PDF_DIR = '/legal/pdfs';

/**
 * @type {LegalDocument[]}
 */
export const LEGAL_DOCUMENTS = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    fileName: 'DEW_THEORY_PRIVACY_POLICY.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_PRIVACY_POLICY.pdf`,
    route: '/privacy',
    visibility: 'PUBLIC',
    feature: 'sitewide',
    showInFooter: true,
    showInCheckout: true,
    showInBooking: false,
    showInVirtualConsultation: true,
    showInMembership: false,
    internalOnly: false
  },
  {
    id: 'terms',
    title: 'Terms of Use & Sale',
    fileName: 'DEW_THEORY_TERMS_OF_USE_AND_SALE.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_TERMS_OF_USE_AND_SALE.pdf`,
    route: '/terms',
    visibility: 'PUBLIC',
    feature: 'commerce',
    showInFooter: true,
    showInCheckout: true,
    showInBooking: false,
    showInVirtualConsultation: false,
    showInMembership: false,
    internalOnly: false
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    fileName: 'DEW_THEORY_SHIPPING_AND_DELIVERY_POLICY.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_SHIPPING_AND_DELIVERY_POLICY.pdf`,
    route: '/shipping',
    visibility: 'PUBLIC',
    feature: 'commerce',
    showInFooter: true,
    showInCheckout: true,
    showInBooking: false,
    showInVirtualConsultation: false,
    showInMembership: false,
    internalOnly: false
  },
  {
    id: 'returns',
    title: 'Returns, Refunds & Exchanges',
    fileName: 'DEW_THEORY_RETURNS_REFUNDS_AND_EXCHANGES_POLICY.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_RETURNS_REFUNDS_AND_EXCHANGES_POLICY.pdf`,
    route: '/returns',
    visibility: 'PUBLIC',
    feature: 'commerce',
    showInFooter: true,
    showInCheckout: true,
    showInBooking: false,
    showInVirtualConsultation: false,
    showInMembership: false,
    internalOnly: false
  },
  {
    id: 'booking-policy',
    title: 'Booking, Cancellation & No-Show',
    fileName: 'DEW_THEORY_BOOKING_CANCELLATION_AND_NO_SHOW_POLICY.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_BOOKING_CANCELLATION_AND_NO_SHOW_POLICY.pdf`,
    route: '/booking-policy',
    visibility: 'PUBLIC',
    feature: 'booking',
    showInFooter: true,
    showInCheckout: false,
    showInBooking: true,
    showInVirtualConsultation: false,
    showInMembership: false,
    internalOnly: false
  },
  {
    id: 'aesthetic-disclaimer',
    title: 'Aesthetic Services & Skincare Disclaimer',
    fileName: 'DEW_THEORY_AESTHETIC_SERVICES_AND_SKINCARE_DISCLAIMER.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_AESTHETIC_SERVICES_AND_SKINCARE_DISCLAIMER.pdf`,
    route: '/aesthetic-disclaimer',
    visibility: 'PUBLIC',
    feature: 'services',
    showInFooter: true,
    showInCheckout: false,
    showInBooking: true,
    showInVirtualConsultation: true,
    showInMembership: false,
    internalOnly: false
  },
  {
    id: 'cookies',
    title: 'Cookie & Tracking Technologies Notice',
    fileName: 'DEW_THEORY_COOKIE_AND_TRACKING_TECHNOLOGIES_NOTICE.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_COOKIE_AND_TRACKING_TECHNOLOGIES_NOTICE.pdf`,
    route: '/cookies',
    visibility: 'PUBLIC',
    feature: 'sitewide',
    showInFooter: true,
    showInCheckout: false,
    showInBooking: false,
    showInVirtualConsultation: false,
    showInMembership: false,
    internalOnly: false
  },
  {
    id: 'accessibility',
    title: 'Accessibility Statement',
    fileName: 'DEW_THEORY_ACCESSIBILITY_STATEMENT.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_ACCESSIBILITY_STATEMENT.pdf`,
    route: '/accessibility',
    visibility: 'PUBLIC',
    feature: 'sitewide',
    showInFooter: true,
    showInCheckout: false,
    showInBooking: false,
    showInVirtualConsultation: false,
    showInMembership: false,
    internalOnly: false
  },
  {
    id: 'virtual-consultation-terms',
    title: 'Virtual Consultation Terms & Informed Consent',
    fileName: 'DEW_THEORY_VIRTUAL_CONSULTATION_TERMS_AND_INFORMED_CONSENT.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_VIRTUAL_CONSULTATION_TERMS_AND_INFORMED_CONSENT.pdf`,
    route: null,
    visibility: 'PUBLIC',
    feature: 'virtual-consultation',
    showInFooter: false,
    showInCheckout: false,
    showInBooking: false,
    showInVirtualConsultation: true,
    showInMembership: false,
    internalOnly: false
  },
  {
    id: 'consultation-photo-intake',
    title: 'Consultation Photo & Intake Authorization',
    fileName: 'DEW_THEORY_CONSULTATION_PHOTO_AND_INTAKE_AUTHORIZATION.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_CONSULTATION_PHOTO_AND_INTAKE_AUTHORIZATION.pdf`,
    route: null,
    visibility: 'PUBLIC',
    feature: 'virtual-consultation',
    showInFooter: false,
    showInCheckout: false,
    showInBooking: false,
    showInVirtualConsultation: true,
    showInMembership: false,
    internalOnly: false
  },
  {
    id: 'consumer-health',
    title: 'Consumer Health Data Privacy Policy',
    fileName: 'DEW_THEORY_CONSUMER_HEALTH_DATA_PRIVACY_POLICY.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_CONSUMER_HEALTH_DATA_PRIVACY_POLICY.pdf`,
    route: null,
    visibility: 'CONDITIONAL',
    feature: 'consumer-health',
    showInFooter: false,
    showInCheckout: false,
    showInBooking: false,
    showInVirtualConsultation: false,
    showInMembership: false,
    internalOnly: false
  },
  {
    id: 'minor-guardian-consent',
    title: 'Minor Client Parent/Guardian Consent',
    fileName: 'DEW_THEORY_MINOR_CLIENT_PARENT_GUARDIAN_CONSENT.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_MINOR_CLIENT_PARENT_GUARDIAN_CONSENT.pdf`,
    route: null,
    visibility: 'CONDITIONAL',
    feature: 'minor-clients',
    showInFooter: false,
    showInCheckout: false,
    showInBooking: false,
    showInVirtualConsultation: false,
    showInMembership: false,
    internalOnly: false
  },
  {
    id: 'treatment-informed-consent',
    title: 'Aesthetic Treatment Informed Consent',
    fileName: 'DEW_THEORY_AESTHETIC_TREATMENT_INFORMED_CONSENT.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_AESTHETIC_TREATMENT_INFORMED_CONSENT.pdf`,
    route: null,
    visibility: 'CONDITIONAL',
    feature: 'treatment-consent',
    showInFooter: false,
    showInCheckout: false,
    showInBooking: true,
    showInVirtualConsultation: false,
    showInMembership: false,
    internalOnly: false
  },
  {
    id: 'membership-terms',
    title: 'Membership & Automatic Renewal Terms',
    fileName: 'DEW_THEORY_MEMBERSHIP_AND_AUTOMATIC_RENEWAL_TERMS.pdf',
    pdfPath: `${LEGAL_PDF_DIR}/DEW_THEORY_MEMBERSHIP_AND_AUTOMATIC_RENEWAL_TERMS.pdf`,
    route: null,
    visibility: 'PRE_LAUNCH',
    feature: 'membership',
    showInFooter: false,
    showInCheckout: false,
    showInBooking: false,
    showInVirtualConsultation: false,
    showInMembership: true,
    internalOnly: false
  },
  {
    id: 'claims-audit',
    title: 'Website Legal & Claims Audit',
    fileName: 'DEW_THEORY_WEBSITE_LEGAL_AND_CLAIMS_AUDIT.pdf',
    pdfPath: null,
    route: null,
    visibility: 'INTERNAL',
    feature: 'compliance',
    showInFooter: false,
    showInCheckout: false,
    showInBooking: false,
    showInVirtualConsultation: false,
    showInMembership: false,
    internalOnly: true,
    repoPath: 'legal/internal/DEW_THEORY_WEBSITE_LEGAL_AND_CLAIMS_AUDIT.pdf'
  },
  {
    id: 'implementation-guide',
    title: 'Legal Website Implementation Guide',
    fileName: 'DEW_THEORY_LEGAL_WEBSITE_IMPLEMENTATION_GUIDE.pdf',
    pdfPath: null,
    route: null,
    visibility: 'INTERNAL',
    feature: 'compliance',
    showInFooter: false,
    showInCheckout: false,
    showInBooking: false,
    showInVirtualConsultation: false,
    showInMembership: false,
    internalOnly: true,
    repoPath: 'legal/internal/DEW_THEORY_LEGAL_WEBSITE_IMPLEMENTATION_GUIDE.pdf'
  },
  {
    id: 'legal-open-items',
    title: 'Legal Open Items',
    fileName: 'DEW_THEORY_LEGAL_OPEN_ITEMS.pdf',
    pdfPath: null,
    route: null,
    visibility: 'INTERNAL',
    feature: 'compliance',
    showInFooter: false,
    showInCheckout: false,
    showInBooking: false,
    showInVirtualConsultation: false,
    showInMembership: false,
    internalOnly: true,
    repoPath: 'legal/internal/DEW_THEORY_LEGAL_OPEN_ITEMS.pdf'
  }
];

/** Archive note: COMPLETE package was expected but not present in the FIXED V2 upload set. */
export const MISSING_FROM_ARCHIVE = ['DEW_THEORY_COMPLETE_LEGAL_POLICY_PACKAGE.pdf'];

/**
 * @param {string} id
 * @returns {LegalDocument|undefined}
 */
export function getLegalDocument(id) {
  return LEGAL_DOCUMENTS.find((d) => d.id === id);
}

/**
 * Footer Help links — PUBLIC only, never INTERNAL/CONDITIONAL/PRE_LAUNCH.
 * @returns {{ label: string, href: string }[]}
 */
export function getFooterLegalLinks() {
  const order = [
    'terms',
    'privacy',
    'shipping',
    'returns',
    'booking-policy',
    'aesthetic-disclaimer',
    'accessibility',
    'cookies'
  ];
  /** @type {{ label: string, href: string }[]} */
  const links = [];
  for (const id of order) {
    const doc = getLegalDocument(id);
    if (!doc || !doc.showInFooter || doc.visibility !== 'PUBLIC' || !doc.route) continue;
    if (id === 'consumer-health' && !CONSUMER_HEALTH_POLICY_PUBLISHED) continue;
    const label =
      id === 'terms'
        ? 'Terms'
        : id === 'privacy'
          ? 'Privacy'
          : id === 'shipping'
            ? 'Shipping'
            : id === 'returns'
              ? 'Returns'
              : id === 'booking-policy'
                ? 'Booking / Cancellation'
                : id === 'aesthetic-disclaimer'
                  ? 'Aesthetic Disclaimer'
                  : id === 'accessibility'
                    ? 'Accessibility'
                    : id === 'cookies'
                      ? 'Cookies'
                      : doc.title;
    links.push({ label, href: doc.route });
  }
  if (CONSUMER_HEALTH_POLICY_PUBLISHED) {
    const ch = getLegalDocument('consumer-health');
    if (ch?.route) links.push({ label: 'Consumer Health Data', href: ch.route });
  }
  return links;
}

/**
 * @returns {LegalDocument[]}
 */
export function getCheckoutLegalDocuments() {
  return LEGAL_DOCUMENTS.filter(
    (d) => d.showInCheckout && d.visibility === 'PUBLIC' && d.route
  );
}

/**
 * @returns {LegalDocument[]}
 */
export function getBookingLegalDocuments() {
  return LEGAL_DOCUMENTS.filter((d) => {
    if (!d.showInBooking || d.internalOnly) return false;
    if (d.id === 'minor-guardian-consent' && !MINOR_CLIENT_BOOKING_ENABLED) return false;
    if (d.visibility === 'INTERNAL') return false;
    return Boolean(d.pdfPath || d.route);
  });
}

/**
 * Documents linked before virtual-consultation consent.
 * Consumer health stays gated unless published.
 * @returns {LegalDocument[]}
 */
export function getVirtualConsultationLegalDocuments() {
  return LEGAL_DOCUMENTS.filter((d) => {
    if (d.internalOnly || d.visibility === 'INTERNAL') return false;
    if (d.id === 'consumer-health') return CONSUMER_HEALTH_POLICY_PUBLISHED;
    return d.showInVirtualConsultation;
  });
}

/**
 * @returns {LegalDocument[]}
 */
export function getMembershipLegalDocuments() {
  return LEGAL_DOCUMENTS.filter((d) => d.showInMembership && !d.internalOnly);
}

/**
 * Public HTML legal routes for sitemap / smoke tests.
 * @returns {string[]}
 */
export function getPublicLegalRoutes() {
  return LEGAL_DOCUMENTS.filter(
    (d) => d.visibility === 'PUBLIC' && d.route && !d.internalOnly
  ).map((d) => d.route);
}

/**
 * Public PDF paths that must resolve with application/pdf.
 * @returns {string[]}
 */
export function getPublicPdfPaths() {
  return LEGAL_DOCUMENTS.filter(
    (d) =>
      d.pdfPath &&
      !d.internalOnly &&
      d.visibility !== 'INTERNAL' &&
      (d.visibility === 'PUBLIC' ||
        d.visibility === 'PRE_LAUNCH' ||
        d.visibility === 'CONDITIONAL')
  ).map((d) => d.pdfPath);
}

/**
 * Paths that must never appear in footer navigation.
 * @returns {string[]}
 */
export function getInternalDocumentFileNames() {
  return LEGAL_DOCUMENTS.filter((d) => d.internalOnly).map((d) => d.fileName);
}
