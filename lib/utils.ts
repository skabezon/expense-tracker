import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convierte un mes en español a su número (0-11)
 * @param month - Nombre del mes en español (ej: "enero", "Enero", "ENERO")
 * @returns Número del mes (0-11) o -1 si no es válido
 */
export function monthToNumber(month: string): number {
  const months: Record<string, number> = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11,
  }

  return months[month.toLowerCase()] ?? -1
}

/**
 * Convierte un número de mes (0-11) a su nombre en español
 * @param monthNumber - Número del mes (0-11)
 * @returns Nombre del mes en español o cadena vacía si no es válido
 */
export function numberToMonth(monthNumber: number): string {
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ]

  return months[monthNumber] ?? ''
}