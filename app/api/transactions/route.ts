import { NextRequest, NextResponse } from "next/server"
import { TransactionService } from "@/lib/services/transactionService"

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id',
  }
}

// Manejar preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}
export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const transactions = await TransactionService.findByUserId(userId)
    return NextResponse.json(transactions, { headers: corsHeaders() })
  } catch (error) {
    console.error("Error al obtener transacciones:", error)
    return NextResponse.json(
      { error: "Error al obtener transacciones" },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const transaction = await TransactionService.create({
      ...body,
      userId,
      date: new Date(body.date),
    })

    return NextResponse.json(transaction, { headers: corsHeaders() })
  } catch (error) {
    console.error("Error al crear transacción:", error)
    return NextResponse.json(
      { error: "Error al crear transacción" },
      { status: 500, headers: corsHeaders() }
    )
  }
}

