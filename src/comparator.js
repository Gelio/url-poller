export default class Comparator {
  constructor(jsDiff, cache) {
    this._jsDiff = jsDiff;
    this._cache = cache;
  }

  getDiff(key, newValue) {
    let previousValue = this._cache.get(key) || '';
    return this._jsDiff.diffTrimmedLines(previousValue, newValue);
  }
}
