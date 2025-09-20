import './blueskytracker.css';

export default function TrackerBanner({ className = "tracker-banner" }) {
  return (
    <a 
      className={className} 
      href="https://blueskytracker.app" 
      target="_blank" 
      rel="noreferrer"
    >
      <div className="tracker-banner-content">
        <img 
          src="/assets/tracker-manager-bluesky.png" 
          alt="Tracker - Manager for Bluesky" 
          className="tracker-logo"
        />
        <div className="tracker-text">
          <div className="tracker-title">Tracker - Manager for Bluesky</div>
          <div className="tracker-subtitle">
            👥 Track followers & unfollowers · 📊 Real-time stats - Try it now!
          </div>
        </div>
      </div>
    </a>
  );
}
