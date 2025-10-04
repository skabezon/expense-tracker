import { NextRequest } from "next/server"
import { TransactionService } from "@/lib/services/transactionService"
import { getAuthenticatedUser } from "@/lib/api/auth"
import { validateBody, TransactionUpdateSchema } from "@/lib/api/validation"
import {
  successResponse,
  handleApiError,
} from "@/lib/api/response"

/**
 * GET /api/transactions/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()

    const transaction = await TransactionService.findById(params.id)

    // Verificar ownership
    if (transaction.userId !== user.id) {
      throw new Error('No autorizado')
    }

    return successResponse(transaction)
  } catch (error) {
    return handleApiError(error, 'GET /transactions/[id]')
  }
}

/**
 * PUT /api/transactions/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()
    const data = await validateBody(request, TransactionUpdateSchema)

    const transaction = await TransactionService.update(params.id, {
      ...data,
      ...(data.date && { date: new Date(data.date) }),
    })

    // Verificar ownership
    if (transaction.userId !== user.id) {
      throw new Error('No autorizado')
    }

    return successResponse(transaction, 'Transacción actualizada')
  } catch (error) {
    return handleApiError(error, 'PUT /transactions/[id]')
  }
}

/**
 * DELETE /api/transactions/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()

    const transaction = await TransactionService.findById(params.id)

    if (transaction.userId !== user.id) {
      throw new Error('No autorizado')
    }

    await TransactionService.delete(params.id)

    return successResponse(null, 'Transacción eliminada')
  } catch (error) {
    return handleApiError(error, 'DELETE /transactions/[id]')
  }
}