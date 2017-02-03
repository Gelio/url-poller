import requestPromise from 'request-promise';
import { Subject } from 'rxjs';
import Comparator from './comparator';

const pollerConfig = {
  defaultInterval: 60 * 1000,
};

export default class Poller {

  constructor(
    { interval = pollerConfig.defaultInterval, requests = [] } = { },
    { request = requestPromise, comparator = new Comparator() } = { },
  ) {
    this.request = request;
    this.comparator = comparator;
    this.interval = interval;
    this.requests = requests;

    this.hasStarted = false;
    this.isPaused = false;

    this.diffSubject = new Subject();
    this.errorSubject = new Subject();
  }

  start() {
    if (this.hasStarted && !this.isPaused) {
      throw new Error('Poller has already started');
    }
    if (this.requests.length === 0) {
      throw new Error('Requests list is empty');
    }

    this.hasStarted = true;
    this.pollUrls();
    this.intervalID = setInterval(this.pollUrls.bind(this), this.interval);
  }

  stop() {
    this.pause();
    this.isPaused = false;
    this.comparator.getCache().clear();
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
    if (this.requests.length === 0) {
      this.pause();
    }

    this.requests.forEach(this.pollSingleUrl.bind(this));
  }

  pollSingleUrl(requestOptions) {
    let url = typeof requestOptions === 'object' ? requestOptions.url : requestOptions;
    this.request(requestOptions)
      .then((body) => {
        let isInitialDiff = !this.comparator.has(requestOptions);
        let diff = this.comparator.diffAndUpdate(requestOptions, body);
        let anyUpdates = diff.some(singleDiff => singleDiff.added || singleDiff.removed);
        if (anyUpdates || isInitialDiff) {
          this.diffSubject.next({
            isInitialDiff,
            requestOptions,
            url,
            diff,
            body,
          });
        }
      })
      .catch(error => this.errorSubject.next({
        requestOptions,
        error,
        url,
      }));
  }

  getDiffObservable() {
    return this.diffSubject.asObservable();
  }

  getErrorObservable() {
    return this.errorSubject.asObservable();
  }
}
