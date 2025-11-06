import { FastifyRequest, FastifyReply } from 'fastify'

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args)
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error)
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
}

export function logRequest(request: FastifyRequest, reply: FastifyReply) {
  logger.info(`${request.method} ${request.url}`, {
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  })
}

