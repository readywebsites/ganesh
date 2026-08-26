'use client';

import { useState, useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { getApiUrl, extractErrorMessage, getFriendlyErrorMessage } from '@/lib/api';

const PRESET_AMOUNTS = [251, 501, 1100, 2100, 5100, 11000];
const UPI_ID = 'rajshukla1717-1@okhdfcbank';
const UPI_BENEFICIARY = 'Raj Shukla';
const UPI_APPS = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'];

function Donation() {
  const [step, setStep] = useState('form'); // 'form' | 'qr' | 'success'
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    amount: '501',
  });
  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sectionRef = useRef(null);
  const infoRef = useRef(null);
  const cardRef = useRef(null);
  const qrImageRef = useRef(null);

  // GSAP Entrance Animations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (infoRef.current) {
        gsap.fromTo(
          infoRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
        );
      }

      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, scale: 0.96, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.1 }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Floating effect for QR code
  useEffect(() => {
    if (step === 'qr' && qrImageRef.current) {
      const tween = gsap.to(qrImageRef.current, {
        y: -6,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      return () => tween.kill();
    }
  }, [step]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSelectPreset = (val) => {
    setFormData({ ...formData, amount: String(val) });
    if (errorMsg) setErrorMsg('');
  };

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Step 1 -> Step 2 (Validation and transition to QR)
  const handleProceedToQR = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const name = formData.name.trim();
    const phone = formData.phone.trim().replace(/[\s\-\(\)\+]/g, '');
    const amountNum = Number(formData.amount);

    if (name.length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!amountNum || amountNum <= 0) {
      setErrorMsg('Please enter a valid donation amount greater than 0.');
      return;
    }

    setStep('qr');
  };

  // Step 2 -> Step 3 (I Have Completed Payment - Save in Database & WhatsApp)
  const handleCompletedPayment = async () => {
    setLoading(true);
    setErrorMsg('');

    const cleanPhone = formData.phone.trim().replace(/[\s\-\(\)\+]/g, '');
    const payload = {
      name: formData.name.trim(),
      donor_name: formData.name.trim(),
      phone: cleanPhone.length === 12 && cleanPhone.startsWith('91') ? cleanPhone.slice(2) : cleanPhone,
      mobile: cleanPhone,
      email: formData.email.trim(),
      amount: Number(formData.amount),
      payment_method: 'GPay / UPI',
      paymentMethod: 'GPay / UPI',
      status: 'pending',
      paymentStatus: 'PENDING',
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
          'Unable to submit payment record. Please verify your details.'
        );
        throw new Error(validationMessage);
      }

      if (data && data.success === false) {
        const err = extractErrorMessage(data, response.status, 'Payment record submission failed.');
        throw new Error(err);
      }

      setSubmittedData({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        amount: Number(formData.amount),
        paymentMethod: 'GPay / UPI',
        status: 'Pending Verification',
        transactionId: data?.data?.transactionId || data?.donation?.transactionId || 'Pending Verification',
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      });

      setStep('success');
    } catch (err) {
      console.error('Donation submission error:', err);
      setErrorMsg(getFriendlyErrorMessage(err, 'Unable to submit payment details. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      amount: '501',
    });
    setSubmittedData(null);
    setErrorMsg('');
    setStep('form');
  };

  const bulletPoints = [
    'Ganesh Mahotsav Management & Daily Poojas',
    'Eco-Friendly Clay Idols & Immersion Pond Care',
    'Daily Mahaprasad & Annakshetra Bhandara',
    'Floral Decoration & Traditional Aarti Rituals',
    'Community Welfare & Devotee Amenities',
    'Sanctuary Security, Medical Aid & Volunteer Care',
  ];

  return (
    <section id="donation" ref={sectionRef} className="relative py-20 lg:py-28 overflow-hidden bg-[#F7F3EA]">
      {/* Ambient Luxury Background Lights */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(184,154,74,0.08)_0%,transparent_65%)]" />
      <div className="pointer-events-none absolute -top-40 right-10 w-96 h-96 rounded-full bg-[#B89A4A]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-10 w-96 h-96 rounded-full bg-[#C99B45]/10 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#B89A4A]/40 bg-[#FAF7EF]/90 text-[#8F7430] tracking-[0.2em] text-xs font-semibold uppercase backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(184,154,74,0.15)]">
            <span>🙏</span>
            <span>DIVINE CONTRIBUTION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#3F3528] via-[#8F7430] to-[#B89A4A] uppercase mb-3">
            Support Sacred Sewa
          </h2>
          <div className="w-28 h-[2px] mx-auto bg-gradient-to-r from-transparent via-[#B89A4A] to-transparent my-3" />
          <p className="text-sm sm:text-base text-[#776B5B] font-light leading-relaxed max-w-2xl mx-auto">
            Contribute to the grand celebration, eco-friendly initiatives, and community welfare sewas of Surat Cha Gaurinandan.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Sacred Sewa Information Card */}
          <div ref={infoRef} className="lg:col-span-5 w-full">
            <div className="relative rounded-3xl p-6 sm:p-8 md:p-10 bg-gradient-to-b from-[#FFFDF7] via-[#FAF7EF] to-[#EEE7D8] border border-[#B89A4A]/35 shadow-[0_15px_45px_rgba(63,53,40,0.08)] backdrop-blur-xl overflow-hidden">
              
              {/* Corner accents */}
              <div className="pointer-events-none absolute top-0 left-0 w-12 h-[2px] bg-gradient-to-r from-[#B89A4A] to-transparent" />
              <div className="pointer-events-none absolute top-0 left-0 w-[2px] h-12 bg-gradient-to-b from-[#B89A4A] to-transparent" />
              <div className="pointer-events-none absolute bottom-0 right-0 w-12 h-[2px] bg-gradient-to-l from-[#B89A4A] to-transparent" />
              <div className="pointer-events-none absolute bottom-0 right-0 w-[2px] h-12 bg-gradient-to-t from-[#B89A4A] to-transparent" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B89A4A]/10 border border-[#B89A4A]/30 text-[#8F7430] text-xs font-semibold uppercase tracking-wider mb-4">
                <span>🌺</span>
                <span>Direct Temple Offering</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-heading text-[#3F3528] font-light leading-tight mb-4">
                Every Offering Brings Blessings
              </h3>

              <div className="space-y-3 text-sm text-[#635543] font-light leading-relaxed mb-6">
                <p>
                  Every contribution is utilized with pure devotion toward grand rituals, sacred aartis, eco-friendly celebrations, and distributing free Mahaprasad to thousands of devotees.
                </p>
                <p>
                  Join hands in preserving our sacred heritage and empowering community welfare initiatives.
                </p>
              </div>

              <div className="w-full h-[1px] bg-gradient-to-r from-[#B89A4A]/40 via-[#B89A4A]/20 to-transparent my-5" />

              <div className="space-y-2.5">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#8F7430]">
                  Your contribution supports:
                </h4>
                <div className="space-y-2 pt-1">
                  {bulletPoints.map((point) => (
                    <div key={point} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#4A3E31]">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#B89A4A] mt-1.5 shadow-[0_0_6px_rgba(184,154,74,0.6)]" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badge */}
              <div className="mt-8 pt-4 border-t border-[#B89A4A]/20 flex items-center justify-between text-xs text-[#776B5B]">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="text-[#8F7430]">✓</span> 100% Transparent Trust Account
                </span>
                <span className="text-[11px] font-mono text-[#8F7430] bg-[#FAF7EF] px-2.5 py-1 rounded-full border border-[#B89A4A]/30">
                  GPay / UPI Verified
                </span>
              </div>

            </div>
          </div>


          {/* RIGHT COLUMN: Interactive Dynamic 3-Step Donation Portal */}
          <div ref={cardRef} className="lg:col-span-7 w-full">
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-[#B89A4A]/60 via-[#D8BD72]/35 to-[#8F7430]/40 shadow-[0_20px_60px_rgba(63,53,40,0.12)]">
              <div className="relative rounded-[22px] bg-gradient-to-b from-[#FFFDF7] via-[#FAF7EF] to-[#F5EFE1] p-6 sm:p-8 md:p-10 backdrop-blur-2xl border border-[#B89A4A]/30 overflow-hidden">

                {/* STEP 1: DEVOTEE DETAILS & AMOUNT FORM */}
                {step === 'form' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-[#B89A4A]/20 pb-4">
                      <div>
                        <span className="text-xs uppercase tracking-[0.2em] text-[#8F7430] font-bold">Step 1 of 2</span>
                        <h3 className="text-xl sm:text-2xl font-heading text-[#3F3528] font-bold">
                          Enter Donation Details
                        </h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#B89A4A]/15 border border-[#B89A4A]/40 flex items-center justify-center text-[#8F7430] text-lg font-heading font-bold">
                        1
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-3 text-xs text-red-800 bg-red-100/90 rounded-xl border border-red-300 font-medium">
                        {errorMsg}
                      </div>
                    )}

                    <form onSubmit={handleProceedToQR} className="space-y-5">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-[#3F3528] mb-1.5 uppercase tracking-wider">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="e.g. Ramesh Bhai Patel"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-[#FFFDF7] border border-[#B89A4A]/35 rounded-xl px-4 py-3 text-sm text-[#2B231A] font-medium placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#8F7430] transition-colors shadow-sm"
                        />
                      </div>

                      {/* Mobile & Email Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#3F3528] mb-1.5 uppercase tracking-wider">
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8F7430]">
                              +91
                            </span>
                            <input
                              type="tel"
                              name="phone"
                              required
                              maxLength="10"
                              placeholder="98765 43210"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full bg-[#FFFDF7] border border-[#B89A4A]/35 rounded-xl pl-12 pr-4 py-3 text-sm text-[#2B231A] font-medium placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#8F7430] transition-colors shadow-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#3F3528] mb-1.5 uppercase tracking-wider">
                            Email <span className="text-xs font-normal text-[#776B5B]">(Optional)</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            placeholder="ramesh@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-[#FFFDF7] border border-[#B89A4A]/35 rounded-xl px-4 py-3 text-sm text-[#2B231A] font-medium placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#8F7430] transition-colors shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Donation Amount & Preset Chips */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-[#3F3528] uppercase tracking-wider">
                            Donation Amount (₹) <span className="text-red-500">*</span>
                          </label>
                          <span className="text-xs text-[#8F7430] font-semibold">Select or enter custom</span>
                        </div>

                        {/* Preset Chips */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                          {PRESET_AMOUNTS.map((amt) => {
                            const isSelected = String(amt) === String(formData.amount);
                            return (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => handleSelectPreset(amt)}
                                className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-[#8F7430] text-white border-[#8F7430] shadow-md scale-[1.03]'
                                    : 'bg-[#FAF7EF] hover:bg-[#F3EAD7] text-[#3F3528] border-[#B89A4A]/30'
                                }`}
                              >
                                ₹{amt.toLocaleString('en-IN')}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Amount Input */}
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-[#8F7430]">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="amount"
                            required
                            min="1"
                            placeholder="Enter custom amount"
                            value={formData.amount}
                            onChange={handleChange}
                            className="w-full bg-[#FFFDF7] border border-[#B89A4A]/40 rounded-xl pl-9 pr-4 py-3 text-base text-[#2B231A] font-bold placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430] focus:ring-1 focus:ring-[#8F7430] transition-colors shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full btn-primary shimmer-btn py-4 px-6 rounded-xl font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-[#8F7430] via-[#B89A4A] to-[#D8BD72] text-[#2B231A] shadow-[0_4px_25px_rgba(184,154,74,0.3)] hover:shadow-[0_6px_35px_rgba(184,154,74,0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300"
                        >
                          <span>Proceed to Donate ➔</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}


                {/* STEP 2: REAL GPAY / UPI QR CODE PAYMENT SCREEN */}
                {step === 'qr' && (
                  <div className="space-y-6 text-center animate-fade-in">
                    <div className="flex items-center justify-between border-b border-[#B89A4A]/20 pb-4 text-left">
                      <div>
                        <span className="text-xs uppercase tracking-[0.2em] text-[#8F7430] font-bold">Step 2 of 2</span>
                        <h3 className="text-xl sm:text-2xl font-heading text-[#3F3528] font-bold">
                          Scan GPay / UPI QR Code
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep('form')}
                        className="text-xs text-[#8F7430] hover:underline font-bold px-3 py-1.5 rounded-lg border border-[#B89A4A]/30 bg-[#FAF7EF]"
                      >
                        ← Edit Details
                      </button>
                    </div>

                    {errorMsg && (
                      <div className="p-3 text-xs text-red-800 bg-red-100/90 rounded-xl border border-red-300 font-medium text-left">
                        {errorMsg}
                      </div>
                    )}

                    {/* QR Code Container */}
                    <div ref={qrImageRef} className="relative inline-block my-2">
                      <div className="relative p-3.5 rounded-2xl bg-[#FFFDF7] border-2 border-[#B89A4A]/50 shadow-[0_12px_40px_rgba(184,154,74,0.25)]">
                        <Image
                          src="/images/qr-payment.jpg"
                          alt="Surat Cha Gaurinandan GPay UPI QR Code - Raj Shukla"
                          width={240}
                          height={240}
                          className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl shadow-inner border border-[#B89A4A]/20 mx-auto"
                          priority
                        />
                        {/* Corner Accents */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#8F7430]" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#8F7430]" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#8F7430]" />
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#8F7430]" />
                      </div>
                    </div>

                    {/* Beneficiary & Amount Highlight */}
                    <div className="space-y-3 bg-[#FAF7EF] p-4 sm:p-5 rounded-2xl border border-[#B89A4A]/30 max-w-md mx-auto">
                      <div>
                        <span className="text-[11px] uppercase tracking-widest text-[#776B5B] font-bold">
                          Official UPI Beneficiary
                        </span>
                        <h4 className="text-lg font-bold text-[#3F3528] font-heading">{UPI_BENEFICIARY}</h4>
                      </div>

                      {/* UPI ID with Copy Action */}
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFFDF7] border border-[#B89A4A]/35 text-[#3F3528]">
                        <span className="text-xs font-mono font-bold tracking-wide">{UPI_ID}</span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="text-[#8F7430] hover:text-[#3F3528] text-xs font-bold px-2 py-0.5 rounded bg-[#B89A4A]/15 border border-[#B89A4A]/30 transition-colors"
                        >
                          {copied ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>

                      {/* REQUIRED TEXT & AMOUNT TO PAY */}
                      <div className="pt-2 border-t border-[#B89A4A]/20">
                        <div className="text-xs uppercase tracking-wider text-[#776B5B] font-medium">
                          Amount to Pay:
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-[#8F7430] font-heading my-1">
                          ₹{Number(formData.amount || 0).toLocaleString('en-IN')}
                        </div>
                        <p className="text-xs sm:text-sm text-[#4A3E31] font-semibold leading-relaxed mt-2 px-2">
                          Please scan the QR code using Google Pay or any UPI app and complete your payment.
                        </p>
                      </div>

                      {/* Accepted UPI Apps */}
                      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                        {UPI_APPS.map((app) => (
                          <span
                            key={app}
                            className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FAF7EF] border border-[#B89A4A]/30 text-[#8F7430]"
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Devotee Reference Info */}
                    <div className="text-xs text-[#776B5B] flex items-center justify-center gap-4">
                      <span>Devotee: <strong className="text-[#3F3528]">{formData.name}</strong></span>
                      <span>•</span>
                      <span>Mobile: <strong className="text-[#3F3528]">{formData.phone}</strong></span>
                    </div>

                    {/* REQUIRED ACTION BUTTON: I Have Completed Payment */}
                    <div className="pt-2 max-w-md mx-auto">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleCompletedPayment}
                        className="w-full btn-primary shimmer-btn py-4 px-6 rounded-xl font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-[#8F7430] via-[#B89A4A] to-[#D8BD72] text-[#2B231A] shadow-[0_4px_25px_rgba(184,154,74,0.3)] hover:shadow-[0_6px_35px_rgba(184,154,74,0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                      >
                        <span>{loading ? 'Submitting Payment Details...' : 'I Have Completed Payment'}</span>
                      </button>
                    </div>
                  </div>
                )}


                {/* STEP 3: SUBMISSION CONFIRMATION (NO FAKE SUCCESS) */}
                {step === 'success' && submittedData && (
                  <div className="text-center py-4 sm:py-6 space-y-5 animate-fade-in max-w-lg mx-auto">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#B89A4A]/15 border-2 border-[#B89A4A]/40 shadow-[0_0_30px_rgba(184,154,74,0.25)] mb-1">
                      <span className="text-4xl">🙏</span>
                    </div>

                    {/* Required Headings */}
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-heading text-[#3F3528] font-bold mb-2">
                        🙏 Thank You for Your Contribution!
                      </h3>
                      <p className="text-sm font-semibold text-[#8F7430]">
                        Your payment details have been submitted successfully.
                      </p>
                      <p className="text-xs sm:text-sm text-[#635543] font-medium mt-1">
                        Payment confirmation will be verified shortly.
                      </p>
                    </div>

                    {/* Detailed Submitted Summary Card */}
                    <div className="bg-[#FAF7EF] rounded-2xl border border-[#B89A4A]/30 p-5 text-left text-xs space-y-2.5 shadow-sm">
                      <div className="flex justify-between items-center pb-2 border-b border-[#B89A4A]/20">
                        <span className="text-[#776B5B] font-medium">Status</span>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          ⏳ Pending Verification
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#776B5B] font-medium">Devotee Name:</span>
                        <span className="font-bold text-[#2B231A]">{submittedData.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#776B5B] font-medium">Mobile:</span>
                        <span className="font-bold text-[#2B231A]">{submittedData.phone}</span>
                      </div>
                      {submittedData.email && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#776B5B] font-medium">Email:</span>
                          <span className="font-medium text-[#2B231A]">{submittedData.email}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-[#776B5B] font-medium">Amount:</span>
                        <span className="font-extrabold text-[#8F7430] text-sm">
                          ₹{submittedData.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#776B5B] font-medium">Payment Method:</span>
                        <span className="font-bold text-[#2B231A]">{submittedData.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#776B5B] font-medium">Date:</span>
                        <span className="text-[#2B231A] font-medium">{submittedData.date}</span>
                      </div>
                    </div>

                    {/* Blessings Note */}
                    <p className="text-xs text-[#776B5B] leading-relaxed max-w-sm mx-auto">
                      May Lord Ganesha shower you and your family with boundless health, peace, prosperity, and divine happiness.
                    </p>

                    {/* Reset Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="btn-primary shimmer-btn py-3 px-8 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#8F7430] via-[#B89A4A] to-[#D8BD72] text-[#2B231A] shadow-md"
                      >
                        <span>Make Another Contribution</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default memo(Donation);

