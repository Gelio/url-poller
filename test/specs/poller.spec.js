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
});
