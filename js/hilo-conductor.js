/**
 * ============================================================================
 * HILO CONDUCTOR
 * Una línea abstracta que nace en la tarjeta de código de la portada,
 * recorre toda la página pasando por un nodo en cada sección y termina
 * subrayando la palabra "Hablemos." del contacto.
 * Se va dibujando a medida que se hace scroll: representa el camino
 * del hardware (SMX) al desarrollo web full stack.
 *
 * Cómo se conecta con el HTML (solo atributos data-, sin depender de clases):
 *   data-hilo         → la zona que recorre el hilo (el <main>)
 *   data-hilo-inicio  → el elemento del que nace (la tarjeta de código)
 *   data-nodo         → los puntos por los que pasa (uno en cada sección)
 *   data-hilo-fin     → el texto que subraya al final ("Hablemos.")
 *
 * Para cambiar el recorrido, toca los valores de la sección "AJUSTES".
 * Los colores y grosores están en css/hilo.css.
 *
 * Sin JavaScript el hilo simplemente no aparece (la web sigue igual).
 * Con "reducir movimiento" activado se dibuja entero, sin animación.
 * ============================================================================
 */
'use strict';

(() => {
  const zona = document.querySelector('[data-hilo]');
  const inicio = document.querySelector('[data-hilo-inicio]');
  const fin = document.querySelector('[data-hilo-fin]');
  const nodos = [...document.querySelectorAll('[data-nodo]')];
  if (!zona || !inicio || !nodos.length) return;

  const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --------------------------------------------------------------------------
     AJUSTES DEL RECORRIDO
     -------------------------------------------------------------------------- */
  // Hasta dónde se aleja el hilo hacia la derecha entre sección y sección
  // (0 = borde izquierdo, 1 = borde derecho). Se usan por turnos.
  const CURVAS_A_LA_DERECHA = [0.78, 0.46, 0.7, 0.55, 0.84];
  // Entre qué secciones el hilo hace un bucle (número de tramo, empezando en 0)
  const TRAMOS_CON_BUCLE = [1, 3];
  // Separación entre las pequeñas ondas que hace el hilo en el margen (px)
  const DISTANCIA_ONDAS = 260;
  // Altura de la pantalla (de 0 a 1) por la que va "leyendo" el hilo
  const PUNTO_DE_LECTURA = 0.62;

  /* --------------------------------------------------------------------------
     1. CREAR EL DIBUJO SVG
     Se crea aquí para no ensuciar el HTML. Tiene cuatro piezas:
       - recorrido: el camino completo, en punteado suave (lo que queda por ver)
       - trazo:     la línea de color que se va dibujando con el scroll
       - halo y cabeza: el punto brillante que va en la punta de la línea
       - final:     un punto que aparece cuando el hilo llega al final
     -------------------------------------------------------------------------- */
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function crearElementoSvg(etiqueta, clase) {
    const elemento = document.createElementNS(SVG_NS, etiqueta);
    elemento.setAttribute('class', clase);
    return elemento;
  }

  const svg = crearElementoSvg('svg', 'hilo');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  const recorrido = crearElementoSvg('path', 'hilo__recorrido');
  const trazo = crearElementoSvg('path', 'hilo__trazo');
  const halo = crearElementoSvg('circle', 'hilo__halo');
  const cabeza = crearElementoSvg('circle', 'hilo__cabeza');
  const final = crearElementoSvg('circle', 'hilo__final');
  halo.setAttribute('r', '11');
  cabeza.setAttribute('r', '5');
  final.setAttribute('r', '5');

  svg.append(recorrido, trazo, final, halo, cabeza);
  zona.prepend(svg);

  /* --------------------------------------------------------------------------
     2. CALCULAR LOS PUNTOS DEL RECORRIDO
     Se miden las posiciones reales de los elementos en la página, así el hilo
     se adapta solo al tamaño de la pantalla y al contenido.
     -------------------------------------------------------------------------- */

  // Posición de un elemento dentro de la zona. fx y fy van de 0 a 1:
  // (0.5, 1) es el centro del borde inferior, por ejemplo.
  function posicion(elemento, fx = 0.5, fy = 0.5) {
    const caja = elemento.getBoundingClientRect();
    const cajaZona = zona.getBoundingClientRect();
    return {
      x: caja.left - cajaZona.left + caja.width * fx,
      y: caja.top - cajaZona.top + caja.height * fy,
    };
  }

  // Borde inferior del contenido de la sección en la que está un elemento
  function finalDelContenido(elemento) {
    const seccion = elemento.closest('section');
    const contenido = seccion?.querySelector(':scope > .contenedor') || seccion;
    return posicion(contenido, 0, 1).y;
  }

  // Giro redondeado (en forma de U tumbada) para volver hacia la izquierda
  function puntosDeGiro(centro, radio) {
    return [
      { x: centro.x - radio * 0.9, y: centro.y - radio * 0.6 },
      { x: centro.x + radio * 0.35, y: centro.y },
      { x: centro.x - radio * 0.9, y: centro.y + radio * 0.6 },
    ];
  }

  // Añade un pequeño bucle alrededor de un punto (para darle un aire más libre)
  function puntosDeBucle(centro, radio) {
    return [
      { x: centro.x - radio, y: centro.y - radio * 0.7 },
      { x: centro.x + radio * 0.9, y: centro.y - radio * 0.3 },
      { x: centro.x + radio * 0.4, y: centro.y + radio * 0.9 },
      { x: centro.x - radio * 0.8, y: centro.y + radio * 0.3 },
      { x: centro.x - radio * 0.1, y: centro.y - radio * 0.9 },
      { x: centro.x + radio * 1.3, y: centro.y + radio * 0.6 },
    ];
  }

  // Puntos para llegar a un nodo desde arriba, bajando en vertical por el margen
  function llegadaAlNodo(nodo, xMargen, hueco) {
    return [
      { x: xMargen + 70, y: nodo.y - Math.min(100, hueco * 0.3) },
      { x: xMargen, y: nodo.y - Math.min(40, hueco * 0.15) },
      nodo,
    ];
  }

  function calcularPuntos() {
    const ancho = zona.clientWidth;
    const puntos = [];
    const centrosNodos = nodos.map((nodo) => posicion(nodo));
    const xMargen = centrosNodos[0].x;                    // el hilo baja por el margen izquierdo
    const onda = Math.min(14, Math.max(3, xMargen * 0.3)); // amplitud de las ondas del margen

    // Tramo inicial: de la tarjeta de código al primer nodo
    const origen = posicion(inicio, 0.5, 1);
    const finalPortada = finalDelContenido(inicio);
    const primerNodo = centrosNodos[0];
    const alturaHueco = primerNodo.y - finalPortada;

    const bajadaInicial = Math.max(40, Math.min(90, alturaHueco * 0.3));
    puntos.push(origen, { x: origen.x, y: origen.y + bajadaInicial });
    puntos.push({ x: origen.x + (xMargen - origen.x) * 0.3, y: finalPortada + alturaHueco * 0.45 });
    puntos.push(...llegadaAlNodo(primerNodo, xMargen, alturaHueco));

    // Tramos entre nodos: ondas por el margen y una gran curva en el hueco entre secciones
    for (let i = 0; i < centrosNodos.length - 1; i++) {
      const nodo = centrosNodos[i];
      const siguiente = centrosNodos[i + 1];
      const finalSeccion = finalDelContenido(nodos[i]);

      // Ondas suaves bajando por el margen mientras se lee la sección
      let lado = 1;
      for (let y = nodo.y + DISTANCIA_ONDAS; y < finalSeccion - 80; y += DISTANCIA_ONDAS) {
        puntos.push({ x: xMargen + onda * lado, y });
        lado *= -1;
      }
      // Sale por debajo del contenido (así no cruza ningún texto)
      const hueco = siguiente.y - finalSeccion;
      puntos.push({ x: xMargen, y: finalSeccion + 12 });
      puntos.push({ x: xMargen + 35, y: finalSeccion + hueco * 0.2 });

      // Curva hacia la derecha en el espacio vacío entre las dos secciones
      if (hueco > 90) {
        const centroCurva = {
          x: ancho * CURVAS_A_LA_DERECHA[i % CURVAS_A_LA_DERECHA.length],
          y: finalSeccion + hueco * 0.45,
        };
        const radio = Math.min(55, hueco * 0.28);
        if (TRAMOS_CON_BUCLE.includes(i)) {
          puntos.push(...puntosDeBucle(centroCurva, radio));
        } else {
          puntos.push(...puntosDeGiro(centroCurva, radio));
        }
      }
      puntos.push(...llegadaAlNodo(siguiente, xMargen, hueco));
    }

    // Tramo final: del último nodo hasta subrayar "Hablemos."
    const ultimo = centrosNodos[centrosNodos.length - 1];
    let subrayado = null;
    if (fin) {
      const izquierda = posicion(fin, 0, 1);
      const derecha = posicion(fin, 1, 1);
      const ySubrayado = izquierda.y + 4;
      // Baja por el margen y entra en horizontal por debajo del título
      puntos.push({ x: xMargen, y: ultimo.y + 50 });
      puntos.push({ x: xMargen, y: ySubrayado - 40 });
      puntos.push({ x: xMargen + 40, y: ySubrayado });
      puntos.push({ x: izquierda.x, y: ySubrayado });
      subrayado = { x: derecha.x, y: ySubrayado };
    }

    return { puntos, subrayado };
  }

  /* --------------------------------------------------------------------------
     3. CONVERTIR LOS PUNTOS EN UNA CURVA SUAVE
     Técnica "Catmull-Rom centrípeta": la curva pasa exactamente por cada
     punto y los une con curvas de Bézier, sin esquinas ni bucles raros
     aunque los puntos estén a distancias muy distintas.
     -------------------------------------------------------------------------- */
  const redondear = (numero) => Math.round(numero * 10) / 10;
  const raizDistancia = (a, b) => Math.sqrt(Math.hypot(b.x - a.x, b.y - a.y));

  // Punto de control de Bézier para el tramo que sale de "desde" hacia "hacia"
  // (d1: distancia al punto anterior, d2: distancia del tramo; ambas en raíz)
  function puntoDeControl(anterior, desde, hacia, d1, d2) {
    if (d1 < 1e-6) return desde;
    const calcular = (eje) => (d1 * d1 * hacia[eje] - d2 * d2 * anterior[eje]
      + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * desde[eje]) / (3 * d1 * (d1 + d2));
    return { x: calcular('x'), y: calcular('y') };
  }

  // Devuelve el atributo "d" del SVG y la lista de tramos (para medirlos)
  function curvaSuave(puntos) {
    let d = `M ${redondear(puntos[0].x)} ${redondear(puntos[0].y)}`;
    const tramos = [];
    for (let i = 0; i < puntos.length - 1; i++) {
      const anterior = puntos[i - 1] || puntos[i];
      const actual = puntos[i];
      const siguiente = puntos[i + 1];
      const despues = puntos[i + 2] || siguiente;

      const d1 = raizDistancia(anterior, actual);
      const d2 = raizDistancia(actual, siguiente);
      const d3 = raizDistancia(siguiente, despues);

      const control1 = puntoDeControl(anterior, actual, siguiente, d1, d2);
      const control2 = puntoDeControl(despues, siguiente, actual, d3, d2);

      d += ` C ${redondear(control1.x)} ${redondear(control1.y)},`
        + ` ${redondear(control2.x)} ${redondear(control2.y)},`
        + ` ${redondear(siguiente.x)} ${redondear(siguiente.y)}`;
      tramos.push([actual, control1, control2, siguiente]);
    }
    return { d, tramos };
  }

  // Punto de una curva de Bézier cúbica para t entre 0 y 1
  function puntoEnTramo([p0, c1, c2, p3], t) {
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const e = t * t * t;
    return {
      x: a * p0.x + b * c1.x + c * c2.x + e * p3.x,
      y: a * p0.y + b * c1.y + c * c2.y + e * p3.y,
    };
  }

  // Recorre la curva a pasitos y apunta, para cada paso: la distancia recorrida,
  // la posición y la altura máxima alcanzada hasta ese momento.
  // (Se calcula aquí con matemáticas en vez de preguntar al navegador punto a
  // punto, que es mucho más lento.)
  function medirCurva(tramos) {
    const lista = [];
    let distancia = 0;
    let alturaMaxima = -Infinity;
    let previo = tramos[0][0];
    lista.push({ distancia: 0, x: previo.x, y: previo.y, altura: previo.y });

    for (const tramo of tramos) {
      const aproximado = Math.hypot(tramo[3].x - tramo[0].x, tramo[3].y - tramo[0].y)
        + Math.hypot(tramo[1].x - tramo[0].x, tramo[1].y - tramo[0].y)
        + Math.hypot(tramo[2].x - tramo[3].x, tramo[2].y - tramo[3].y);
      const pasos = Math.max(4, Math.ceil(aproximado / 6));
      for (let paso = 1; paso <= pasos; paso++) {
        const punto = puntoEnTramo(tramo, paso / pasos);
        distancia += Math.hypot(punto.x - previo.x, punto.y - previo.y);
        alturaMaxima = Math.max(alturaMaxima, punto.y);
        lista.push({ distancia, x: punto.x, y: punto.y, altura: alturaMaxima });
        previo = punto;
      }
    }
    return lista;
  }

  /* --------------------------------------------------------------------------
     4. CONSTRUIR EL HILO (se repite si cambia el tamaño de la página)
     -------------------------------------------------------------------------- */
  let longitud = 0;
  let muestras = [];        // { distancia, x, y, altura máxima alcanzada }
  let alturasNodos = [];

  // pathLength="1000": el navegador trata el trazo como si midiera 1000,
  // así el dibujo parcial se controla con un porcentaje (ver actualizar()).
  const LARGO_NORMALIZADO = 1000;
  trazo.setAttribute('pathLength', String(LARGO_NORMALIZADO));
  trazo.style.strokeDasharray = `${LARGO_NORMALIZADO} ${LARGO_NORMALIZADO}`;

  function construir() {
    const ancho = zona.clientWidth;
    const alto = zona.scrollHeight;
    svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);

    const { puntos, subrayado } = calcularPuntos();
    if (subrayado) puntos.push(subrayado);
    const { d, tramos } = curvaSuave(puntos);
    const ultimoPunto = puntos[puntos.length - 1];
    final.setAttribute('cx', ultimoPunto.x);
    final.setAttribute('cy', ultimoPunto.y);

    recorrido.setAttribute('d', d);
    trazo.setAttribute('d', d);

    // Se mide el hilo: para cada tramo recorrido, hasta qué altura ha llegado.
    // Así se sabe cuánto dibujar según lo que se ha bajado en la página.
    muestras = medirCurva(tramos);
    longitud = muestras[muestras.length - 1].distancia;
    alturasNodos = nodos.map((nodo) => posicion(nodo).y);
    actualizar();
  }

  /* --------------------------------------------------------------------------
     5. DIBUJAR SEGÚN EL SCROLL
     -------------------------------------------------------------------------- */

  // Busca la primera muestra que llega a una altura (búsqueda binaria: rápida
  // aunque haya miles de muestras)
  function muestraHasta(altura) {
    let bajo = 0;
    let alto = muestras.length - 1;
    while (bajo < alto) {
      const medio = (bajo + alto) >> 1;
      if (muestras[medio].altura < altura) bajo = medio + 1;
      else alto = medio;
    }
    return muestras[bajo];
  }

  function actualizar() {
    if (!longitud) return;

    const alturaLectura = window.innerHeight * PUNTO_DE_LECTURA - zona.getBoundingClientRect().top;
    const alFinalDeLaPagina = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    const dibujarTodo = alFinalDeLaPagina || menosMovimiento.matches;
    const punta = dibujarTodo ? muestras[muestras.length - 1] : muestraHasta(alturaLectura);
    const distancia = punta.distancia;

    // El truco del trazo: una línea discontinua con un único guion tan largo
    // como el hilo; desplazándola se ve solo la parte ya recorrida.
    const recorridoHecho = longitud ? distancia / longitud : 0;
    trazo.style.strokeDashoffset = String(LARGO_NORMALIZADO * (1 - recorridoHecho));

    cabeza.setAttribute('cx', punta.x);
    cabeza.setAttribute('cy', punta.y);
    halo.setAttribute('cx', punta.x);
    halo.setAttribute('cy', punta.y);

    // Los nodos se encienden cuando el hilo llega a ellos
    nodos.forEach((nodo, i) => {
      nodo.classList.toggle('activo', dibujarTodo || alturasNodos[i] <= alturaLectura);
    });
    svg.classList.toggle('hilo--completo', distancia >= longitud - 1);
  }

  /* --------------------------------------------------------------------------
     6. ESCUCHAR CAMBIOS
     requestAnimationFrame evita recalcular más de una vez por fotograma.
     -------------------------------------------------------------------------- */
  const tareasPendientes = new Set();
  function programar(tarea) {
    if (tareasPendientes.has(tarea)) return;
    tareasPendientes.add(tarea);
    requestAnimationFrame(() => {
      tareasPendientes.delete(tarea);
      tarea();
    });
  }

  window.addEventListener('scroll', () => programar(actualizar), { passive: true });

  // Si cambia el tamaño de la página (ventana, fuentes que cargan...), se rehace el hilo
  new ResizeObserver(() => programar(construir)).observe(zona);
  document.fonts?.ready.then(construir);
  window.addEventListener('load', construir);

  construir();
})();
