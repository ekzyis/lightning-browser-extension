import utils from "../../../common/lib/utils";
import { Battery } from "../../../types";
// import GitHubRepo from "./GitHubRepo";
import Monetization from "./Monetization";
import Twitter from "./Twitter";
import YouTubeVideo from "./YouTubeVideo";
// import YouTubeChannel from "./YouTubeChannel";

declare global {
  interface Window {
    LBE_LIGHTNING_DATA: [Battery] | null;
    LBE_EXTRACT_LIGHTNING_DATA_RUNNING: boolean;
  }
}

const enhancements = [Monetization, Twitter, YouTubeVideo];

async function LBE_EXTRACT_LIGHTNING_DATA() {
  // prevent the function from being called multiple times
  // this could happen because the browser.tabs.onUpdated event is fired multiple times
  if (window["LBE_EXTRACT_LIGHTNING_DATA_RUNNING"]) {
    return;
  }
  // reset potential previous data (e.g. if navigation happens through JS and not a full page load)
  window.LBE_LIGHTNING_DATA = null;
  // get maching extractors/enhancements for the current URL
  // NOTE: this does not mean that data can be found. Because of that we run all possible ones
  const matching = enhancements.filter((e) => {
    return document.location.toString().match(e.urlMatcher);
  });

  // Set the running flag. This prevents the function from running multiple times
  // because of the way web navigation events work the function call could be triggered multiple times
  // there is no clear event to identify that a user has navigated on the website. we rely on the `browser.tabs.onUpdated` event.
  window.LBE_EXTRACT_LIGHTNING_DATA_RUNNING = true;

  const batteriesRunning = matching.map((enhancement) => {
    return enhancement.battery().then((data) => {
      if (data) {
        window.LBE_LIGHTNING_DATA = data;
        utils.call("setIcon", { icon: "active" });
      }
    });
  });
  // reset lock
  await Promise.all(batteriesRunning);
  window.LBE_EXTRACT_LIGHTNING_DATA_RUNNING = false;
  return window.LBE_LIGHTNING_DATA;
}
export default LBE_EXTRACT_LIGHTNING_DATA;
