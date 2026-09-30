import { withPageMetadata } from '@/lib/page-metadata';
import { Suspense } from 'react';
import PageShell from '@/components/PageShell';
import SearchResults from '@/components/SearchResults';

export const metadata = withPageMetadata('/search', {
  title: 'Search',
  description: 'Search the Skin Script catalog, ingredient library and storefront pages.',
  alternates: { canonical: '/search' },
  robots: { index: false, follow: true }
});

export default function SearchPage() {
  return (
    <PageShell
      eyebrow="Search"
      title="Find it"
      intro="Products, ingredients and pages — searched locally against the live catalog."
    >
      <Suspense fallback={<div className="h-24 border-b border-border" aria-hidden="true" />}>
        <SearchResults />
      </Suspense>
    </PageShell>
  );
}
