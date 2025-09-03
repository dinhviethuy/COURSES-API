import { Injectable } from '@nestjs/common'
import ffmpeg from 'fluent-ffmpeg'
import { PassThrough } from 'stream'
import { AzureService } from './azure.services'

@Injectable()
export class MediaInfoService {
  constructor(private readonly azureService: AzureService) {}

  async getInfo(blobName: string): Promise<number> {
    const blobClient = this.azureService.getBlockBlobClient(blobName)
    const downloadResp = await blobClient.download()
    console.log(downloadResp)

    const stream = downloadResp.readableStreamBody
    if (!stream) throw new Error('Cannot read blob stream')

    return new Promise((resolve, reject) => {
      const tmp = new PassThrough()
      stream.pipe(tmp)

      ffmpeg(tmp).ffprobe((err, data) => {
        if (err) return reject(new Error(err.message))
        // resolve({
        //   duration: data.format.duration,
        //   size: data.format.size,
        //   bit_rate: data.format.bit_rate,
        //   streams: data.streams.map((s) => ({
        //     codec: s.codec_name,
        //     width: s.width,
        //     height: s.height,
        //     sample_rate: s.sample_rate
        //   }))
        // })
        console.log(data.format.duration)
        resolve(Number(data.format.duration ?? 0))
      })
    })
  }
}
