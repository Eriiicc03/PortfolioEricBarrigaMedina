# Portfolio profesional · Eric Barriga Medina

[![Validar y desplegar](https://github.com/Eriiicc03/Eriiicc03.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/Eriiicc03/Eriiicc03.github.io/actions/workflows/deploy.yml)
![HTML5](https://img.shields.io/badge/HTML5-semántico-e34f26)
![CSS3](https://img.shields.io/badge/CSS3-propio-1572b6)
![JavaScript](https://img.shields.io/badge/JavaScript-sin_dependencias-f7df1e)

Web personal que funciona a la vez como **currículum** y como **portfolio**: permite a una empresa
entender mi perfil en pocos segundos y comprobar, mediante proyectos reales enlazados a su código,
lo que sé hacer.

### 🔗 Web publicada: **[eriiicc03.github.io](https://eriiicc03.github.io/)**

![Captura de la portada del portfolio en escritorio](docs/captura-escritorio.png)

---

## Índice

1. [Objetivo](#objetivo)
2. [Contenido de la web](#contenido-de-la-web)
3. [Tecnologías](#tecnologías)
4. [Características](#características)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [Cómo visualizarlo en local](#cómo-visualizarlo-en-local)
7. [Despliegue](#despliegue)
8. [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)
9. [Cómo añadir un proyecto](#cómo-añadir-un-proyecto)
10. [Calidad y validación](#calidad-y-validación)
11. [Autor y licencia](#autor-y-licencia)

---

## Objetivo

Práctica **PR01 · Portfolio profesional** del módulo *0614 · Despliegue de aplicaciones web*
(CFGS Desarrollo de Aplicaciones Web, Institut Thos i Codina).

El objetivo es construir un sitio que:

- Transmita una **identidad profesional propia** y se consulte con comodidad desde el **móvil**.
- Sirva como **CV**: presentación, perfil, competencias, formación, idiomas y contacto.
- Aporte **evidencias verificables**: cada proyecto enlaza a su repositorio e indica qué competencias demuestra.
- Se mantenga **vivo**: está pensado para añadir proyectos nuevos en minutos (ver [Cómo añadir un proyecto](#cómo-añadir-un-proyecto)).

## Contenido de la web

| Sección | Qué contiene |
| :-- | :-- |
| **Inicio** | Nombre, perfil profesional objetivo, disponibilidad, contacto directo y enlaces a GitHub y LinkedIn. |
| **01 · Perfil** | Presentación redactada para una empresa: qué sé hacer, qué me interesa y qué oportunidad busco. |
| **02 · Competencias** | Tecnologías agrupadas por área (frontend, backend, datos, despliegue, sistemas y forma de trabajar), distinguiendo lo que uso con soltura de lo que estoy consolidando. |
| **03 · Proyectos** | Proyectos reales con enlace al código y la lista de competencias que demuestran, más un resumen de las prácticas recientes del ciclo. |
| **04 · Trayectoria** | Formación (CFGS DAW, CFGM SMX, formación autodidacta), prácticas que busco, idiomas y objetivos. |
| **05 · Contacto** | Correo (con botón para copiarlo), LinkedIn, GitHub y botón para descargar el CV en PDF. |

## Tecnologías

- **HTML5 semántico**: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, listas de definición y jerarquía de títulos coherente.
- **CSS3 propio**, sin frameworks: variables (custom properties), Grid, Flexbox, tipografía fluida con `clamp()`, `color-mix()`, `@media (prefers-color-scheme)`, `@media (prefers-reduced-motion)` y hoja de impresión.
- **JavaScript** (ES2020+) sin librerías ni dependencias.
- **GitHub Actions** + **GitHub Pages** para validación y despliegue continuo.
- **html-validate** para validar el HTML en cada push.
- Fuentes autoalojadas: [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque), [Inter](https://rsms.me/inter/) y [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (licencia SIL OFL 1.1).

No hay paso de compilación: el código que hay en el repositorio es exactamente el que se publica.

## Características

- 📱 **Responsive *mobile-first***: probado en móvil (375 px), tableta (820 px) y escritorio (1366–1440 px).
- 🌗 **Tema claro y oscuro**: sigue la preferencia del sistema y recuerda la elección del usuario.
- 📄 **CV en PDF desde la propia web**: el botón *Guardar CV en PDF* usa `css/print.css` para generar un currículum A4 de dos páginas con las URL de los repositorios.
- ♿ **Accesibilidad**: enlace para saltar al contenido, foco visible, menú móvil con `aria-expanded`, sección activa con `aria-current`, contraste AA en ambos temas, respeto a *reducir movimiento* y todo el contenido disponible **sin JavaScript** (mejora progresiva).
- ⚡ **Rendimiento**: fuentes autoalojadas con precarga y fuentes de reserva con métricas ajustadas (sin saltos de maquetación), ilustraciones hechas solo con CSS y ninguna dependencia externa.
- 🔎 **SEO**: metadatos, Open Graph con imagen para compartir en LinkedIn, datos estructurados `schema.org/Person`, `sitemap.xml` y `robots.txt`.
- 🚧 **Página 404** personalizada.

<p align="center">
  <img src="docs/captura-movil.png" alt="Portada del portfolio en móvil con tema oscuro" width="280">
</p>

**CV generado con el botón «Guardar CV en PDF»:**

![Las dos páginas del CV en PDF generado desde la web](docs/cv-pdf.png)

## Estructura del proyecto

```text
.
├── index.html                 # Página principal (todo el contenido del CV y portfolio)
├── 404.html                   # Página de error personalizada
├── css/
│   ├── fonts.css              # @font-face de las fuentes propias y fuentes de reserva
│   ├── tokens.css             # Variables de diseño: color, tipografía, espaciado, temas
│   ├── base.css               # Reset, tipografía base y utilidades de accesibilidad
│   ├── layout.css             # Estructura: cabecera, secciones, rejillas, pie
│   ├── components.css         # Componentes BEM: botones, tarjetas, chips, timeline...
│   └── print.css              # Estilos de impresión (CV en PDF)
├── js/
│   └── main.js                # Tema, menú móvil, sección activa, copiar, imprimir
├── assets/
│   ├── fonts/                 # Fuentes .woff2 (subconjunto latino)
│   └── img/                   # Favicon, icono iOS e imagen para redes sociales
├── docs/                      # Capturas usadas en este README (no se publican)
├── .github/workflows/
│   └── deploy.yml             # CI/CD: validación de HTML y publicación en GitHub Pages
├── .htmlvalidate.json         # Reglas del validador de HTML
├── .editorconfig              # Formato común para cualquier editor
├── robots.txt
└── sitemap.xml
```

**Organización del CSS.** Los archivos se cargan en orden de lo más general a lo más concreto
(fuentes → tokens → base → layout → componentes). Los colores, tamaños y espacios nunca se
escriben "a mano" en los componentes: salen de las variables de `tokens.css`, así que cambiar
el color de acento o la escala tipográfica es cuestión de una línea. Las clases siguen la
convención **BEM** (`bloque__elemento--modificador`).

## Cómo visualizarlo en local

No necesita instalación ni compilación. Tras clonar el repositorio:

```bash
git clone https://github.com/Eriiicc03/Eriiicc03.github.io.git
cd Eriiicc03.github.io
```

**Opción 1 · Abrir el archivo.** Haz doble clic en `index.html`. Todo funciona directamente desde el disco.

**Opción 2 · Servidor local (recomendado).** Así se comporta igual que en producción:

```bash
python3 -m http.server 8000
```

y abre <http://localhost:8000>. También sirve la extensión *Live Server* de VS Code o `npx serve`.

## Despliegue

La web se publica en **GitHub Pages** mediante **GitHub Actions** ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)):

1. En cada *push* o *pull request* a `main` o `develop` se **valida el HTML** con html-validate.
2. Solo en `main`, si la validación pasa, se copian los archivos públicos a `_site/` y se **publica** en GitHub Pages.

El estado de cada despliegue se puede consultar en la pestaña
[Actions](https://github.com/Eriiicc03/Eriiicc03.github.io/actions) del repositorio.

### Publicarlo por primera vez

1. Crear en GitHub un repositorio **público** llamado `Eriiicc03.github.io` (con ese nombre, GitHub Pages lo publica en la raíz `https://eriiicc03.github.io/`).
2. Subir el código y las ramas:

   ```bash
   git remote add origin git@github.com:Eriiicc03/Eriiicc03.github.io.git
   git push -u origin main develop
   ```

3. En el repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Volver a lanzar el workflow (pestaña *Actions → Validar y desplegar → Run workflow*) o hacer un nuevo push a `main`.

## Flujo de trabajo con Git

El proyecto sigue un flujo de ramas sencillo inspirado en *Git Flow*:

| Rama | Uso |
| :-- | :-- |
| `main` | Versión publicada. Cada push despliega la web. |
| `develop` | Rama de integración donde se prueban los cambios antes de publicarlos. |
| `feature/*`, `fix/*`, `docs/*` | Ramas cortas para cada tarea; se integran en `develop` con `git merge --no-ff` para que quede constancia en el historial. |

Los mensajes de commit siguen **[Conventional Commits](https://www.conventionalcommits.org/es/)**:
`feat` (funcionalidad), `fix` (corrección), `style` (estilos), `perf` (rendimiento),
`docs` (documentación), `ci` (integración continua) y `chore` (mantenimiento).

```bash
git log --oneline --graph --all   # ver el historial con las ramas
```

## Cómo añadir un proyecto

El portfolio está pensado para crecer con cada práctica o proyecto nuevo:

1. Crear una rama: `git switch develop && git switch -c feature/proyecto-nombre`.
2. En `index.html`, dentro de `<div class="projects">`, copiar esta plantilla:

   ```html
   <article class="project" data-reveal>
     <div class="project__visual" aria-hidden="true">
       <!-- Ilustración opcional: reutiliza .diagram, .mock-browser o .mock-calc -->
     </div>
     <div class="project__body">
       <p class="project__meta">
         <span class="badge badge--done">Completado</span>   <!-- badge--live | badge--done | badge--wip -->
         <span>2026 · Backend</span>
       </p>
       <h3 class="project__title">Nombre del proyecto</h3>
       <p class="project__desc">Qué es y qué problema resuelve, en una o dos frases.</p>
       <h4 class="project__subtitle">Qué demuestra</h4>
       <ul class="project__proofs">
         <li>Competencia concreta que se puede comprobar en el código.</li>
       </ul>
       <ul class="tags">
         <li>Tecnología</li>
       </ul>
       <p class="project__links">
         <a class="link-arrow" href="https://github.com/Eriiicc03/REPO" target="_blank" rel="noopener">
           Código
           <svg class="icon" aria-hidden="true"><use href="#i-arrow-up-right"/></svg>
         </a>
       </p>
     </div>
   </article>
   ```

3. Actualizar la fecha de *Última actualización* del pie y `<lastmod>` en `sitemap.xml`.
4. Validar (`npx html-validate@9 index.html 404.html`), hacer commit (`feat: añade proyecto X`), integrar en `develop` y después en `main` para publicarlo.

La rejilla se adapta sola al número de proyectos.

## Calidad y validación

- **HTML**: `npx html-validate@9 index.html 404.html` → sin errores (se ejecuta también en cada push).
- **Lighthouse** (Chrome, servidor local, septiembre de 2026):

  | | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
  | :-- | :-: | :-: | :-: | :-: |
  | Escritorio | 100 | 100 | 100 | 100 |
  | Móvil | 90 | 100 | 100 | 100 |

  En móvil, lo que resta son la compresión y la caché del servidor local de pruebas; GitHub Pages ya sirve los archivos comprimidos.

- **Responsive** revisado a 375, 390, 820, 1024, 1366 y 1440 px de ancho, en tema claro y oscuro.
- **Sin JavaScript**: todo el contenido y la navegación siguen funcionando.

## Autor y licencia

**Eric Barriga Medina** · Estudiante de 2.º de DAW

- ✉️ [ericbarrigamedina1@gmail.com](mailto:ericbarrigamedina1@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/eric-barriga-medina-5753632b2/)
- 🐙 [GitHub](https://github.com/Eriiicc03)

El **código** se distribuye bajo licencia [MIT](LICENSE). Los **textos y datos personales** son
© Eric Barriga Medina. Las fuentes tipográficas mantienen su licencia SIL Open Font License 1.1.
