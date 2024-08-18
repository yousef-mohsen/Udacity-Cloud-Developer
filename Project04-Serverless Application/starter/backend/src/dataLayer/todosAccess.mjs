import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'

import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('todoAccess')

export class TodoAccess {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todosTable = process.env.TODOS_TABLE
  ) {
    this.documentClient = documentClient
    this.todosTable = todosTable
    this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
  }

  async getAllTodos(userId) {
    
    logger.info(`Getting all todos`)
    
    logger.info('userId: ', userId)
    

    const result = await this.dynamoDbClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    })
  
    return result.Items
  }

  async createTodo(todo) {
    logger.info(`Creating a todo with id ${todo.todoId}`)

    await this.dynamoDbClient.put({
      TableName: this.todosTable,
      Item: todo
    })

    return todo
  }

  async addTodoUrl(todoId, userId, url) {

    
    await this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: "set attachmentUrl = :url",

      ExpressionAttributeValues: {
        ":url": url
      }
    })

  }

  async updateTodo(updateTodoRequest, todoId, userId) {
    logger.info(`updating a todo with id ${todoId}`)
    logger.info(`updating a todo with userId ${userId}`)
    const dueDate = updateTodoRequest.dueDate
    const done = updateTodoRequest.done
    const nameOfTodo = updateTodoRequest.name

    await this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      ExpressionAttributeNames: {
        "#n": "name",
      },
      UpdateExpression: "set #n = :nameOfTodo, dueDate = :dueDate, done = :done ",
      ExpressionAttributeValues: {
        ":nameOfTodo": nameOfTodo,
        ":dueDate": dueDate,
        ":done": done
      }
    })
  }

  async deleteTodo(userId, todoId) {
    
    await this.dynamoDbClient.delete({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    })
  }


}
