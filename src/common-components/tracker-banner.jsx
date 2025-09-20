import './blueskytracker.css';
import trackerLogo from '../assets/tracker-manager-bluesky.png';

export default function TrackerBanner({ className = "tracker-banner", subtitle = "👥 Track followers & unfollowers 📊 Real-time stats - Start Tracking!" }) {
  const handleClick = (e) => {
    // Add UTM parameters for analytics tracking
    const url = new URL("https://blueskytracker.app");
    url.searchParams.set('utm_source', 'clearsky.app');
    url.searchParams.set('utm_medium', 'referral');
    url.searchParams.set('utm_campaign', 'banner_promotion');
    
    // Open in new tab with tracking parameters
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
    e.preventDefault();
  };

  return (
    <a 
      className={className} 
      href="https://blueskytracker.app?utm_source=clearsky.app&utm_medium=referral&utm_campaign=banner_promotion" 
      target="_blank" 
      rel="noreferrer"
      onClick={handleClick}
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
