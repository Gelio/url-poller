export default class Comparator {
  constructor(jsDiff) {
    this.cache = new Map();
    this.jsDiff = jsDiff;
  }

  getDiff(key, newValue) {
    let previousValue = this.cache.get(key) || '';
    return this.jsDiff.diffTrimmedLines(previousValue, newValue);
  }

  diffAndUpdate(key, newValue) {
    let diff = this.getDiff(key, newValue);
    this.cache.set(key, newValue);
    return diff;
  }

  getCache() {
    return this.cache;
  }
}
