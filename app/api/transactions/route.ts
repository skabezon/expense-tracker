import { NextRequest, NextResponse } from "next/server"
import { TransactionService } from "@/lib/services/transactionService"
import { getAuthenticatedUser } from "@/lib/api/auth"
import { validateBody, TransactionSchema } from "@/lib/api/validation"
import {
  successResponse,
  createdResponse,
  handleApiError,
} from "@/lib/api/response"

// ❌ QUITAR CORS '*' - Solo permitir tu dominio
const corsHeaders = (origin?: string) => {
  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    'http://localhost:3000',
  ].filter(Boolean)

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return headers
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(req.headers.get('origin') || undefined),
  })
}

/**
 * GET /api/transactions
 * Obtener todas las transacciones del usuario
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Obtener usuario de forma SEGURA con getServerSession
    const user = await getAuthenticatedUser()

    // Obtener transacciones
    const transactions = await TransactionService.findByUserId(user.id)

    return successResponse(transactions)
  } catch (error) {
    return handleApiError(error, 'GET /transactions')
  }
}

/**
 * POST /api/transactions
 * Crear nueva transacción
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Autenticación segura
    const user = await getAuthenticatedUser()

    // ✅ Validar con Zod
    const data = await validateBody(request, TransactionSchema)

    // Crear transacción
    const transaction = await TransactionService.create({
      ...data,
      userId: user.id,
      date: new Date(data.date),
    })

    return createdResponse(transaction, 'Transacción creada exitosamente')
  } catch (error) {
    return handleApiError(error, 'POST /transactions')
  }
}