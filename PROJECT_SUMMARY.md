# Documentación del Proyecto: PrepKitchen

Este documento es un resumen completo del proyecto, su propósito, arquitectura y tecnologías utilizadas para facilitar su comprensión a cualquier desarrollador o persona interesada en el proyecto.

## 1. ¿De qué trata el proyecto? (Propósito)
**PrepKitchen** (nombre interno) es una aplicación web de gestión de preparaciones y estandarización de recetas enfocada en el rubro gastronómico (restaurantes, dark kitchens, catering). 

Su objetivo principal es resolver el problema de la consistencia en la cocina. Permite tener un recetario digital estandarizado donde los cocineros pueden consultar cómo preparar exactamente cada elemento, mientras que los administradores controlan las recetas, categorías y accesos del personal.

## 2. Roles de Usuario
El sistema se basa en el control de acceso por roles (RBAC). Existen dos roles principales:
*   **Administrador (`admin`):** Tiene control total. Puede crear, editar y eliminar recetas, gestionar los usuarios del sistema (dar de alta a cocineros) y ver el historial de cambios.
*   **Cocinero (`cocinero`):** Es un usuario de solo lectura. Su interfaz está optimizada para la cocina (tablets/celulares) y solo puede buscar, navegar por categorías y visualizar las recetas paso a paso con sus ingredientes.

## 3. Stack Tecnológico (Tecnologías)
El proyecto utiliza un stack moderno, rápido y sin servidor tradicional (Serverless/BaaS):

### Frontend (Cliente)
*   **React 19:** Biblioteca principal para construir la interfaz de usuario.
*   **Vite:** Empaquetador y servidor de desarrollo ultrarrápido (reemplaza a Create React App).
*   **React Router DOM v7:** Manejo de rutas (navegación entre páginas como `/login`, `/admin`, `/cook`).
*   **CSS / UI:** Estilos personalizados modernos, diseñados para ser responsivos (Mobile-First) ya que se usará en cocinas.

### Backend / Base de Datos
*   **Supabase:** Plataforma Backend-as-a-Service (BaaS) basada en PostgreSQL. Se utiliza para:
    *   **Base de datos relacional:** Almacenamiento estructurado.
    *   **Autenticación (Supabase Auth):** Manejo de sesiones, login y encriptación de contraseñas.
    *   **Edge Functions:** Funciones sin servidor (ej: para crear usuarios desde el panel de admin sin perder la sesión actual).
    *   **Row Level Security (RLS):** Políticas de seguridad a nivel de base de datos.

## 4. Arquitectura del Proyecto

El código está estructurado de forma modular dentro de la carpeta `src/`:

```text
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
```

## 5. Estructura de la Base de Datos (Modelo Relacional)
El modelo de datos está diseñado para mantener un historial y desglosar recetas complejas:

1.  **`users`**: Extiende la tabla nativa de Supabase Auth. Guarda el `role`, `name` y si está `active`.
2.  **`categories`**: Agrupa las recetas (ej: Salsas, Cortes de Carne).
3.  **`recipes`**: La tabla central. Guarda el nombre, categoría, tiempo de vida útil (shelf life) y condiciones de almacenamiento.
4.  **`recipe_ingredients`**: Tabla pivote que lista los ingredientes y cantidades exactas de una receta.
5.  **`recipe_steps`**: Guarda las instrucciones ordenadas paso a paso para elaborar la receta.
6.  **`recipe_history`**: Un registro de auditoría (logs). Cada vez que un admin crea, edita o elimina una receta, se guarda qué cambió y quién lo hizo.

## 6. Flujo de Trabajo y Seguridad
1.  **Rutas Protegidas:** El archivo `App.jsx` contiene componentes como `<ProtectedRoute>`, `<AdminRoute>` y `<CookRoute>` que evalúan el estado de `AuthContext`. Si un cocinero intenta entrar a una URL de `/admin`, es redirigido automáticamente.
2.  **Variables de Entorno:** El proyecto requiere de un archivo `.env` local y variables en el Hosting de producción para conectar React con Supabase.
3.  **Despliegue (Deploy):** El frontend está diseñado para hospedarse en servicios de archivos estáticos (como Netlify, Vercel o GitHub Pages), mientras Supabase mantiene toda la lógica de backend 24/7 de forma externa.
