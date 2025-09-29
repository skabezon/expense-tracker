import { NextResponse } from "next/server"
import { TransactionService } from "@/lib/services/transactionService"

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id',
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401, headers: corsHeaders() }
      )
    }

    const id = params.id
    if (!id) {
      return NextResponse.json(
        { error: "ID requerido" },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Verificar que la transacción pertenezca al usuario
    const existingTransaction = await TransactionService.findById(id)
    if (!existingTransaction || existingTransaction.userId !== userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401, headers: corsHeaders() }
      )
    }

    const success = await TransactionService.delete(id)
    if (!success) {
      return NextResponse.json(
        { error: "No se pudo eliminar la transacción" },
        { status: 400, headers: corsHeaders() }
      )
    }

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders() }
    )
  } catch (error) {
    console.error("Error al eliminar transacción:", error)
    return NextResponse.json(
      { error: "Error al eliminar transacción" },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401, headers: corsHeaders() }
      )
    }

    const id = params.id
    const body = await request.json()

    // Verificar que la transacción pertenezca al usuario
    const existingTransaction = await TransactionService.findById(id)
    if (!existingTransaction || existingTransaction.userId !== userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401, headers: corsHeaders() }
      )
    }

    const transaction = await TransactionService.update({
      ...body,
      id
    })
    return NextResponse.json(
      transaction,
      { headers: corsHeaders() }
    )
  } catch (error) {
    console.error("Error al actualizar transacción:", error)
    return NextResponse.json(
      { error: "Error al actualizar transacción" },
      { status: 500, headers: corsHeaders() }
    )
  }
}