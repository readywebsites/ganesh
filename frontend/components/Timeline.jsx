'use client';

import { useState, useEffect, memo } from 'react';
import { getApiUrl } from '@/lib/api';

const INITIAL_EVENTS = [
  {
    order: 1,
    day: 'Day 01 | Bhadrapada Chaturthi',
    title: 'Pran Pratishtha (Divine Invocation)',
    desc: 'Welcome the Lord with traditional Dhol Tasha drums. The placement of the idol is accompanied by rigorous Vedic chants to invoke the soul of Ganesha into the clay Murti.',
    time: '08:30 AM - 11:30 AM',
    location: 'Main Temple Hall',
  },
  {
    order: 2,
    day: 'Day 05 | Bhadrapada Ashtami',
    title: 'Maha Chhappan Bhog Offering',
    desc: 'A glorious visual offering of 56 varieties of handcrafted Modaks, traditional sweets, and sacred fruits. Prepared by master chefs and devotees with utmost purity.',
    time: '12:30 PM onwards',
    location: 'Prasad Mandap',
  },
  {
    order: 3,
    day: 'Day 08 | Bhadrapada Ekadashi',
    title: 'Divine Maha Aarti & Jagran',
    desc: 'A spectacular evening filled with hundreds of brass lamps, ringing bells, and classical performance. Singing devotional bhajans that run late into the night.',
    time: '07:00 PM - 11:00 PM',
    location: 'Sanctuary Courtyard',
  },
  {
    order: 4,
    day: 'Day 10 | Anant Chaturdashi',
    title: 'Visarjan (Divine Immersion)',
    desc: 'The emotional send-off procession under saffron colors. Immersing the eco-friendly clay idol in water, symbolizing the cycle of form returning to formlessness.',
    time: '09:00 AM onwards',
    location: 'Sacred Water Ghats',
  },
];

function Timeline() {
  const [eventsList, setEventsList] = useState(INITIAL_EVENTS);

  useEffect(() => {
    let isMounted = true;

    async function fetchEvents() {
      try {
        const res = await fetch(getApiUrl('/events/'));
        if (!res.ok) return;
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.data || data.events;
        if (Array.isArray(rawList) && rawList.length > 0 && isMounted) {
          const sorted = [...rawList].sort(
            (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)
          );
          setEventsList(sorted);
        }
      } catch (err) {
        console.warn('Using initial celebration schedule:', err);
      }
    }

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

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

          {eventsList.map((evt, idx) => {
            // Automatic alternating zig-zag layout:
            // 1st (idx 0) -> LEFT (timeline-item)
            // 2nd (idx 1) -> RIGHT (timeline-item even)
            // 3rd (idx 2) -> LEFT (timeline-item)
            // 4th (idx 3) -> RIGHT (timeline-item even)
            // Continues automatically for any number of future events
            const isEven = idx % 2 === 1;
            const dayText = evt.day || evt.date || '';
            const descText = evt.desc || evt.description || '';

            return (
              <div
                key={evt._id || evt.id || idx}
                className={`timeline-item ${isEven ? 'even' : ''}`}
              >
                <div className="timeline-dot"></div>
                <div className="timeline-card">
                  {dayText && <span className="timeline-date">{dayText}</span>}
                  <h3>{evt.title}</h3>
                  <p>{descText}</p>
                  <div className="timeline-meta">
                    {evt.time && <span>⏱ {evt.time}</span>}
                    {evt.location && <span>📍 {evt.location}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default memo(Timeline);

