import * as uuid from 'uuid'

import { TodoAccess } from '../dataLayer/todosAccess.mjs'
import {DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
const todoAccess = new TodoAccess()
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const s3Client = new S3Client()

export async function getAllTodos(userId) {
  return todoAccess.getAllTodos(userId)
}

export async function createTodo(createTodoRequest, userId) {
  const itemId = uuid.v4()
  const createdAt =  new Date().toJSON()

  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    dueDate: createTodoRequest.dueDate,
    createdAt: createdAt,
    name: createTodoRequest.name,
    done: "false"
  })
}



export async function updateTodo(updateTodoRequest, todoId, userId) {

  return await todoAccess.updateTodo(updateTodoRequest, todoId, userId)
}


export async function deleteTodo(userId, todoId) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: todoId
  })
  await s3Client.send(command);

  return await todoAccess.deleteTodo(userId, todoId)
}