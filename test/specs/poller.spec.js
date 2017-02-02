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

    let poller = new Poller({ interval, requests: urls }, { request: requestSpy });

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

    let poller = new Poller({ interval, requests: urls }, { request: requestSpy });

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

    let poller = new Poller({ interval, requests: urls }, { request: requestSpy });

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

    let poller = new Poller({ interval, requests: urls }, { request: requestSpy });

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

    let poller = new Poller({ interval, requests: urls }, { request });

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

    let poller = new Poller({ interval, requests: urls }, { request });

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

  it('should handle the same options as the _request_ library (pass them on)', () => {
    let interval = 5000;
    let requests = [
      {
        url: 'http://mock-url.com',
        auth: {
          user: 'user1',
          pass: 'secret',
        },
      },
    ];

    let request = (options) => {
      expect(options).toBeDefined();
      expect(options.url).toEqual('http://mock-url.com');
      expect(options.auth.user).toEqual('user1');
      expect(options.auth.pass).toEqual('secret');

      return Promise.resolve('response');
    };

    let poller = new Poller({ interval, requests }, { request });
    poller.start();
  });

  it('should include additional information in the observable', (done) => {
    let interval = 5000;
    let urls = ['mock-url1'];
    let counter = 0;
    // eslint-disable-next-line
    let request = url => Promise.resolve(`the body of the ${url}, ${counter++}`);

    let poller = new Poller({ interval, requests: urls }, { request });

    let diff$ = poller.getDiffObservable();
    let diffSubscriber = jasmine.createSpy('diffSubscriber spy');
    let subscription = diff$.subscribe(diffSubscriber);

    poller.start();
    setImmediate(() => {
      expect(diffSubscriber).toHaveBeenCalledWith(jasmine.objectContaining({
        isInitialDiff: true,
        url: 'mock-url1',
        diff: jasmine.any(Array),
      }));
      diffSubscriber.calls.reset();

      jasmine.clock().tick(interval + 100);
      setImmediate(() => {
        expect(diffSubscriber).toHaveBeenCalledWith(jasmine.objectContaining({
          isInitialDiff: false,
          url: 'mock-url1',
          diff: jasmine.any(Array),
        }));

        subscription.unsubscribe();
        done();
      });
    });
  });

  it('should emit errors on _request_ library errors', (done) => {
    let interval = 5000;
    let urls = ['mock-url1', 'mock-url2'];
    let counter = 0;
    let request = (url) => {
      if (url === 'mock-url1') {
        return Promise.reject(new Error('mock-url1 is forbidden'));
      }

      // eslint-disable-next-line
      return Promise.resolve(`Body for ${url}, ${counter++}`);
    };

    let poller = new Poller({ interval, requests: urls }, { request });

    let diff$ = poller.getDiffObservable();
    let diffSubscriber = jasmine.createSpy('diffSubscriber spy');
    let error$ = poller.getErrorObservable();
    let errorSubscriber = jasmine.createSpy('errorSubscriber spy');
    let diffSubscription = diff$.subscribe(diffSubscriber);
    let errorSubscription = error$.subscribe(errorSubscriber);

    poller.start();
    setImmediate(() => {
      expect(errorSubscriber).toHaveBeenCalled();
      expect(diffSubscriber).not.toHaveBeenCalledWith(jasmine.objectContaining({
        url: 'mock-url1',
      }));
      expect(diffSubscriber).toHaveBeenCalledWith(jasmine.objectContaining({
        url: 'mock-url2',
      }));
      errorSubscriber.calls.reset();
      diffSubscriber.calls.reset();

      jasmine.clock().tick(interval + 100);
      setImmediate(() => {
        expect(errorSubscriber).toHaveBeenCalled();
        expect(diffSubscriber).toHaveBeenCalled();

        errorSubscription.unsubscribe();
        diffSubscription.unsubscribe();
        done();
      });
    });
  });
});
