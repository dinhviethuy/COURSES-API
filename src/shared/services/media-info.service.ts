// MediaInfoService (ý tưởng)
import { BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } from '@azure/storage-blob'
import { Injectable } from '@nestjs/common'
import ffmpeg from 'fluent-ffmpeg'
import { envConfig } from 'src/shared/config'
import { AzureService } from 'src/shared/services/azure.services'

@Injectable()
export class MediaInfoService {
  constructor(private readonly azureService: AzureService) {}

  private buildSasUrl(blobName: string, minutes = 10) {
    const blobClient = this.azureService.getBlockBlobClient(blobName)
    const expiresOn = new Date(Date.now() + minutes * 60 * 1000)
    const sas = generateBlobSASQueryParameters(
      {
        containerName: envConfig.AZURE_STORAGE_CONTAINER,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        expiresOn
      },
      new StorageSharedKeyCredential(envConfig.AZURE_STORAGE_ACCOUNT_NAME, envConfig.AZURE_STORAGE_ACCOUNT_KEY)
    ).toString()
    return `${blobClient.url}?${sas}`
  }

  async getInfo(blobName: string): Promise<number> {
    const url = this.buildSasUrl(blobName)
    console.log('url', url)
    return new Promise<number>((resolve, reject) => {
      ffmpeg(url)
        .inputOptions(['-analyzeduration', '10M', '-probesize', '10M'])
        .ffprobe((err, data) => {
          if (err) return reject(new Error(err.message))
          resolve(Number(data?.format?.duration ?? 0))
        })
    })
  }
}
