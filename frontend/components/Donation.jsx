'use client';

import { useState, useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { getApiUrl, extractErrorMessage, getFriendlyErrorMessage } from '@/lib/api';

function Donation() {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    transactionId: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sectionRef = useRef(null);
  const infoRef = useRef(null);
  const qrRef = useRef(null);
  const qrImageRef = useRef(null);
  const modalRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Fade Up Info Card
      if (infoRef.current) {
        gsap.fromTo(
          infoRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        );
      }

      // Scale In & Entrance for QR Card
      if (qrRef.current) {
        gsap.fromTo(
          qrRef.current,
          { opacity: 0, scale: 0.92, y: 40 },
          { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.15 }
        );
      }

      // Continuous Floating animation for QR display container
      if (qrImageRef.current) {
        gsap.to(qrImageRef.current, {
          y: -8,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Modal entrance animation
  useEffect(() => {
    if (showModal && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [showModal]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('rajshukla1717-1@okhdfcbank');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const payload = {
      donor_name: formData.name.trim(),
      name: formData.name.trim(),
      amount: Number(formData.amount),
      transaction_id: formData.transactionId.trim(),
      transactionId: formData.transactionId.trim(),
      email: formData.email.trim() || 'devotee@suratchagaurinandan.com',
      phone: formData.phone.trim() || '9876543210',
      notes: formData.notes.trim(),
    };

    try {
      const response = await fetch(getApiUrl('/donations/'), {
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
          'Unable to submit donation record. Please check the entered details.'
        );
        throw new Error(validationMessage);
      }

      if (data && data.success === false) {
        const errorMsg = extractErrorMessage(data, response.status, 'Donation submission failed.');
        throw new Error(errorMsg);
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', amount: '', transactionId: '', notes: '' });
    } catch (err) {
      console.error('Donation submission error:', err);
      setErrorMsg(getFriendlyErrorMessage(err, 'Unable to submit donation. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const bulletPoints = [
    'Ganesh Mahotsav Management',
    'Seva Activities',
    'Mahaprasad Distribution',
    'Decoration',
    'Social Activities',
    'Temple Services',
  ];

  const upiApps = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'];

  return (
    <section id="donation" ref={sectionRef} className="relative py-20 lg:py-28 overflow-hidden bg-[#F7F3EA]">
      {/* Background Luxury Ambient Glows & Rays */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(184,154,74,0.08)_0%,transparent_65%)]" />
      <div className="pointer-events-none absolute -top-40 right-10 w-96 h-96 rounded-full bg-[#B89A4A]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-10 w-96 h-96 rounded-full bg-[#C99B45]/10 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#B89A4A]/40 bg-[#FAF7EF]/90 text-[#8F7430] tracking-[0.2em] text-xs font-semibold uppercase backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(184,154,74,0.15)]">
            <span className="text-[#8F7430]">🙏</span>
            <span>DIVINE CONTRIBUTION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#3F3528] via-[#8F7430] to-[#B89A4A] uppercase mb-4">
            Support Sacred Sewa
          </h2>
          <div className="w-28 h-[2px] mx-auto bg-gradient-to-r from-transparent via-[#B89A4A] to-transparent my-4" />
          <p className="text-sm sm:text-base text-[#776B5B] font-light leading-relaxed">
            Contribute to the grand celebration, eco-friendly initiatives, and community welfare sewas of Surat Cha Gaurinandan.
          </p>
        </div>

        {/* 2-Column Grid for Desktop, Stacked for Mobile (QR Card First on Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[60px] items-center">
          
          {/* QR PAYMENT CARD (Mobile: Order 1, Desktop: Order 2 - Right side) */}
          <div ref={qrRef} className="order-1 lg:order-2 w-full flex justify-center">
            <div className="group relative w-full max-w-md p-[1px] rounded-3xl bg-gradient-to-b from-[#B89A4A]/60 via-[#D8BD72]/40 to-[#8F7430]/50 shadow-[0_20px_60px_rgba(63,53,40,0.08)] transition-all duration-500 hover:shadow-[0_25px_70px_rgba(184,154,74,0.25)]">
              
              {/* Luxury Glass Card Inner */}
              <div className="relative rounded-[23px] bg-gradient-to-b from-[#FFFDF7] via-[#FAF7EF] to-[#EEE7D8] p-6 sm:p-8 backdrop-blur-2xl text-center border border-[#B89A4A]/30 overflow-hidden">
                
                {/* Accent Corner Lines */}
                <div className="pointer-events-none absolute top-0 left-0 w-16 h-[2px] bg-gradient-to-r from-[#B89A4A] to-transparent" />
                <div className="pointer-events-none absolute top-0 left-0 w-[2px] h-16 bg-gradient-to-b from-[#B89A4A] to-transparent" />
                <div className="pointer-events-none absolute bottom-0 right-0 w-16 h-[2px] bg-gradient-to-l from-[#B89A4A] to-transparent" />
                <div className="pointer-events-none absolute bottom-0 right-0 w-[2px] h-16 bg-gradient-to-t from-[#B89A4A] to-transparent" />

                {/* Soft Golden Glow Ring behind QR */}
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#B89A4A]/15 blur-3xl group-hover:bg-[#B89A4A]/25 transition-all duration-700" />

                {/* QR Display Frame with Floating Animation */}
                <div ref={qrImageRef} className="relative inline-block mb-6 z-10">
                  <div className="relative p-3 rounded-2xl bg-[#FFFDF7] border border-[#B89A4A]/40 shadow-[0_10px_35px_rgba(184,154,74,0.2)]">
                    <Image
                      src="/images/qr-payment.jpg"
                      alt="Ganesh Mahotsav UPI QR Code - Raj Shukla"
                      width={240}
                      height={240}
                      className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-xl shadow-md border border-[#B89A4A]/20"
                      priority
                    />
                    
                    {/* Corner Bracket Frame styling */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#B89A4A]" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#B89A4A]" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#B89A4A]" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#B89A4A]" />
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-3 z-10 relative">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-[#3F3528] via-[#8F7430] to-[#B89A4A] tracking-wide font-medium">
                      Raj Shukla
                    </h3>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#8F7430]/80 font-light mt-0.5">
                      Official UPI Beneficiary
                    </p>
                  </div>

                  {/* UPI ID Pill with Copy Action */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF7EF] border border-[#B89A4A]/30 text-[#3F3528] shadow-inner group-hover:border-[#B89A4A]/60 transition-colors">
                    <span className="text-xs font-mono tracking-wide selection:bg-[#D8BD72] selection:text-[#3F3528]">
                      rajshukla1717-1@okhdfcbank
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="ml-1 text-[#8F7430] hover:text-[#3F3528] transition-colors text-xs font-semibold px-2 py-0.5 rounded bg-[#B89A4A]/10 hover:bg-[#B89A4A]/30 border border-[#B89A4A]/40"
                      title="Copy UPI ID"
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  <p className="text-xs text-amber-200/60 font-light tracking-wider uppercase pt-1">
                    Scan &amp; Pay Securely
                  </p>

                  {/* Accepted UPI Apps */}
                  <div className="pt-2">
                    <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-medium">
                      Accepted UPI Apps
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {upiApps.map((app) => (
                        <span
                          key={app}
                          className="px-3 py-1 text-[11px] rounded-full bg-amber-950/40 border border-gold/20 text-amber-200/80 backdrop-blur-sm shadow-sm"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button to Submit Transfer Receipt */}
                  <div className="pt-5">
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="w-full btn-primary shimmer-btn py-3.5 px-6 rounded-xl font-medium text-sm tracking-wider uppercase bg-gradient-to-r from-goldDark via-gold to-goldLight text-black shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    >
                      <span>Submit Transfer Receipt / Details</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>


          {/* DONATION INFO CARD (Mobile: Order 2, Desktop: Order 1 - Left side) */}
          <div ref={infoRef} className="order-2 lg:order-1 w-full">
            <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-b from-neutral-900/80 via-black/90 to-neutral-950/95 border border-gold/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden">
              
              {/* Golden Decorative Accent Header Lines */}
              <div className="pointer-events-none absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />
              <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-40" />

              {/* Tag / Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-amber-200 text-xs font-medium mb-4">
                <span>🙏</span>
                <span className="tracking-wider uppercase">Divine Contribution</span>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-light text-transparent bg-clip-text bg-gradient-to-r from-goldLight via-gold to-amber-200 mb-6 leading-tight">
                Support Eco-Friendly Celebrations
              </h3>

              {/* Paragraphs */}
              <div className="space-y-4 text-gray-300 text-sm sm:text-base font-light leading-relaxed">
                <p>
                  Every contribution is utilized toward making the Ganesh Utsav sustainable, planting trees for immersion ponds, distributing clay idols to local families, and organizing free meals (Bhandara) for devotees.
                </p>
                <p>
                  Join hands in keeping the heritage alive while respecting mother earth. All contributions are eligible for 80G tax benefits under national regulations.
                </p>
              </div>

              {/* Decorative Golden Line */}
              <div className="w-full h-[1px] bg-gradient-to-r from-gold/40 via-amber-500/20 to-transparent my-6" />

              {/* Bullet Points Section */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold">
                  Every contribution helps:
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {bulletPoints.map((point) => (
                    <div key={point} className="flex items-center gap-2.5 text-sm text-gray-200">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                      <span className="font-light">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="btn-primary shimmer-btn inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-xl font-medium text-sm tracking-wider uppercase bg-gradient-to-r from-goldDark via-gold to-goldLight text-black shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  <span>Record / Register Donation Online</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* DONATION FORM MODAL */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#F7F3EA]/90 backdrop-blur-xl animate-fade-in overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
                setSubmitted(false);
              }
            }}
          >
            <div
              ref={modalRef}
              className="relative w-full max-w-md sm:max-w-lg my-auto rounded-3xl border border-[#B89A4A]/40 bg-gradient-to-b from-[#FFFDF7] via-[#FAF7EF] to-[#EEE7D8] p-6 sm:p-8 text-[#3F3528] shadow-[0_25px_70px_rgba(63,53,40,0.15)] overflow-hidden"
            >
              {/* Luxury Ambient Glows inside Modal */}
              <div className="pointer-events-none absolute -top-24 -left-24 w-60 h-60 rounded-full bg-[#B89A4A]/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-[#C99B45]/15 blur-3xl" />
              <div className="pointer-events-none absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#B89A4A] to-transparent" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSubmitted(false);
                }}
                className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#B89A4A]/30 bg-[#FAF7EF] text-[#776B5B] transition-all duration-300 hover:border-[#B89A4A] hover:bg-[#B89A4A]/20 hover:text-[#3F3528] hover:scale-110"
                aria-label="Close modal"
              >
                ✕
              </button>

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <span className="inline-block text-3xl mb-2">🙏</span>
                  <h3 className="font-heading text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#3F3528] via-[#8F7430] to-[#B89A4A] font-light tracking-wide">
                    Record Sacred Donation
                  </h3>
                  <p className="text-xs text-[#776B5B] mt-1 font-light">
                    Enter your payment details for instant acknowledgement &amp; tax receipt.
                  </p>
                </div>

                {submitted ? (
                  <div className="text-center py-8 px-2 space-y-4">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#B89A4A]/30 via-[#D8BD72]/20 to-transparent border border-[#B89A4A]/50 shadow-[0_0_30px_rgba(184,154,74,0.3)] mb-2">
                      <span className="text-4xl">🙏</span>
                    </div>
                    
                    <h4 className="text-xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-[#3F3528] via-[#8F7430] to-[#B89A4A]">
                      Donation Recorded Successfully!
                    </h4>
                    
                    <p className="text-xs sm:text-sm text-[#776B5B] font-light leading-relaxed max-w-xs mx-auto">
                      May Lord Ganesha bless you and your family with peace, prosperity, and divine happiness.
                    </p>
                    
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          setSubmitted(false);
                        }}
                        className="btn-primary shimmer-btn px-8 py-3 rounded-xl text-xs font-medium tracking-widest uppercase bg-gradient-to-r from-[#8F7430] via-[#B89A4A] to-[#D8BD72] text-[#3F3528] shadow-[0_4px_20px_rgba(184,154,74,0.25)] hover:shadow-[0_6px_35px_rgba(184,154,74,0.4)] transition-all duration-300"
                      >
                        <span>Close Window</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {errorMsg && (
                      <div className="p-3 text-xs text-red-800 bg-red-100/80 rounded-xl border border-red-300 backdrop-blur-md">
                        {errorMsg}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-[#3F3528] mb-1 tracking-wide">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Ramesh Bhai Patel"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-[#FAF7EF] border border-[#B89A4A]/30 rounded-xl px-4 py-2.5 text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#B89A4A]/50 transition-all duration-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#3F3528] mb-1 tracking-wide">
                          Amount (₹) *
                        </label>
                        <input
                          type="number"
                          name="amount"
                          required
                          min="1"
                          placeholder="501"
                          value={formData.amount}
                          onChange={handleChange}
                          className="w-full bg-[#FAF7EF] border border-[#B89A4A]/30 rounded-xl px-4 py-2.5 text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#B89A4A]/50 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3F3528] mb-1 tracking-wide">
                          UPI / Txn ID *
                        </label>
                        <input
                          type="text"
                          name="transactionId"
                          required
                          placeholder="UPI/Bank Ref ID"
                          value={formData.transactionId}
                          onChange={handleChange}
                          className="w-full bg-[#FAF7EF] border border-[#B89A4A]/30 rounded-xl px-4 py-2.5 text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#B89A4A]/50 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#3F3528] mb-1 tracking-wide">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="ramesh@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-[#FAF7EF] border border-[#B89A4A]/30 rounded-xl px-4 py-2.5 text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#B89A4A]/50 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3F3528] mb-1 tracking-wide">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+91 9876543210"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-[#FAF7EF] border border-[#B89A4A]/30 rounded-xl px-4 py-2.5 text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#B89A4A]/50 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#3F3528] mb-1 tracking-wide">
                        Notes / Sewa Cause
                      </label>
                      <input
                        type="text"
                        name="notes"
                        placeholder="e.g. Mahaprasad Sewa, Floral Decor"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full bg-[#FAF7EF] border border-[#B89A4A]/30 rounded-xl px-4 py-2.5 text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#B89A4A]/50 transition-all duration-300"
                      />
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary shimmer-btn py-3 px-6 rounded-xl text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-[#8F7430] via-[#B89A4A] to-[#D8BD72] text-[#3F3528] shadow-[0_4px_20px_rgba(184,154,74,0.2)] hover:shadow-[0_6px_35px_rgba(184,154,74,0.4)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                      >
                        <span>{loading ? 'Recording...' : 'Submit Donation'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default memo(Donation);

