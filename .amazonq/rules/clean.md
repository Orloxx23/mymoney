# Clean Code

Al escribir código, sigue estrictamente estos principios:

## Nombres Significativos
- Usa nombres descriptivos y pronunciables
- Evita abreviaciones y nombres de una letra (excepto en loops cortos)
- Los nombres deben revelar la intención
- Usa nombres buscables y consistentes

## Funciones
- Deben ser pequeñas (máximo 20 líneas)
- Hacer una sola cosa y hacerla bien
- Un solo nivel de abstracción por función
- Máximo 3 parámetros, evita flags booleanos
- Sin efectos secundarios

## Comentarios
- El código debe ser autoexplicativo
- Usa comentarios solo cuando el código no puede expresar la intención
- Evita comentarios redundantes o obsoletos
- Prefiere código claro sobre comentarios explicativos

## Formato
- Consistencia en indentación y espaciado
- Agrupa código relacionado
- Mantén líneas cortas (máximo 120 caracteres)
- Organiza imports y dependencias

## Manejo de Errores
- Usa excepciones en lugar de códigos de error
- Proporciona contexto con las excepciones
- No retornes ni pases null
- Valida en los límites

## DRY (Don't Repeat Yourself)
- Elimina duplicación de código
- Extrae lógica común a funciones reutilizables
- Usa composición y abstracción

## Testing
- Código testeable es código limpio
- Un assert por test
- Tests legibles y mantenibles
- FIRST: Fast, Independent, Repeatable, Self-validating, Timely

## Aplicación en TypeScript/React
- Usa TypeScript para tipos explícitos
- Componentes pequeños y enfocados
- Custom hooks para lógica compartida
- Evita prop drilling excesivo
- Usa constantes para valores mágicos
