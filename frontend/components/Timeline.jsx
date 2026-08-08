'use client';

import { memo } from 'react';

const events = [
  {
    day: 'Day 01 | Bhadrapada Chaturthi',
    title: 'Pran Pratishtha (Divine Invocation)',
    desc: 'Welcome the Lord with traditional Dhol Tasha drums. The placement of the idol is accompanied by rigorous Vedic chants to invoke the soul of Ganesha into the clay Murti.',
    time: '08:30 AM - 11:30 AM',
    location: 'Main Temple Hall',
    even: false,
  },
  {
    day: 'Day 05 | Bhadrapada Ashtami',
    title: 'Maha Chhappan Bhog Offering',
    desc: 'A glorious visual offering of 56 varieties of handcrafted Modaks, traditional sweets, and sacred fruits. Prepared by master chefs and devotees with utmost purity.',
    time: '12:30 PM onwards',
    location: 'Prasad Mandap',
    even: true,
  },
  {
    day: 'Day 08 | Bhadrapada Ekadashi',
    title: 'Divine Maha Aarti & Jagran',
    desc: 'A spectacular evening filled with hundreds of brass lamps, ringing bells, and classical performance. Singing devotional bhajans that run late into the night.',
    time: '07:00 PM - 11:00 PM',
    location: 'Sanctuary Courtyard',
    even: false,
  },
  {
    day: 'Day 10 | Anant Chaturdashi',
    title: 'Visarjan (Divine Immersion)',
    desc: 'The emotional send-off procession under saffron colors. Immersing the eco-friendly clay idol in water, symbolizing the cycle of form returning to formlessness.',
    time: '09:00 AM onwards',
    location: 'Sacred Water Ghats',
    even: true,
  },
];

function Timeline() {
  return (
    <section id="events">
      <div className="section-wrapper">
        <div className="section-header">
          <span className="section-tag">Festivities Program</span>
          <h2 className="heading-md section-title">THE CELEBRATION SCHEDULE</h2>
          <div className="section-divider"></div>
        </div>

        <div className="timeline-container">
          <div className="timeline-line"></div>
          <div className="timeline-progress" style={{ height: '100%' }}></div>

          {events.map((evt, idx) => (
            <div key={idx} className={`timeline-item ${evt.even ? 'even' : ''}`}>
              <div className="timeline-dot"></div>
              <div className="timeline-card">
                <span className="timeline-date">{evt.day}</span>
                <h3>{evt.title}</h3>
                <p>{evt.desc}</p>
                <div className="timeline-meta">
                  <span>⏱ {evt.time}</span>
                  <span>📍 {evt.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Timeline);

