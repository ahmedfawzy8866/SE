import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * HTTP Status codes with standard meanings
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    status: number;
    timestamp: string;
  };
}

/**
 * Standard API success response structure
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * Error codes for standardized client responses
 */
export enum ErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CONFLICT = 'CONFLICT',
}

/**
 * Create a standardized error response
 * Never expose error.message or stack traces to clients
 */
export function createErrorResponse(
  message: string,
  code: ErrorCode,
  status: HttpStatusCode,
  internalError?: unknown
): NextResponse<ApiErrorResponse> {
  // Log internal error details server-side if available
  if (internalError) {
    const errorMsg = internalError instanceof Error ? internalError.message : String(internalError);
    logger.error('API error', {
      code,
      status,
      internalMessage: errorMsg,
    });
  }

  return NextResponse.json(
    {
      error: {
        message,
        code,
        status,
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Create a bad request error (400)
 * Used for validation failures, malformed input, etc.
 */
export function badRequest(
  message = 'The request could not be processed.',
  internalError?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    message,
    ErrorCode.INVALID_REQUEST,
    HttpStatusCode.BAD_REQUEST,
    internalError
  );
}

/**
 * Create an authentication error (401)
 * Used when user is not authenticated
 */
export function unauthorized(
  message = 'Authentication is required to access this resource.',
  internalError?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    message,
    ErrorCode.AUTHENTICATION_FAILED,
    HttpStatusCode.UNAUTHORIZED,
    internalError
  );
}

/**
 * Create an authorization error (403)
 * Used when user is authenticated but lacks permissions
 */
export function forbidden(
  message = 'You do not have permission to access this resource.',
  internalError?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    message,
    ErrorCode.AUTHORIZATION_FAILED,
    HttpStatusCode.FORBIDDEN,
    internalError
  );
}

/**
 * Create a not found error (404)
 */
export function notFound(
  message = 'The requested resource was not found.',
  internalError?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    message,
    ErrorCode.RESOURCE_NOT_FOUND,
    HttpStatusCode.NOT_FOUND,
    internalError
  );
}

/**
 * Create a conflict error (409)
 * Used when request conflicts with current state
 */
export function conflict(
  message = 'The request conflicts with the current state of the resource.',
  internalError?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    message,
    ErrorCode.CONFLICT,
    HttpStatusCode.CONFLICT,
    internalError
  );
}

/**
 * Create a validation error (422)
 * Used for semantic validation failures
 */
export function validationError(
  message = 'The request could not be validated.',
  internalError?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    message,
    ErrorCode.VALIDATION_ERROR,
    HttpStatusCode.UNPROCESSABLE_ENTITY,
    internalError
  );
}

/**
 * Create a generic internal server error (500)
 * Never expose internal error details
 */
export function internalError(
  message = 'An internal server error occurred.',
  internalError?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    message,
    ErrorCode.INTERNAL_ERROR,
    HttpStatusCode.INTERNAL_SERVER_ERROR,
    internalError
  );
}

/**
 * Create a service unavailable error (503)
 */
export function serviceUnavailable(
  message = 'The service is temporarily unavailable. Please try again later.',
  internalError?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    message,
    ErrorCode.SERVICE_UNAVAILABLE,
    HttpStatusCode.SERVICE_UNAVAILABLE,
    internalError
  );
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  status: HttpStatusCode = HttpStatusCode.OK
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
