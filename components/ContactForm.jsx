'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: 'general',
    message: ''
  });

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not send — try again in a moment');
        setStatus('error');
        return;
      }
      setStatus('sent');
      setForm({ name: '', email: '', topic: 'general', message: '' });
    } catch {
      setError('Could not send message — check your connection and try again');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="glass-1 p-8 sm:p-10" role="status">
        <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
          Sent
        </p>
        <h2 className="mt-3 font-display text-2xl font-normal text-graphite">Message received</h2>
        <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/75">
          Emily or the studio will reply to the email you left. For appointment changes or order
          questions, include your booking or order reference if you have one.
        </p>
        <ol className="mt-6 space-y-2 border border-chrome/20 bg-pearl/40 p-4">
          <li className="font-body text-xs font-light leading-relaxed text-charcoal/70">
            <span className="font-label text-[0.55rem] uppercase tracking-lockup text-chrome">
              Next
            </span>
            <span className="mt-0.5 block">Watch your inbox (and spam) for a reply.</span>
          </li>
        </ol>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-8 font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
        >
          Send another
        </button>
      </div>
    );
  }

  const loading = status === 'loading';

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-busy={loading}>
      <div>
        <label
          htmlFor="contact-name"
          className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
        >
          Name
        </label>
        <input
          id="contact-name"
          required
          disabled={loading}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60"
        />
      </div>
      <div>
        <label
          htmlFor="contact-email"
          className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
        >
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          required
          disabled={loading}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60"
        />
      </div>
      <div>
        <label
          htmlFor="contact-topic"
          className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
        >
          Topic
        </label>
        <select
          id="contact-topic"
          disabled={loading}
          value={form.topic}
          onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
          className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60"
        >
          <option value="general">General</option>
          <option value="booking">Booking / reschedule</option>
          <option value="order">Order / shipping</option>
          <option value="membership">Membership interest</option>
          <option value="press">Press / wholesale</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="contact-message"
          className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={6}
          disabled={loading}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60"
        />
      </div>
      {error && (
        <div className="border border-chrome/30 bg-pearl/70 p-4" role="alert">
          <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-chrome">
            Send failed
          </p>
          <p className="mt-2 font-body text-xs font-light leading-relaxed text-charcoal/80">
            {error}
          </p>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="sweep min-h-[48px] border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
