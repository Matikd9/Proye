# Guía de Contribución

## Estructura de Commits

Para cumplir con el requisito de al menos 3 commits por integrante, sigue esta estructura:

### Formato de Commits
```
tipo(alcance): descripción breve

Descripción detallada (opcional)
```

### Tipos de Commits
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan código)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### Ejemplos de Commits

**Integrante 1:**
```
feat(auth): implementar autenticación básica con bcrypt
feat(api): crear endpoints CRUD para eventos
feat(ui): agregar componentes de formulario responsive
```

**Integrante 2:**
```
feat(ai): integrar API de Gemini para planificación
feat(scraping): implementar web scraping de servicios
feat(i18n): agregar sistema multilenguaje español/inglés
```

## Flujo de Trabajo

1. Crear una rama para tu feature:
   ```bash
   git checkout -b feature/nombre-feature
   ```

2. Hacer commits frecuentes:
   ```bash
   git add .
   git commit -m "tipo(alcance): descripción"
   ```

3. Push a la rama:
   ```bash
   git push origin feature/nombre-feature
   ```

4. Crear Pull Request en GitHub

5. Revisar y mergear a main

## Estándares de Código

- Usar TypeScript para todo el código
- Seguir las convenciones de Next.js
- Comentar código complejo
- Mantener componentes pequeños y reutilizables
- Usar ESLint y corregir warnings

## Testing

- Probar todas las funcionalidades antes de commit
- Verificar responsive design en móvil, tablet y desktop
- Probar autenticación y autorización
- Verificar que la IA funcione correctamente

