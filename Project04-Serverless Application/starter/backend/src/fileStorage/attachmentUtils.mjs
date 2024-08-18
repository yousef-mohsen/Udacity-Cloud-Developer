import AWSXRay from 'aws-xray-sdk-core'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { TodoAccess } from '../dataLayer/todosAccess.mjs'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const todoAccess = new TodoAccess()
const s3Client = new S3Client()

const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export async function generateUploadUrl(todoId, userId) {
    const bucketName = process.env.ATTACHMENT_S3_BUCKET
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: todoId
    })
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: urlExpiration
    })

    const attachementUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
    await todoAccess.addTodoUrl(todoId, userId, attachementUrl)

    return url
  }