// @ts-check
import logoDay from './assets/CleardayLarge.png';
import logoNight from './assets/ClearnightLarge.png';
import logoDaySmall from './assets/CleardaySmall.png';
import logoNightSmall from './assets/ClearnightSmall.png';

/**
 * set the src of an img element to a themed logo based on current time
 * @param {HTMLImageElement} imageEl
 */
export function setLogo(imageEl) {
  const images = getLogoImage();
  imageEl.src = images.large;
  imageEl.srcset = images.srcSet;
  imageEl.sizes = '100vw';
}

export function getLogoImage() {
  const currentTime = new Date();
  const hours = currentTime.getHours();

  const DAY_START = 6;
  const DAY_END = 18;

  let useDay = false;
  const refreshIn = new Date(currentTime);
  refreshIn.setMinutes(0);
  refreshIn.setSeconds(0);
  refreshIn.setMilliseconds(0);

  if (hours < DAY_START) {
    refreshIn.setHours(DAY_START);
  } else if (hours > DAY_END) {
    refreshIn.setHours(DAY_START);
    refreshIn.setDate(refreshIn.getDate() + 1);
  } else {
    useDay = true;
    refreshIn.setHours(DAY_END);
  }

  const large = useDay ? logoDay : logoNight;
  const small = useDay ? logoDaySmall : logoNightSmall;
  return {
    large,
    small,
    srcSet: `${small} 800w, ${large} 1700w`,
    refreshInMsec: refreshIn.getTime() - currentTime.getTime(),
  };
}
