import './blueskytracker.css';
import trackerLogo from '../assets/tracker-manager-bluesky.png';

export default function TrackerBanner({ className = "tracker-banner", subtitle = "👥 Track followers & unfollowers 📊 Real-time stats - Start Tracking!" }) {
  return (
    <a 
      className={className} 
      href="https://blueskytracker.app?utm_source=clearsky.app&utm_medium=referral&utm_campaign=banner_promotion" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      <div className="tracker-banner-content">
        <img 
          src={trackerLogo} 
          alt="" 
          className="tracker-logo"
        />
        <div className="tracker-text">
          <div className="tracker-title">Tracker - Manager for Bluesky</div>
          <div className="tracker-subtitle">
            {subtitle}
          </div>
        </div>
      </div>
    </a>
  );
}
