# Arquitectura del Proyecto

Sigue esta estructura de carpetas para mantener el código escalable y modular:

## Estructura de Carpetas

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo de rutas de autenticación
│   ├── (dashboard)/              # Grupo de rutas del dashboard
│   │   ├── transactions/         # Página de movimientos
│   │   ├── categories/           # Página de categorías
│   │   └── recurring/            # Página de pagos repetitivos
│   ├── api/                      # API routes
│   └── layout.tsx                # Layout principal
├── ui/                           # Componentes genéricos reutilizables (shadcn)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── features/                     # Features con colocation completa
│   ├── transactions/
│   │   ├── components/           # Componentes específicos de transactions
│   │   │   ├── transaction-list.tsx
│   │   │   ├── transaction-form.tsx
│   │   │   └── transaction-card.tsx
│   │   ├── hooks/                # Hooks específicos de transactions
│   │   │   └── use-transactions.ts
│   │   ├── types/                # Tipos específicos de transactions
│   │   │   └── transaction.ts
│   │   ├── services/             # Servicios específicos de transactions
│   │   │   └── transaction-service.ts
│   │   ├── utils/                # Utilidades específicas de transactions
│   │   │   └── format-transaction.ts
│   │   └── index.ts              # Barrel export
│   ├── categories/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── services/
│   │   └── index.ts
│   └── recurring/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       ├── services/
│       └── index.ts
├── components/                   # Componentes compartidos entre features
│   ├── layouts/                  # Layouts (header, sidebar, footer)
│   └── shared/                   # Componentes reutilizables (data-table, empty-state)
├── lib/                          # Utilidades y configuraciones globales
│   ├── api/                      # Clientes API y fetchers
│   ├── validations/              # Schemas de validación (Zod)
│   └── utils.ts                  # Funciones helper globales
└── constants/                    # Constantes globales
    └── app-config.ts
```

## Principios de Organización

### Estructura por Feature (Colocation)
- Cada feature contiene TODO lo que necesita: components, hooks, types, services, utils
- Agrupa por funcionalidad, no por tipo de archivo
- Facilita encontrar y modificar código relacionado
- Permite eliminar features completas sin afectar otras

### Carpetas Principales
- **ui/**: Componentes genéricos sin lógica de negocio (shadcn/ui)
- **features/**: Features autocontenidas con colocation completa
- **components/**: Componentes compartidos entre múltiples features
- **lib/**: Utilidades y configuraciones globales

### Reglas de Importación
- `ui/` NO importa de ninguna otra carpeta
- `features/` pueden importar de `ui/`, `components/shared/` y `lib/`
- Features NO deben importar de otras features
- `components/shared/` puede importar de `ui/` y `lib/`
- Usa barrel exports (index.ts) en cada feature

### Colocation de Archivos
- Tests junto al código: `transaction-form.tsx` + `transaction-form.test.tsx`
- Todo relacionado a una feature vive dentro de su carpeta
- Si un hook/type/util solo se usa en una feature, va dentro de ella

### Naming
- Componentes: PascalCase (`TransactionList.tsx`)
- Hooks: camelCase con prefijo `use` (`useTransactions.ts`)
- Utilidades: camelCase (`formatCurrency.ts`)
- Tipos: PascalCase (`Transaction`, `Category`)
- Constantes: UPPER_SNAKE_CASE (`MAX_AMOUNT`)

### Escalabilidad
- Cada feature debe poder crecer independientemente
- Extrae lógica compartida a `hooks/` o `services/`
- Usa composición sobre duplicación
- Mantén componentes pequeños y enfocados (< 200 líneas)
