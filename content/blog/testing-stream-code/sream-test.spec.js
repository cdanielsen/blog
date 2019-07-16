const fs = require("fs")
const { PassThrough } = require("stream")

jest.mock("fs")

const streamToFile = (inputStream, filePath) => {
  return new Promise((resolve, reject) => {
    const fileWriteStream = fs.createWriteStream(filePath)
    inputStream
      .on("error", reject)
      .pipe(fileWriteStream)
      .on("finish", resolve)
      .on("error", reject)
  })
}

describe("streamToFile", () => {
  it("rejects with an error if a READ stream error occurs", async () => {
    // Arrange
    const mockReadable = new PassThrough()
    const mockWriteable = new PassThrough()
    const mockFilePath = "/oh/what/a/file.txt"
    const mockError = new Error("You crossed the streams!")
    fs.createWriteStream.mockReturnValueOnce(mockWriteable)

    // Act
    const actualPromise = streamToFile(mockReadable, mockFilePath)
    setTimeout(() => {
      mockReadable.emit("error", mockError)
    }, 100)

    // Assert
    await expect(actualPromise).rejects.toEqual(mockError)
  })

  it("rejects with an error if a WRITE stream error occurs", async () => {
    // Arrange
    const mockReadable = new PassThrough()
    const mockWriteable = new PassThrough()
    const mockFilePath = "/oh/what/a/file.txt"
    const mockError = new Error("You crossed the streams!")
    fs.createWriteStream.mockReturnValueOnce(mockWriteable)

    // Act
    const actualPromise = streamToFile(mockReadable, mockFilePath)
    setTimeout(() => {
      mockWriteable.emit("error", mockError)
    }, 100)

    // Assert
    await expect(actualPromise).rejects.toEqual(mockError)
  })
})
