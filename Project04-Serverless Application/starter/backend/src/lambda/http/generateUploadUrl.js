import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { generateUploadUrl } from '../../fileStorage/attachmentUtils.mjs'

import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('generateUploadsUrl')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info("Processing event:", event)

    const todoId = event.pathParameters.todoId

    const userId = getUserId(event)

    const uploadUrl = await generateUploadUrl(todoId, userId)

    return {
      statusCode: 201,
     body: JSON.stringify({
      uploadUrl
      })
    }
  })


