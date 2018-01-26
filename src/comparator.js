import * as jsDiff from 'diff';

export default class Comparator {
  constructor(_jsDiff = jsDiff) {
    this.cache = new Map();
    this.jsDiff = _jsDiff;
  }

  getDiff(key, newValue) {
    const previousValue = this.cache.get(key) || '';
    return this.jsDiff.diffTrimmedLines(previousValue, newValue);
  }

  diffAndUpdate(key, newValue) {
    const diff = this.getDiff(key, newValue);
    this.cache.set(key, newValue);
    return diff;
  }

  getCache() {
    return this.cache;
  }

  has(key) {
    return this.cache.has(key);
  }
}
