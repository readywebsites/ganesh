'use client';

import { useState, memo } from 'react';
import { getApiUrl, extractErrorMessage, getFriendlyErrorMessage } from '@/lib/api';

const initialFormData = {
  name: '',
  mobile: '',
  email: '',
  city: '',
  address: '',
  occupation: '',
  volunteer: 'Aarti & Ritual Assistance',
};

function Membership() {
  const [formData, setFormData] = useState(initialFormData);
  const [submittedData, setSubmittedData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [membershipId, setMembershipId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const cleanMobile = (formData.mobile || '').replace(/[\s\-\(\)\+]/g, '');
    const validMobile =
      cleanMobile.startsWith('91') && cleanMobile.length === 12
        ? cleanMobile.slice(2)
        : cleanMobile;

    if (!/^\d{10}$/.test(validMobile)) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    if (!formData.name || formData.name.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters long.');
      setLoading(false);
      return;
    }

    const payload = {
      full_name: formData.name.trim(),
      name: formData.name.trim(),
      phone: validMobile,
      mobile: validMobile,
      email: formData.email.trim(),
      city: formData.city.trim() || 'Surat',
      address: formData.address.trim(),
      occupation: formData.occupation.trim(),
      volunteer: formData.volunteer || 'Aarti & Ritual Assistance',
    };

    try {
      const response = await fetch(getApiUrl('/memberships/'), {
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
          'Unable to submit membership registration. Please check the entered details.'
        );
        throw new Error(validationMessage);
      }

      if (data && data.success === false) {
        const errorMsg = extractErrorMessage(data, response.status, 'Membership registration failed.');
        throw new Error(errorMsg);
      }

      // Backend confirmed success
      const memberInfo = data?.membership || data?.data || data || {};
      const assignedId =
        data?.membershipId ||
        memberInfo.membership_id ||
        memberInfo.membershipId ||
        `GMN-2026-${String(memberInfo.id || '').replace(/-/g, '').slice(0, 6).toUpperCase() || 'SURAT'}`;

      setMembershipId(assignedId);
      if (data?.qrCode || (data?.data && data.data.qrCode)) {
        setQrCode(data.qrCode || data.data.qrCode);
      }
      setSubmittedData({ ...formData, mobile: validMobile });
      setSubmitted(true);
      setFormData(initialFormData);
    } catch (err) {
      console.error('Membership submission error:', err);
      setErrorMsg(getFriendlyErrorMessage(err, 'Unable to submit membership. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const downloadPassCard = () => {
    const dataToUse = submittedData || formData;
    const name = dataToUse.name || 'Devotee';
    const id = membershipId || 'SURAT-GMN-2026';
    const role = dataToUse.volunteer || 'Bhakta Member';
    const city = dataToUse.city || 'Surat';

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 700);
    grad.addColorStop(0, '#160e06');
    grad.addColorStop(0.5, '#261608');
    grad.addColorStop(1, '#0d0803');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 700);

    // Frame
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 1160, 660);

    ctx.fillStyle = '#f6e0a4';
    ctx.fillRect(20, 20, 1160, 12);

    // Header Title
    ctx.fillStyle = '#f6e0a4';
    ctx.font = 'bold 44px Arial, sans-serif';
    ctx.fillText('સુરત ચા ગૌરીનંદન', 80, 110);

    ctx.fillStyle = '#ff9933';
    ctx.font = '22px Arial, sans-serif';
    ctx.fillText('GANESH MAHOTSAV 2026 — OFFICIAL BHAKTA PASS', 80, 150);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 180);
    ctx.lineTo(1120, 180);
    ctx.stroke();

    // Data Fields
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('MEMBER NAME', 80, 240);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.fillText(name, 80, 300);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('MEMBERSHIP ID', 80, 380);

    ctx.fillStyle = '#f6e0a4';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(id, 80, 430);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('VOLUNTEER ROLE', 550, 380);

    ctx.fillStyle = '#ff9933';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText(role, 550, 430);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('CITY & SECTOR', 80, 520);

    ctx.fillStyle = '#cccccc';
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText(city, 80, 565);

    // QR Box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(920, 380, 200, 200);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(920, 380, 200, 200);

    ctx.fillStyle = '#160e06';
    ctx.fillRect(940, 400, 45, 45);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(948, 408, 29, 29);
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(954, 414, 17, 17);

    ctx.fillStyle = '#160e06';
    ctx.fillRect(1055, 400, 45, 45);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1063, 408, 29, 29);
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(1069, 414, 17, 17);

    ctx.fillStyle = '#160e06';
    ctx.fillRect(940, 515, 45, 45);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(948, 523, 29, 29);
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(954, 529, 17, 17);

    ctx.fillStyle = '#160e06';
    ctx.fillRect(1000, 460, 40, 40);

    const a = document.createElement('a');
    a.download = `${name.replace(/\s+/g, '_')}_Ganesh_Mahotsav_Membership_Card.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const memberDisplayName = (submittedData || formData).name || 'Devotee';
  const memberDisplayRole = (submittedData || formData).volunteer || 'Aarti & Ritual Assistance';
  const memberDisplayCity = (submittedData || formData).city || 'Surat';

  return (
    <section id="membership">
      <div className="section-wrapper">
        <div className="section-header">
          <span className="section-tag">Divine Fraternity</span>
          <h2 className="heading-md section-title">BHAKTA MEMBERSHIP</h2>
          <div className="section-divider"></div>
        </div>

        <div className="membership-container">
          {!submitted ? (
            <div className="membership-card glass-card gold-pulse-border">
              <h3 className="membership-card-title">Join The Sacred Mahotsav Sevak Family</h3>
              <p className="membership-card-desc">
                Register as an official Bhakta Member to receive sacred Utsav updates, VIP Darshan privileges, and participate in volunteer Sewa activities.
              </p>

              <form className="membership-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input"
                      placeholder="e.g. Rajesh Kumar Sharma"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mobile">Mobile Number *</label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      className="form-input"
                      placeholder="e.g. +91 98765 43210"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-input"
                      placeholder="e.g. rajesh@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="form-input"
                      placeholder="e.g. Surat, Gujarat"
                      required
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">Full Address *</label>
                    <textarea
                      id="address"
                      name="address"
                      className="form-input form-textarea"
                      rows="2"
                      placeholder="Your residential address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="occupation">Occupation</label>
                    <input
                      type="text"
                      id="occupation"
                      name="occupation"
                      className="form-input"
                      placeholder="e.g. Businessman / Engineer / Teacher"
                      value={formData.occupation}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="volunteer">Volunteer Sewa Interest *</label>
                    <select
                      id="volunteer"
                      name="volunteer"
                      className="form-input form-select"
                      required
                      value={formData.volunteer}
                      onChange={handleChange}
                    >
                      <option value="Aarti & Ritual Assistance">Aarti & Ritual Assistance</option>
                      <option value="Event & Crowd Guidance">Event & Crowd Guidance</option>
                      <option value="Prasadam Distribution Sewa">Prasadam Distribution Sewa</option>
                      <option value="Media & Photography Team">Media & Photography Team</option>
                      <option value="Vedic Chanting & Music">Vedic Chanting & Music</option>
                      <option value="Eco-Pond & Cleanliness Sewa">Eco-Pond & Cleanliness Sewa</option>
                    </select>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 mb-4 text-sm text-red-800 bg-red-100/80 border border-red-300 rounded-md">
                    {errorMsg}
                  </div>
                )}

                <div className="form-submit-wrapper">
                  <button type="submit" disabled={loading} className="btn-primary shimmer-btn disabled:opacity-50">
                    <span>{loading ? 'Processing Registration...' : 'Complete Membership Registration'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="membership-success-card glass-card gold-pulse-border">
              <div className="success-header">
                <div className="success-checkmark-circle">
                  <svg viewBox="0 0 52 52">
                    <circle className="checkmark-circle" cx="26" cy="26" r="23" fill="none" />
                    <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                </div>
                <h3 className="success-title">Pranam & Heartfelt Gratitude!</h3>
                <p className="success-message">
                  You are now an Official Bhakta Member of <strong>Surat Cha Gaurinandan Mahotsav 2026</strong>.
                </p>
              </div>

              {/* Digital Pass Card Display */}
              <div className="digital-card-preview-wrapper">
                <div className="digital-membership-card">
                  <div className="card-header">
                    <img src="/logo/official_logo.webp" alt="Logo" className="card-logo" width="40" height="40" loading="lazy" />
                    <div className="card-trust-name">
                      <h4>સુરત ચા ગૌરીનંદન</h4>
                      <span>Ganesh Mahotsav 2026 Official Pass</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="card-info-col">
                      <div className="card-field">
                        <span className="card-label">MEMBER NAME</span>
                        <h3 className="card-value">{memberDisplayName}</h3>
                      </div>
                      <div className="card-row">
                        <div className="card-field">
                          <span className="card-label">MEMBERSHIP ID</span>
                          <span className="card-id-highlight">{membershipId}</span>
                        </div>
                        <div className="card-field">
                          <span className="card-label">VOLUNTEER ROLE</span>
                          <span className="card-role-highlight">{memberDisplayRole}</span>
                        </div>
                      </div>
                      <div className="card-field">
                        <span className="card-label">CITY & SECTOR</span>
                        <span className="card-text-muted">{memberDisplayCity}</span>
                      </div>
                    </div>
                    <div className="card-qr-col">
                      <div className="card-qr-box">
                        <svg viewBox="0 0 100 100">
                          <rect width="100" height="100" fill="#ffffff" />
                          <rect x="5" y="5" width="25" height="25" fill="#160e06" />
                          <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                          <rect x="12" y="12" width="11" height="11" fill="#d4af37" />

                          <rect x="70" y="5" width="25" height="25" fill="#160e06" />
                          <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                          <rect x="77" y="12" width="11" height="11" fill="#d4af37" />

                          <rect x="5" y="70" width="25" height="25" fill="#160e06" />
                          <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                          <rect x="12" y="77" width="11" height="11" fill="#d4af37" />

                          <rect x="35" y="6" width="6" height="12" fill="#160e06" />
                          <rect x="45" y="16" width="12" height="6" fill="#d4af37" />
                          <rect x="60" y="8" width="6" height="6" fill="#160e06" />
                          <rect x="36" y="26" width="18" height="6" fill="#160e06" />
                          <rect x="36" y="44" width="6" height="18" fill="#d4af37" />
                          <rect x="46" y="38" width="12" height="12" fill="#160e06" />
                          <rect x="66" y="34" width="18" height="6" fill="#160e06" />
                          <rect x="60" y="44" width="6" height="22" fill="#d4af37" />
                          <rect x="76" y="44" width="18" height="6" fill="#160e06" />
                          <rect x="36" y="70" width="18" height="12" fill="#160e06" />
                          <rect x="40" y="86" width="6" height="8" fill="#d4af37" />
                          <rect x="58" y="74" width="12" height="6" fill="#160e06" />
                          <rect x="74" y="70" width="6" height="18" fill="#d4af37" />
                          <rect x="66" y="86" width="16" height="8" fill="#160e06" />
                          <circle cx="50" cy="50" r="4" fill="#d4af37" />
                        </svg>
                      </div>
                      <span className="qr-caption">Scan for Verification</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-actions-wrapper flex flex-col items-center">
                <button className="btn-primary shimmer-btn" onClick={downloadPassCard}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current mr-2">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                  </svg>
                  <span>Download Digital Membership Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setSubmittedData(null);
                    setErrorMsg('');
                  }}
                  className="mt-3 text-xs text-amber-400 hover:text-amber-300 underline transition-colors cursor-pointer"
                >
                  + Register Another Bhakta Member
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(Membership);

