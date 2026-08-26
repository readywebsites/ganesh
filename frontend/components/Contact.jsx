'use client';

import { useState, memo } from 'react';
import { getApiUrl, extractErrorMessage, getFriendlyErrorMessage } from '@/lib/api';

const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/E9d5WymkXrvbuzWf6?g_st=iw';

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
        data = null;
      }

      if (!response.ok) {
        const validationMessage = extractErrorMessage(
          data,
          response.status,
          'Unable to submit contact message. Please check the entered details.'
        );
        throw new Error(validationMessage);
      }

      if (data && data.success === false) {
        const errorMsg = extractErrorMessage(data, response.status, 'Contact submission failed.');
        throw new Error(errorMsg);
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact submission error:', err);
      setErrorMsg(getFriendlyErrorMessage(err, 'Unable to submit message. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 relative">
      <div className="section-wrapper max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-header text-center mb-12">
          <span className="section-tag inline-block text-xs uppercase tracking-[0.25em] text-[#8F7430] font-bold bg-[#FAF7EF] px-4 py-1.5 rounded-full border border-[#B89A4A]/30 mb-3 shadow-sm">
            Locate Sanctuary
          </span>
          <h2 className="heading-md section-title font-heading text-3xl md:text-4xl text-[#3F3528] font-bold tracking-wide">
            PILGRIM ASSISTANCE & CONTACT
          </h2>
          <div className="section-divider w-24 h-[2px] bg-gradient-to-r from-transparent via-[#B89A4A] to-transparent mx-auto mt-4"></div>
        </div>

        <div className="contact-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info column */}
          <div className="glass-card gold-pulse-border p-6 md:p-8 rounded-2xl flex flex-col justify-between bg-[#FFFDF7]/95 backdrop-blur-xl border border-[#B89A4A]/35 shadow-[0_10px_30px_rgba(63,53,40,0.08)]">
            <div>
              {/* Item 1 - Clickable Address Area */}
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group block mb-6 p-4 rounded-xl bg-[#FAF7EF] hover:bg-[#F4EDE0] border border-[#B89A4A]/30 hover:border-[#8F7430] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                title="Click to open location on Google Maps"
              >
                <div className="flex items-start gap-3.5">
                  <div className="contact-icon w-12 h-12 rounded-full bg-[#B89A4A]/15 border border-[#B89A4A]/40 flex items-center justify-center text-[#8F7430] group-hover:scale-110 group-hover:bg-[#B89A4A] group-hover:text-[#FAF7EF] transition-all flex-shrink-0">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" />
                    </svg>
                  </div>
                  <div className="contact-details flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading text-lg font-bold text-[#8F7430] group-hover:text-[#B88635] transition-colors">
                        Temple Mandap Location
                      </h4>
                      <span className="text-[11px] font-bold text-[#8F7430] bg-[#B89A4A]/15 px-2 py-0.5 rounded-full border border-[#B89A4A]/30 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Maps ↗
                      </span>
                    </div>
                    <p className="text-[#2B231A] font-bold text-sm md:text-base mt-1.5 leading-snug drop-shadow-sm">
                      Nandanvan 2, Vesu, Surat, Gujarat 395007
                    </p>
                    <p className="text-[#6B5B4A] font-medium text-xs mt-1.5 flex items-center gap-1">
                      <span>📍</span> Tap to open live navigation on Google Maps
                    </p>
                  </div>
                </div>
              </a>

              {/* Item 2 - Helplines */}
              <div className="contact-item mb-6 p-4 rounded-xl bg-[#FAF7EF] border border-[#B89A4A]/30 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <div className="contact-icon w-12 h-12 rounded-full bg-[#B89A4A]/15 border border-[#B89A4A]/40 flex items-center justify-center text-[#8F7430] flex-shrink-0">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" />
                    </svg>
                  </div>
                  <div className="contact-details flex-1">
                    <h4 className="font-heading text-lg font-bold text-[#8F7430]">
                      Devotee Helplines
                    </h4>
                    <div className="text-sm mt-1.5 space-y-1">
                      <p className="text-[#5C4D3C] font-medium">
                        Primary Call:{' '}
                        <a
                          href="tel:+912612849102"
                          className="text-[#2B231A] font-bold hover:text-[#8F7430] underline transition-colors"
                        >
                          +91 261 2849102
                        </a>
                      </p>
                      <p className="text-[#5C4D3C] font-medium">
                        WhatsApp Support:{' '}
                        <a
                          href="https://wa.me/919999999999"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2B231A] font-bold hover:text-[#8F7430] underline transition-colors"
                        >
                          +91 99999 99999
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Hub */}
            <div className="mt-2 pt-4 border-t border-[#B89A4A]/25">
              <h4 className="font-heading text-xs uppercase tracking-[0.25em] text-[#8F7430] font-bold mb-3">
                JOIN DEVOTEES HUB
              </h4>
              <div className="social-links flex gap-3">
                <a
                  href="https://wa.me/919999999999"
                  className="social-btn w-11 h-11 rounded-full bg-[#FAF7EF] hover:bg-[#8F7430] border border-[#B89A4A]/40 text-[#8F7430] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                  aria-label="WhatsApp Link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.975L2 22l5.204-1.365a9.939 9.939 0 0 0 4.804 1.233h.004c5.506 0 9.99-4.479 9.992-9.985a9.97 9.97 0 0 0-2.923-7.062A9.92 9.92 0 0 0 12.012 2zm5.727 14.113c-.313.88-1.534 1.583-2.124 1.688-.503.09-1.161.162-3.327-.736-2.77-1.15-4.55-3.978-4.689-4.162-.138-.184-1.12-1.49-1.12-2.842S7.24 8.243 7.52 7.962c.28-.282.607-.352.81-.352h.582c.183 0 .432-.069.675.52.25.604.851 2.083.926 2.235.074.152.124.329.025.528-.1.2-.15.329-.3.504-.15.176-.316.393-.45.527-.15.152-.307.318-.133.621.175.302.777 1.285 1.666 2.079.957.854 1.764 1.118 2.016 1.22.253.1.402.084.551-.088.15-.172.646-.75.819-.997.172-.248.345-.208.582-.12.237.087 1.503.709 1.762.839.26.13.432.196.496.305.064.109.064.634-.249 1.514z" />
                  </svg>
                </a>
                
                <a
                  href="https://youtube.com"
                  className="social-btn w-11 h-11 rounded-full bg-[#FAF7EF] hover:bg-[#8F7430] border border-[#B89A4A]/40 text-[#8F7430] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                  aria-label="YouTube Link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                <a
                  href="https://instagram.com"
                  className="social-btn w-11 h-11 rounded-full bg-[#FAF7EF] hover:bg-[#8F7430] border border-[#B89A4A]/40 text-[#8F7430] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                  aria-label="Instagram Link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card gold-pulse-border p-6 md:p-8 rounded-2xl flex flex-col justify-center bg-[#FFFDF7]/95 backdrop-blur-xl border border-[#B89A4A]/35 shadow-[0_10px_30px_rgba(63,53,40,0.08)]">
            <h3 className="font-heading text-xl md:text-2xl font-bold text-[#8F7430] mb-2">
              Send Message to Trust
            </h3>
            <p className="text-sm text-[#5C4D3C] font-medium mb-5">
              Have questions regarding Darshan, Sevas or Donations? Contact us directly.
            </p>

            {submitted ? (
              <div className="p-6 bg-[#B89A4A]/10 border border-[#B89A4A]/40 text-[#8F7430] rounded-xl text-center my-auto">
                <p className="font-bold text-xl mb-1">🙏 Dhanyawad!</p>
                <p className="text-sm text-[#2B231A] font-medium">Your message has been received. Our team will get back to you shortly.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-xs font-bold text-[#8F7430] underline hover:text-[#B88635]">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {errorMsg && <div className="p-2.5 text-xs text-red-800 bg-red-100/90 rounded border border-red-300 font-medium">{errorMsg}</div>}
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name *"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#FAF7EF] border border-[#B89A4A]/40 rounded-lg px-3.5 py-2.5 text-sm text-[#2B231A] font-medium placeholder-[#776B5B] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#8F7430] transition-colors"
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
                    className="w-full bg-[#FAF7EF] border border-[#B89A4A]/40 rounded-lg px-3.5 py-2.5 text-sm text-[#2B231A] font-medium placeholder-[#776B5B] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#8F7430] transition-colors"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#FAF7EF] border border-[#B89A4A]/40 rounded-lg px-3.5 py-2.5 text-sm text-[#2B231A] font-medium placeholder-[#776B5B] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#8F7430] transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject (e.g. Pass Inquiry, Sewa)"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-[#FAF7EF] border border-[#B89A4A]/40 rounded-lg px-3.5 py-2.5 text-sm text-[#2B231A] font-medium placeholder-[#776B5B] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#8F7430] transition-colors"
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
                    className="w-full bg-[#FAF7EF] border border-[#B89A4A]/40 rounded-lg px-3.5 py-2.5 text-sm text-[#2B231A] font-medium placeholder-[#776B5B] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#8F7430] transition-colors"
                  ></textarea>
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary shimmer-btn py-3 text-sm font-bold uppercase tracking-wider rounded-lg shadow-md hover:scale-[1.02] transition-transform">
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Real Google Maps Card */}
          <div className="map-container gold-pulse-border h-full min-h-[350px] relative rounded-2xl overflow-hidden flex items-center justify-center bg-[#FAF7EF] border border-[#B89A4A]/35 shadow-[0_10px_30px_rgba(63,53,40,0.08)]">
            {showMap ? (
              <div className="w-full h-full relative min-h-[350px]">
                <iframe
                  src="https://maps.google.com/maps?q=Nandanvan%202,%20Vesu,%20Surat,%20Gujarat%20395007&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="map-iframe w-full h-full min-h-[350px]"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sanctuary Location Map"
                ></iframe>
                <div className="map-action-overlay absolute bottom-4 right-4 z-10 flex gap-2">
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary shimmer-btn text-xs px-4 py-2.5 font-bold uppercase tracking-wider shadow-lg rounded-lg inline-flex items-center gap-1.5"
                  >
                    <span>Get Directions ↗</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 md:p-8 flex flex-col items-center justify-center h-full w-full">
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:scale-110 transition-transform mb-3"
                  title="Open on Google Maps"
                >
                  <span className="text-5xl block animate-bounce drop-shadow">📍</span>
                </a>
                <h4 className="font-heading text-[#8F7430] text-xl font-bold mb-1.5">
                  Nandanvan 2, Vesu, Surat
                </h4>
                <p className="text-sm text-[#2B231A] font-semibold mb-1">
                  Gujarat 395007 • Live GPS Location
                </p>
                <p className="text-xs text-[#5C4D3C] font-medium mb-6 max-w-xs">
                  Click below to open live navigation or load interactive map
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                  <button
                    onClick={() => {
                      setShowMap(true);
                      window.open(GOOGLE_MAPS_URL, '_blank', 'noopener,noreferrer');
                    }}
                    className="btn-primary shimmer-btn text-xs px-4 py-2.5 font-bold uppercase tracking-wider rounded-lg flex-1 shadow-md"
                  >
                    <span>Load Interactive Map</span>
                  </button>
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary shimmer-btn text-xs px-4 py-2.5 font-bold uppercase tracking-wider rounded-lg flex-1 shadow-md inline-flex items-center justify-center"
                  >
                    <span>Get Directions ↗</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Contact);

