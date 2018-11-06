---
layout: post
title: Browser API Blitz
category: blog
tags: [web, APIs, frontend]
---

![Henri Helvetica's Title Card](http://mitchkeenan.com/apisTechshare/titleCard.png)

I did up this presentation at work this week and figured I'd copy the README in as a blog post, here it is in all it's glory!

View the [slides](http://mitchkeenan.com/apisTechshare), the [repo](https://github.com/konamacona/apisTechshare), or see below for the notes.

## Browser API Blitz

Index:

 - [Planet of the APIs](#planet-of-the-apis)
 - [Performance Observer](#performance-observer)
 - [Paint Timing APIs](#paint-timing-apis)
 - [Interaction Observer API](#interaction-observer-api)
 - [Media Capabilities API](#media-capabilities-api)
 - [Network Info API](#network-info-api)
 - [Battery Status API](#battery-status-api)
 - [Server Timing API](#server-timing-api)
 - [Long Task API](#long-task-api)
 - [Others](#others)
   - [Navigation API](#navigation-api)
   - [Timers 1: time and timeEnd](#timers-1-time-and-timeend)
   - [Timers 2: performance.now()](#timers-2-performancenow)
   - [Timers 3: User Timing API](#timers-3-user-timing-api)
 - [Resources](#resources)

<!--break-->

---

## Planet of the APIs

Original Presentation by Henri Helvetica ([@HenriHelvetica](https://twitter.com/HenriHelvetica)) at Web Unleashed.

Henri's presentation focused about 50/50 on the *why* and the *how* of using these APIs, however I'm just going to cover the *how* in the interest of not mangling his presentation too badly and trying to condense it into 15 minutes.

I will mention that it seemed that one of the major underlying themes of Web Unleashed was the the *next billion* and how they access the web. Henri's talk stressed that performance is not just about sites loading 100ms faster on your 5G iPhone SX Pixel Pro, but also about the people on 2G/3G $30 phones being able to access your site at all.

## Performance Observer

Not covered in Henri's Presentation, but used for several APIs he did cover.

Allows observation of many performance based events and data. We won't cover all of these but they are all useful, [check them out](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry/entryType).

```js
const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    console.log(entry);
  }
});
observer.observe({ entryTypes: [
  'frame', // Event Loop
  'navigation' // Navigation Events (see below) 
  'resource' // Resource Requests
  'mark', 'measure', // User Timings API (see below) 
  'paint', // Paint Timing API (see below) ****
]});
```

---

## Paint Timing APIs

The Paint Timing API allows us to measure the time to **first meaningful paint** and **first contentful paint** in code.

```js
// Put the following in `<head>`
const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    // `name` will be either 'first-paint' or 'first-contentful-paint'.
    const metricName = entry.name;

    // Adding startTime is important here or you could skew the numbers drastically.
    const time = Math.round(entry.startTime + entry.duration);

    console.log('Performance Metrics', metricName, time);
  }
});
observer.observe({ entryTypes: ['paint'] });
```

```js
// Logs:
// > Performance Metrics first-paint 1607
// > Performance Metrics first-contentful-paint 1607
```

---

## Interaction Observer API

The Intersection Observer API enables developers to understand the **visibility and position of target DOM elements** relative to an **intersection root**.

It is often used for infinite scrolling.

[Demo on Alligator.io](https://alligator.io/js/intersection-observer/#simple-example)

```js
const observer = new IntersectionObserver( entries => {
  entries.forEach( entry => {
    if ( entry.intersectionRatio > 0 ) {
      console.log('Entry is visible.');
    } else {
      console.log('Entry is not visible.');
    }
  });
});
observer.observe( document.querySelectorAll('.some-elements') );
```

---

## Media Capabilities API

An API to **query the user agent** with regards to the **decoding and encoding abilities of the device** based on info such as codecs, profile, resolution, bitrates, etc. The API exposes information such as **whether the playback should be smooth and power efficient**.

```js
const mediaConfig = {
  type: 'file',
  audio: {
    contentType: 'audio/ogg',
    channels: 2,
    bitrate: 132700,
    samplerateL: 5200
  }
};

navigator.mediaCapabilities.decodingInfo(mediaConfig).then(result => {
  console.log(result);
})
```

```json
MediaCapabilitiesInfo: {
  "supported": false,
  "smooth": false,
  "powerEfficient": false
}
```

---

## Network Info API

The Network Information API enables web apps to access information about the **network connection in use by the device.** It can also be observed for changes.

```js
console.log(navigator.connection);
```

```json
NetworkInformation: {
  "downlink": 10,
  "effectiveType": "4g",
  "onchange": null,
  "rtt": 100,
  "saveData": false,
}
```

---

## Battery Status API

The Battery Status API provides information about the systems **battery charge level** and lets you be notified by events that are sent when **the battery level or charging status change.** It is however **deprecated**.

```js
if (navigator.battery) {
  console.log(navigator.battery);
} else if (navigator.getBattery) {
  navigator.getBattery().then(console.log);
} else {
  console.log('Battery Status not supported');
}
```

```json
BatteryManager: {
  "charging": true,
  "chargingTime": 0,
  "dischargingTime": "Infinity",
  "level": 1,
  "onchargingchange": null,
  "onchargingtimechange": null,
  "ondischargingtimechange": null,
  "onlevelchange": null
}
```

[Demo](http://pazguille.github.io/demo-battery-api/)

---

## Server Timing API

Standardizes access to Server-Timing header values in client code. Only works if Server is setting header values on requests.

```js
const entries = performance.getEntriesByType('resource');
console.log(entries[0].serverTiming);
```

In this case the server would be setting the following header:

```http
Server-Timing: cache;desc="Cache Read";dur=23.2,db;dur=53,app;dur=47.2
```

And on the client we'd see the following log:

```js
// Logs:
// > PerformanceServerTiming { name: 'cache', duration: 23.2, description: 'Cache Read' },
// > PerformanceServerTiming { name: 'db',    duration: 53,   description: '' },
// > PerformanceServerTiming { name: 'app',   duration: 47.2, description: '' }
```

---

## Long Task API

The proposed long task API (Chrome only for now) allows us to monitor for executions taking longer than 50ms.

```js
const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    console.log(entry);
  }
});
observer.observe({ entryTypes: ['longtask'] });
```

[Demo](https://w3c.github.io/longtasks/render-jank-demo.html)

---

## Others

Not oncluded in Henri's Presentation, but I think are relevant.

---

### Navigation API

Similar to the Paint Timing APIs in implementation. Measures allows us to see lots of useful metrics like network request timings as well as **DOM ready**, **DOM interactive**, etc.

```js
const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    console.log(entry);
  }
});
observer.observe({ entryTypes: ['navigation'] });
```

```json
// Logs:
PerformanceNavigationTiming: {
  "connectEnd": 14.800000004470348,
  "connectStart": 14.600000009522773,
  "decodedBodySize": 50817,
  "domComplete": 2621.500000008382,
  "domContentLoadedEventEnd": 799.299999998766,
  "domContentLoadedEventStart": 785.7000000076368,
  "domInteractive": 782.2000000014668,
  "domainLookupEnd": 14.600000009522773,
  "domainLookupStart": 14.600000009522773,
  "duration": 2653.7000000098487,
  "encodedBodySize": 50817,
  "entryType": "navigation",
  "fetchStart": 7.599999997182749,
  "initiatorType": "navigation",
  "loadEventEnd": 2653.7000000098487,
  "loadEventStart": 2621.7000000033295,
  "name": "http://localhost:3000",
  "nextHopProtocol": "http/1.1",
  "redirectCount": 0,
  "redirectEnd": 0,
  "redirectStart": 0,
  "requestStart": 14.900000009220093,
  "responseEnd": 165.0999999983469,
  "responseStart": 158.99999999965075,
  "secureConnectionStart": 0,
  "serverTiming": [],
  "startTime": 0,
  "transferSize": 51057,
  "type": "reload",
  "unloadEventEnd": 169.00000000896398,
  "unloadEventStart": 165.8000000024913,
  "workerStart": 0,
}
```

---

### Timers 1: time and timeEnd

Quick and easy way to monitor **execution time**. Available in browser and node.

> Note: no way to get the value programmatically.

```js
const TIMER_NAME = 'myFirstTimer';
console.time(TIMER_NAME); // Start the timer
setTimeout(() => {
  console.timeEnd(TIMER_NAME); // End the timer and log the elapsed time.
}, 1000);
```

```js
// Logs:
// > myFirstTimer: 1002.4091796875ms
```

---

### Timers 2: performance.now()

`performance.now()` returns a very high precision† (up to microseconds) elapsed time since the start of the document's lifetime.

```js
const t1 = performance.now();
setTimeout(() => {
  const t2 = performance.now();
  console.log(`Took ${t2 - t1} milliseconds.`);
}, 1000);
```

```js
// Logs:
// > Took 1001.7000000079861 milliseconds.
```

†
>The timestamp is not actually high-resolution. To mitigate security threats such as Spectre, browsers currently round the results to varying degrees. (Firefox started rounding to 1 millisecond in Firefox 60.) Some browsers may also slightly randomize the timestamp. The precision may improve again in future releases; browser developers are still investigating these timing attacks and how best to mitigate them.

---

### Timers 3: User Timing API

Another way to monitor **elapsed time** with high precision (uses `performance.now()` under the hood). Marks and measures can also be monitored with a PerformanceObserver.

```js
performance.mark('start-script'); // Create Starting Mark
setTimeout(() => {

  performance.mark('end-script'); // Create Ending Mark
  
  // Create the Measure
  performance.measure(
    'total-script-execution-time', // Measure Name
    'start-script', // Starting Mark
    'end-script' // Ending Mark
  );

  // Get the result
  const result = performance.getEntriesByName(
    'total-script-execution-time',
    'measure'
  )[0];

  console.log(result);
}, 1000);
```

```json
// Logs:
PerformanceMeasure: {
  "name": "total-script-execution-time",
  "entryType": "measure",
  "startTime": 4354.699999996228,
  "duration": 1004.2000000103144
}
```

---

## Resources

* [Planet of the APIs Presentation Page](https://fitc.ca/presentation/planet-of-apis-a-tale-of-performance-user-experience/) and [Slides by Henri Helvetica](https://www.slideshare.net/fitc_slideshare/planet-of-apis-a-tale-of-performance-user-experience)
* [Performance Observer API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) and [Perfomance Entry](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry/entryType)
* [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API), [Demo on Alligator.io](https://alligator.io/js/intersection-observer/#simple-example), [Demo by Google](https://googlechrome.github.io/samples/intersectionobserver/)
* [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API), [Demo by Guille Paz](http://pazguille.github.io/demo-battery-api/)
* [Timers API](https://developer.mozilla.org/en-US/docs/Web/API/console#Timers)
* [`performance.now()`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)
* [User Timing API](https://developer.mozilla.org/en-US/docs/Web/API/User_Timing_API)
* [Server Timing API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceServerTiming)
* [Long Tasks API](https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API), [Demo](https://w3c.github.io/longtasks/render-jank-demo.html)****
