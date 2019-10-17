---
title: Stream Pipelines
author: "Christian"
date: "2019-10-17T00:00:00.001Z"
description: Power move
splashUrl: https://source.unsplash.com/uanoYn1AmPs/5184×3456
splashAuthor: Tim Marshall
splashAuthorUrl: https://unsplash.com/@timmarshall
---

In the [last post](/testing-stream-code), we talked about how nicely streams and promises play well together. A rather awkward issue came up where we needed to register error event handlers on each individual stream in the pipeline:

```js
const streamToFile = (inputStream, filePath) => {
  return new Promise((resolve, reject) => {
    const fileWriteStream = fs.createWriteStream(filePath)
    inputStream
      .on('error', reject)
      .pipe(fileWriteStream)
      .on('finish', resolve)
      .on('error', reject)
    })
}
```

While this might be acceptable for, say, two or three streams `pipe`'d together, it would get annoying pretty quickly beyond that. That's a problem: sandwiching transform streams in between a readable stream and a writeable one is an incredibly powerful pattern, allowing you to process large quantities of data in almost any way you wish, while doing it efficiently to boot.

There are [many](https://www.freecodecamp.org/news/node-js-streams-everything-you-need-to-know-c9141306be93/) [good](https://flaviocopes.com/nodejs-streams/) tutorials on using/writing your own transform streams, so I'd like to focus on what seems like an underused native node api that solves our duplicative error handler problem, along with other benefits. Enter `stream.pipeline`.

As [the docs](https://nodejs.org/api/stream.html#stream_stream_pipeline_streams_callback) indicate, this API takes an arbitrary number of streams you want to `pipe` together and a traditional error-first node callback. Error events raised from _any_ of the streams will trigger the callback, sending the error as its lone argument so you can respond to it. This removes the cruft of calling `pipe` and the `on('error')` methods over and over again. Compare the following:

```js
// Tired
const cruftyStreamPipeline = () => {
  return new Promise((resolve, reject) => {
    someInputStream
      .on('error', reject)
      .pipe(someTransformStream)
      .on('error', reject)
      .pipe(yetAnotherTransformStream)
      .on('error', reject)
      .pipe(finalDestinationStream)
      .on('error', reject)
      .on('finish', resolve)
    })
}

// Wired
const { pipeline } = require('stream');

const slimmerStreamPipeline = () => {
  return new Promise((resolve, reject) => {
    pipeline(
      someInputStream,
      someTransformStream,
      yetAnotherTransformStream,
      finalDestinationStream,
    (err) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  }
}

```
Nice. But wait! It gets even more better!

```js
// Inspired
const { promisify } = require('util');
const { pipeline } = require('stream');

const asnycPipeline = promisify(pipeline);

const svelteStreamPipeline = () => asyncPipeline(
  someInputStream,
  someTransformStream,
  yetAnotherTransformStream,
  finalDestinationStream,
);

```

Yes friend, you can use another underrated gem in the bowels of node's standard library (`util.promisify`) to convert `stream.pipeline`'s default callback interface to a promise one! It might be a bit overkill for our simple example at the beginning of this series, but check out the difference:

```js
// From this...
const streamToFile = (inputStream, filePath) => {
  return new Promise((resolve, reject) => {
    const fileWriteStream = fs.createWriteStream(filePath)
    inputStream
      .pipe(fileWriteStream)
      .on('finish', resolve)
      .on('error', reject)
    })
}

// To this..
const { promisify } = require('util');
const { pipeline } = require('stream');

const asnycPipeline = promisify(pipeline);

const soHotRightNowStreamToFile = (inputStream, filePath) => {
  const fileWriteStream = fs.createWriteStream(filePath)
  return asyncPipeline(
    inputStream,
    fileWriteStream
);
```

The benefits get more obvious as you add more streams. Even more awesome: in the event of an error, you should be doing cleanup of your streams because [they don't destroy themselves by default](https://nodejs.org/api/stream.html#stream_event_error). I almost never remember to do this, but stream.pipeline _does it for you_, calling `stream.destroy(err)` in the event an error is thrown on all the streams you gave it.

To me, this is a great abstraction. Get rid of all the boilerplate of catching errors, wrapping things up in promises, and proper clean up, and let me focus on writing my sweet, sweet custom transform streams.

This concludes this little series on using and testing promisified streams. I hope you found it useful.