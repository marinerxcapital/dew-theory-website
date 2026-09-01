'use client';

import AdminNav from './AdminNav';

export default function AdminShell({ admin, children }) {
  const isLogin = !admin;

  if (isLogin) {
    return (
      <div className="pt-20">
        <a href="#admin-main" className="skip-link">Skip to admin content</a>
        <div id="admin-main" tabIndex={-1}>{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <a href="#admin-main" className="skip-link">Skip to admin content</a>
      <header className="border-b border-sage-deep/15 bg-ivory/90 backdrop-blur-sm">
        <div className="mx-auto max-w-shell px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-sage-deep">
                Dew Theory · Owner
              </p>
              <p className="font-display text-xl font-normal text-forest">Owner console</p>
            </div>
            <p className="font-body text-xs font-light text-muted">
              {admin.name}
              <span className="hidden sm:inline"> · {admin.email}</span>
            </p>
          </div>
          <div className="mt-4">
            <AdminNav admin={admin} />
          </div>
        </div>
      </header>
      <main
        id="admin-main"
        tabIndex={-1}
        className="mx-auto max-w-shell px-4 py-8 sm:px-6 lg:px-10 lg:py-12"
      >
        {children}
      </main>
    </div>
  );
}
