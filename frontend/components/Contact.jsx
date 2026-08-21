'use client';

import { useState, memo } from 'react';
import { getApiUrl } from '@/lib/api';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showMap, setShowMap] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      subject: formData.subject.trim() || 'General Pilgrim Inquiry',
      message: formData.message.trim(),
    };

    try {
      const response = await fetch(getApiUrl('/contacts/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(`Server returned an invalid response (HTTP ${response.status}).`);
      }

      if (!response.ok) {
        const validationMessage =
          data?.message ||
          data?.detail ||
          (data?.errors && Object.values(data.errors).flat().join(', ')) ||
          (typeof data === 'object' && Object.values(data).filter(v => typeof v === 'string' || Array.isArray(v)).flat().join(', ')) ||
          'Unable to submit the form.';

        throw new Error(validationMessage);
      }

      if (!data.success) {
        throw new Error(data.message || 'Submission failed.');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact submission error:', err);
      if (err instanceof TypeError || err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setErrorMsg('Network error. Please try again.');
      } else {
        setErrorMsg(err.message || 'Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact">
      <div className="section-wrapper">
        <div className="section-header">
          <span className="section-tag">Locate Sanctuary</span>
          <h2 className="heading-md section-title">PILGRIM ASSISTANCE & CONTACT</h2>
          <div className="section-divider"></div>
        </div>

        <div className="contact-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info column */}
          <div className="contact-info-block flex flex-col justify-between">
            <div>
              {/* Item 1 */}
              <div className="contact-item mb-6">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" />
                  </svg>
                </div>
                <div className="contact-details">
                  <h4>Temple Mandap Location</h4>
                  <p>Nandanvan 2, Vesu, Surat, Gujarat 395007</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="contact-item mb-6">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" />
                  </svg>
                </div>
                <div className="contact-details">
                  <h4>Devotee Helplines</h4>
                  <p>
                    Primary Call: +91 261 2849102<br />
                    WhatsApp Support: +91 99999 99999
                  </p>
                </div>
              </div>
            </div>

            {/* Social Hub */}
            <div className="mt-4">
              <h4 className="font-heading text-base tracking-widest mb-4">JOIN DEVOTEES HUB</h4>
              <div className="social-links">
                <a href="https://wa.me/919999999999" className="social-btn" aria-label="WhatsApp Link" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.975L2 22l5.204-1.365a9.939 9.939 0 0 0 4.804 1.233h.004c5.506 0 9.99-4.479 9.992-9.985a9.97 9.97 0 0 0-2.923-7.062A9.92 9.92 0 0 0 12.012 2zm5.727 14.113c-.313.88-1.534 1.583-2.124 1.688-.503.09-1.161.162-3.327-.736-2.77-1.15-4.55-3.978-4.689-4.162-.138-.184-1.12-1.49-1.12-2.842S7.24 8.243 7.52 7.962c.28-.282.607-.352.81-.352h.582c.183 0 .432-.069.675.52.25.604.851 2.083.926 2.235.074.152.124.329.025.528-.1.2-.15.329-.3.504-.15.176-.316.393-.45.527-.15.152-.307.318-.133.621.175.302.777 1.285 1.666 2.079.957.854 1.764 1.118 2.016 1.22.253.1.402.084.551-.088.15-.172.646-.75.819-.997.172-.248.345-.208.582-.12.237.087 1.503.709 1.762.839.26.13.432.196.496.305.064.109.064.634-.249 1.514z" />
                  </svg>
                </a>
                
                <a href="https://youtube.com" className="social-btn" aria-label="YouTube Link" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                <a href="https://instagram.com" className="social-btn" aria-label="Instagram Link" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card gold-pulse-border p-6 rounded-xl flex flex-col justify-center">
            <h3 className="font-heading text-xl text-gold mb-2">Send Message to Trust</h3>
            <p className="text-sm text-gray-400 mb-4">Have questions regarding Darshan, Sevas or Donations? Contact us directly.</p>

            {submitted ? (
              <div className="p-4 bg-gold/10 border border-gold/40 text-gold rounded-lg text-center my-auto">
                <p className="font-bold text-lg mb-1">🙏 Dhanyawad!</p>
                <p className="text-sm">Your message has been received. Our team will get back to you shortly.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-xs text-amber-300 underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {errorMsg && <div className="p-2 text-xs text-red-700 bg-red-100/80 rounded border border-red-300">{errorMsg}</div>}
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name *"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#FAF7EF] border border-[#B89A4A]/30 rounded px-3 py-2 text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address *"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#FAF7EF] border border-[#B89A4A]/30 rounded px-3 py-2 text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430]"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#FAF7EF] border border-[#B89A4A]/30 rounded px-3 py-2 text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject (e.g. Pass Inquiry, Sewa)"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-[#FAF7EF] border border-[#B89A4A]/30 rounded px-3 py-2 text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430]"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    rows="3"
                    placeholder="Your Message / Query *"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-[#FAF7EF] border border-[#B89A4A]/30 rounded px-3 py-2 text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430]"
                  ></textarea>
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary shimmer-btn py-2 text-sm">
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Real Google Maps Embed */}
          <div className="map-container gold-pulse-border h-full min-h-[300px] relative rounded-xl overflow-hidden flex items-center justify-center bg-[#EEE7D8]">
            {showMap ? (
              <iframe
                src="https://maps.google.com/maps?q=Nandanvan%202,%20Vesu,%20Surat,%20Gujarat%20395007&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="map-iframe w-full h-full min-h-[300px]"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            ) : (
              <div className="text-center p-6 cursor-pointer" onClick={() => setShowMap(true)}>
                <span className="text-4xl mb-2 block">📍</span>
                <h4 className="font-heading text-[#8F7430] text-lg mb-1">Nandanvan 2, Vesu, Surat</h4>
                <p className="text-xs text-gray-400 mb-4">Click to load interactive sanctuary map</p>
                <button className="btn-primary shimmer-btn text-xs px-4 py-2">
                  <span>Load Interactive Map</span>
                </button>
              </div>
            )}

            <div className="map-action-overlay">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Nandanvan+2,+Vesu,+Surat,+Gujarat+395007"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary map-directions-btn shimmer-btn"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Contact);

