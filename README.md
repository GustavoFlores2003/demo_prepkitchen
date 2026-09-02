# 🍳 PrepKitchen

Aplicación web para la **gestión, estandarización y consulta de preparaciones culinarias** en restaurantes, dark kitchens, servicios de catering y otras operaciones gastronómicas.

PrepKitchen centraliza las recetas de una cocina profesional en una plataforma digital, permitiendo que los administradores mantengan la información actualizada y que el equipo de cocina consulte procedimientos estandarizados desde computador, tablet o teléfono.

---

## 📌 Descripción

En una operación gastronómica, una misma preparación puede terminar realizándose de manera distinta dependiendo de quién la ejecute.

Esto puede provocar:

* diferencias de sabor, textura o presentación;
* errores en cantidades;
* pérdida de conocimiento cuando cambia el personal;
* dificultad para capacitar nuevos cocineros;
* falta de trazabilidad sobre modificaciones de recetas.

**PrepKitchen busca resolver este problema mediante un recetario digital centralizado y controlado.**

Cada receta puede contener sus ingredientes, cantidades, procedimiento paso a paso, categoría, condiciones de almacenamiento y vida útil.

---

## ✨ Funcionalidades

### 👨‍💼 Administrador

El administrador dispone de un panel para gestionar el contenido y los usuarios de la plataforma.

Actualmente puede:

* visualizar un dashboard administrativo;
* crear recetas;
* editar recetas existentes;
* eliminar recetas;
* administrar ingredientes y cantidades;
* definir pasos de preparación;
* gestionar categorías;
* administrar usuarios;
* crear nuevos usuarios;
* controlar usuarios activos o desactivados;
* consultar el historial de cambios;
* acceder a la vista utilizada por los cocineros.

### 👨‍🍳 Cocinero

La interfaz del cocinero está orientada principalmente a la consulta rápida de información durante el trabajo en cocina.

Puede:

* visualizar las categorías disponibles;
* consultar recetas;
* navegar por recetas según categoría;
* buscar preparaciones;
* revisar ingredientes y cantidades;
* consultar instrucciones paso a paso;
* revisar información de almacenamiento y vida útil.

El cocinero no dispone de las herramientas administrativas de mantenimiento del sistema.

---

## 🔐 Roles y control de acceso

PrepKitchen utiliza un sistema de acceso basado en roles.

| Rol        | Permisos principales                                                 |
| ---------- | -------------------------------------------------------------------- |
| `admin`    | Administración completa de recetas, categorías, usuarios e historial |
| `cocinero` | Consulta de categorías, recetas, búsqueda e instrucciones            |

Las rutas de React están protegidas según autenticación y rol.

Por ejemplo:

```text
/admin/*  → Administradores
/cook/*   → Usuarios autenticados
/login    → Acceso al sistema
```

Un usuario sin sesión es redirigido al login, mientras que un usuario sin permisos administrativos no puede acceder desde la interfaz a las rutas de administración.

---

## 🛠️ Stack tecnológico

### Frontend

| Tecnología         | Uso                           |
| ------------------ | ----------------------------- |
| React 19           | Construcción de la interfaz   |
| React DOM          | Renderizado de la aplicación  |
| React Router DOM 7 | Navegación y rutas protegidas |
| Vite 5             | Desarrollo y compilación      |
| CSS Modules / CSS  | Estilos y diseño responsive   |

### Backend

| Tecnología              | Uso                                     |
| ----------------------- | --------------------------------------- |
| Supabase                | Backend as a Service                    |
| PostgreSQL              | Base de datos relacional                |
| Supabase Auth           | Autenticación y sesiones                |
| Row Level Security      | Seguridad a nivel de base de datos      |
| Supabase Edge Functions | Operaciones administrativas del backend |

### Despliegue

El proyecto incluye configuración para:

* Netlify
* aplicaciones SPA con React Router
* build de producción mediante Vite

---

## 🏗️ Arquitectura

La aplicación sigue una estructura modular separando interfaz, autenticación, acceso a datos y lógica de negocio.

```text
PrepKitchen
│
├── Frontend
│   ├── React
│   ├── React Router
│   ├── Components
│   ├── Pages
│   ├── Contexts
│   └── Services
│
└── Backend
    └── Supabase
        ├── PostgreSQL
        ├── Authentication
        ├── Row Level Security
        └── Edge Functions
```

El flujo general es:

```text
Usuario
   │
   ▼
React
   │
   ├── AuthContext
   │
   ├── Protected Routes
   │
   ▼
Services
   │
   ▼
Supabase Client
   │
   ├── Authentication
   ├── PostgreSQL
   └── Edge Functions
```

---

## 📁 Estructura del proyecto

```text
demo_prepkitchen/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── contexts/
│   │   └── AuthContext
│   │
│   ├── lib/
│   │   ├── constants.js
│   │   └── supabase.js
│   │
│   ├── pages/
│   │   │
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── RecipeList.jsx
│   │   │   ├── RecipeForm.jsx
│   │   │   ├── CategoryList.jsx
│   │   │   ├── UserList.jsx
│   │   │   └── HistoryLog.jsx
│   │   │
│   │   ├── auth/
│   │   │   └── Login.jsx
│   │   │
│   │   └── cook/
│   │       ├── Dashboard.jsx
│   │       ├── CategoryRecipes.jsx
│   │       ├── RecipeDetail.jsx
│   │       └── SearchResults.jsx
│   │
│   ├── services/
│   │   ├── categoryService.js
│   │   ├── historyService.js
│   │   ├── recipeService.js
│   │   └── userService.js
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── supabase/
│   ├── functions/
│   │   └── create-user/
│   │       └── index.ts
│   │
│   └── config.toml
│
├── supabase-migration.sql
├── netlify.toml
├── vite.config.js
├── package.json
└── README.md
```

---

## 🗄️ Base de datos

El modelo de datos se encuentra basado en PostgreSQL mediante Supabase.

### `users`

Información adicional asociada a los usuarios registrados mediante Supabase Auth.

Campos principales:

```text
id
email
name
role
active
created_at
```

---

### `categories`

Permite clasificar las preparaciones.

Ejemplos:

```text
Salsas Base
Cortes de Carne
Vegetales Prep
Masas
```

Campos principales:

```text
id
name
icon
created_at
```

---

### `recipes`

Tabla principal de recetas.

Contiene información como:

```text
id
name
category_id
shelf_life
shelf_life_unit
storage
updated_by
created_at
updated_at
```

---

### `recipe_ingredients`

Almacena los ingredientes asociados a cada receta.

```text
recipe_id
ingredient
quantity
sort_order
```

Una receta puede contener múltiples ingredientes.

---

### `recipe_steps`

Contiene las instrucciones ordenadas de preparación.

```text
recipe_id
step_number
instruction
```

---

### `recipe_history`

Registro utilizado para mantener trazabilidad sobre las modificaciones realizadas en las recetas.

```text
recipe_id
user_id
change_type
old_value
new_value
created_at
```

Los valores anteriores y nuevos se almacenan mediante `JSONB`.

---

## 🔄 Modelo relacional simplificado

```text
auth.users
    │
    │ 1:1
    ▼
 users
    │
    │
    └───────────────┐
                    │
                    ▼
               recipes
                  │ │
          ┌───────┘ └────────┐
          ▼                  ▼
recipe_ingredients      recipe_steps
          │
          │
          └──────────────────┐
                             ▼
                      recipe_history


categories
    │
    └──────────────► recipes
```

---

## ⚙️ Instalación local

### 1. Requisitos

Se recomienda disponer de:

* Node.js 18 o superior;
* npm;
* Git;
* una cuenta de Supabase;
* un proyecto creado en Supabase.

---

### 2. Clonar el repositorio

```bash
git clone https://github.com/GustavoFlores2003/demo_prepkitchen.git
```

Entrar al proyecto:

```bash
cd demo_prepkitchen
```

---

### 3. Instalar dependencias

```bash
npm install
```

---

### 4. Configurar Supabase

Crear un proyecto en Supabase.

Posteriormente ejecutar el contenido de:

```text
supabase-migration.sql
```

desde el SQL Editor de Supabase.

Este script crea las tablas principales de la aplicación y habilita Row Level Security.

---

## 🔑 Variables de entorno

Crear un archivo:

```text
.env
```

en la raíz del proyecto.

Agregar:

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
```

> ⚠️ No subir archivos `.env` ni claves privadas al repositorio.

La `SUPABASE_SERVICE_ROLE_KEY` utilizada por operaciones administrativas debe permanecer exclusivamente en el entorno seguro de Supabase y nunca debe exponerse en el frontend.

---

## 👥 Creación de usuarios

La creación administrativa de usuarios utiliza la Supabase Edge Function:

```text
supabase/functions/create-user
```

Esta función:

1. recibe la sesión del usuario que realiza la solicitud;
2. valida el token;
3. consulta su perfil;
4. comprueba que tenga rol `admin`;
5. utiliza la API administrativa de Supabase para crear el nuevo usuario.

De esta forma, la `SERVICE_ROLE_KEY` no necesita exponerse al navegador.

---

## ▶️ Ejecutar en desarrollo

Iniciar Vite:

```bash
npm run dev
```

La aplicación normalmente estará disponible en:

```text
http://localhost:5173
```

---

## 📦 Build de producción

Generar la versión optimizada:

```bash
npm run build
```

El resultado se genera en:

```text
dist/
```

Para comprobar localmente el build:

```bash
npm run preview
```

---

## 🌐 Despliegue con Netlify

El repositorio contiene un archivo:

```text
netlify.toml
```

configurado para ejecutar:

```bash
npm run build
```

y publicar:

```text
dist
```

También incluye una regla de redirección hacia:

```text
/index.html
```

necesaria para que las rutas de React Router funcionen correctamente al recargar directamente páginas como:

```text
/admin/dashboard
/cook/dashboard
/cook/recipe/:id
```

En Netlify también deben configurarse:

```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

---

## 🔒 Consideraciones de seguridad

La aplicación implementa diferentes capas de control:

* autenticación mediante Supabase Auth;
* rutas protegidas en React;
* control de acceso según rol;
* cuentas activas/desactivadas;
* Row Level Security habilitado;
* Edge Function para operaciones administrativas sensibles;
* `SERVICE_ROLE_KEY` aislada del frontend.

### ⚠️ Importante

Las políticas RLS incluidas actualmente en `supabase-migration.sql` están pensadas para una etapa de **desarrollo/demo**.

Actualmente permiten operaciones amplias a usuarios autenticados.

Antes de utilizar PrepKitchen en producción se recomienda implementar políticas RLS específicas para cada rol, por ejemplo:

```text
ADMIN
├── crear
├── leer
├── actualizar
└── eliminar

COCINERO
└── leer
```

El control de acceso del frontend mejora la experiencia del usuario, pero **la seguridad definitiva debe aplicarse también en PostgreSQL mediante RLS**.

---

## 🧭 Rutas principales

### Autenticación

```text
/login
```

### Administrador

```text
/admin/dashboard
/admin/recipes
/admin/recipes/new
/admin/recipes/:id/edit
/admin/categories
/admin/users
/admin/history
```

### Cocinero

```text
/cook/dashboard
/cook/category/:id
/cook/recipe/:id
/cook/search
```

---

## 🎯 Objetivo del proyecto

PrepKitchen busca transformar las recetas internas de una cocina en **procedimientos digitales estandarizados, accesibles y trazables**.

La idea central puede resumirse como:

```text
Receta informal
      ↓
Receta estandarizada
      ↓
Información centralizada
      ↓
Mismo procedimiento para todo el equipo
      ↓
Mayor consistencia operacional
```

El proyecto está pensado especialmente para operaciones donde múltiples personas necesitan preparar un producto de la misma manera y acceder rápidamente a instrucciones actualizadas.

---

## 🚧 Estado del proyecto

PrepKitchen se encuentra actualmente en etapa de **demo / desarrollo funcional**.

Ya incorpora los componentes principales del sistema:

* autenticación;
* separación de roles;
* gestión de recetas;
* categorías;
* usuarios;
* historial de modificaciones;
* interfaz de consulta para cocina;
* conexión con Supabase;
* Edge Functions;
* configuración para despliegue.

Antes de considerarlo listo para un entorno productivo se recomienda reforzar especialmente las políticas RLS, pruebas automatizadas, validación de errores y estrategia de respaldo de datos.

---

## 👨‍💻 Autor

**Gustavo Flores**

Proyecto desarrollado como demostración de una solución digital orientada a la gestión y estandarización de procesos gastronómicos.
