export default class Cache {
  constructor() {
    this._cache = new Map();
  }

  get(key) {
    return this._cache.get(key);
  }

  set(key, value) {
    return this._cache.set(key, value);
  }
}
