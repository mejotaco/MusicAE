# MusicAE - Advanced Edition v2.0
## 🎵 Con Base de Datos IndexedDB y Sistema de Hilos

**ACTUALIZADO** - Ahora con base de datos real, reproducción mejorada y sistema completo de hilos de discusión.

## 🚀 ¿Qué hay de nuevo en v2.0?

### ✨ Nuevas Características

1. **📊 Base de Datos Real (IndexedDB)**
   - Persistencia real de datos en el navegador
   - No más LocalStorage simulado
   - Datos estructurados y relaciones entre tablas

2. **🎵 Reproductor Mejorado**
   - Reproducción de YouTube 100% funcional
   - Manejo de errores mejorado
   - Control de progreso preciso
   - Miniaturas de YouTube automáticas

3. **💬 Sistema de Hilos Completo**
   - Crea hilos de discusión en cada canción
   - Responde a hilos existentes
   - Sistema de conversaciones anidadas

4. **⭐ Reviews Mejoradas**
   - Sistema de calificación por estrellas
   - Comentarios detallados
   - Promedio de ratings por canción

## 📁 Archivos del Proyecto

```
MusicAE/
├── index.html          # Vista de usuario
├── admin.html          # Panel de administración
├── styles.css          # Estilos globales
├── database.js         # ⭐ NUEVO - Base de datos IndexedDB
├── script.js           # JavaScript de usuario (actualizado)
├── admin-script.js     # JavaScript de admin
└── README.md           # Documentación
```

## 🎯 Cómo Usar

### 1. Descargar todos los archivos

Descarga los **7 archivos** haciendo click en cada uno:
- index.html
- admin.html
- styles.css
- **database.js** ⭐ NUEVO
- script.js
- admin-script.js
- README.md

### 2. Colocar en la misma carpeta

**MUY IMPORTANTE**: Todos los archivos deben estar en la **misma carpeta**.

```
📁 MusicAE/
   📄 index.html
   📄 admin.html
   📄 styles.css
   📄 database.js        ⭐ NUEVO
   📄 script.js
   📄 admin-script.js
   📄 README.md
```

### 3. Abrir el archivo index.html

- Doble click en `index.html`
- Se abrirá en tu navegador
- ✅ La primera vez cargará datos de ejemplo automáticamente

## 🔐 Credenciales

### Usuario Normal
- **Registrate**: Puedes crear tu propio usuario
- **Login demo**: Usa los usuarios pre-cargados
  - Usuario: `MusicLover`
  - Password: `demo123`

### Administrador
- Abre `admin.html`
- Usuario: `admin`
- Password: `admin123`
- 2FA: `123456`

## 🎵 Cómo Funciona la Música

### Agregar Canciones

1. Click en "Add Song"
2. Llena el formulario:
   - **Título**: Nombre de la canción
   - **Artista**: Nombre del artista
   - **Álbum**: (Opcional)
   - **URL de YouTube**: 🔗 **IMPORTANTE**
   - **Género**: Selecciona uno

### URLs de YouTube Compatibles

✅ **Formatos que funcionan:**
```
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
```

❌ **No usar:**
- Playlists
- Videos privados
- Videos con restricciones de reproducción

### Ejemplos de URLs que funcionan:

```
https://www.youtube.com/watch?v=fJ9rUzIMcZQ  (Bohemian Rhapsody)
https://www.youtube.com/watch?v=QkF3oxziUI4  (Stairway to Heaven)
https://www.youtube.com/watch?v=hTWKbfoikeg  (Smells Like Teen Spirit)
```

## 💬 Sistema de Hilos

### Crear un Hilo

1. Click en cualquier canción
2. Scroll hasta "Hilos de Discusión"
3. Click en "Crear Hilo"
4. Escribe título y contenido
5. ¡Listo!

### Responder a Hilos

1. Click en cualquier hilo
2. Lee la conversación
3. Escribe tu respuesta abajo
4. Click en "Enviar Respuesta"

## ⭐ Sistema de Reviews

### Agregar una Review

1. Click en una canción
2. Scroll hasta "Reviews"
3. Click en "Agregar Review"
4. Selecciona estrellas (1-5)
5. Escribe tu comentario
6. Enviar

## 🗄️ Base de Datos IndexedDB

### Tablas Creadas

La aplicación crea automáticamente 7 tablas:

1. **users** - Usuarios registrados
2. **songs** - Canciones subidas
3. **reviews** - Calificaciones y comentarios
4. **threads** - Hilos de discusión
5. **replies** - Respuestas a hilos
6. **favorites** - Canciones favoritas
7. **playlists** - Listas de reproducción

### Ver la Base de Datos

Puedes inspeccionar la base de datos:

1. Abre DevTools (F12)
2. Ve a la pestaña "Application"
3. En el menú izquierdo busca "IndexedDB"
4. Expande "MusicAEDatabase"
5. Verás todas las tablas

## 🔧 Solución de Problemas

### ❌ La música no se reproduce

**Posibles causas:**

1. **El video no permite reproducción embebida**
   - Solución: Prueba con otra URL de YouTube
   
2. **La API de YouTube no cargó**
   - Solución: Recarga la página (F5)
   
3. **No tienes internet**
   - Solución: Conéctate a internet (YouTube requiere conexión)

### ❌ No se guardan las canciones

**Causa:** Falta el archivo `database.js`

**Solución:**
1. Verifica que `database.js` esté en la misma carpeta
2. Abre la consola (F12) y busca errores
3. Recarga la página

### ❌ Aparece una pantalla en blanco

**Solución:**
1. Verifica que TODOS los archivos estén en la misma carpeta
2. Abre la consola (F12) y lee los errores
3. Asegúrate de que los nombres de archivo sean correctos:
   - `database.js` (no Database.js ni database.txt)
   - `script.js` (no Script.js)
   - etc.

## 🎓 Características Técnicas

### Base de Datos
- **IndexedDB** - Base de datos del navegador
- **Persistencia** - Los datos se guardan permanentemente
- **Relaciones** - Tablas conectadas entre sí
- **Índices** - Búsquedas rápidas

### Reproductor
- **YouTube IFrame API** - Reproducción oficial
- **Estados** - Playing, Paused, Buffering, Ended
- **Controles** - Play, Pause, Next, Previous, Shuffle, Repeat
- **Progreso** - Barra de tiempo con seek

### Hilos
- **Conversaciones** - Estilo foro
- **Respuestas** - Sistema de replies
- **Timestamps** - Fecha y hora
- **Contador** - Número de respuestas

## 📊 Datos de Ejemplo

La primera vez que abras la app, se cargarán automáticamente:

- ✅ 2 usuarios de ejemplo
- ✅ 6 canciones clásicas
- ✅ Algunas reviews

Puedes eliminar estos datos desde el panel de admin.

## 🚀 Próximas Mejoras

- [ ] Sistema de playlists funcional
- [ ] Búsqueda avanzada
- [ ] Filtros por múltiples géneros
- [ ] Like/Dislike en reviews
- [ ] Notificaciones
- [ ] Modo oscuro/claro
- [ ] Exportar/Importar biblioteca

## ⚠️ Importante

- **Requiere navegador moderno** (Chrome, Firefox, Edge, Safari)
- **Requiere JavaScript habilitado**
- **Requiere conexión a internet** (para YouTube)
- **Los datos se guardan en tu navegador** (no en la nube)

## 💡 Tips

1. **Agrega tus canciones favoritas** desde YouTube
2. **Crea hilos** para discutir sobre música
3. **Deja reviews** en las canciones que te gustan
4. **Marca favoritos** con el corazón
5. **Usa shuffle** para escucha aleatoria

## 🎮 Atajos de Teclado

- **Espacio** - Play/Pause (en player)
- **F5** - Recargar app
- **F12** - Abrir DevTools

## 📝 Notas

- La base de datos es local (solo en tu navegador)
- No hay servidor backend
- Los videos vienen de YouTube
- Las descargas abren YouTube en nueva pestaña

## 🏆 Créditos

**MusicAE - Advanced Edition v2.0**  
Aplicación de música con base de datos real, reproducción de YouTube y sistema de hilos de discusión.

---

¡Disfruta de tu biblioteca musical! 🎵✨

## 📞 Soporte

Si tienes problemas:
1. Verifica que todos los archivos estén en la misma carpeta
2. Abre la consola (F12) y busca errores en rojo
3. Asegúrate de tener conexión a internet
4. Prueba en otro navegador

**¡Que disfrutes MusicAE!** 🎶
