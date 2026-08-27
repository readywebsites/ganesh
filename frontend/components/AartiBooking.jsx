'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import QRCode from 'qrcode';
import { getApiUrl, extractErrorMessage, getFriendlyErrorMessage } from '@/lib/api';

// Available Festival Dates for Surat Cha Gaurinandan Ganesh Mahotsav 2026 (14 Sept - 25 Sept 2026)
const FESTIVAL_DATES = [
  { dateStr: '2026-09-14', dayNum: 14, dayName: 'Mon', festivalTag: 'Sthapana' },
  { dateStr: '2026-09-15', dayNum: 15, dayName: 'Tue' },
  { dateStr: '2026-09-16', dayNum: 16, dayName: 'Wed' },
  { dateStr: '2026-09-17', dayNum: 17, dayName: 'Thu' },
  { dateStr: '2026-09-18', dayNum: 18, dayName: 'Fri' },
  { dateStr: '2026-09-19', dayNum: 19, dayName: 'Sat' },
  { dateStr: '2026-09-20', dayNum: 20, dayName: 'Sun', festivalTag: 'Maha Aarti' },
  { dateStr: '2026-09-21', dayNum: 21, dayName: 'Mon' },
  { dateStr: '2026-09-22', dayNum: 22, dayName: 'Tue' },
  { dateStr: '2026-09-23', dayNum: 23, dayName: 'Wed' },
  { dateStr: '2026-09-24', dayNum: 24, dayName: 'Thu' },
  { dateStr: '2026-09-25', dayNum: 25, dayName: 'Fri', festivalTag: 'Visarjan' },
];

function formatHumanDate(dateStr) {
  if (!dateStr) return '20 September 2026';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = months[parseInt(parts[1], 10) - 1] || 'September';
      const year = parts[0];
      return `${day} ${month} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export default function AartiBooking() {
  const sectionRef = useRef(null);
  const formRef = useRef(null);

  // Flow State: Step 1 (Date), Step 2 (Aarti Selection), Step 3/4 (Form), Step 5 (Success)
  const [selectedDate, setSelectedDate] = useState('2026-09-20');
  const [selectedSlot, setSelectedSlot] = useState(null); // 'morning' | 'night'
  const [slotData, setSlotData] = useState(null);
  const [loadingSlot, setLoadingSlot] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    city: 'Surat',
    members: '1',
    specialNote: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Initial Section Entrance
  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, []);

  // Fetch slot availability whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;

    let isMounted = true;
    const fetchSlotAvailability = async () => {
      setLoadingSlot(true);
      try {
        const res = await fetch(getApiUrl(`/aarti-bookings/availability/?date=${selectedDate}`));
        const data = await res.json();
        if (isMounted) {
          if (data && data.morning && data.night) {
            setSlotData({
              date: data.date || selectedDate,
              morning: {
                title: 'Morning Aarti',
                time: '09:00 AM',
                capacity: data.morning.capacity || 5,
                booked: data.morning.booked || 0,
                remaining: data.morning.remaining ?? 5,
                isFull: Boolean(data.morning.is_full || data.morning.remaining <= 0),
              },
              night: {
                title: 'Night Aarti',
                time: '08:00 PM',
                capacity: data.night.capacity || 5,
                booked: data.night.booked || 0,
                remaining: data.night.remaining ?? 5,
                isFull: Boolean(data.night.is_full || data.night.remaining <= 0),
              },
            });
          } else {
            setSlotData({
              date: selectedDate,
              morning: { title: 'Morning Aarti', time: '09:00 AM', capacity: 5, booked: 0, remaining: 5, isFull: false },
              night: { title: 'Night Aarti', time: '08:00 PM', capacity: 5, booked: 0, remaining: 5, isFull: false },
            });
          }
        }
      } catch (err) {
        console.error('Failed to load slot availability:', err);
        if (isMounted) {
          setSlotData({
            date: selectedDate,
            morning: { title: 'Morning Aarti', time: '09:00 AM', capacity: 5, booked: 0, remaining: 5, isFull: false },
            night: { title: 'Night Aarti', time: '08:00 PM', capacity: 5, booked: 0, remaining: 5, isFull: false },
          });
        }
      } finally {
        if (isMounted) setLoadingSlot(false);
      }
    };

    fetchSlotAvailability();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Handle Date Click
  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setApiError('');
    setSuccessBooking(null);
  };

  // Handle Aarti Slot Selection (Morning or Night)
  const handleSlotSelect = (slotKey) => {
    const isFull = slotData?.[slotKey]?.isFull;
    if (isFull) return;

    setSelectedSlot(slotKey);
    setApiError('');
    setSuccessBooking(null);

    // Smooth scroll to form on mobile
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  // Form Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Please enter your full name (at least 2 characters).';
    }

    const cleanPhone = formData.mobile.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errors.mobile = 'Please enter a valid 10-digit mobile number.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.city.trim()) {
      errors.city = 'Please enter your city.';
    }

    const membersCount = parseInt(formData.members, 10);
    if (isNaN(membersCount) || membersCount < 1 || membersCount > 5) {
      errors.members = 'Members must be between 1 and 5 devotees.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // STEP 4 — Submit Booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;
    if (!selectedSlot) {
      setApiError('Please select either Morning Aarti or Night Aarti.');
      return;
    }

    setSubmitting(true);

    const slotTitle = selectedSlot === 'morning' ? 'Morning Aarti' : 'Night Aarti';
    const payload = {
      devotee_name: formData.name.trim(),
      name: formData.name.trim(),
      phone: formData.mobile.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
      city: formData.city.trim() || 'Surat',
      booking_date: selectedDate,
      date: selectedDate,
      aarti_type: selectedSlot,
      slot: slotTitle,
      number_of_devotees: parseInt(formData.members, 10) || 1,
      members: parseInt(formData.members, 10) || 1,
      notes: formData.specialNote.trim(),
      specialNote: formData.specialNote.trim(),
    };

    try {
      const response = await fetch(getApiUrl('/aarti-bookings/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const errorMsg = extractErrorMessage(
          data,
          response.status,
          'Unable to complete Aarti booking. Please check your details.'
        );
        throw new Error(errorMsg);
      }

      if (data && data.success === false) {
        throw new Error(data.message || 'Aarti booking submission failed.');
      }

      const bookingResult = data?.booking || data?.data || data;
      const finalBooking = {
        bookingId: bookingResult.bookingId || bookingResult.booking_id || bookingResult.id,
        name: bookingResult.name || bookingResult.devotee_name || formData.name,
        mobile: bookingResult.mobile || bookingResult.phone || formData.mobile,
        email: bookingResult.email || formData.email,
        city: bookingResult.city || formData.city || 'Surat',
        date: bookingResult.date || bookingResult.booking_date || selectedDate,
        formattedDate: formatHumanDate(bookingResult.date || bookingResult.booking_date || selectedDate),
        slot: slotTitle,
        time: selectedSlot === 'morning' ? '09:00 AM' : '08:00 PM',
        members: bookingResult.members || bookingResult.number_of_devotees || formData.members,
        specialNote: formData.specialNote.trim(),
      };

      setSuccessBooking(finalBooking);

      // Generate QR Code for VIP Pass
      try {
        const qr = await QRCode.toDataURL(
          JSON.stringify({
            id: finalBooking.bookingId,
            name: finalBooking.name,
            date: finalBooking.formattedDate,
            aarti: finalBooking.slot,
            time: finalBooking.time,
            members: finalBooking.members,
          }),
          { margin: 1, width: 220, color: { dark: '#3F3528', light: '#FFFDF7' } }
        );
        setQrCodeUrl(qr);
      } catch (qrErr) {
        console.error('QR code generation failed:', qrErr);
      }

      // Refresh slot capacity
      try {
        const refreshRes = await fetch(getApiUrl(`/aarti-bookings/availability/?date=${selectedDate}`));
        const refreshData = await refreshRes.json();
        if (refreshData?.morning && refreshData?.night) {
          setSlotData({
            date: refreshData.date || selectedDate,
            morning: {
              title: 'Morning Aarti',
              time: '09:00 AM',
              capacity: refreshData.morning.capacity || 5,
              booked: refreshData.morning.booked || 0,
              remaining: refreshData.morning.remaining ?? 5,
              isFull: Boolean(refreshData.morning.is_full || refreshData.morning.remaining <= 0),
            },
            night: {
              title: 'Night Aarti',
              time: '08:00 PM',
              capacity: refreshData.night.capacity || 5,
              booked: refreshData.night.booked || 0,
              remaining: refreshData.night.remaining ?? 5,
              isFull: Boolean(refreshData.night.is_full || refreshData.night.remaining <= 0),
            },
          });
        }
      } catch {}

      // Scroll to top of booking section for seamless success view
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setApiError(getFriendlyErrorMessage(err, 'Unable to submit booking. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Reset flow to book another
  const handleBookAnother = () => {
    setSuccessBooking(null);
    setSelectedSlot(null);
    setQrCodeUrl('');
    setFormData({
      name: '',
      mobile: '',
      email: '',
      city: 'Surat',
      members: '1',
      specialNote: '',
    });
    setFormErrors({});
    setApiError('');
  };

  // Download Printable VIP Pass
  const handleDownloadPass = () => {
    if (!successBooking) return;
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Please allow popups to open and print your Aarti Pass.');
      return;
    }

    const passHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Aarti Pass - ${successBooking.bookingId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F7F3EA; color: #3F3528; display: flex; justify-content: center; padding: 40px 20px; }
          .pass-box { width: 100%; max-width: 480px; background: #FFFDF7; border: 2px solid #B89A4A; border-radius: 24px; padding: 32px; text-align: center; box-shadow: 0 10px 40px rgba(184,154,74,0.2); }
          .om { font-size: 32px; color: #8F7430; margin-bottom: 8px; }
          .title { font-size: 22px; font-weight: 800; color: #3F3528; letter-spacing: 0.5px; }
          .subtitle { font-size: 13px; color: #8F7430; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
          .badge { display: inline-block; background: #B89A4A; color: #FFFDF7; font-weight: 700; font-size: 11px; text-transform: uppercase; padding: 5px 14px; border-radius: 20px; margin: 16px 0; letter-spacing: 1px; }
          .id-label { font-size: 11px; text-transform: uppercase; color: #776B5B; font-weight: 600; }
          .id-val { font-size: 24px; font-weight: 900; color: #8F7430; font-family: monospace; letter-spacing: 1px; margin: 4px 0 16px; }
          .qr-img { width: 160px; height: 160px; margin: 0 auto 20px; border: 2px solid #B89A4A; border-radius: 16px; padding: 8px; background: #FFFDF7; }
          .details { background: #FAF7EF; border: 1px solid #E6D8B8; border-radius: 16px; padding: 18px; text-align: left; font-size: 13px; line-height: 1.8; margin-bottom: 20px; }
          .details-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #E6D8B8; padding: 6px 0; }
          .details-row:last-child { border-bottom: none; }
          .lbl { color: #776B5B; font-weight: 600; }
          .val { color: #3F3528; font-weight: 700; }
          .val-gold { color: #8F7430; font-weight: 800; }
          .note { font-size: 11px; color: #776B5B; line-height: 1.5; }
          .blessing { color: #8F7430; font-weight: 700; margin-top: 10px; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="pass-box">
          <div class="om">🕉️</div>
          <h1 class="title">Surat Cha Gaurinandan</h1>
          <p class="subtitle">Ganesh Mahotsav 2026 • VIP Aarti Pass</p>
          <div class="badge">Confirmed VIP Pass</div>
          
          <div class="id-label">Booking ID</div>
          <div class="id-val">${successBooking.bookingId}</div>

          ${qrCodeUrl ? `<img src="${qrCodeUrl}" class="qr-img" alt="QR Code" />` : ''}

          <div class="details">
            <div class="details-row"><span class="lbl">Date:</span><span class="val-gold">${successBooking.formattedDate}</span></div>
            <div class="details-row"><span class="lbl">Aarti:</span><span class="val-gold">${successBooking.slot}</span></div>
            <div class="details-row"><span class="lbl">Time:</span><span class="val-gold">${successBooking.time}</span></div>
            <div class="details-row"><span class="lbl">Devotee Name:</span><span class="val">${successBooking.name}</span></div>
            <div class="details-row"><span class="lbl">Mobile:</span><span class="val">${successBooking.mobile}</span></div>
            <div class="details-row"><span class="lbl">Members Allowed:</span><span class="val">${successBooking.members} Devotee(s)</span></div>
            <div class="details-row"><span class="lbl">City:</span><span class="val">${successBooking.city}</span></div>
          </div>

          <p class="note">📍 Please arrive at the temple hall 20 minutes prior to the Aarti.<br>Entry is strictly validated via this Booking ID / QR Pass.</p>
          <p class="blessing">🙏 Ganpati Bappa Morya! 🙏</p>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    printWin.document.write(passHtml);
    printWin.document.close();
  };

  // Open devotee WhatsApp message
  const handleOpenWhatsApp = () => {
    if (!successBooking) return;
    const msg = `🙏 Surat Cha Gaurinandan Ganesh Mahotsav 2026

*Aarti Booking Confirmed*

Booking ID: ${successBooking.bookingId}
Date: ${successBooking.formattedDate}
Aarti: ${successBooking.slot}
Time: ${successBooking.time}
Members: ${successBooking.members}

Name: ${successBooking.name}
Mobile: ${successBooking.mobile}

Please arrive 20 minutes before the Aarti.
Ganpati Bappa Morya! 🙏`;

    const encoded = encodeURIComponent(msg);
    const cleanMobile = successBooking.mobile.replace(/\D/g, '');
    const phone = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`, '_blank');
  };

  return (
    <section
      id="aarti"
      ref={sectionRef}
      className="relative py-24 sm:py-28 bg-[#F7F3EA] text-[#3F3528] overflow-hidden border-t border-[#B89A4A]/20"
    >
      {/* Warm Ambient Temple Lights */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-[#B89A4A]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#D8BD72]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header (Minimal & Clean) */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B89A4A]/10 border border-[#B89A4A]/30 text-[#8F7430] text-xs uppercase tracking-widest font-semibold">
            <span>🏵️</span> Ganesh Mahotsav 2026
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3F3528] via-[#8F7430] to-[#B89A4A] font-heading tracking-tight">
            Book Aarti Pass
          </h2>

          <p className="text-[#776B5B] text-sm sm:text-base leading-relaxed">
            Select your date, choose your Aarti time, and reserve your sacred darshan pass in seconds.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* STEP 5: SUCCESS CONFIRMATION SCREEN */}
        {/* ========================================================================= */}
        {successBooking ? (
          <div className="bg-[#FFFDF7] border-2 border-[#B89A4A]/40 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(184,154,74,0.15)] text-center max-w-xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Header Blessing */}
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#B89A4A] to-[#D8BD72] flex items-center justify-center text-[#FFFDF7] text-3xl mx-auto shadow-[0_4px_20px_rgba(184,154,74,0.35)]">
                🙏
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#3F3528] font-heading tracking-tight">
                Aarti Booking Confirmed
              </h3>
              <p className="text-xs text-[#8F7430] font-semibold uppercase tracking-wider">
                Surat Cha Gaurinandan Mahotsav 2026
              </p>
            </div>

            {/* Confirmed Ticket Card */}
            <div className="bg-[#FAF7EF] border border-[#B89A4A]/30 rounded-2xl p-5 sm:p-6 text-left space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#8F7430] text-[#FFFDF7] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                Confirmed Pass
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#776B5B] tracking-wider block">
                  Booking ID
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#8F7430] font-mono tracking-wider">
                  {successBooking.bookingId}
                </span>
              </div>

              {qrCodeUrl && (
                <div className="flex justify-center py-2">
                  <img
                    src={qrCodeUrl}
                    alt="Aarti Pass QR"
                    className="w-36 h-36 rounded-xl border border-[#B89A4A]/40 p-1.5 bg-[#FFFDF7] shadow-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-[#B89A4A]/20 pt-3">
                <div>
                  <span className="text-[#776B5B] block text-[11px]">Date</span>
                  <span className="font-bold text-[#3F3528]">{successBooking.formattedDate}</span>
                </div>
                <div>
                  <span className="text-[#776B5B] block text-[11px]">Aarti</span>
                  <span className="font-bold text-[#8F7430]">{successBooking.slot}</span>
                </div>
                <div>
                  <span className="text-[#776B5B] block text-[11px]">Time</span>
                  <span className="font-bold text-[#8F7430]">{successBooking.time}</span>
                </div>
                <div>
                  <span className="text-[#776B5B] block text-[11px]">Members</span>
                  <span className="font-bold text-[#3F3528]">{successBooking.members} Person(s)</span>
                </div>
                <div>
                  <span className="text-[#776B5B] block text-[11px]">Name</span>
                  <span className="font-semibold text-[#3F3528] truncate block">{successBooking.name}</span>
                </div>
                <div>
                  <span className="text-[#776B5B] block text-[11px]">Mobile</span>
                  <span className="font-semibold text-[#3F3528]">{successBooking.mobile}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadPass}
                className="w-full py-3 px-4 rounded-xl bg-[#8F7430] text-[#FFFDF7] font-bold text-xs hover:bg-[#776025] transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>📄</span> Download Printable Pass
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 text-[#FFFDF7] font-bold text-xs hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>💬</span> Open WhatsApp Pass
              </button>
            </div>

            <button
              type="button"
              onClick={handleBookAnother}
              className="text-xs font-semibold text-[#8F7430] hover:underline pt-2 inline-block"
            >
              ← Book Another Aarti Slot
            </button>
          </div>
        ) : (
          <div className="space-y-10">

            {/* ========================================================================= */}
            {/* STEP 1: SELECT DATE */}
            {/* ========================================================================= */}
            <div className="bg-[#FFFDF7] border border-[#B89A4A]/30 rounded-3xl p-5 sm:p-7 shadow-[0_10px_30px_rgba(63,53,40,0.06)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#B89A4A]/20 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#8F7430] text-[#FFFDF7] flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#3F3528] font-heading">
                      Select Aarti Date
                    </h3>
                    <p className="text-xs text-[#776B5B]">
                      Ganesh Mahotsav: 14 Sept – 25 Sept 2026
                    </p>
                  </div>
                </div>

                <div className="text-xs font-bold text-[#8F7430] bg-[#FAF7EF] px-3.5 py-1.5 rounded-full border border-[#B89A4A]/30 self-start sm:self-auto">
                  Selected: {formatHumanDate(selectedDate)}
                </div>
              </div>

              {/* Responsive Date Selector Cards */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                {FESTIVAL_DATES.map((item) => {
                  const isSelected = selectedDate === item.dateStr;

                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => handleDateSelect(item.dateStr)}
                      className={`relative p-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 text-center ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#8F7430] to-[#776025] text-[#FFFDF7] shadow-[0_6px_20px_rgba(143,116,48,0.35)] scale-[1.03] border-2 border-[#B89A4A]'
                          : 'bg-[#FAF7EF] border border-[#B89A4A]/25 text-[#3F3528] hover:border-[#8F7430] hover:bg-[#FFFDF7] shadow-sm'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${
                        isSelected ? 'text-[#FFFDF7]/80' : 'text-[#776B5B]'
                      }`}>
                        {item.dayName}
                      </span>

                      <span className={`text-xl sm:text-2xl font-black font-heading leading-tight my-0.5 ${
                        isSelected ? 'text-[#FFFDF7]' : 'text-[#3F3528]'
                      }`}>
                        {item.dayNum}
                      </span>

                      <span className={`text-[10px] font-semibold ${
                        isSelected ? 'text-[#FFFDF7]/90' : 'text-[#8F7430]'
                      }`}>
                        Sept 2026
                      </span>

                      {item.festivalTag && (
                        <span className={`mt-1 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full truncate max-w-full ${
                          isSelected
                            ? 'bg-[#FFFDF7] text-[#8F7430]'
                            : 'bg-[#8F7430]/15 text-[#8F7430] border border-[#8F7430]/30'
                        }`}>
                          ✨ {item.festivalTag}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* STEP 2: SHOW AARTI OPTIONS DIRECTLY */}
            {/* ========================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 px-2">
                <span className="w-7 h-7 rounded-full bg-[#8F7430] text-[#FFFDF7] flex items-center justify-center text-xs font-black">
                  2
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#3F3528] font-heading">
                    Choose Aarti Slot for {formatHumanDate(selectedDate)}
                  </h3>
                  <p className="text-xs text-[#776B5B]">
                    Select either Morning or Night Aarti to open the booking form
                  </p>
                </div>
              </div>

              {loadingSlot ? (
                <div className="py-12 text-center text-[#8F7430] text-xs flex flex-col items-center justify-center gap-2 bg-[#FFFDF7] border border-[#B89A4A]/20 rounded-3xl">
                  <div className="w-6 h-6 border-2 border-[#8F7430] border-t-transparent rounded-full animate-spin" />
                  <span>Checking slot availability...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  
                  {/* MORNING AARTI CARD */}
                  {(() => {
                    const morning = slotData?.morning || {
                      title: 'Morning Aarti',
                      time: '09:00 AM',
                      capacity: 5,
                      booked: 0,
                      remaining: 5,
                      isFull: false,
                    };
                    const isSelected = selectedSlot === 'morning';
                    const isFull = morning.isFull;

                    return (
                      <div
                        onClick={() => !isFull && handleSlotSelect('morning')}
                        className={`relative rounded-3xl p-6 sm:p-7 border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
                          isFull
                            ? 'bg-[#FAF7EF]/60 border-[#E6D8B8] opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#FFFDF7] border-[#8F7430] shadow-[0_12px_35px_rgba(143,116,48,0.22)] ring-2 ring-[#8F7430]/30 scale-[1.01]'
                            : 'bg-[#FFFDF7] border-[#B89A4A]/30 hover:border-[#8F7430] hover:shadow-[0_8px_25px_rgba(184,154,74,0.15)]'
                        }`}
                      >
                        {/* Top Header */}
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-[#B89A4A]/15 border border-[#B89A4A]/30 flex items-center justify-center text-2xl text-[#8F7430]">
                                🌅
                              </div>
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8F7430] block">
                                  Morning Ritual
                                </span>
                                <h4 className="text-xl sm:text-2xl font-black text-[#3F3528] font-heading">
                                  Morning Aarti
                                </h4>
                              </div>
                            </div>

                            {/* Availability Badge */}
                            <div>
                              {isFull ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-300">
                                  🔴 Sold Out
                                </span>
                              ) : morning.remaining <= 2 ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                  ⚠️ {morning.remaining} Left
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  🟢 {morning.remaining} Available
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Time */}
                          <div className="bg-[#FAF7EF] rounded-2xl p-4 border border-[#B89A4A]/20 flex items-center justify-between mb-5">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#776B5B] block">
                                Aarti Time
                              </span>
                              <span className="text-2xl sm:text-3xl font-black text-[#8F7430] font-heading">
                                09:00 AM
                              </span>
                            </div>
                            <div className="text-right text-xs">
                              <span className="text-[#776B5B] block text-[10px]">Max Capacity</span>
                              <span className="font-bold text-[#3F3528]">5 Devotees / Slot</span>
                            </div>
                          </div>
                        </div>

                        {/* Select Button */}
                        <button
                          type="button"
                          disabled={isFull}
                          className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                            isFull
                              ? 'bg-[#E6D8B8] text-[#776B5B] cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#8F7430] text-[#FFFDF7] shadow-md'
                              : 'bg-[#B89A4A]/20 text-[#8F7430] hover:bg-[#8F7430] hover:text-[#FFFDF7]'
                          }`}
                        >
                          {isFull ? (
                            'Fully Booked'
                          ) : isSelected ? (
                            <>
                              <span>✓ Selected — Fill Details Below</span>
                            </>
                          ) : (
                            <>
                              <span>Select Morning Aarti</span>
                              <span>→</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })()}

                  {/* NIGHT AARTI CARD */}
                  {(() => {
                    const night = slotData?.night || {
                      title: 'Night Aarti',
                      time: '08:00 PM',
                      capacity: 5,
                      booked: 0,
                      remaining: 5,
                      isFull: false,
                    };
                    const isSelected = selectedSlot === 'night';
                    const isFull = night.isFull;

                    return (
                      <div
                        onClick={() => !isFull && handleSlotSelect('night')}
                        className={`relative rounded-3xl p-6 sm:p-7 border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
                          isFull
                            ? 'bg-[#FAF7EF]/60 border-[#E6D8B8] opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#FFFDF7] border-[#8F7430] shadow-[0_12px_35px_rgba(143,116,48,0.22)] ring-2 ring-[#8F7430]/30 scale-[1.01]'
                            : 'bg-[#FFFDF7] border-[#B89A4A]/30 hover:border-[#8F7430] hover:shadow-[0_8px_25px_rgba(184,154,74,0.15)]'
                        }`}
                      >
                        {/* Top Header */}
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-[#B89A4A]/15 border border-[#B89A4A]/30 flex items-center justify-center text-2xl text-[#8F7430]">
                                🌙
                              </div>
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8F7430] block">
                                  Evening Darshan
                                </span>
                                <h4 className="text-xl sm:text-2xl font-black text-[#3F3528] font-heading">
                                  Night Aarti
                                </h4>
                              </div>
                            </div>

                            {/* Availability Badge */}
                            <div>
                              {isFull ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-300">
                                  🔴 Sold Out
                                </span>
                              ) : night.remaining <= 2 ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                  ⚠️ {night.remaining} Left
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  🟢 {night.remaining} Available
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Time */}
                          <div className="bg-[#FAF7EF] rounded-2xl p-4 border border-[#B89A4A]/20 flex items-center justify-between mb-5">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#776B5B] block">
                                Aarti Time
                              </span>
                              <span className="text-2xl sm:text-3xl font-black text-[#8F7430] font-heading">
                                08:00 PM
                              </span>
                            </div>
                            <div className="text-right text-xs">
                              <span className="text-[#776B5B] block text-[10px]">Max Capacity</span>
                              <span className="font-bold text-[#3F3528]">5 Devotees / Slot</span>
                            </div>
                          </div>
                        </div>

                        {/* Select Button */}
                        <button
                          type="button"
                          disabled={isFull}
                          className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                            isFull
                              ? 'bg-[#E6D8B8] text-[#776B5B] cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#8F7430] text-[#FFFDF7] shadow-md'
                              : 'bg-[#B89A4A]/20 text-[#8F7430] hover:bg-[#8F7430] hover:text-[#FFFDF7]'
                          }`}
                        >
                          {isFull ? (
                            'Fully Booked'
                          ) : isSelected ? (
                            <>
                              <span>✓ Selected — Fill Details Below</span>
                            </>
                          ) : (
                            <>
                              <span>Select Night Aarti</span>
                              <span>→</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })()}

                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* STEP 3 & 4: BOOKING FORM & CONFIRMATION */}
            {/* ========================================================================= */}
            {selectedSlot && (
              <div
                ref={formRef}
                className="bg-[#FFFDF7] border-2 border-[#B89A4A]/40 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(63,53,40,0.08)] space-y-6 animate-in fade-in duration-300"
              >
                {/* Form Top Header with Selected Booking Information */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#B89A4A]/20 pb-5">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#8F7430] text-[#FFFDF7] flex items-center justify-center text-sm font-black">
                      3
                    </span>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#3F3528] font-heading">
                        Devotee Details
                      </h3>
                      <p className="text-xs text-[#776B5B]">
                        Please fill in your details to confirm the pass
                      </p>
                    </div>
                  </div>

                  {/* Clearly Display Selected Booking Information (No re-selection) */}
                  <div className="bg-[#FAF7EF] border border-[#B89A4A]/30 rounded-2xl px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-[#776B5B] text-[10px] uppercase font-bold block">Date</span>
                      <span className="font-bold text-[#3F3528]">{formatHumanDate(selectedDate)}</span>
                    </div>
                    <div className="w-px h-6 bg-[#B89A4A]/20 hidden sm:block" />
                    <div>
                      <span className="text-[#776B5B] text-[10px] uppercase font-bold block">Aarti</span>
                      <span className="font-bold text-[#8F7430]">
                        {selectedSlot === 'morning' ? 'Morning Aarti' : 'Night Aarti'}
                      </span>
                    </div>
                    <div className="w-px h-6 bg-[#B89A4A]/20 hidden sm:block" />
                    <div>
                      <span className="text-[#776B5B] text-[10px] uppercase font-bold block">Time</span>
                      <span className="font-bold text-[#8F7430]">
                        {selectedSlot === 'morning' ? '09:00 AM' : '08:00 PM'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* API Error Alert */}
                {apiError && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs font-medium flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#3F3528] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Ramesh Bhai Patel"
                      className={`w-full px-4 py-3 rounded-xl bg-[#FAF7EF] border text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none transition-colors ${
                        formErrors.name ? 'border-red-400 bg-red-50/40' : 'border-[#B89A4A]/30 focus:border-[#8F7430]'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Mobile & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3F3528] mb-1.5">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        required
                        maxLength={10}
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile (e.g. 9876543210)"
                        className={`w-full px-4 py-3 rounded-xl bg-[#FAF7EF] border text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none transition-colors ${
                          formErrors.mobile ? 'border-red-400 bg-red-50/40' : 'border-[#B89A4A]/30 focus:border-[#8F7430]'
                        }`}
                      />
                      {formErrors.mobile && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.mobile}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3F3528] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="devotee@example.com"
                        className={`w-full px-4 py-3 rounded-xl bg-[#FAF7EF] border text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none transition-colors ${
                          formErrors.email ? 'border-red-400 bg-red-50/40' : 'border-[#B89A4A]/30 focus:border-[#8F7430]'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* City & Members */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3F3528] mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Surat"
                        className={`w-full px-4 py-3 rounded-xl bg-[#FAF7EF] border text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none transition-colors ${
                          formErrors.city ? 'border-red-400 bg-red-50/40' : 'border-[#B89A4A]/30 focus:border-[#8F7430]'
                        }`}
                      />
                      {formErrors.city && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3F3528] mb-1.5">
                        Number of Members * (1 to 5)
                      </label>
                      <select
                        name="members"
                        value={formData.members}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF7EF] border border-[#B89A4A]/30 text-sm text-[#3F3528] focus:outline-none focus:border-[#8F7430] transition-colors"
                      >
                        <option value="1">1 Member (Individual Pass)</option>
                        <option value="2">2 Members</option>
                        <option value="3">3 Members</option>
                        <option value="4">4 Members</option>
                        <option value="5">5 Members (Maximum per slot)</option>
                      </select>
                      {formErrors.members && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.members}</p>
                      )}
                    </div>
                  </div>

                  {/* Special Note */}
                  <div>
                    <label className="block text-xs font-bold text-[#3F3528] mb-1.5">
                      Special Note (Optional)
                    </label>
                    <textarea
                      name="specialNote"
                      rows={2}
                      value={formData.specialNote}
                      onChange={handleInputChange}
                      placeholder="Wheelchair assistance, elder seating, or specific prayers..."
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF7EF] border border-[#B89A4A]/30 text-sm text-[#3F3528] placeholder-[#9A8D78] focus:outline-none focus:border-[#8F7430] transition-colors resize-none"
                    />
                  </div>

                  {/* STEP 4: Confirm CTA Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-[#8F7430] via-[#A8883B] to-[#B89A4A] text-[#FFFDF7] hover:brightness-105 shadow-[0_8px_25px_rgba(143,116,48,0.3)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[#FFFDF7] border-t-transparent rounded-full animate-spin" />
                          <span>Reserving Aarti Pass...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Aarti Booking</span>
                          <span>🙏</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
