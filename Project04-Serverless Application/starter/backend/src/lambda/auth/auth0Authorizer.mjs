import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

import jwksClient from 'jwks-rsa'

var client = jwksClient({
  jwksUri: 'https://dev-43huyolvdu2m2xms.us.auth0.com/.well-known/jwks.json'
})


const logger = createLogger('auth')


export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })



  //from https://github.com/auth0/node-jwks-rsa
  const kid = jwt.header.kid;
  const key = await client.getSigningKey(kid);
  const signingKey = key.getPublicKey();

  return jsonwebtoken.verify(token, signingKey, { algorithms: ['RS256']})

}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
