# 🎯 ReservaYa - Plataforma de Reservas y Gestión

[![Backend Deploy](https://github.com/YOUR_USERNAME/ReservaYa/actions/workflows/backend-deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/ReservaYa/actions/workflows/backend-deploy.yml)
[![Frontend Deploy](https://github.com/YOUR_USERNAME/ReservaYa/actions/workflows/frontend-deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/ReservaYa/actions/workflows/frontend-deploy.yml)
[![CI Tests](https://github.com/YOUR_USERNAME/ReservaYa/actions/workflows/ci-tests.yml/badge.svg)](https://github.com/YOUR_USERNAME/ReservaYa/actions/workflows/ci-tests.yml)

ReservaYa es una plataforma moderna de reservas y gestión de servicios que conecta proveedores con clientes, permitiendo la reserva de citas, eventos, servicios a domicilio y mesas de restaurante.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Inicio Rápido](#-inicio-rápido)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías](#-tecnologías)
- [Documentación](#-documentación)
- [Scripts Útiles](#-scripts-útiles)
- [Despliegue](#-despliegue)

## ✨ Características

### Para Clientes
- 🔍 Búsqueda y descubrimiento de servicios
- 📅 Reserva de citas en tiempo real
- 💬 Asistente de IA para ayuda personalizada
- 📱 Interfaz responsiva y moderna
- ✉️ Notificaciones de confirmación

### Para Proveedores
- 🏢 Perfiles personalizados con landing pages
- 📊 Gestión de servicios y precios
- 👥 Administración de personal
- 📈 Dashboard de reservas
- ⏰ Configuración de horarios

### Tipos de Servicios Soportados
1. **APPOINTMENT** - Citas (ej: salón de belleza, consultoría)
2. **EVENT** - Eventos (ej: talleres, clases grupales)
3. **ON_SITE** - Servicios a domicilio (ej: reparaciones)
4. **TABLE** - Reservas de mesa (ej: restaurantes)

## 🏗️ Arquitectura

```
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  React Frontend │────────▶│  .NET 9 Backend  │
│  (TypeScript)   │  HTTPS  │   (Web API)      │
│                 │◀────────│                  │
└─────────────────┘         └────────┬─────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │ Azure Table     │
                            │ Storage         │
                            └─────────────────┘
```

### Stack Tecnológico

**Backend:**
- .NET 9 (C#)
- ASP.NET Core Web API
- Azure Table Storage
- Repository Pattern
- Dependency Injection
- Swagger/OpenAPI

**Frontend:**
- React 19
- TypeScript
- Vite
- Google Gemini AI
- Custom Hooks

## 🚀 Inicio Rápido

### Requisitos Previos

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+)
- [Azurite](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite) (para desarrollo local)
- [PowerShell](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell)

### Instalación Rápida

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd ReservaYa
   ```

2. **Iniciar todo el entorno de desarrollo**
   ```powershell
   .\start-dev.ps1
   ```

   Este script:
   - ✅ Verifica requisitos del sistema
   - ✅ Instala dependencias si es necesario
   - ✅ Inicia Azurite (emulador de Azure Storage)
   - ✅ Inicia el backend en `https://localhost:5001`
   - ✅ Inicia el frontend en `http://localhost:3000`

3. **Poblar datos iniciales** (opcional)
   ```powershell
   .\seed-data.ps1
   ```

   Esto creará:
   - 3 proveedores de ejemplo
   - 2 perfiles de proveedor
   - 6 servicios de prueba
   - 2 miembros del personal
   - 1 cliente de prueba

4. **Acceder a la aplicación**
   - Frontend: http://localhost:3000
   - Backend API: https://localhost:5001/api
   - Swagger UI: https://localhost:5001/swagger

### Instalación Manual

Si prefieres iniciar cada componente por separado:

**Backend:**
```powershell
cd Backend
.\run-local.ps1 -StartAzurite
```

**Frontend:**
```bash
cd Frontend
npm install
npm run dev
```

## 📁 Estructura del Proyecto

```
ReservaYa/
├── Backend/                    # .NET 9 Web API
│   ├── Controllers/           # API Controllers
│   ├── Models/                # Domain Models
│   ├── Services/              # Business Logic
│   │   ├── Interfaces/       # Service Interfaces
│   │   └── ...               # Service Implementations
│   ├── Program.cs            # App Configuration
│   ├── appsettings.json      # Configuration
│   ├── Dockerfile            # Docker Configuration
│   └── README.md             # Backend Documentation
│
├── Frontend/                   # React + TypeScript
│   ├── components/            # React Components
│   │   ├── Navbar.tsx
│   │   ├── Assistant.tsx
│   │   ├── BookingModal.tsx
│   │   └── ApiExample.tsx    # API Integration Example
│   ├── config/               # Configuration
│   │   └── api.config.ts     # API Configuration
│   ├── hooks/                # Custom React Hooks
│   │   └── useApi.ts         # API Integration Hooks
│   ├── services/             # External Services
│   │   ├── apiService.ts     # Backend API Client
│   │   └── geminiService.ts  # AI Service
│   ├── App.tsx               # Main Component
│   ├── types.ts              # TypeScript Types
│   ├── .env.example          # Environment Template
│   └── README.md             # Frontend Documentation
│
├── start-dev.ps1              # 🚀 Inicio rápido del entorno
├── seed-data.ps1              # 🌱 Poblar datos iniciales
└── README.md                  # Este archivo
```

## 🛠️ Tecnologías

### Backend
- **Framework:** .NET 9, ASP.NET Core 9
- **Base de Datos:** Azure Table Storage (NoSQL)
- **Patrón:** Repository Pattern, Dependency Injection
- **API Docs:** Swagger/OpenAPI
- **Contenedor:** Docker
- **Hosting:** Azure App Service

### Frontend
- **Framework:** React 19
- **Lenguaje:** TypeScript
- **Build Tool:** Vite
- **IA:** Google Gemini API
- **State Management:** React Hooks
- **Hosting:** Azure Static Web Apps (recomendado)

## 📚 Documentación

### Documentación del Backend
- [Backend README](Backend/README.md) - Guía completa del backend
- [Quick Start](Backend/QUICKSTART.md) - Inicio rápido
- [Architecture](Backend/ARCHITECTURE.md) - Detalles de arquitectura
- [API Examples](Backend/API_EXAMPLES.md) - Ejemplos de uso del API

### Documentación del Frontend
- [Frontend README](Frontend/README.md) - Guía completa del frontend
- [API Integration](Frontend/API_INTEGRATION.md) - Guía de integración con el backend
- [ApiExample Component](Frontend/components/ApiExample.tsx) - Ejemplo de código

### APIs Principales

#### Users API
```http
GET    /api/users              # Obtener todos los usuarios
POST   /api/users              # Crear usuario
GET    /api/users/{id}         # Obtener usuario por ID
PUT    /api/users/{id}         # Actualizar usuario
DELETE /api/users/{id}         # Eliminar usuario
```

#### Services API
```http
GET    /api/services                          # Todos los servicios
POST   /api/services                          # Crear servicio
GET    /api/services/by-provider/{providerId} # Servicios por proveedor
```

#### Bookings API
```http
GET    /api/bookings/by-client/{clientId}     # Reservas por cliente
GET    /api/bookings/by-provider/{providerId} # Reservas por proveedor
POST   /api/bookings                          # Crear reserva
PATCH  /api/bookings/{id}/cancel              # Cancelar reserva
PATCH  /api/bookings/{id}/confirm             # Confirmar reserva
```

Ver [API_EXAMPLES.md](Backend/API_EXAMPLES.md) para más detalles.

## 📜 Scripts Útiles

### Desarrollo

```powershell
# Iniciar entorno completo (backend + frontend + Azurite)
.\start-dev.ps1

# Iniciar solo backend
.\start-dev.ps1 -SkipFrontend

# Iniciar solo frontend
.\start-dev.ps1 -SkipBackend

# Iniciar sin Azurite (usar Azure en la nube)
.\start-dev.ps1 -SkipAzurite
```

### Datos

```powershell
# Poblar datos iniciales
.\seed-data.ps1

# Poblar datos en backend remoto
.\seed-data.ps1 -BackendUrl "https://mi-backend.azurewebsites.net/api"
```

### Backend

```powershell
cd Backend

# Ejecutar localmente
dotnet run

# Ejecutar con Azurite
.\run-local.ps1 -StartAzurite

# Compilar
dotnet build

# Tests
dotnet test

# Publicar
dotnet publish -c Release
```

### Frontend

```bash
cd Frontend

# Desarrollo
npm run dev

# Build
npm run build

# Preview del build
npm run preview

# Linter
npm run lint
```

## 🚀 Despliegue

ReservaYa utiliza **GitHub Actions** para CI/CD automático con despliegue a Azure.

### 🎯 Despliegue Automático con GitHub Actions

#### Workflows Disponibles

1. **Backend Deploy** (`.github/workflows/backend-deploy.yml`)
   - Trigger: Push a `main` con cambios en `Backend/**`
   - Destino: Azure App Service (`testarauco`)
   - Pipeline: Build → Test → Publish → Deploy

2. **Frontend Deploy** (`.github/workflows/frontend-deploy.yml`)
   - Trigger: Push a `main` con cambios en `Frontend/**`
   - Destino: Azure Static Web Apps
   - Pipeline: Build → Deploy

3. **CI Tests** (`.github/workflows/ci-tests.yml`)
   - Trigger: Pull requests
   - Ejecuta: Tests del backend + Lint del frontend + Security scan

#### 🔧 Configuración Rápida

**1. Configurar Secretos en GitHub:**

Ve a: Repository Settings → Secrets and variables → Actions

Crea estos secretos:
- `AZURE_WEBAPP_PUBLISH_PROFILE` - Publish profile del App Service
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - Token del Static Web App
- `VITE_GEMINI_API_KEY` - API key de Google Gemini (opcional)

**2. Configurar Azure App Service:**

```bash
# En Azure Portal → App Service → Configuration
AzureTableStorage__ConnectionString = <tu-connection-string>
```

**3. Desplegar:**

```bash
git add .
git commit -m "Deploy to Azure"
git push origin main
```

Los workflows se ejecutarán automáticamente! 🎉

#### 📊 URLs de Producción

- **Backend API:** https://testarauco-htfzbfacbcf3fcfs.eastus2-01.azurewebsites.net
- **Swagger UI:** https://testarauco-htfzbfacbcf3fcfs.eastus2-01.azurewebsites.net/swagger
- **Frontend:** Tu URL de Azure Static Web App

#### 📚 Documentación Completa de Despliegue

Ver guías detalladas:
- **[DEPLOY.md](DEPLOY.md)** - Guía rápida de despliegue
- **[.github/DEPLOYMENT.md](.github/DEPLOYMENT.md)** - Configuración completa paso a paso

### 🔄 Despliegue Manual (Alternativo)

Si prefieres desplegar manualmente sin GitHub Actions:

**Backend:**
```bash
cd Backend
dotnet publish -c Release -o ./publish
# Usar Azure Portal para subir la carpeta publish
```

**Frontend:**
```bash
cd Frontend
npm run build
# Usar Azure Portal para subir la carpeta dist
```

## 🔐 Seguridad

- Variables de entorno para credenciales sensibles
- HTTPS obligatorio en producción
- CORS configurado para dominios específicos
- Validación de datos en backend
- Manejo seguro de errores sin exponer detalles internos

## 🐛 Troubleshooting

### Backend no inicia
```powershell
# Verificar .NET SDK
dotnet --version

# Verificar Azurite
azurite --version

# Reinstalar dependencias
dotnet restore
```

### Frontend no conecta con Backend
1. Verifica que `VITE_API_BASE_URL` esté configurado en `.env`
2. Verifica que el backend esté corriendo
3. Revisa la consola del navegador para errores de CORS
4. Verifica que el backend tenga CORS configurado para `http://localhost:3000`

### Error de CORS
El backend debe tener en `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código privado.

## 👥 Equipo

Desarrollado con ❤️ por el equipo de ReservaYa

---

**¿Preguntas?** Revisa la [documentación](Backend/README.md) o abre un issue.

**¿Listo para empezar?** Ejecuta `.\start-dev.ps1` y comienza a desarrollar! 🚀
