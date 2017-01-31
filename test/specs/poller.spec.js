import Poller from '../../src/poller';

describe('Poller', () => {
  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should throw an error when starting with an empty URL list', () => {
    let poller = new Poller();

    expect(poller.start).toThrow();
  });

  it('should query urls immediately after starting', () => {
    let interval = 5000;
    let urls = [
      'mock-urls',
      'will-not-be-called',
      'because a mock object is used',
      'instead of a proper request library',
    ];
    let request = url => Promise.resolve(`the body of the ${url}`);
    let requestSpy = jasmine.createSpy('request spy', request).and.callThrough();

    let poller = new Poller({ interval, urls }, { request: requestSpy });

    expect(requestSpy).not.toHaveBeenCalled();
    poller.start();
    expect(requestSpy).toHaveBeenCalledTimes(urls.length);
  });

  it('should query urls after a specified interval', () => {
    let interval = 5000;
    let urls = [
      'mock-urls',
      'will-not-be-called',
      'because a mock object is used',
      'instead of a proper request library',
    ];
    let request = url => Promise.resolve(`the body of the ${url}`);
    let requestSpy = jasmine.createSpy('request spy', request).and.callThrough();

    let poller = new Poller({ interval, urls }, { request: requestSpy });

    poller.start();

    requestSpy.calls.reset();
    jasmine.clock().tick(interval + 100);
    expect(requestSpy).toHaveBeenCalledTimes(urls.length);
  });

  it('should query urls after several intervals', () => {
    let interval = 5000;
    let urls = [
      'mock-urls',
      'will-not-be-called',
      'because a mock object is used',
      'instead of a proper request library',
    ];
    let request = url => Promise.resolve(`the body of the ${url}`);
    let requestSpy = jasmine.createSpy('request spy', request).and.callThrough();

    let poller = new Poller({ interval, urls }, { request: requestSpy });

    poller.start();

    requestSpy.calls.reset();
    jasmine.clock().tick((interval + 100) * 5);
    expect(requestSpy).toHaveBeenCalledTimes(urls.length * 5);
  });

  it('should pause and resume querying', () => {
    let interval = 5000;
    let urls = [
      'mock-urls',
      'will-not-be-called',
      'because a mock object is used',
      'instead of a proper request library',
    ];
    let request = url => Promise.resolve(`the body of the ${url}`);
    let requestSpy = jasmine.createSpy('requestSpy', request).and.callThrough();

    let poller = new Poller({ interval, urls }, { request: requestSpy });

    poller.start();

    requestSpy.calls.reset();

    poller.pause();
    jasmine.clock().tick(interval + 100);
    expect(requestSpy).not.toHaveBeenCalled();

    poller.resume();
    expect(requestSpy).toHaveBeenCalledTimes(urls.length);

    requestSpy.calls.reset();
    jasmine.clock().tick(interval + 100);
    expect(requestSpy).toHaveBeenCalledTimes(urls.length);
  });

  it('should throw when trying to pause before starting', () => {
    let poller = new Poller({ interval: 5000, urls: ['a'] });
    expect(poller.pause).toThrow();
  });

  it('should throw when trying to resume before starting', () => {
    let poller = new Poller({ interval: 5000, urls: ['a'] });
    expect(poller.resume).toThrow();
  });

  it('should throw when trying to stop before starting', () => {
    let poller = new Poller({ interval: 5000, urls: ['a'] });
    expect(poller.stop).toThrow();
  });

  it('should send diffs via observable', (done) => {
    let interval = 5000;
    let urls = ['mock-url'];
    let callCount = 0;
    // eslint-disable-next-line
    let request = url => Promise.resolve(`the body of the ${url}, call count ${callCount++}`);

    let poller = new Poller({ interval, urls }, { request });

    let diff$ = poller.getDiffObservable();
    let diffSubscriber = jasmine.createSpy('diffSubscriber spy');
    let subscription = diff$.subscribe(diffSubscriber);

    poller.start();
    // using setImmediate due to native promises in request being asynchronous
    setImmediate(() => {
      expect(diffSubscriber).toHaveBeenCalledTimes(urls.length);
      diffSubscriber.calls.reset();

      jasmine.clock().tick(interval + 100);
      setImmediate(() => {
        expect(diffSubscriber).toHaveBeenCalledTimes(urls.length);

        subscription.unsubscribe();
        done();
      });
    });
  });

  it('should not send diffs when nothing has changed', (done) => {
    let interval = 5000;
    let urls = ['mock-url1', 'mock-url2'];
    let request = url => Promise.resolve(`the body of the ${url}`);

    let poller = new Poller({ interval, urls }, { request });

    let diff$ = poller.getDiffObservable();
    let diffSubscriber = jasmine.createSpy('diffSubscriber spy');
    let subscription = diff$.subscribe(diffSubscriber);

    poller.start();
    setImmediate(() => {
      expect(diffSubscriber).toHaveBeenCalledTimes(urls.length);
      diffSubscriber.calls.reset();

      jasmine.clock().tick(interval + 100);
      setImmediate(() => {
        expect(diffSubscriber).not.toHaveBeenCalled();

        subscription.unsubscribe();
        done();
      });
    });
  });
});
