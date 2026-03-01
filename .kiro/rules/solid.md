# Principios SOLID

Al escribir código, sigue estrictamente estos principios:

## S - Single Responsibility Principle (Responsabilidad Única)
- Cada clase, función o módulo debe tener una única razón para cambiar
- Separa lógica de negocio, presentación y acceso a datos
- Crea funciones pequeñas y enfocadas en una sola tarea

## O - Open/Closed Principle (Abierto/Cerrado)
- El código debe estar abierto a extensión pero cerrado a modificación
- Usa interfaces, tipos y composición para extender funcionalidad
- Evita modificar código existente que funciona

## L - Liskov Substitution Principle (Sustitución de Liskov)
- Los subtipos deben ser sustituibles por sus tipos base
- Las implementaciones deben cumplir el contrato de sus interfaces
- No rompas las expectativas del tipo padre

## I - Interface Segregation Principle (Segregación de Interfaces)
- Crea interfaces específicas y pequeñas en lugar de una grande
- Los clientes no deben depender de métodos que no usan
- Prefiere múltiples interfaces cohesivas

## D - Dependency Inversion Principle (Inversión de Dependencias)
- Depende de abstracciones, no de implementaciones concretas
- Los módulos de alto nivel no deben depender de módulos de bajo nivel
- Usa inyección de dependencias y tipos/interfaces

## Aplicación en React/Next.js
- Componentes con una sola responsabilidad
- Custom hooks para lógica reutilizable
- Separación de componentes de UI y lógica de negocio
- Props tipadas con TypeScript
- Composición sobre herencia
