# Configuración de Azure para ReservaYa

## 📋 Configuraciones Requeridas

### 1. Azure App Service (Backend)

**Nombre del App Service**: `testarauco`  
**URL**: https://testarauco-htfzbfacbcf3fcfs.eastus2-01.azurewebsites.net

#### ✅ Connection String Requerida

Debes configurar la connection string de Azure Table Storage en el App Service:

1. Ve al Portal de Azure: https://portal.azure.com
2. Navega a tu App Service: `testarauco`
3. En el menú izquierdo, selecciona **Configuration**
4. En la pestaña **Connection strings**, agrega:

   - **Name**: `AzureTableStorage`
   - **Value**: Tu connection string de Azure Storage Account (formato: `DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net`)
   - **Type**: `Custom`

5. Click **Save**
6. Espera a que el App Service reinicie

#### 📝 Cómo obtener la Connection String

1. Ve a tu **Storage Account** en el Portal de Azure
2. En el menú izquierdo, selecciona **Access keys**
3. Copia el valor de **Connection string** (de cualquiera de las dos keys)

**⚠️ IMPORTANTE**: Sin esta configuración, el backend se crasheará al arrancar en producción.

---

### 2. Azure Static Web App (Frontend)

**URL**: https://delightful-tree-089c2700f.3.azurestaticapps.net/

#### ✅ Variables de Entorno

Las variables de entorno ya están configuradas en [.github/workflows/frontend-deploy.yml](.github/workflows/frontend-deploy.yml):

```yaml
env:
  VITE_API_BASE_URL: https://testarauco-htfzbfacbcf3fcfs.eastus2-01.azurewebsites.net/api
  VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
```

**Requerimientos de GitHub Secrets**:
- `VITE_GEMINI_API_KEY`: Ya configurado ✅
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Ya configurado ✅

---

## 🚀 Proceso de Deployment

### Backend

1. Push a la rama `main` con cambios en `Backend/**`
2. GitHub Actions ejecuta [.github/workflows/backend-deploy.yml](.github/workflows/backend-deploy.yml)
3. Build y deploy automático a Azure App Service
4. **Verifica** que la connection string esté configurada en Azure

### Frontend

1. Push a la rama `main` con cambios en `Frontend/**`
2. GitHub Actions ejecuta [.github/workflows/frontend-deploy.yml](.github/workflows/frontend-deploy.yml)
3. Build con variables de entorno de producción
4. Deploy automático a Azure Static Web Apps

---

## 🔍 Verificación de Deployment

### Backend (API)

```powershell
# Test base URL
Invoke-WebRequest -Uri "https://testarauco-htfzbfacbcf3fcfs.eastus2-01.azurewebsites.net"

# Test API endpoint
Invoke-RestMethod -Uri "https://testarauco-htfzbfacbcf3fcfs.eastus2-01.azurewebsites.net/api/providerprofiles" -Method Get

# Test Swagger (solo en Development)
# Start-Process "https://testarauco-htfzbfacbcf3fcfs.eastus2-01.azurewebsites.net/swagger"
```

### Frontend (Static Web App)

```powershell
# Abrir en navegador
Start-Process "https://delightful-tree-089c2700f.3.azurestaticapps.net"
```

---

## 🛠️ Troubleshooting

### Backend devuelve 404 en endpoints

**Causa**: El backend probablemente se crasheó durante el startup  
**Solución**: 
1. Verifica que la Connection String esté configurada en Azure App Service
2. Ve a **Logs** en el App Service para ver errores
3. Reinicia el App Service después de configurar la connection string

### Frontend muestra datos MOCK en producción

**Causa**: El frontend no puede conectarse al backend (CORS o backend caído)  
**Solución**:
1. Verifica que el backend responda (ver comandos arriba)
2. Verifica CORS en [Backend/Program.cs](Backend/Program.cs) incluya la URL del Static Web App
3. Revisa la consola del navegador para errores (F12 → Console)

### Cambios no se reflejan después de deployment

**Causa**: Caché del navegador o deployment no completado  
**Solución**:
1. Espera 1-2 minutos después del deployment
2. Refresca con Ctrl+Shift+R (hard refresh)
3. Verifica el workflow en GitHub Actions que haya completado exitosamente

---

## 📚 Recursos

- [Azure App Service Documentation](https://learn.microsoft.com/azure/app-service/)
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/azure/static-web-apps/)
- [Azure Table Storage Documentation](https://learn.microsoft.com/azure/storage/tables/)
- [GitHub Actions Azure Deployment](https://learn.microsoft.com/azure/app-service/deploy-github-actions)

---

## 🔐 Seguridad

**❌ NO COMMITEAR**:
- Connection strings en código
- API keys en archivos `.env` (solo `.env.example`)
- Secrets de GitHub Actions

**✅ USAR**:
- GitHub Secrets para valores sensibles
- Azure Key Vault para production secrets (recomendado para futuro)
- Variables de entorno de Azure App Service

---

_Última actualización: $(Get-Date -Format 'yyyy-MM-dd')_
