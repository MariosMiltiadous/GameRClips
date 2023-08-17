import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
// downgrade ffmpeg to 0.11.6 - npm i @ffmpeg/ffmpeg@0.11.6
// https://ffmpegwasm.netlify.app/docs/migration

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {
  isRunning = false
  isReady = false
  private ffmpeg

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true })
  }

  async init() {
    if (this.isReady) {
      return
    }

    await this.ffmpeg.load()

    this.isReady = true;
  }

  async getScreenshots(file: File) {
    this.isRunning = true

    const data = await fetchFile(file)
    this.ffmpeg.FS('writeFile', file.name, data)

    const seconds = [1, 2, 3]
    const commands: string[] = []

    seconds.forEach(second => {
      commands.push(
        // Input (-i = grab a specific file)
        '-i', file.name,
        // Output Options - scale=510:-1 => width is 510 and height will be calculated by ffmpeg + https://www.ffmpeg.org/ffmpeg.html
        '-ss', `00:00:0${second}`,
        '-frames:v', '1',
        '-filter:v', 'scale=510:-1',
        // Output
        `output_0${second}.png`
      )
    })

    await this.ffmpeg.run(
      ...commands
    )

    const screenShots: string[] = []

    seconds.forEach(second => {
      // get the file
      const screenShotFile = this.ffmpeg.FS(
        'readFile', `output_0${second}.png`)

        // create blob for the file
      const screenshotBlob = new Blob(
        [screenShotFile.buffer], {
        type: 'image/png'
      }
      )
      // construct a url for the image
      const screenShotURL = URL.createObjectURL(screenshotBlob)
      screenShots.push(screenShotURL)
    })

    this.isRunning = false
    return screenShots
  }

  async blobFromURL(url: string){
    const response = await fetch(url)
    const blob = await response.blob()

    return blob
  }
}
