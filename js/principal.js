/**
 * ============================================================================
 * PORTFOLIO · ERIC BARRIGA MEDINA
 * Interactividad general de la página, sin librerías ni frameworks.
 *
 * La web funciona también sin JavaScript: este archivo solo añade comodidad.
 * Cada función se ocupa de una cosa y se activa al final del archivo:
 *
 *   iniciarTema()          → botón de tema claro / oscuro
 *   iniciarMenu()          → menú desplegable en móvil
 *   iniciarCabecera()      → borde de la cabecera al hacer scroll
 *   iniciarSeccionActiva() → marca en el menú la sección que se está leyendo
 *   iniciarAparicion()     → los bloques aparecen suavemente al hacer scroll
 *   iniciarCopiarCorreo()  → botón "Copiar" del correo
 *   iniciarImprimir()      → botón "Guardar CV en PDF"
 *   iniciarAnio()          → año actual en el pie de página
 *
 * El hilo conductor (la línea que recorre la página) está aparte, en
 * js/hilo-conductor.js.
 *
 * El HTML se conecta con este archivo mediante atributos data-...
 * (por ejemplo data-boton-tema o data-copiar), así las clases se pueden
 * cambiar sin romper nada.
 * ============================================================================
 */
'use strict';

(() => {
  const raiz = document.documentElement;
  const sistemaOscuro = window.matchMedia('(prefers-color-scheme: dark)');
  const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --------------------------------------------------------------------------
     TEMA CLARO / OSCURO
     Si la persona no ha elegido nada, se sigue el tema del sistema (lo hace
     el CSS). Al pulsar el botón se guarda la elección en el navegador.
     -------------------------------------------------------------------------- */
  const CLAVE_TEMA = 'tema';

  function temaActual() {
    if (raiz.dataset.tema) return raiz.dataset.tema;
    return sistemaOscuro.matches ? 'oscuro' : 'claro';
  }

  function guardarTema(tema) {
    try {
      localStorage.setItem(CLAVE_TEMA, tema);
    } catch {
      // Navegación privada o almacenamiento bloqueado: no se recordará.
    }
  }

  function iniciarTema() {
    const boton = document.querySelector('[data-boton-tema]');
    if (!boton) return;

    // aria-pressed="true" indica a los lectores de pantalla que el tema oscuro está activo
    const actualizarBoton = () => boton.setAttribute('aria-pressed', String(temaActual() === 'oscuro'));

    actualizarBoton();

    boton.addEventListener('click', () => {
      const nuevoTema = temaActual() === 'oscuro' ? 'claro' : 'oscuro';
      raiz.dataset.tema = nuevoTema;
      guardarTema(nuevoTema);
      actualizarBoton();
    });

    // Si cambia el tema del sistema y no hay elección guardada
    sistemaOscuro.addEventListener('change', actualizarBoton);
  }

  /* --------------------------------------------------------------------------
     MENÚ EN MÓVIL
     -------------------------------------------------------------------------- */
  function iniciarMenu() {
    const menu = document.querySelector('[data-menu]');
    const boton = document.querySelector('[data-menu-boton]');
    if (!menu || !boton) return;

    const estaAbierto = () => menu.classList.contains('esta-abierto');

    const abrirOCerrar = (abrir) => {
      menu.classList.toggle('esta-abierto', abrir);
      boton.setAttribute('aria-expanded', String(abrir));
    };

    boton.addEventListener('click', () => abrirOCerrar(!estaAbierto()));

    // Se cierra al elegir una sección...
    menu.addEventListener('click', (evento) => {
      if (evento.target.closest('a')) abrirOCerrar(false);
    });

    // ...al pulsar fuera del menú...
    document.addEventListener('click', (evento) => {
      if (estaAbierto() && !menu.contains(evento.target)) abrirOCerrar(false);
    });

    // ...o con la tecla Escape (y el foco vuelve al botón)
    document.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape' && estaAbierto()) {
        abrirOCerrar(false);
        boton.focus();
      }
    });

    // Si la ventana se hace grande, el desplegable deja de existir
    window.matchMedia('(min-width: 48rem)').addEventListener('change', (evento) => {
      if (evento.matches) abrirOCerrar(false);
    });
  }

  /* --------------------------------------------------------------------------
     CABECERA: borde inferior cuando la página tiene scroll
     -------------------------------------------------------------------------- */
  function iniciarCabecera() {
    const cabecera = document.querySelector('[data-cabecera]');
    if (!cabecera) return;

    const actualizar = () => cabecera.classList.toggle('con-scroll', window.scrollY > 8);
    actualizar();
    window.addEventListener('scroll', actualizar, { passive: true });
  }

  /* --------------------------------------------------------------------------
     SECCIÓN ACTIVA EN EL MENÚ
     IntersectionObserver avisa cuando una sección pasa por el centro de la
     pantalla; entonces se marca su enlace con aria-current="location".
     -------------------------------------------------------------------------- */
  function iniciarSeccionActiva() {
    if (!('IntersectionObserver' in window)) return;

    const enlaces = [...document.querySelectorAll('.menu__enlace[href^="#"]')];
    const enlacePorId = new Map(enlaces.map((enlace) => [enlace.hash.slice(1), enlace]));
    const secciones = document.querySelectorAll('main > section[id]');

    const observador = new IntersectionObserver((entradas) => {
      entradas
        .filter((entrada) => entrada.isIntersecting)
        .forEach((entrada) => {
          enlaces.forEach((enlace) => enlace.removeAttribute('aria-current'));
          enlacePorId.get(entrada.target.id)?.setAttribute('aria-current', 'location');
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    secciones.forEach((seccion) => observador.observe(seccion));
  }

  /* --------------------------------------------------------------------------
     APARICIÓN AL HACER SCROLL
     Los elementos con data-aparecer aparecen al entrar en pantalla.
     La clase .aparicion-activa se pone aquí: si este archivo no carga,
     nada se queda oculto.
     -------------------------------------------------------------------------- */
  function iniciarAparicion() {
    const elementos = document.querySelectorAll('[data-aparecer]');
    if (!elementos.length || menosMovimiento.matches || !('IntersectionObserver' in window)) return;

    raiz.classList.add('aparicion-activa');

    // Si entran varios a la vez, aparecen escalonados (máximo 4 pasos)
    const PAUSA_MS = 90;
    const MAX_PASOS = 4;

    const observador = new IntersectionObserver((entradas) => {
      entradas
        .filter((entrada) => entrada.isIntersecting)
        .forEach((entrada, posicion) => {
          const retardo = Math.min(posicion, MAX_PASOS) * PAUSA_MS;
          setTimeout(() => entrada.target.classList.add('visible'), retardo);
          observador.unobserve(entrada.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    elementos.forEach((elemento) => observador.observe(elemento));
  }

  /* --------------------------------------------------------------------------
     COPIAR EL CORREO
     -------------------------------------------------------------------------- */
  async function copiarTexto(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // Plan B para navegadores sin la API del portapapeles
      const areaTemporal = document.createElement('textarea');
      areaTemporal.value = texto;
      areaTemporal.setAttribute('readonly', '');
      areaTemporal.style.position = 'fixed';
      areaTemporal.style.opacity = '0';
      document.body.append(areaTemporal);
      areaTemporal.select();
      const copiado = document.execCommand('copy');
      areaTemporal.remove();
      return copiado;
    }
  }

  function iniciarCopiarCorreo() {
    const aviso = document.querySelector('[data-copiar-aviso]');

    document.querySelectorAll('[data-copiar]').forEach((boton) => {
      const etiqueta = boton.querySelector('[data-copiar-texto]');
      const textoOriginal = etiqueta.textContent;
      let temporizador;

      boton.addEventListener('click', async () => {
        const copiado = await copiarTexto(boton.dataset.copiar);

        etiqueta.textContent = copiado ? '¡Copiado!' : 'No se pudo copiar';
        boton.classList.toggle('copiado', copiado);
        if (aviso) aviso.textContent = copiado ? 'Correo copiado al portapapeles' : 'No se pudo copiar el correo';

        // A los 2 segundos el botón vuelve a su estado normal
        clearTimeout(temporizador);
        temporizador = setTimeout(() => {
          etiqueta.textContent = textoOriginal;
          boton.classList.remove('copiado');
          if (aviso) aviso.textContent = '';
        }, 2200);
      });
    });
  }

  /* --------------------------------------------------------------------------
     GUARDAR EL CV EN PDF
     Abre el diálogo de impresión: css/impresion.css convierte la página en
     un CV de formato A4. Se cambia el título para que el PDF tenga buen nombre.
     -------------------------------------------------------------------------- */
  function iniciarImprimir() {
    document.querySelectorAll('[data-imprimir]').forEach((boton) => {
      boton.addEventListener('click', () => window.print());
    });

    const tituloOriginal = document.title;
    window.addEventListener('beforeprint', () => {
      document.title = 'CV - Eric Barriga Medina';
    });
    window.addEventListener('afterprint', () => {
      document.title = tituloOriginal;
    });
  }

  /* --------------------------------------------------------------------------
     AÑO ACTUAL EN EL PIE
     -------------------------------------------------------------------------- */
  function iniciarAnio() {
    const anio = String(new Date().getFullYear());
    document.querySelectorAll('[data-anio]').forEach((elemento) => {
      elemento.textContent = anio;
    });
  }

  /* ----- Arranque: se activa todo ----- */
  iniciarTema();
  iniciarMenu();
  iniciarCabecera();
  iniciarSeccionActiva();
  iniciarAparicion();
  iniciarCopiarCorreo();
  iniciarImprimir();
  iniciarAnio();
})();
