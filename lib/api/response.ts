import { NextResponse } from 'next/server'
import { env } from '@/lib/config/env'
import { ValidationError } from './validation'

export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  message?: string
  details?: any
}

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status })
}

export function createdResponse<T>(
  data: T,
  message: string = 'Creado exitosamente'
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, message, 201)
}

export function errorResponse(
  error: string,
  status: number = 500,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      details: env.NODE_ENV === 'development' ? details : undefined,
    },
    { status }
  )
}

export function validationErrorResponse(
  errors: ValidationError
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      details: errors.toJSON().details,
    },
    { status: 400 }
  )
}

export function unauthorizedResponse(
  message: string = 'No autorizado'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  )
}

export function notFoundResponse(
  resource: string = 'Recurso'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error: `${resource} no encontrado` },
    { status: 404 }
  )
}

export function internalErrorResponse(
  error: unknown,
  context?: string
): NextResponse<ApiErrorResponse> {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

  console.error(`[API Error${context ? ` - ${context}` : ''}]:`, {
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  })

  return NextResponse.json(
    {
      success: false,
      error: 'Error interno del servidor',
      message: env.NODE_ENV === 'development' ? errorMessage : undefined,
    },
    { status: 500 }
  )
}

export function handleApiError(error: unknown, context?: string): NextResponse {
  if (error instanceof ValidationError) {
    return validationErrorResponse(error)
  }

  if (error instanceof Error) {
    if (error.message.includes('No autorizado') || error.message.includes('No authenticated')) {
      return unauthorizedResponse()
    }

    if (error.message.includes('no encontrad')) {
      return notFoundResponse()
    }
  }

  return internalErrorResponse(error, context)
}