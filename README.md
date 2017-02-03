# URL Poller
[![Build Status](https://travis-ci.org/Gelio/url-poller.svg?branch=master)](https://travis-ci.org/Gelio/url-poller)
[![Code Climate](https://codeclimate.com/github/Gelio/url-poller/badges/gpa.svg)](https://codeclimate.com/github/Gelio/url-poller)
[![Test Coverage](https://codeclimate.com/github/Gelio/url-poller/badges/coverage.svg)](https://codeclimate.com/github/Gelio/url-poller/coverage)
[![Issue Count](https://codeclimate.com/github/Gelio/url-poller/badges/issue_count.svg)](https://codeclimate.com/github/Gelio/url-poller)
[![npm](https://img.shields.io/npm/dm/multiple-url-poller.svg)](https://www.npmjs.com/package/multiple-url-poller)
[![npm](https://img.shields.io/npm/v/multiple-url-poller.svg)](https://www.npmjs.com/package/multiple-url-poller)

A fully customizable url poller and notifier

# Features
* polls multiple urls
* customizable poll interval
* creates a diff between the previous and current version upon changes
* handles HTTP authentication and any other option from
  the [request](https://github.com/request/request) library
* emits changes and notifies using [RxJS](https://github.com/ReactiveX/RxJS)
  giving you lots of possibilities to fit your needs



# Set up
In the console run:
``` bash
npm install multiple-url-poller
```

Include the poller:
``` javascript
const Poller = require('multiple-url-poller').Poller;
```




# Example
## Polling a website that displays current time and log diffs to the console

``` javascript
const Poller = require('multiple-url-poller').Poller;

let interval = 5 * 1000;  // time in miliseconds
let urls = ['https://time.is/'];
let poller = new Poller({ interval, requests: urls });
let diffs$ = poller.getDiffObservable();
let subscription = diffs$
  .subscribe(changesNotification => console.log('New diff', changesNotification.diff));

poller.start();
```


## Polling a website that requires user authentication
``` javascript
const Poller = require('multiple-url-poller').Poller;

let interval = 5 * 1000;  // time in ms
let requests = [{
  url: 'https://supersecurewebsite.com/guarded-resource',
  auth: {
    user: 'username',
    pass: 'secretpassword'
  }
}];
let poller = new Poller({ interval, requests });
let diffs$ = poller.getDiffObservable();
let subscription = diffs$
  .subscribe(changesNotification => console.log('New diff', changesNotification.diff));

poller.start();
```

# Documentation
The idea of this poller is to fetch contents of websites in certain intervals and
compare consecutive ones to check whether any changes were introduces to those websites.

One use case of such a package is an email notifier for college test results.
In my college we usually do not get notified at all about the results from tests,
so by setting up this poller to query lectrers' websites I can send myself (and other people
from my class) email (using _nodemailer_) about the results.

The only thing exposed in this package is the `Poller` class:
* `new Poller(options)` - creates a new poller instance. It has to be started
with the `start` method.

  Possible options:
  * `interval` (optional) - number of miliseconds between two consecutive polls.
  The default is 60 seconds.
  * `requests` - array of urls/request options that will be polled.
  It may contain either urls as strings or options objects that comply with
  the format expected by the `request` library (see [`request` library documentation]
  for more information)

Poller instance methods:
* `start()` - begins polling. First batch of requests is sent immediately, each following
batch of requests will be sent after the interval specified in the options provided
when creating a poller.
* `stop()` - stops the poller and clears the cache.
* `pause()` - pauses the poller, resetting the interval.
* `resume()` - resumes the poller after it has been paused. Same as with `start`,
initial requests are sent immediately.
* `getDiffObservable()` - returns the RxJS observable that all diffs will be emitted to.

  Objects in the observable implement the following interface:
  ``` typescript
  interface ChangesNotification {
    isInitialDiff: boolean;
    requestOptions: string | Object; // the url/options that those changes came from
    url: string; // the url extracted from requestOptions
    diff: SingleDiff[]; // array of single diffs (see below)
    body: string; // contents of the website
  }
  ```

  The SingleDiff object is the same as the diff object from `js-diff` library.

* `getErrorObservable()` - returns the RxJS observable that emits error upon request errors.

  Objects in the observable implement the following interface:
  ``` typescript
  interface RequestError {
    url: string;  // same as in ChangesNotification
    requestOptions: string | Object;  // same as in ChangesNotification
    error: Object;  // error emitted by the `request` library
  }
  ```




# Contributing
If you would like to suggest a feature or report a problem please use the *Issues* tab on GitHub.

All pull requests are welcome! Before creating one, make sure there are no problems by running
the following commands:
``` bash
npm run lint
npm test
```

Creating unit tests for new features in your pull requests would also be splendid, although it is
not required.



# Author
The author of this project is [Grzegorz Rozdzialik](https://github.com/Gelio).
