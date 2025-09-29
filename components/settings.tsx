"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Palette, Database, Shield, Download, Upload, Trash2 } from "lucide-react"

export function Settings() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu experiencia con ExpenseTracker</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" placeholder="Tu nombre" defaultValue="Usuario Demo" className="glass" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                defaultValue="demo@expensetracker.com"
                className="glass"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda predeterminada</Label>
              <Select defaultValue="usd">
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD - Dólar Estadounidense</SelectItem>
                  <SelectItem value="mxn">MXN - Peso Mexicano</SelectItem>
                  <SelectItem value="eur">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-gradient-to-r from-primary to-accent">Guardar Cambios</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="budget-alerts">Alertas de presupuesto</Label>
                <p className="text-sm text-muted-foreground">Recibe alertas cuando excedas el 80% del presupuesto</p>
              </div>
              <Switch id="budget-alerts" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="unnecessary-alerts">Gastos innecesarios</Label>
                <p className="text-sm text-muted-foreground">Notificaciones sobre patrones de gasto innecesario</p>
              </div>
              <Switch id="unnecessary-alerts" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="monthly-reports">Reportes mensuales</Label>
                <p className="text-sm text-muted-foreground">Resumen mensual de gastos por email</p>
              </div>
              <Switch id="monthly-reports" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="transaction-alerts">Nuevas transacciones</Label>
                <p className="text-sm text-muted-foreground">Confirmar cada nueva transacción</p>
              </div>
              <Switch id="transaction-alerts" />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Apariencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <Select defaultValue="dark">
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Color de acento</Label>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-primary cursor-pointer"></div>
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-transparent cursor-pointer"></div>
                <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-transparent cursor-pointer"></div>
                <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-transparent cursor-pointer"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="animations">Animaciones</Label>
                <p className="text-sm text-muted-foreground">Efectos de transición y animaciones</p>
              </div>
              <Switch id="animations" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Gestión de Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Exportar datos</Label>
              <p className="text-sm text-muted-foreground">Descarga todos tus datos en formato CSV</p>
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Exportar Transacciones
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Importar datos</Label>
              <p className="text-sm text-muted-foreground">Sube un archivo CSV con transacciones</p>
              <Button variant="outline" className="w-full bg-transparent">
                <Upload className="w-4 h-4 mr-2" />
                Importar Transacciones
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-destructive">Zona de peligro</Label>
              <p className="text-sm text-muted-foreground">Eliminar todos los datos permanentemente</p>
              <Button variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Todos los Datos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacidad y Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Autenticación de dos factores</Label>
                    <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad</p>
                  </div>
                  <Switch id="two-factor" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-sharing">Compartir datos anónimos</Label>
                    <p className="text-sm text-muted-foreground">Ayuda a mejorar la aplicación</p>
                  </div>
                  <Switch id="data-sharing" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Contraseña actual</Label>
                  <Input id="current-password" type="password" className="glass" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <Input id="new-password" type="password" className="glass" />
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Cambiar Contraseña
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
