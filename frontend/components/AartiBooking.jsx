'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import QRCode from 'qrcode';
import { getApiUrl } from '@/lib/api';

export default function AartiBooking() {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);

  // Date selection state (default selected: 2026-09-14)
  const [selectedDate, setSelectedDate] = useState('2026-09-14');
  const [slotData, setSlotData] = useState(null);
  const [loadingSlot, setLoadingSlot] = useState(false);

  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlotName, setSelectedSlotName] = useState(''); // 'Morning Aarti' or 'Night Aarti'
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    city: '',
    members: '1',
    specialNote: '',
    agreeRules: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Fetch slot configuration and booking counts for selectedDate
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlotInfo = async () => {
      setLoadingSlot(true);
      try {
        const res = await fetch(getApiUrl(`/aarti/slots?date=${selectedDate}`));
        const data = await res.json();
        if (data.success && data.slot) {
          setSlotData(data.slot);
        } else {
          // Fallback defaults
          setSlotData({
            date: selectedDate,
            bookingOpen: true,
            morning: { slot: 'Morning Aarti', time: '09:00 AM', capacity: 15, booked: 0, remaining: 15, isFull: false },
            night: { slot: 'Night Aarti', time: '08:00 PM', capacity: 15, booked: 0, remaining: 15, isFull: false },
          });
        }
      } catch (err) {
        console.error('Failed to fetch slot details:', err);
        setSlotData({
          date: selectedDate,
          bookingOpen: true,
          morning: { slot: 'Morning Aarti', time: '09:00 AM', capacity: 15, booked: 0, remaining: 15, isFull: false },
          night: { slot: 'Night Aarti', time: '08:00 PM', capacity: 15, booked: 0, remaining: 15, isFull: false },
        });
      } finally {
        setLoadingSlot(false);
      }
    };

    fetchSlotInfo();
  }, [selectedDate]);

  // GSAP Entrance Animation
  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
    }
  }, []);

  // Open booking modal
  const handleOpenBooking = (slotName) => {
    setSelectedSlotName(slotName);
    setErrorMsg('');
    setSuccessBooking(null);
    setModalOpen(true);
  };

  // Form input handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submit booking
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.agreeRules) {
      setErrorMsg('Please accept the temple rules to proceed with booking.');
      return;
    }

    if (!/^\d{10}$/.test(formData.mobile.trim())) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(getApiUrl('/aarti/book'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          city: formData.city,
          members: formData.members,
          date: selectedDate,
          slot: selectedSlotName,
          specialNote: formData.specialNote,
        }),
      });

      const data = await res.json();

      if (data.success && data.booking) {
        setSuccessBooking(data.booking);

        // Generate client-side QR Code URL
        const qrUrl = await QRCode.toDataURL(
          JSON.stringify({
            bookingId: data.booking.bookingId,
            name: data.booking.name,
            date: data.booking.date,
            slot: data.booking.slot,
            members: data.booking.members,
          })
        );
        setQrCodeUrl(qrUrl);

        // Refresh slot data
        const refreshRes = await fetch(getApiUrl(`/aarti/slots?date=${selectedDate}`));
        const refreshData = await refreshRes.json();
        if (refreshData.success && refreshData.slot) {
          setSlotData(refreshData.slot);
        }
      } else {
        setErrorMsg(data.message || 'Failed to confirm booking. Please try again.');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setErrorMsg('Network error. Unable to process your Aarti booking.');
    } finally {
      setSubmitting(false);
    }
  };

  // Download QR Code PNG
  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${successBooking?.bookingId || 'Aarti_Pass'}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Printable PDF Ticket Pass
  const handleDownloadPDF = () => {
    if (!successBooking) return;
    
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Please allow popups to download your Aarti Pass PDF.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Aarti Pass - ${successBooking.bookingId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #050505; color: #fff; padding: 40px; display: flex; justify-content: center; }
          .pass-card { width: 500px; background: #0d0d0d; border: 2px solid #d4af37; border-radius: 20px; padding: 30px; text-align: center; box-shadow: 0 0 40px rgba(212,175,55,0.3); }
          .title { font-size: 24px; font-weight: 800; color: #d4af37; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
          .sub { font-size: 13px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
          .qr { width: 180px; height: 180px; margin: 15px auto; border: 3px solid #d4af37; border-radius: 12px; padding: 8px; background: #fff; }
          .badge { display: inline-block; background: #d4af37; color: #000; font-weight: 800; padding: 6px 16px; border-radius: 20px; font-size: 13px; margin-bottom: 20px; }
          .grid { text-align: left; background: #161616; border-radius: 12px; padding: 16px; margin-top: 20px; border: 1px solid #333; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
          .label { color: #888; }
          .val { color: #fff; font-weight: 600; }
          .gold { color: #f6e0a4; font-weight: 700; }
          .footer { margin-top: 25px; font-size: 11px; color: #777; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="pass-card">
          <div class="title">Surat Cha Gaurinandan</div>
          <div class="sub">Ganesh Mahotsav 2026 • VIP Aarti Pass</div>
          <div class="badge">CONFIRMED PASS</div>
          
          <div>
            <div style="font-size: 12px; color: #888;">BOOKING ID</div>
            <div style="font-size: 26px; font-weight: 900; color: #d4af37; letter-spacing: 2px;">${successBooking.bookingId}</div>
          </div>

          <img src="${qrCodeUrl}" class="qr" alt="Pass QR" />

          <div class="grid">
            <div class="row"><span class="label">Devotee:</span><span class="val">${successBooking.name}</span></div>
            <div class="row"><span class="label">Date:</span><span class="val gold">${successBooking.date}</span></div>
            <div class="row"><span class="label">Slot:</span><span class="val gold">${successBooking.slot} (${successBooking.slot.includes('Morning') ? '09:00 AM' : '08:00 PM'})</span></div>
            <div class="row"><span class="label">Members Allowed:</span><span class="val">${successBooking.members} Person(s)</span></div>
            <div class="row"><span class="label">City:</span><span class="val">${successBooking.city}</span></div>
            <div class="row"><span class="label">Mobile:</span><span class="val">${successBooking.mobile}</span></div>
          </div>

          <div class="footer">
            <p><strong>Temple Address:</strong> VIP Road, Vesu, Surat, Gujarat 395007</p>
            <p>Please present this QR code pass 20 minutes prior to Aarti. Entry is strictly non-transferable.</p>
            <p style="color: #d4af37; font-weight: bold; margin-top: 10px;">Ganpati Bappa Morya! 🙏</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  // Open WhatsApp Link directly
  const handleOpenWhatsApp = () => {
    if (!successBooking) return;
    const timeStr = successBooking.slot.includes('Morning') ? '09:00 AM' : '08:00 PM';
    const text = `🙏 Surat Cha Gaurinandan Ganesh Mahotsav

Your Aarti Booking has been Confirmed.

Booking ID:
${successBooking.bookingId}

Date:
${successBooking.date}

Slot:
${successBooking.slot}

Time:
${timeStr}

Members:
${successBooking.members}

Please arrive 20 minutes before the Aarti.

Ganpati Bappa Morya 🙏`;

    const encoded = encodeURIComponent(text);
    const cleanMobile = successBooking.mobile.replace(/\D/g, '');
    const phone = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`, '_blank');
  };

  // September 2026 Calendar Grid Setup
  // September 1, 2026 is a Tuesday (index 2 in Sun..Sat grid, so 2 blank cells at start)
  // Total days in Sept 2026: 30
  const calendarDays = [];
  const startBlankOffset = 2; // Sun(0), Mon(1) -> Tuesday is 2
  for (let i = 0; i < startBlankOffset; i++) {
    calendarDays.push({ isBlank: true, id: `blank-${i}` });
  }

  // Days 1 to 30
  for (let d = 1; d <= 30; d++) {
    const dateStr = `2026-09-${String(d).padStart(2, '0')}`;
    const dayOfWeekIndex = (startBlankOffset + d - 1) % 7;
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayName = dayNames[dayOfWeekIndex];

    const isSelectable = d >= 14 && d <= 25;
    const isFestival = d === 14 || d === 20 || d === 25;
    let festivalName = '';
    if (d === 14) festivalName = 'Sthapana';
    if (d === 20) festivalName = 'Maha Aarti';
    if (d === 25) festivalName = 'Visarjan';

    calendarDays.push({
      isBlank: false,
      dayNum: d,
      dateStr,
      dayName,
      isSelectable,
      isFestival,
      festivalName,
    });
  }

  return (
    <section id="aarti" ref={sectionRef} className="relative py-28 bg-black text-white overflow-hidden border-t border-amber-500/10">
      {/* Background Luxury Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs uppercase tracking-widest font-semibold backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <span>🏵️</span> Ganesh Mahotsav 2026 • VIP Aarti Portal
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 font-heading">
            Exclusive Aarti Pass Booking
          </h2>
          
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Experience the divine blessings of <strong className="text-amber-300">Surat Cha Gaurinandan</strong>. Select your sacred date from the luxury September calendar below.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* CALENDAR SECTION (Apple + Awwwards Square Glass Grid) */}
        {/* ========================================================================= */}
        <div className="mb-16">
          
          {/* Calendar Header Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-zinc-950/80 border border-amber-500/30 backdrop-blur-xl p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                📅
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 font-heading tracking-wide">
                  September 2026
                </h3>
                <p className="text-xs text-amber-400/80 font-medium tracking-wider uppercase">
                  Selectable Range: 14 Sept – 25 Sept 2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_10px_rgba(212,175,55,0.6)]" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300">
                <span className="w-3 h-3 rounded-full bg-amber-950 border border-amber-500/50" />
                <span>Bookable</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <span className="w-3 h-3 rounded-full bg-zinc-900 border border-zinc-800 opacity-40" />
                <span>Unavailable</span>
              </div>
            </div>
          </div>

          {/* Calendar Container */}
          <div className="bg-zinc-950/90 border border-amber-500/20 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-w-4xl mx-auto overflow-x-auto">
            
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3 md:gap-4 mb-4 text-center justify-items-center">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="w-[60px] sm:w-[80px] md:w-[100px] text-[10px] sm:text-xs font-bold tracking-widest text-amber-400/70 uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Square Date Cards Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3 md:gap-4 justify-items-center">
              {calendarDays.map((item) => {
                if (item.isBlank) {
                  return (
                    <div
                      key={item.id}
                      className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] rounded-2xl bg-transparent opacity-0 pointer-events-none"
                    />
                  );
                }

                const isSelected = selectedDate === item.dateStr;

                return (
                  <button
                    key={item.dateStr}
                    disabled={!item.isSelectable}
                    onClick={() => item.isSelectable && setSelectedDate(item.dateStr)}
                    className={`w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 group overflow-hidden ${
                      !item.isSelectable
                        ? 'bg-zinc-950/40 border border-zinc-900/60 text-zinc-700 opacity-25 cursor-not-allowed pointer-events-none'
                        : isSelected
                        ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-black border-2 border-amber-300 shadow-[0_0_35px_rgba(212,175,55,0.7)] scale-105 sm:scale-110 font-bold z-10'
                        : item.isFestival
                        ? 'bg-gradient-to-b from-amber-950/40 to-black border-2 border-amber-500/60 text-amber-200 shadow-[0_8px_30px_rgba(0,0,0,0.8)] hover:border-amber-400 hover:scale-105 hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] cursor-pointer'
                        : 'bg-black/70 backdrop-blur-xl border border-amber-500/30 text-amber-100/90 shadow-[0_8px_25px_rgba(0,0,0,0.7)] hover:border-amber-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer'
                    }`}
                  >
                    {/* Top Day Name */}
                    <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider mb-0.5 ${
                      isSelected ? 'text-black/80' : !item.isSelectable ? 'text-zinc-800' : 'text-amber-400/80'
                    }`}>
                      {item.dayName}
                    </span>

                    {/* Central Large Day Number */}
                    <span className={`text-lg sm:text-2xl md:text-3xl font-black font-heading leading-none ${
                      isSelected ? 'text-black' : !item.isSelectable ? 'text-zinc-700' : 'text-white'
                    }`}>
                      {item.dayNum}
                    </span>

                    {/* Bottom Festival Indicator Badge */}
                    {item.isFestival && (
                      <div className={`mt-1 text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded-full tracking-tighter truncate max-w-[90%] ${
                        isSelected
                          ? 'bg-black text-amber-300 border border-amber-400/50'
                          : 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                      }`}>
                        ✨ {item.festivalName}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BOOKING INFO CARD (Apple Luxury Card) */}
          {/* ========================================================================= */}
          <div className="mt-12 bg-zinc-950/80 border border-amber-500/30 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group hover:border-amber-500/50 transition-all duration-500">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-amber-500/20 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(212,175,55,0.2)] text-amber-300">
                  🙏
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 font-heading">
                    Aarti Booking Information
                  </h3>
                  <p className="text-xs text-amber-400/80 font-semibold tracking-widest uppercase mt-0.5">
                    Surat Cha Gaurinandan Mahotsav 2026
                  </p>
                </div>
              </div>
              
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <span>✨</span> Ganpati Bappa Morya <span>✨</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800/80 flex items-center gap-3.5">
                <span className="text-3xl">📅</span>
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Booking Dates</div>
                  <div className="text-xs sm:text-sm font-bold text-amber-200">14 Sept – 25 Sept 2026</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800/80 flex items-center gap-3.5">
                <span className="text-3xl">🌅</span>
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Morning Aarti</div>
                  <div className="text-sm font-black text-amber-400">09:00 AM</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800/80 flex items-center gap-3.5">
                <span className="text-3xl">🌙</span>
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Night Aarti</div>
                  <div className="text-sm font-black text-amber-400">08:00 PM</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800/80 flex items-center gap-3.5">
                <span className="text-3xl">👥</span>
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Max Capacity</div>
                  <div className="text-sm font-black text-amber-300">15 Bookings / Slot</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-400/90 font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <span>Please arrive <strong>20 minutes before</strong> the Aarti.</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                <span>Instant QR Pass Allocation</span>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* BOOKING CARDS (Morning & Night Aarti - 40% Larger Size & Premium Animations) */}
        {/* ========================================================================= */}
        <div ref={cardsRef} className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-2 font-heading">
              <span>🪔</span> Available Aarti Passes for {selectedDate}
            </h3>
            {slotData?.bookingOpen === false && (
              <span className="text-xs font-extrabold text-red-400 bg-red-950/60 px-4 py-1.5 rounded-full border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                🔴 Bookings Closed for this Date
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            
            {/* MORNING AARTI SLOT CARD */}
            {(() => {
              const morning = slotData?.morning || {
                slot: 'Morning Aarti',
                time: '09:00 AM',
                capacity: 15,
                booked: 0,
                remaining: 15,
                isFull: false,
              };
              const isFull = morning.isFull || morning.remaining <= 0;
              const isAlmostFull = !isFull && morning.remaining <= 3;
              const isClosed = slotData?.bookingOpen === false;
              const pctBooked = Math.min(100, Math.round((morning.booked / morning.capacity) * 100));

              return (
                <div className="relative group rounded-3xl p-8 sm:p-10 md:p-12 bg-zinc-950/90 border border-amber-500/30 backdrop-blur-2xl transition-all duration-500 hover:border-amber-500/60 hover:shadow-[0_15px_60px_rgba(212,175,55,0.2)] flex flex-col justify-between overflow-hidden hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />

                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(212,175,55,0.3)]">
                          🌅
                        </div>
                        <div>
                          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-1">
                            Morning Ritual
                          </div>
                          <h4 className="text-3xl sm:text-4xl font-black text-white font-heading">Morning Aarti</h4>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isFull ? (
                          <span className="px-4 py-2 rounded-full text-xs font-black bg-red-500/20 text-red-400 border border-red-500/50 flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                            🔴 FULLY BOOKED
                          </span>
                        ) : isAlmostFull ? (
                          <span className="px-4 py-2 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                            ⚠️ Few Seats Left
                          </span>
                        ) : (
                          <span className="px-4 py-2 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            🟢 AVAILABLE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time Display */}
                    <div className="mb-8">
                      <div className="text-xs uppercase font-bold text-zinc-500 tracking-wider mb-1">Aarti Time</div>
                      <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-400 font-heading">
                        09:00 AM
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-2 mb-8">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-400">Capacity Occupancy</span>
                        <span className="text-amber-400">{pctBooked}% Booked</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                          style={{ width: `${pctBooked}%` }}
                        />
                      </div>
                    </div>

                    {/* Seat Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 my-6 p-5 rounded-2xl bg-black/80 border border-zinc-800/90 text-center">
                      <div>
                        <div className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider">Booked</div>
                        <div className="text-xl sm:text-2xl font-bold text-zinc-200 mt-1">{morning.booked}</div>
                      </div>
                      <div className="border-x border-zinc-800">
                        <div className="text-[11px] text-amber-400 uppercase font-extrabold tracking-wider">Seats Left</div>
                        <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5">{morning.remaining}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider">Maximum</div>
                        <div className="text-xl sm:text-2xl font-bold text-zinc-400 mt-1">{morning.capacity}</div>
                      </div>
                    </div>
                  </div>

                  {/* Large Gold Book Now Button */}
                  <button
                    disabled={isFull || isClosed || loadingSlot}
                    onClick={() => handleOpenBooking('Morning Aarti')}
                    className={`w-full py-5 rounded-2xl font-extrabold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3 mt-6 ${
                      isFull || isClosed
                        ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                        : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black hover:brightness-110 shadow-[0_0_35px_rgba(212,175,55,0.4)] hover:shadow-[0_0_45px_rgba(212,175,55,0.6)] active:scale-[0.98]'
                    }`}
                  >
                    {isFull ? (
                      '🔴 FULLY BOOKED'
                    ) : isClosed ? (
                      'Bookings Closed'
                    ) : (
                      <>
                        <span>Book Morning Aarti Pass</span>
                        <span className="text-xl">→</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}

            {/* NIGHT AARTI SLOT CARD */}
            {(() => {
              const night = slotData?.night || {
                slot: 'Night Aarti',
                time: '08:00 PM',
                capacity: 15,
                booked: 0,
                remaining: 15,
                isFull: false,
              };
              const isFull = night.isFull || night.remaining <= 0;
              const isAlmostFull = !isFull && night.remaining <= 3;
              const isClosed = slotData?.bookingOpen === false;
              const pctBooked = Math.min(100, Math.round((night.booked / night.capacity) * 100));

              return (
                <div className="relative group rounded-3xl p-8 sm:p-10 md:p-12 bg-zinc-950/90 border border-amber-500/30 backdrop-blur-2xl transition-all duration-500 hover:border-amber-500/60 hover:shadow-[0_15px_60px_rgba(212,175,55,0.2)] flex flex-col justify-between overflow-hidden hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />

                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(212,175,55,0.3)]">
                          🌙
                        </div>
                        <div>
                          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-1">
                            Evening Celebration
                          </div>
                          <h4 className="text-3xl sm:text-4xl font-black text-white font-heading">Night Aarti</h4>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isFull ? (
                          <span className="px-4 py-2 rounded-full text-xs font-black bg-red-500/20 text-red-400 border border-red-500/50 flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                            🔴 FULLY BOOKED
                          </span>
                        ) : isAlmostFull ? (
                          <span className="px-4 py-2 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                            ⚠️ Few Seats Left
                          </span>
                        ) : (
                          <span className="px-4 py-2 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            🟢 AVAILABLE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time Display */}
                    <div className="mb-8">
                      <div className="text-xs uppercase font-bold text-zinc-500 tracking-wider mb-1">Aarti Time</div>
                      <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-400 font-heading">
                        08:00 PM
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-2 mb-8">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-400">Capacity Occupancy</span>
                        <span className="text-amber-400">{pctBooked}% Booked</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                          style={{ width: `${pctBooked}%` }}
                        />
                      </div>
                    </div>

                    {/* Seat Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 my-6 p-5 rounded-2xl bg-black/80 border border-zinc-800/90 text-center">
                      <div>
                        <div className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider">Booked</div>
                        <div className="text-xl sm:text-2xl font-bold text-zinc-200 mt-1">{night.booked}</div>
                      </div>
                      <div className="border-x border-zinc-800">
                        <div className="text-[11px] text-amber-400 uppercase font-extrabold tracking-wider">Seats Left</div>
                        <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5">{night.remaining}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider">Maximum</div>
                        <div className="text-xl sm:text-2xl font-bold text-zinc-400 mt-1">{night.capacity}</div>
                      </div>
                    </div>
                  </div>

                  {/* Large Gold Book Now Button */}
                  <button
                    disabled={isFull || isClosed || loadingSlot}
                    onClick={() => handleOpenBooking('Night Aarti')}
                    className={`w-full py-5 rounded-2xl font-extrabold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3 mt-6 ${
                      isFull || isClosed
                        ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                        : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black hover:brightness-110 shadow-[0_0_35px_rgba(212,175,55,0.4)] hover:shadow-[0_0_45px_rgba(212,175,55,0.6)] active:scale-[0.98]'
                    }`}
                  >
                    {isFull ? (
                      '🔴 FULLY BOOKED'
                    ) : isClosed ? (
                      'Bookings Closed'
                    ) : (
                      <>
                        <span>Book Night Aarti Pass</span>
                        <span className="text-xl">→</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}

          </div>
        </div>
      </div>

      {/* APPLE-STYLE GLASS BOOKING MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-zinc-950/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] my-8">
            
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            {!successBooking ? (
              <>
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    {selectedSlotName} Pass
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-2 font-heading">
                    Complete Your Aarti Booking
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Date: <strong className="text-amber-300">{selectedDate}</strong> • Slot: <strong className="text-amber-300">{selectedSlotName} ({selectedSlotName.includes('Morning') ? '09:00 AM' : '08:00 PM'})</strong>
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-medium">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        name="mobile"
                        required
                        maxLength={10}
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Your city (e.g. Surat)"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Number of Members * (1–5)</label>
                      <select
                        name="members"
                        value={formData.members}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                      >
                        <option value="1">1 Member</option>
                        <option value="2">2 Members</option>
                        <option value="3">3 Members</option>
                        <option value="4">4 Members</option>
                        <option value="5">5 Members (Max)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Special Note (Optional)</label>
                    <textarea
                      name="specialNote"
                      rows={2}
                      value={formData.specialNote}
                      onChange={handleInputChange}
                      placeholder="Any special assistance or notes..."
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="agreeRules"
                      name="agreeRules"
                      checked={formData.agreeRules}
                      onChange={handleInputChange}
                      className="mt-1 accent-amber-500"
                    />
                    <label htmlFor="agreeRules" className="text-xs text-zinc-400 leading-normal cursor-pointer">
                      I agree to temple guidelines & rules. I will arrive 20 minutes prior to Aarti.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black hover:brightness-110 shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all duration-300 mt-4 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Confirm Aarti Booking Pass</span>
                        <span>✨</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* SUCCESS SCREEN */
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full flex items-center justify-center mx-auto text-black text-3xl font-extrabold shadow-[0_0_30px_rgba(212,175,55,0.5)] animate-bounce">
                  ✓
                </div>

                <div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Booking Confirmed
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-2 font-heading">
                    Aarti Pass Generated!
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Confirmation sent via WhatsApp & Email
                  </p>
                </div>

                {/* Ticket Pass Preview Card */}
                <div className="bg-zinc-900 border border-amber-500/40 rounded-2xl p-6 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-4 py-1 bg-amber-500 text-black font-extrabold text-[10px] tracking-widest rounded-bl-xl uppercase">
                    VIP ACCESS PASS
                  </div>

                  <div className="text-center mb-4">
                    <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Booking ID</span>
                    <div className="text-2xl font-black text-amber-400 tracking-wider font-mono">
                      {successBooking.bookingId}
                    </div>
                  </div>

                  {qrCodeUrl && (
                    <div className="flex justify-center my-3">
                      <img
                        src={qrCodeUrl}
                        alt="Aarti Pass QR Code"
                        className="w-36 h-36 rounded-xl border-2 border-amber-500 p-1.5 bg-white shadow-md"
                      />
                    </div>
                  )}

                  <div className="space-y-2 text-xs border-t border-zinc-800 pt-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Name:</span>
                      <span className="font-semibold text-white">{successBooking.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Date:</span>
                      <span className="font-semibold text-amber-300">{successBooking.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Slot:</span>
                      <span className="font-semibold text-amber-300">
                        {successBooking.slot} ({successBooking.slot.includes('Morning') ? '09:00 AM' : '08:00 PM'})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Members:</span>
                      <span className="font-semibold text-white">{successBooking.members} Person(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Status:</span>
                      <span className="font-bold text-emerald-400">Confirmed</span>
                    </div>
                  </div>
                </div>

                {/* Download / WhatsApp Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="py-3 px-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span>📄</span> Download PDF Pass
                  </button>

                  <button
                    onClick={handleDownloadQR}
                    className="py-3 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span>📷</span> Download QR
                  </button>

                  <button
                    onClick={handleOpenWhatsApp}
                    className="py-3 px-3 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span>💬</span> WhatsApp
                  </button>
                </div>

                <button
                  onClick={() => {
                    setModalOpen(false);
                    setSuccessBooking(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-white underline pt-2 block mx-auto"
                >
                  Close Window
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </section>
  );
}
