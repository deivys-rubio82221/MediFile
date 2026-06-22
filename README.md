# MediFile 📋

### Organizador inteligente de papelería médica con IA

App web progresiva (PWA) que permite fotografiar, organizar y clasificar automáticamente documentos médicos usando Claude de Anthropic. Incluye copia de seguridad en la nube y un perfil médico de emergencia accesible en segundos.

---

## 📁 Estructura del proyecto

```
medifile/
├── index.html          ← App completa (HTML + CSS + JS en un solo archivo)
├── manifest.json       ← Configuración PWA (instalable como app)
├── sw.js               ← Service Worker (funciona sin internet + auto-actualización)
├── generate_icons.py   ← Script para generar los iconos
├── icons/              ← (Generado por generate_icons.py)
│   ├── icon-72.png … icon-512.png
│   ├── icon-maskable-192.png / icon-maskable-512.png
│   ├── apple-touch-icon.png
│   └── favicon-32.png
└── README.md           ← Este archivo
```

---

## ✅ Funcionalidades

| Función | Descripción |
|---|---|
| 🔐 **Auth** | Registro, login y recuperación con pregunta de seguridad |
| 👆 **Biometría** | Desbloqueo con huella o Face ID (WebAuthn) |
| 📷 **Cámara** | Captura con cámara trasera o desde galería |
| 🤖 **IA (Claude)** | Lee el documento y sugiere la carpeta correcta |
| 📂 **Carpetas** | 6 carpetas predeterminadas + crear nuevas con colores |
| 🔍 **Búsqueda** | Búsqueda instantánea por nombre, tipo o texto extraído |
| 🕐 **Recientes** | Lista todos los documentos ordenados por fecha |
| 🔬 **Zoom de documentos** | Visor de pantalla completa con pan y zoom real |
| ⏰ **Recordatorios** | Notificaciones para citas o toma de medicamentos |
| ☁️ **Copia de seguridad** | Respaldo manual o en la nube (Drive / Firebase / Supabase) |
| 🆘 **Perfil médico** | Tipo de sangre, alergias, EPS y contacto de emergencia |
| 📱 **PWA** | Instalable en celular como app nativa, con accesos directos |
| 🌙 **Dark mode** | Soporte automático según preferencia del sistema |
| 💻 **Responsive** | Móvil, tablet y escritorio con panel de marca |
| 📴 **Offline** | Funciona sin internet (excepto clasificación IA) |
| 🔄 **Auto-actualización** | Aviso no intrusivo cuando hay una versión nueva |

---

## 🚀 Cómo ejecutar localmente

### Opción 1 — Python (recomendado, sin instalar nada)

```bash
cd medifile
python3 generate_icons.py
python3 -m http.server 8080
# → http://localhost:8080
```

### Opción 2 — Node.js

```bash
npm install -g serve
serve . -p 8080
```

### Opción 3 — PHP

```bash
php -S localhost:8080
```

---

## 📱 Probar en celular (red local)

> Necesitas que el celular y el computador estén en el **mismo WiFi**.

```bash
# IP local (Mac/Linux)
ip addr show | grep "inet " | grep -v 127.0.0.1
# IP local (Windows)
ipconfig

python3 -m http.server 8080 --bind 0.0.0.0
# En el celular: http://192.168.X.X:8080
```

> ⚠️ La cámara y la biometría (WebAuthn) solo funcionan con **HTTPS o localhost**. En red local (`192.168.X.X`) ambas pueden bloquearse.

### Probar con HTTPS local usando ngrok

```bash
ngrok http 8080
# Usa la URL https://xxxx.ngrok.io en el celular
```

---

## 🔑 Configurar la clave API de IA

1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. Crea una cuenta
3. Ve a **API Keys** → **Create Key**
4. En la app: **Perfil → Configurar IA → pega tu clave**

La clave se guarda **solo en tu dispositivo** (localStorage). Sin clave API, la app clasifica usando palabras clave de forma básica.

Modelo usado actualmente: `claude-sonnet-4-20250514`. Alternativas si quieres cambiar velocidad/costo/precisión:
- `claude-haiku-4-5-20251001` — más rápido y económico
- `claude-opus-4-6` — más preciso, mayor costo

---

## ☁️ Copia de seguridad

Desde **Perfil → Copia de seguridad** puedes:

- Ver la fecha de tu última copia.
- Elegir proveedor: **Google Drive**, **Firebase** o **Supabase**.
- Crear o restaurar una copia (requiere que conectes tus propias credenciales del proveedor — ver nota abajo).
- Exportar/importar manualmente un archivo `.json` con todos tus datos, sin depender de ningún proveedor externo. Esta opción siempre funciona, incluso sin internet.

> **Nota importante:** la integración real con Google Drive/Firebase/Supabase requiere que tú (o quien despliegue la app) registre credenciales OAuth/API en cada plataforma — son gratuitas pero requieren configuración propia por motivos de seguridad (no se puede compartir una clave de Anthropic/Google entre todos los usuarios de una app pública). La función de exportar/importar manual está completamente lista y no depende de configuración externa.

---

## 🆘 Perfil médico de emergencia

Desde **Perfil → Perfil médico** puedes registrar:

- Nombre, edad y tipo de sangre.
- EPS / aseguradora.
- Alergias, condiciones crónicas y medicamentos actuales (como etiquetas).
- Contacto de emergencia (nombre, teléfono, relación).
- Notas adicionales.

Esta información se muestra en una tarjeta de identificación visual pensada para mostrarse rápido a personal médico en una urgencia. Se guarda localmente, igual que el resto de tus datos.

---

## 🌐 Desplegar en producción (gratis)

### Netlify Drop (más fácil, 1 minuto)
1. Ve a [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra la carpeta `medifile/`
3. Listo — URL pública con HTTPS

### Vercel
```bash
npm install -g vercel
vercel
```

### GitHub Pages
```bash
git init
git add .
git commit -m "MediFile v1.1.0"
git remote add origin https://github.com/TU_USUARIO/medifile.git
git push -u origin main
# Settings → Pages → Source: main branch
```

### Cloudflare Pages
```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name=medifile
```

---

## 📲 Instalar como app en el celular (PWA)

**Android (Chrome):**
1. Abre la URL en Chrome
2. Menú (⋮) → "Instalar app"

**iPhone (Safari):**
1. Abre la URL en Safari
2. Compartir (□↑) → "Agregar a pantalla de inicio"

Una vez instalada, los accesos directos (mantener presionado el ícono) te llevan directo a Cámara, Búsqueda o Perfil médico.

---

## 🛠 Personalización

### Agregar nuevas carpetas predeterminadas

```javascript
const DEF_FOLDERS = [
  {id:'_cir', name:'Cirugía',     icon:'ti-cut',         colorIdx:3},
  {id:'_lab', name:'Laboratorio', icon:'ti-flask',       colorIdx:1},
  {id:'_car', name:'Cardiología', icon:'ti-heart',       colorIdx:0}, // ← nueva
];
```

| Índice | Color |
|---|---|
| 0 | Azul |
| 1 | Verde |
| 2 | Ámbar |
| 3 | Rojo |
| 4 | Morado |
| 5 | Teal |
| 6 | Gris |

Íconos: cualquiera de [Tabler Icons](https://tabler-icons.io/) (sin el prefijo `ti-`).

---

## 💾 Almacenamiento de datos

| Clave | Contenido |
|---|---|
| `mf_users` | Lista de usuarios (email, hash de contraseña SHA-256) |
| `mf_folders_[uid]` | Carpetas del usuario |
| `mf_docs_[uid]` | Metadatos de documentos |
| `mf_i_[docId]` | Imagen en base64 de cada documento |
| `mf_reminders_[uid]` | Recordatorios programados |
| `mf_medical_[uid]` | Perfil médico de emergencia |
| `mf_backupmeta_[uid]` | Fecha y proveedor de la última copia de seguridad |

> **Límite:** ~5-10 MB por navegador. Con imágenes comprimidas (~40-60 KB cada una), caben entre 80-150 documentos. Para más capacidad, considera migrar a IndexedDB.

---

## 🔄 Cómo funciona la actualización

A partir de v1.1.0, cuando publicas una nueva versión (subiendo un `sw.js` con un `SW_VERSION` distinto), los usuarios que tengan la app abierta verán un pequeño aviso "Hay una nueva versión disponible" con un botón **Actualizar**. La app no se recarga sola a la fuerza — el usuario decide el momento, evitando perder un análisis de IA o un formulario a medio llenar.

Para publicar una actualización: sube los archivos nuevos y simplemente sube en 1 el número de `SW_VERSION` dentro de `sw.js`.

---

## 🗺 Roadmap

- [x] Búsqueda de documentos por texto
- [x] Recordatorios de citas/medicamentos
- [x] Perfil médico de emergencia
- [x] Copia de seguridad (exportación manual)
- [ ] Sincronización real en la nube (Firebase / Supabase con credenciales propias)
- [ ] Exportar documentos a PDF
- [ ] Compartir documentos con otros usuarios (médico, familiar)
- [ ] OCR offline sin internet
- [ ] Migración de localStorage a IndexedDB para mayor capacidad

---

## ⚙️ Requisitos técnicos

| Requisito | Mínimo |
|---|---|
| Navegador | Chrome 90+, Safari 14+, Firefox 88+, Edge 90+ |
| Internet | Solo para clasificación con IA y copia en la nube |
| Cámara | Requerida para captura directa (opcional si usas galería) |
| Biometría | Requiere HTTPS o localhost; sensor de huella/Face ID en el dispositivo |
| Almacenamiento | ~5-10 MB libres en el dispositivo |

---

## 📄 Licencia

Uso libre para fines personales y educativos.