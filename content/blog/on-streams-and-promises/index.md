---
title: On streams and promises
author: "Christian"
date: "2019-07-04T00:00:00.001Z"
description: Why they belong together, and where to watch out
---

I recently worked on a service that involved consuming large amounts of data, processing it in various ways, and then sending it somewhere else. This seemed like the perfect oppurtunity to dig into one of node's core concepts: [streams](https://nodejs.org/api/stream.html).

[Streams](https://nodejs.org/api/process.html#process_process_stdout) [are](https://nodejs.org/api/http.html#http_class_http_incomingmessage) [everywhere](https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options) in node, and once you get the hang of using them, they are delightful. I found many [solid](https://www.freecodecamp.org/news/node-js-streams-everything-you-need-to-know-c9141306be93/) [articles](https://flaviocopes.com/nodejs-streams/) that cover the basics, but I wanted to touch on something that came up while combining streams with another core node concept: [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

Let's say we wanted to create a function that would stream a large data source to a file.
```
const streamToFile = (inputStream, filePath) => {
  const fileWriteStream = fs.createWriteStream(filePath)
  inputStream
    .pipe(fileWriteStream)
}
```
Assuming the arguments were valid, this would get the job done, but this function would start the streaming process and then return immediately with `undefined`. Not very helpful, as we probably would want to know when the stream had finished (or if something went wrong), so we could react accordingly.

Luckily, streams are all [event emitters](https://nodejs.org/api/events.html), so we can register listener callbacks on various events that the stream emits. Stream methods like `.pipe` and `.on` generally return the stream itself, so we can succinctly chain these registrations on the back of the `pipe` call.

```
const reactToStreamEvents = error => {
  if (error) {
    console.log('Uh oh!')
  } else {
    console.log('All done'!)
  }
}

const streamToFile = (inputStream, filePath, callback) => {
  const fileWriteStream = fs.createWriteStream(filePath)
  inputStream
    .pipe(fileWriteStream)
    .on('finish', callback)
    .on('error', callback)
}

// Some later usage...

streamToFile(someYugeReadableStream, '/path/to/bigFile.txt', reactToStreamEvents)

```

This works, but promises provide a nicer way to accomplish the same thing, by wrapping the stream code.

```
const streamToFile = (inputStream, filePath) => {
  return new Promise((resolve, reject) => {
    const fileWriteStream = fs.createWriteStream(filePath)
    inputStream
      .pipe(fileWriteStream)
      .on('finish', resolve)
      .on('error', reject)
    })
}
```

Now streamToFile immediately returns a promise object that we can pass around, `await` in some other `async` function, or chain `.then` and `.catch` handlers to. It abstracts away the core of we were doing with the `reactToStreamEvents` callback: signaling for success and failure, while offloading the responsibility of reacting to whatever code might be consuming the promise, giving us more flexibility. Neat.

While I think promises are pretty straightforward once you use them for a while, the [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) sugar syntax makes them really simple to reason about. If I can use either (which is almost always) I generally use async/await. In this case though, we *cannot* use async/await inside streamToFile, because the event emitter interface expects you to pass a *function* (a callback!) as the second argument to the `.on()` method calls.

The un-sugary (but still quite sexy, imho) [Promise executor function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#Syntax) gives us just the callbacks we need: `resolve` and `reject`. As such, plain jane promises and streams play quite nicely together. In my next post, I'll cover the peculiarities of testing our `streamToFile` function.