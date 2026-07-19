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
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not send');
        setStatus('error');
        return;
      }
      setStatus('sent');
      setForm({ name: '', email: '', topic: 'general', message: '' });
    } catch {
      setError('Could not send message');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="glass-1 p-10">
        <h2 className="font-display text-2xl font-normal text-graphite">Message received</h2>
        <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/75">
          Emily or the studio will reply to the email you left. For appointment changes, include your
          booking reference if you have one.
        </p>
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

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
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
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
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
          value={form.topic}
          onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
          className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
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
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
        />
      </div>
      {error && (
        <p className="font-body text-xs font-light text-charcoal/70" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="sweep border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
