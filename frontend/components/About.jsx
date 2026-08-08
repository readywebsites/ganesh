'use client';

import { memo } from 'react';

function About() {
  return (
    <section id="about">
      <div className="section-wrapper">
        <div className="section-header">
          <span className="section-tag">Divine Aspects</span>
          <h2 className="heading-md section-title">THE PATH OF WISDOM</h2>
          <div className="section-divider"></div>
        </div>

        <div className="about-grid">
          {/* Card 1 */}
          <div className="about-card">
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C11.5 5 9.5 7.5 8 9.5C6 12 4.5 14 5.5 16.5C6.5 19 9.5 20.5 12 20.5C14.5 20.5 17.5 19 18.5 16.5C19.5 14 18 12 16 9.5C14.5 7.5 12.5 5 12 2Z" />
                <path d="M12 7C11.7 9 10.3 11 9 12.5C7.5 14 6.5 15 7.2 16.5C7.8 18 10 19 12 19C14 19 16.2 18 16.8 16.5C17.5 15 16.5 14 15 12.5C13.7 11 12.3 9 12 7Z" opacity="0.6" />
              </svg>
            </div>
            <h3>Pavitrata (Spiritual Purity)</h3>
            <p>
              The lotus symbolizes ultimate detachment from worldly desires, growing untainted in muddy water, reminding us to maintain purity of consciousness in all actions.
            </p>
            <div className="about-card-glow"></div>
          </div>

          {/* Card 2 */}
          <div className="about-card">
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24">
                <path d="M12 3L15 8.5L20.5 9L16.5 13L17.5 18.5L12 15.5L6.5 18.5L7.5 13L3.5 9L9 8.5L12 3Z" />
                <circle cx="12" cy="12" r="9" opacity="0.3" />
              </svg>
            </div>
            <h3>Vidya (Intellect & Wisdom)</h3>
            <p>
              Known as Vinayaka, Ganesha is the embodiment of supreme intellect and learning, guiding seekers toward higher discernment, knowledge, and self-realization.
            </p>
            <div className="about-card-glow"></div>
          </div>

          {/* Card 3 */}
          <div className="about-card">
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24">
                <path d="M12 2V22M12 2L8 6M12 2L16 6M7 10C7 14 17 14 17 10" />
              </svg>
            </div>
            <h3>Vighnaharta (Obstacle Remover)</h3>
            <p>
              Armed with the axe to cut worldly attachments and the noose to harness wild thoughts, Ganesha removes spiritual and material hurdles along our life path.
            </p>
            <div className="about-card-glow"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(About);

