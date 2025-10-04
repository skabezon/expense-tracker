import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api/auth'
import { UserService } from '@/lib/services/userService'
import { successResponse, handleApiError } from '@/lib/api/response'
import { z } from 'zod'

const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
})

/**
 * GET /api/users - Obtener información del usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser()
    const user = await UserService.findByEmail(authUser.email)

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    return successResponse(user)
  } catch (error) {
    return handleApiError(error, 'GET /api/users')
  }
}

/**
 * PUT /api/users - Actualizar información del usuario autenticado
 */
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser()
    const body = await request.json()
    const data = UpdateUserSchema.parse(body)

    const user = await UserService.findByEmail(authUser.email)

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    const updatedUser = await UserService.update(user._id!.toString(), data)

    return successResponse(updatedUser, 'Usuario actualizado correctamente')
  } catch (error) {
    return handleApiError(error, 'PUT /api/users')
  }
}

/**
 * DELETE /api/users - Eliminar cuenta del usuario autenticado
 */
export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser()
    const user = await UserService.findByEmail(authUser.email)

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    await UserService.delete(user._id!.toString())

    return successResponse(null, 'Usuario eliminado correctamente')
  } catch (error) {
    return handleApiError(error, 'DELETE /api/users')
  }
}