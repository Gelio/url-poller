export default class Comparator {
  constructor(jsDiff) {
    this._cache = new Map();
    this._jsDiff = jsDiff;
  }

  getDiff(key, newValue) {
    let previousValue = this._cache.get(key) || '';
    return this._jsDiff.diffTrimmedLines(previousValue, newValue);
  }

  diffAndUpdate(key, newValue) {
    let diff = this.getDiff(key, newValue);
    this._cache.set(key, newValue);
    return diff;
  }

  getCache() {
    return this._cache;
  }
}
