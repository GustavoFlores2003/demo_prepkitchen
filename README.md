# 🍳 PrepKitchen

> Aplicación web para la gestión de preparaciones culinarias y estandarización de recetas en entornos gastronómicos profesionales (restaurantes, dark kitchens y servicios de catering).

================================================================================
TABLA DE CONTENIDOS
================================================================================
1. Propósito del Proyecto
2. Roles de Usuario
3. Stack Tecnológico
4. Arquitectura del Proyecto
5. Estructura de la Base de Datos
6. Flujo de Trabajo y Seguridad
7. Instalación y Configuración Local
8. Variables de Entorno
9. Despliegue

================================================================================
1. PROPÓSITO DEL PROYECTO
================================================================================
PrepKitchen (nombre interno) es una aplicación web de gestión de preparaciones y
estandarización de recetas enfocada en el rubro gastronómico (restaurantes, dark
kitchens, catering).

Su objetivo principal es resolver el problema de la consistencia en la cocina.
Permite tener un recetario digital estandarizado donde los cocineros pueden
consultar cómo preparar exactamente cada elemento, mientras que los administradores
controlan las recetas, categorías y accesos del personal.

================================================================================
2. ROLES DE USUARIO
================================================================================
El sistema se basa en el control de acceso por roles (RBAC). Existen dos roles
principales:

- Administrador (admin):
  Tiene control total. Puede crear, editar y eliminar recetas, gestionar los
  usuarios del sistema (dar de alta a cocineros) y ver el historial de cambios.

- Cocinero (cocinero):
  Es un usuario de solo lectura. Su interfaz está optimizada para la cocina
  (tablets/celulares) y solo puede buscar, navegar por categorías y visualizar
  las recetas paso a paso con sus ingredientes.

================================================================================
3. STACK TECNOLÓGICO
================================================================================
El proyecto utiliza un stack moderno, rápido y sin servidor tradicional
(Serverless / BaaS):

Frontend (Cliente):
- React 19: Biblioteca principal para construir la interfaz de usuario.
- Vite: Empaquetador y servidor de desarrollo ultrarrápido (reemplaza a Create React App).
- React Router DOM v7: Manejo de rutas y navegación entre páginas (ej: /login, /admin, /cook).
- CSS / UI: Estilos personalizados modernos, diseñados para ser responsivos (Mobile-First) ya que se usará en cocinas.

Backend / Base de Datos:
- Supabase: Plataforma Backend-as-a-Service (BaaS) basada en PostgreSQL.
  * Base de datos relacional: Almacenamiento estructurado.
  * Autenticación (Supabase Auth): Manejo de sesiones, login y encriptación de contraseñas.
  * Edge Functions: Funciones sin servidor (ej: para crear usuarios desde el panel de admin sin perder la sesión actual).
  * Row Level Security (RLS): Políticas de seguridad a nivel de base de datos.

================================================================================
4. ARQUITECTURA DEL PROYECTO
================================================================================
El código está estructurado de forma modular dentro de la carpeta src/:

src/
├── components/       # Componentes visuales reutilizables
│   ├── layout/       # Envoltorios de página (AdminLayout, CookLayout)
│   └── ui/           # Elementos pequeños (Spinner, Botones, Inputs)
├── contexts/         # Manejo de estado global
│   └── AuthContext   # Controla si el usuario está logueado y su rol
├── lib/              # Configuraciones y utilidades compartidas
│   ├── constants.js  # Variables constantes (ROLES, etc.)
│   └── supabase.js   # Inicialización del cliente de Supabase
├── pages/            # Las pantallas o vistas completas de la app
│   ├── admin/        # Vistas exclusivas del administrador (UserList, RecipeForm)
│   ├── auth/         # Login
│   └── cook/         # Vistas exclusivas del cocinero (Dashboard, RecipeDetail)
├── services/         # Lógica de conexión a la Base de Datos (Consultas SQL/Supabase)
│   ├── categoryService.js
│   ├── historyService.js
│   ├── recipeService.js
│   └── userService.js
└── App.jsx           # Archivo principal de rutas (Router) y protección de accesos

================================================================================
5. ESTRUCTURA DE LA BASE DE DATOS
================================================================================
El modelo relacional está diseñado para mantener un historial y desglosar recetas
complejas:

- users:
  Extiende la tabla nativa de Supabase Auth. Guarda el role, name y si está active.

- categories:
  Agrupa las recetas (ej: Salsas, Cortes de Carne).

- recipes:
  La tabla central. Guarda el nombre, categoría, tiempo de vida útil (shelf life)
  y condiciones de almacenamiento.

- recipe_ingredients:
  Tabla pivote que lista los ingredientes y cantidades exactas de una receta.

- recipe_steps:
  Guarda las instrucciones ordenadas paso a paso para elaborar la receta.

- recipe_history:
  Un registro de auditoría (logs). Cada vez que un admin crea, edita o elimina
  una receta, se guarda qué cambió y quién lo hizo.

================================================================================
6. FLUJO DE TRABAJO Y SEGURIDAD
================================================================================
- Rutas Protegidas:
  El archivo App.jsx contiene componentes como <ProtectedRoute>, <AdminRoute> y
  <CookRoute> que evalúan el estado de AuthContext. Si un cocinero intenta entrar
  a una URL de /admin, es redirigido automáticamente.

- Políticas de Base de Datos (RLS):
  Políticas de seguridad a nivel de fila (Row Level Security) que impiden modificaciones
  no autorizadas directo en PostgreSQL.

- Aislamiento de Sesiones:
  Uso de Edge Functions para tareas administrativas (crear usuarios) sin desconectar
  la sesión activa del administrador.

================================================================================
7. INSTALACIÓN Y CONFIGURACIÓN LOCAL
================================================================================
Prerrequisitos:
- Node.js (versión 18 o superior recomendada)
- npm o gestor de paquetes de preferencia
- Cuenta y proyecto activo en Supabase

Pasos de instalación:
1. Clonar el repositorio:
   git clone https://github.com/tu-usuario/prepkitchen.git
   cd prepkitchen

2. Instalar dependencias:
   npm install

3. Configurar variables de entorno:
   Copiar o crear el archivo .env en la raíz del proyecto (ver sección 8).

4. Iniciar servidor local de desarrollo:
   npm run dev

   La app iniciará por defecto en http://localhost:5173

================================================================================
8. VARIABLES DE ENTORNO
================================================================================
El proyecto requiere un archivo .env en la raíz local y configurar las mismas
variables en el hosting de producción para conectar React con Supabase:

VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase

================================================================================
9. DESPLIEGUE
================================================================================
El frontend está diseñado para hospedarse en servicios de archivos estáticos
(como Netlify, Vercel o GitHub Pages), mientras Supabase mantiene toda la lógica
de backend 24/7 de forma externa:

1. Ejecutar la compilación para producción:
   npm run build

2. El directorio generado (dist/) se despliega en el proveedor elegido.
3. Asegurar la configuración de las variables de entorno en el panel del hosting
   y añadir las reglas de redirección a index.html para soportar el enrutamiento
