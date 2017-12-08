---
layout: post
title: Headless Chrome and Puppeteer
category: blog
tags: [web, javascript, chrome, automation]
---

<!-- 2017-12-01-headless-chrome.md -->

![A headless statue]({{ site.url }}/public/images/headless.jpeg)

I did a small presentation on [Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome) this week at work and just wanted to write up a small blog post version of it. In includes an introduction to Headless Chrome and a small tutorial on using the it's node API

## What is Headless Chrome?

Headless chrome is a new(ish) feature of the chrome web browser which allows it to run without a *head*. This means that no graphical output is shown, and more importantly it is never even generated. This reduces the time normal browser actions take significantly.

<!--break-->

## What is Headless Chrome *for*?

Headless chrome can be used for just about anything you can do with regular chrome, but I will mostly be using for the following:

* Scraping - Getting data out of websites that do not provide a sufficient API
* Automation - Automating tasks that must be done in a browser
* Testing - Integration and even unit testing are easier than ever when using Headless Chrome

## Why should I use Headless Chrome instead of *insert alternative here*?

Although we've all heard great things about *insert alternative here*, it probably [does not have the performance](https://hackernoon.com/benchmark-headless-chrome-vs-phantomjs-e7f44c6956c) of headless chrome, and if it does, it likely [isn't your users browser](https://www.netmarketshare.com/browser-market-share.aspx), and if it is then go use it.

## Ways to lose your head - Command Line

Chrome Headless can be run by passing the --headless flag when launching it from the command line, here are some examples. These assume you have an alias of `chrome` pointing to your chrome installation.

```shell
# Dump the raw DOM content to standard out
> chrome --headless --dump-dom http://mitchkeenan.com

# Take a screenshot of the page once it loads
> chrome --headless --screenshot http://mitchkeenan.com

# Print the page to pdf once it loads
> chrome --headless --print-to-pdf http://mitchkeenan.com

# Navigate to the site and provide a REPL in the js context of the page
> chrome --headless --repl http://mitchkeenan.com

# Navigate to the page and allow the chrome debugger to access the session
> chrome --headless --remote-debugging-port=9222 http://mitchkeenan.com
```

## Ways to lose your head - Karma

[Karma](http://karma-runner.github.io/) is a testing framework for running your tests (in most testing frameworks) on real browsers. This is helpful if you're running integration tests or you want to make sure your unit test pass on the same compiler your users are using.

With the release of Headless Chrome you can now run Karma tests silently! I don't use Karma much but it's so easy to use Headless Chrome in it I wanted to quickly include the example.

All you need to do is add Headless Chrome as a browser in your karma.config.js

```js
// karma.config.js
module.exports = function(config) {
  config.set({
    browsers : ['ChromeHeadless']
  });
};
```

## Ways to lose your head - Puppeteer

[Puppeteer](https://github.com/GoogleChrome/puppeteer) is Google's official node API for Chrome Headless. It has a fantastic interface and great docs. This is how I've been using chrome headless. Google has set up a [demo](https://try-puppeteer.appspot.com/), which is nice but isn't a great example of a real use case. So I've written up a few examples of how to do some common tasks below. These all use the async/await syntax from ES7 so if you're not familiar [check it out](https://hackernoon.com/6-reasons-why-javascripts-async-await-blows-promises-away-tutorial-c7ec10518dd9).

#### Setup

Install:

* Install [Node](https://nodejs.org/en/) if you don't have it
* Install Puppeteer with `npm i -s puppeteer` in your working folder
* Create `index.js` and add the following

```js
// index.js
const puppeteer = require('puppeteer');
async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Here is where the rest of the code will be

  await browser.close();
}
run();
```

* Finally run with `node index.js`

#### Navigation

```js
// Go to a page and wait for it to fire the onload event
await page.goto('http://mitchkeenan.com');

// Go back and forward in browser history
await page.goBack();
await page.goForward();

// Click an element and wait for any events (or redirects) to complete
// Note that the selector I passed in is the element that is clicked, this could
//  be any selector you'd use with querySelector, getElementById or jQuery.
// In this case it clicks the projects link and waits for it to load
await page.click('.sidebar-nav-item[href="/projects/"]');
```

#### Screenshots and PDFs

```js
// Take a screenshot
await page.screenshot({ path: './path/to/target/image.png' })

// Create a PDF
await page.pdf({ path: './path/to/target/file.pdf' })
```

#### Running javascript on the page and logging

```js
// This pipes any console logs/errors from the page to standard out
page.on('console', (...args) => console.log('PAGE LOG:', ...args));

// Evaluate runs the function you pass it in the context of the page
// This would console log the url, which would then get piped back to std out
await page.evaluate(() => {
  // This is running in the browser context
  console.log(`url is ${location.href}`);
});
```

#### Scraping Data

This is a small example, but I suggest you also check out the `page.$`, `page.$eval` and `page.$$` functions in the docs for extra scrape-y goodness.

```js
// This will get the names of my projects

// Go to the projects page
await page.goto('http://mitchkeenan.com/projects/');

// The $$eval command runs a querySelectAll for the selector you provide and
//  evaluates the callback parameter with the resulting elements as an argument,
//  returning whatever the callback returns.
const names = await page.$$eval('.post-title a', elements => {
  // This is running in the browser context
  return elements.map(el => el.innerHTML);
});

// Log the names
console.log(names);
```

#### Device emulation
This one is a bit different because it requires some additional setup so I've included the entire code

```js
// index.js
const puppeteer = require('puppeteer');

// Puppeteer comes with many device presets
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];

async function run () {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Uses the devices dimensions and user agent
  await page.emulate(iPhone);

  await page.goto('http://mitchkeenan.com');
  await page.screenshot({ path: 'mobile.png' });

  await browser.close();
}
run();
```

#### See what's happening
You can pass a flag when creating the browser that will force it to run in non-headless mode, which is great for debugging.

```js
// Instead of the line
const browser = await puppeteer.launch();

// Use the following
const browser = await puppeteer.launch({
  headless: false
});
```

## Conclusion

Headless Chrome is a fantastic way to get tests or browsing tasks done programmatically, try it out the next time you get tired of doing some repetitive task and want to automate it!
