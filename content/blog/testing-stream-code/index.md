---
title: Testing streams
author: "Christian"
date: "2019-07-14T00:00:00.001Z"
description: Things get weird
splashUrl: https://source.unsplash.com/9AxFJaNySB8/4060x3226
splashAuthor: Tian Kuan
splashAuthorUrl: https://unsplash.com/@realaxer
---

In the [last post](/on-streams-and-promises), we talked about how nicely streams and promises play well together. We designed this simple function to demonstrate:

```js
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

What would a good set of tests for this function look like and how would we write them? My mental model when I write unit tests is to think about the question "What is this function's job?" In this case, I'd say this function has two high level responsibilities/behaviors to verify:

 - Signal if the incoming data is streamed correctly
 - Error gracefully if not

I try to answer this question without any technical jargon as a reminder that, as much as possible, tests should [avoid testing implementation details](https://kentcdodds.com/blog/testing-implementation-details/) and focus instead on desired outcomes. Unfortunately, this is a case where the function's main duty is a side effect (writing to the file system), so we will probably have to bend or break this rule.

This function actually presents a couple of testing pitfalls that we will want to carefully navigate:

 - This function writes data to disk, which we don't want to do in a unit test
 - This function has async behavior via listening for events, which we will want to simulate and verify

I've been using [jest](https://jestjs.io) to unit test lately. Here's where I might start with this test:

```js
describe('streamToFile', () => {
  it('rejects with an error if a stream error occurs', async () => {
    await expect(streamToFile()).rejects.toEqual('ahoy!');
  })
})
```

If all tests follow the classic stages of *Arrange, Act, Assert*, I like to [start at the end](https://en.wikipedia.org/wiki/Backward_design) with the Assert stage, to remind myself what I'm working toward, and to let the test runner give me a road map for what I need to fix.

I also always put in a purposefully dumb assertion ('ahoy!') so that I know when I've got my test right because it's failing for the right reason (because false positives are... the worst). We'll update that at the very end to make it pass.

This test will currently fail because we're not passing the correct arguments to `streamToFile`. Let's start fixing $#!+.

```js
const { PassThrough } = require('stream')

describe('streamToFile', () => {
  it('rejects/errors if a stream error occurs', async () => {
    // Arrange
    const mockReadable = new PassThrough()
    const mockFilePath = '/oh/what/a/file.txt'

    // Act & Assert
    await expect(streamToFile(mockReadable, mockFilePath))
      .rejects.toEqual('ahoy!')
  })
})
```

Now we've satisfied `streamToFile`'s signature with two things:

 - `mockReadable` is a [PassThrough steam](https://nodejs.org/api/stream.html#stream_class_stream_passthrough). As the docs note, this is a very simple implementation of a [Transform stream](https://nodejs.org/api/stream.html#stream_class_stream_transform) that simply takes the input and passes it right through. It implements the Readable and Writeable APIs, making it very handy for testing.
 - `mockFilePath` is... a fake file path. When mocking, I think it's important to stick as close to what the actual code wants as possible, so your tests serve as documentation. In this case, we're going to use jest's [auto-mocking](https://jestjs.io/docs/en/manual-mocks#mocking-node-modules) feature to hijack the `fs.createWriteStream` method so we don't actually touch the file system. Since this doppelgänger won't actually be doing anything with the input, we could technically (obnoxiously?) pass that hijacked function whatever we want, but this way someone can look at the test and start to understand the ins and outs of the function under test.

Since we don't actually want to write any data to our fake file path, let's do the hijacking.

```js
const fs = require('fs')
const { PassThrough } = require('stream')

jest.mock('fs')

describe('streamToFile', () => {
  it('rejects/errors if a stream error occurs', async () => {
    // Arrange
    const mockReadable = new PassThrough()
    const mockWriteable = new PassThrough()
    const mockFilePath = '/oh/what/a/file.txt'
    fs.createWriteStream.mockReturnValueOnce(mockWriteable)

    // Act & Assert
    await expect(streamToFile(mockReadable, mockFilePath))
      .rejects.toEqual('ahoy!')
  })
})
```

Now we've done three things:

- Use jest's automocking to replace all methods on the `fs` object with jest functions that do nothing and return `undefined` by default
- Overridden that default behavior in this test by using the [`mockReturnValueOnce`](https://jestjs.io/docs/en/mock-function-api#mockfnmockreturnvalueoncevalue) method
- Returning what our code would expect from `fs.createWriteStream`: something that implements the Writeable interface (another `PassThrough` stream!).

Now our code will no longer attempt to touch the file system, *and* we control/have references to the streams. Noice.

Our test will now fail with a timeout because the 'error' event is never called (we haven't emitted one).

And this is where things get a little weird. Usually you just have one "Act" statement in a unit test - invoking the thing you're testing - but in this case we need two.

Invoking `streamToFile` hooks the streams up using [`.pipe`](https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options) but then we also need to emit an event to run something *through* those beautiful tubes (an error in this case).

We're currently using the [await/expect combined syntax](https://jestjs.io/docs/en/asynchronous#async-await) to Act and Assert in the same line. Usually this is fine/terse/convenient, but in this case, not so much, because we want to do something *after* the promise has been created, but *before* it has settled. Let's separate those out.

```js
describe('streamToFile', () => {
  it('rejects/errors if a stream error occurs', async () => {
    // Arrange
    const mockReadable = new PassThrough()
    const mockWriteable = new PassThrough()
    const mockFilePath = '/oh/what/a/file.txt'
    fs.createWriteStream.mockReturnValueOnce(mockWriteable)

    // Act
    const actualPromise = streamToFile(mockReadable, mockFilePath)

    // Assert
    await expect(actualPromise).rejects.toEqual('ahoy!')
  })
})
```

And now we can augment our "Act" section by emitting an error event.

```js
describe('streamToFile', () => {
  it('rejects/errors if a stream error occurs', async () => {
    // Arrange
    const mockReadable = new PassThrough()
    const mockWriteable = new PassThrough()
    const mockFilePath = '/oh/what/a/file.txt'
    const mockError = new Error('You crossed the streams!')
    fs.createWriteStream.mockReturnValueOnce(mockWriteable)

    // Act
    const actualPromise = streamToFile(mockReadable, mockFilePath)
    mockReadable.emit('error', mockError)

    // Assert
    await expect(actualPromise).rejects.toEqual('ahoy!')
  })
})
```
This *should* work consistently (and you do want deterministic, flake free tests, don't you?), but there's a sneaky race condition afoot. If we think through what's happening in this test you might reasonably conclude the order of operations would be something like this:

1. Invoke `streamToFile` with mock inputs/dependencies and create a reference to the promise it generates
2. Emit an error event from one of those mock streams that simulates a file write error
3. Assert that the promise rejects with that error

That *will likely* be what happens, but it isn't deterministic. It's possible that the event could be emitted before the error event handler is registered, leading to a failed test with Jest complaining about an unhandled error event. This very likely wouldn't be an issue in the actual application, as emitting the events would likely occur *well after* the streams had been connected. As such, it's better to have our test model that likely flow (and eliminate the race condition), by using good old `setTimeout`.

```js
describe('streamToFile', () => {
  it('rejects/errors if a stream error occurs', async () => {
    // Arrange
    const mockReadable = new PassThrough()
    const mockWriteable = new PassThrough()
    const mockFilePath = '/oh/what/a/file.txt'
    const mockError = new Error('You crossed the streams!')
    fs.createWriteStream.mockReturnValueOnce(mockWriteable)

    // Act
    const actualPromise = streamToFile(mockReadable, mockFilePath)
    setTimeout(() => {
      mockReadable.emit('error', mockError)
    }, 100)

    // Assert
    await expect(actualPromise).rejects.toEqual('ahoy!')
  })
})
```

100 milliseconds is a trivial delay in human time, but it's a small eternity for the event loop. This should guarantee that our event is emitted only after we've hooked up a listener for it.

If we run this test we can see that it's *failing for the right reason*: remember that we gave it a dumb assertion on purpose at the very beginning. Now we can switch it out for the actual error and we have a test that proves streamToFile captures errors correctly.

```js
describe('streamToFile', () => {
  it('rejects/errors if a stream error occurs', async () => {
    // Arrange
    const mockReadable = new PassThrough()
    const mockWriteable = new PassThrough()
    const mockFilePath = '/oh/what/a/file.txt'
    const mockError = new Error('You crossed the streams!')
    fs.createWriteStream.mockReturnValueOnce(mockWriteable)

    // Act
    const actualPromise = streamToFile(mockReadable, mockFilePath)
    setTimeout(() => {
      mockReadable.emit('error', mockError)
    }, 100)

    // Assert
    await expect(actualPromise).rejects.toEqual(mockError)
  })
})
```
### Additional Tests

One of the many underrated benefits of writing tests is that you often end up discovering code paths (or catching bugs) you hadn't thought of while working through an implementation. In this case, the test above proves that our implementation will handle an error from the *writeable* stream, but what about if the *readable* stream emits an error. Will it propagate through to our error handler? Let's find out:

```js
describe('streamToFile', () => {
  it('rejects/errors if a READ stream error occurs', async () => {
    // Arrange
    const mockReadable = new PassThrough()
    const mockWriteable = new PassThrough()
    const mockFilePath = '/oh/what/a/file.txt'
    const mockError = new Error('You crossed the streams!')
    fs.createWriteStream.mockReturnValueOnce(mockWriteable)

    // Act
    const actualPromise = streamToFile(mockReadable, mockFilePath)
    setTimeout(() => {
      mockReadable.emit('error', mockError)
    }, 100)

    // Assert
    await expect(actualPromise).rejects.toEqual(mockError)
  })

  it('rejects/errors if a WRITE stream error occurs', async () => {
    // Arrange
    const mockReadable = new PassThrough()
    const mockWriteable = new PassThrough()
    const mockFilePath = '/oh/what/a/file.txt'
    const mockError = new Error('You crossed the streams!')
    fs.createWriteStream.mockReturnValueOnce(mockWriteable)

    // Act
    const actualPromise = streamToFile(mockReadable, mockFilePath)
    setTimeout(() => {
      mockWriteable.emit('error', mockError)
    }, 100)

    // Assert
    await expect(actualPromise).rejects.toEqual(mockError);
  })
})
```

Now we have two tests: quite similar, but the first emits an error from the readable stream, while the second emits an error from the writeable one. The writeable one passes, the readable one does not! This is because each stream has its own error event, and `.pipe` says nothing about sending errors through to the next stream. If we want to catch (and then reject) from them both, we need to update our implementation and register an error event on the readable stream too.

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

describe('streamToFile', () => {
  it('rejects/errors if a READ stream error occurs', async () => {
    // Arrange
    const mockReadable = new PassThrough()
    const mockWriteable = new PassThrough()
    const mockFilePath = '/oh/what/a/file.txt'
    const mockError = new Error('You crossed the streams!')
    fs.createWriteStream.mockReturnValueOnce(mockWriteable)

    // Act
    const actualPromise = streamToFile(mockReadable, mockFilePath)

    setTimeout(() => {
      mockReadable.emit('error', mockError)
    }, 100)

    // Assert
    await expect(actualPromise).rejects.toEqual(mockError)
  })
```

Now we're gracefully handling errors on the write AND read stream. Thanks, tests!

And now that we've tested the "sad" code paths, we can finally test the happy path: a successful run of `streamToFile`.

```js
describe('streamToFile', () => {
  it('resolves if the data writes successfully', async () => {
    // Arrange
    const mockReadable = new PassThrough()
    const mockWriteable = new PassThrough()
    const mockFilePath = '/oh/what/a/file.txt'
    const mockError = new Error('You crossed the streams!')
    fs.createWriteStream.mockReturnValueOnce(mockWriteable)

    // Act
    const actualPromise = streamToFile(mockReadable, mockFilePath)

    setTimeout(() => {
      mockReadable.emit('data', 'beep!')
      mockReadable.emit('data', 'boop!')
      mockReadable.emit('end')
    }, 100)

    // Assert
    await expect(actualPromise).resolves.toEqual(undefined)
  })
```
Note that we're not resolving the promise with a value, forcing us to assert - ick - on the default value of `undefined`. But perhaps this function would evolve to resolve with some useful value for further downstream work.

In the next post, I'll discuss a better way to handle the error propagation gotcha we ran into, with [`Stream.pipeline`](https://nodejs.org/api/stream.html#stream_stream_pipeline_streams_callback).