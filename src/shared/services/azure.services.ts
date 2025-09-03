import {
  BlobSASPermissions,
  BlobServiceClient,
  ContainerClient,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters
} from '@azure/storage-blob'
import { Injectable, Logger } from '@nestjs/common'
import { envConfig } from 'src/shared/config'
import * as streamifier from 'streamifier'

@Injectable()
export class AzureService {
  private readonly logger = new Logger(AzureService.name)
  private containerClient: ContainerClient
  private readonly storageSharedKeyCredential: StorageSharedKeyCredential

  constructor() {
    const containerName = envConfig.AZURE_STORAGE_CONTAINER || 'videos'
    const blobServiceClient = BlobServiceClient.fromConnectionString(envConfig.AZURE_STORAGE_CONNECTION_STRING)
    this.containerClient = blobServiceClient.getContainerClient(containerName)
    this.storageSharedKeyCredential = new StorageSharedKeyCredential(
      envConfig.AZURE_STORAGE_ACCOUNT_NAME,
      envConfig.AZURE_STORAGE_ACCOUNT_KEY
    )
  }

  async ensureContainer() {
    await this.containerClient.createIfNotExists({ access: 'container' })
    this.logger.log(`Container ready: ${this.containerClient.containerName}`)
  }

  getBlockBlobClient(blobName: string) {
    return this.containerClient.getBlockBlobClient(blobName)
  }

  getProps(blobName: string) {
    return this.getBlockBlobClient(blobName).getProperties()
  }

  downloadRange(blobName: string, offset: number, count?: number) {
    return this.getBlockBlobClient(blobName).download(offset, count)
  }

  async uploadBuffer(file: Express.Multer.File, blobPath?: string) {
    const blobName = blobPath ?? `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName)

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype || 'application/octet-stream' }
    })

    return { blobName, url: blockBlobClient.url }
  }

  async uploadStream(file: Express.Multer.File, blobPath?: string) {
    const blobName = blobPath ?? `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName)

    const bufferSize = 4 * 1024 * 1024
    const maxConcurrency = 5

    const stream = streamifier.createReadStream(file.buffer)
    await blockBlobClient.uploadStream(stream, bufferSize, maxConcurrency, {
      blobHTTPHeaders: { blobContentType: file.mimetype || 'application/octet-stream' }
    })

    return { blobName, url: blockBlobClient.url }
  }

  generateWriteSasUrl(blobName: string, ttlSeconds = 5 * 60, ip?: string) {
    const startsOn = new Date(Date.now() - 2 * 60 * 1000)
    const expiresOn = new Date(Date.now() + ttlSeconds * 1000)

    const sas = generateBlobSASQueryParameters(
      {
        containerName: this.containerClient.containerName,
        blobName,
        permissions: BlobSASPermissions.parse('cw'),
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
        ipRange: ip ? { start: ip, end: ip } : undefined
      },
      this.storageSharedKeyCredential
    ).toString()

    const url = `${this.containerClient.getBlockBlobClient(blobName).url}?${sas}`
    return url
  }

  // generateReadSasUrl(blobName: string, ttlSeconds = 15 * 60) {
  //   const account = process.env.AZURE_STORAGE_ACCOUNT_NAME!
  //   const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!
  //   const credential = new StorageSharedKeyCredential(account, accountKey)

  //   const expiresOn = new Date(Date.now() + ttlSeconds * 1000)
  //   const startsOn = new Date(Date.now() - 5 * 60 * 1000)

  //   const sas = generateBlobSASQueryParameters(
  //     {
  //       containerName: this.containerClient.containerName,
  //       blobName,
  //       permissions: BlobSASPermissions.parse('r'),
  //       startsOn,
  //       expiresOn,
  //       protocol: SASProtocol.Https
  //     },
  //     credential
  //   ).toString()

  //   const url = `${this.containerClient.getBlockBlobClient(blobName).url}?${sas}`
  //   return url
  // }
}
