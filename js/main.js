/**
 * Portfolio · Eric Barriga Medina
 *
 * Interacciones de la página, sin librerías ni frameworks.
 * Mejora progresiva: todo el contenido es accesible sin JavaScript;
 * este archivo solo añade comodidad (tema, menú móvil, copiar, imprimir...).
 */
'use strict';

(() => {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------------
     Tema claro / oscuro
     Sin elección guardada, la página sigue la preferencia del sistema (CSS).
     Al pulsar el botón se fija data-theme y se recuerda en localStorage.
     ------------------------------------------------------------------------ */
  const THEME_KEY = 'theme';

  const getTheme = () => root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Navegación privada o almacenamiento bloqueado: el tema no se recordará.
    }
  }

  function initTheme() {
    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;

    const sync = () => button.setAttribute('aria-pressed', String(getTheme() === 'dark'));

    button.hidden = false;
    sync();

    button.addEventListener('click', () => {
      const next = getTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      saveTheme(next);
      sync();
    });

    prefersDark.addEventListener('change', sync);
  }

  /* ------------------------------------------------------------------------
     Menú de navegación en móvil
     ------------------------------------------------------------------------ */
  function initNav() {
    const nav = document.querySelector('.site-nav');
    const toggle = nav?.querySelector('.site-nav__toggle');
    if (!nav || !toggle) return;

    const isOpen = () => nav.classList.contains('is-open');
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    // Cerrar al elegir una sección, al pulsar fuera o con la tecla Escape
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('click', (event) => {
      if (isOpen() && !nav.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Si la ventana pasa a tamaño escritorio, el menú desplegable deja de tener sentido
    window.matchMedia('(min-width: 48rem)').addEventListener('change', (event) => {
      if (event.matches) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------------
     Cabecera: muestra un borde inferior cuando la página tiene scroll
     ------------------------------------------------------------------------ */
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ------------------------------------------------------------------------
     Resalta en el menú la sección que se está leyendo
     ------------------------------------------------------------------------ */
  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;

    const links = [...document.querySelectorAll('.site-nav__link[href^="#"]')];
    const linkById = new Map(links.map((link) => [link.hash.slice(1), link]));
    const sections = document.querySelectorAll('main > section[id]');

    const observer = new IntersectionObserver((entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry) => {
          links.forEach((link) => link.removeAttribute('aria-current'));
          linkById.get(entry.target.id)?.setAttribute('aria-current', 'location');
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((section) => observer.observe(section));
  }

  /* ------------------------------------------------------------------------
     Aparición suave de bloques al entrar en pantalla
     Se usa la clase .reveal-ready (añadida aquí) para que, si este script
     no carga, el contenido nunca quede oculto.
     ------------------------------------------------------------------------ */
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length || prefersReducedMotion.matches || !('IntersectionObserver' in window)) return;

    root.classList.add('reveal-ready');

    const STAGGER_MS = 90;
    const observer = new IntersectionObserver((entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, index) => {
          setTimeout(() => entry.target.classList.add('is-visible'), index * STAGGER_MS);
          observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach((item) => observer.observe(item));
  }

  /* ------------------------------------------------------------------------
     Copiar el correo al portapapeles
     ------------------------------------------------------------------------ */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Alternativa para contextos sin API de portapapeles
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      const copied = document.execCommand('copy');
      area.remove();
      return copied;
    }
  }

  function initCopy() {
    const status = document.querySelector('[data-copy-status]');

    document.querySelectorAll('[data-copy]').forEach((button) => {
      const label = button.querySelector('[data-copy-label]');
      const originalText = label.textContent;
      let resetTimer;

      button.hidden = false;

      button.addEventListener('click', async () => {
        const copied = await copyText(button.dataset.copy);

        label.textContent = copied ? '¡Copiado!' : 'No se pudo copiar';
        button.classList.toggle('is-done', copied);
        if (status) {
          status.textContent = copied ? 'Correo copiado al portapapeles' : 'No se pudo copiar el correo';
        }

        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          label.textContent = originalText;
          button.classList.remove('is-done');
          if (status) status.textContent = '';
        }, 2200);
      });
    });
  }

  /* ------------------------------------------------------------------------
     Guardar el CV en PDF
     Abre el diálogo de impresión; css/print.css convierte la página en un CV
     de formato A4. Se cambia el título para sugerir un buen nombre de archivo.
     ------------------------------------------------------------------------ */
  function initPrint() {
    const buttons = document.querySelectorAll('[data-print]');

    buttons.forEach((button) => {
      button.hidden = false;
      button.addEventListener('click', () => window.print());
    });

    const originalTitle = document.title;
    window.addEventListener('beforeprint', () => {
      document.title = 'CV - Eric Barriga Medina';
    });
    window.addEventListener('afterprint', () => {
      document.title = originalTitle;
    });
  }

  /* ------------------------------------------------------------------------
     Año actual en el pie de página
     ------------------------------------------------------------------------ */
  function initYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach((element) => {
      element.textContent = year;
    });
  }

  initTheme();
  initNav();
  initHeader();
  initScrollSpy();
  initReveal();
  initCopy();
  initPrint();
  initYear();
})();
