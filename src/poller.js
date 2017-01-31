import requestPromise from 'request-promise';
import Comparator from './comparator';

const pollerConfig = {
  defaultInterval: 60 * 1000,
};

export default class Poller {
  constructor(
    { interval = pollerConfig.defaultInterval, urls = [] } = { },
    { request = requestPromise, comparator = new Comparator() } = { },
  ) {
    this.request = request;
    this.comparator = comparator;
    this.interval = interval;
    this.urls = urls;

    this.hasStarted = false;
    this.isPaused = false;
  }

  start() {
    if (this.hasStarted && !this.isPaused) {
      throw new Error('Poller has already started');
    }
    if (this.urls.length === 0) {
      throw new Error('URL list is empty');
    }

    this.hasStarted = true;
    this.pollUrls();
    this.intervalID = setInterval(this.pollUrls.bind(this), this.interval);
  }

  stop() {
    this.pause();
    this.isPaused = false;
  }

  pause() {
    if (!this.hasStarted) {
      throw new Error('Poller has not been started yet');
    }

    clearInterval(this.intervalID);
    this.intervalID = null;

    this.isPaused = true;
  }

  resume() {
    if (!this.hasStarted) {
      throw new Error('Poller has not been started yet');
    }

    this.start();
  }


  pollUrls() {
    if (this.urls.length === 0) {
      this.pause();
    }

    this.urls.forEach(this.pollSingleUrl.bind(this));
  }

  pollSingleUrl(url) {
    this.request(url)
      .then((body) => {
        let diff = this.comparator.diffAndUpdate(url, body);

        let anyUpdates = diff.some(singleDiff => singleDiff.added || singleDiff.removed);
        if (anyUpdates) {
          // push diff
        }
      });
  }
}
