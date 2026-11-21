# Brand refresh
Branch: redesign-noches-bonitas. Local preview only; no push. Tests: node --test tests/*.test.cjs.
Delivery: single local feature branch; no PR.

## Specs
S1?S10: Exact requirements below, with user override: all purchase actions use Instagram, not checkout. Missing travel price remains placeholder. No automatic delivery promises without checkout.
Hola. Necesito actualizar mi sitio web **nochesbonitasmx.com** (Noches Bonitas, sueño infantil respetuoso). Es un sitio hecho a mano (HTML + `styles.css`, `promotion.css`, `currency.css` y archivos `.js`). Quiero que hagas los cambios de abajo **conservando mis textos, mi historia, mis testimonios, mis precios actuales y el selector de moneda (MXN / USD / COP)**, salvo donde te pido cambiarlos.

Reglas importantes:
- Primero revisa los archivos del sitio para entender cómo está hecho. Después haz los cambios en una **rama nueva** (por ejemplo `rediseño-noches-bonitas`) y **no publiques nada** hasta que yo revise la vista previa.
- Antes de borrar o reescribir algo que no esté en esta lista, pregúntame.
- No inventes precios, testimonios, datos, fotos ni enlaces. Donde falte un dato, deja un marcador claro como `[ENLACE DE PAGO GUÍA DE VIAJE]` y al final dame la lista de todo lo que falta.
- Escribe en español de México, de tú, con un tono cálido y sin culpa. No uses las palabras "mágico", "perfecto", "garantizado", "tienes que" ni "deberías".
- Todo tiene que verse bien en celular (375 px de ancho) y en computadora, sin scroll horizontal.
- Cuando termines, explícame en palabras sencillas qué cambiaste y qué tengo que revisar.

---

## 1. Tipografía (urgente)

Hoy el CSS pide Poppins y Montserrat, pero **no se cargan** (no hay enlace de Google Fonts ni `@font-face`), así que la mayoría de las visitantes ven una letra genérica.

- Carga desde Google Fonts, con `preconnect` y `display=swap`:
  - **Poppins** 500, 600, 700 → títulos, botones y etiquetas
  - **Nunito** 400, 600, 700 → textos y párrafos (reemplaza a Montserrat)
  - **Caveat** 600 → notas cortas "escritas a mano" (por ejemplo, "con cariño, Nicoleth")
- La palabra destacada de los títulos (hoy "*bonitas*" en Georgia itálica) debe ir en **Poppins**, en color cielo profundo `#2F5E8C`, sin itálica. Ejemplo: "Volvamos a hacer **bonitas** tus noches", con "bonitas" en azul.

## 2. Colores de mi marca

Usa estas variables en `:root` y reemplaza los colores actuales por los equivalentes:

```
--crema:        #F7F3E8   fondo principal
--luna:         #FFFDF8   tarjetas
--cielo:        #8AB6DC   acentos, íconos, círculos
--cielo-suave:  #DCE9F5   fondos de sección alternos y etiquetas
--cielo-prof:   #2F5E8C   palabra destacada, enlaces, tarjeta "más elegido"
--tinta:        #2E3A4F   textos y títulos (reemplaza el azul marino #173A5B)
--tinta-suave:  #5B6577   textos secundarios
--arena:        #DBC7A4   líneas, bordes, detalles
--terracota:    #D57F41   SOLO para el botón principal de compra o contacto (un acento por pantalla)
```

- Alterna los fondos de sección entre **crema** y **cielo suave**. Hoy no aparece el azul cielo, y es la firma de mis guías.
- Etiquetas pequeñas (como "PARA TU BEBÉ. PARA TI…"): estilo "píldora", fondo cielo suave, texto cielo profundo, Poppins 700, mayúsculas y letra espaciada.
- Tarjetas: fondo `--luna`, esquinas de 16 a 20 px y **un borde fino** (`box-shadow: 0 0 0 1.2px rgba(47,94,140,.10)`) en lugar de sombras difuminadas.
- Botón principal: fondo terracota, texto blanco, Poppins 700, totalmente redondeado. Botones secundarios: borde tinta y fondo transparente.

## 3. Ilustraciones y estilo visual

- En el arco del inicio, en lugar de solo la luna, pon una **escena de noche ilustrada en SVG**: cielo degradado de `#2F5E8C` a `#8AB6DC`, luna crema, destellos, una nube, una cuna de barrotes y un osito. Estilo de línea: trazo `#2E3A4F` de 2.2 px, esquinas redondeadas y rellenos planos con mis colores. Mantén el texto "Dormir mejor también puede sentirse bonito."
- Usa íconos de línea con ese mismo estilo (cuna, luna, osito, reloj, corazón, libro, maleta) en las tarjetas de servicios y productos, en lugar de solo texto.
- Agrega estrellitas terracota y destellos cielo como detalles decorativos, con moderación.

## 4. Celular: primera pantalla

- La barra de promoción con el contador, más el logo y el menú, ocupan casi un tercio de la pantalla en el celular. Hazla **una sola línea delgada** ("30% en todos los servicios · Ver promoción") y que se pueda cerrar. El contador puede ir solo en computadora o dentro de la ventana de promoción.
- En el celular, el menú debe ir en un botón de hamburguesa, para que el título principal se vea sin hacer scroll.

## 5. Nueva estructura de la página

Reordena las secciones así:

1. **Inicio** (mis textos actuales + la nueva ilustración)
2. **El enfoque** (mis 3 puntos actuales)
3. **Sobre mí** (mi foto y mi historia actuales)
4. **NUEVA · "¿En qué etapa están?"**: 3 tarjetas grandes que bajan a su sección:
   - 🤰 "Embarazo y 0 a 5 meses" → sección Primeras noches bonitas
   - 🌙 "Desde los 6 meses" → planes
   - 🧳 "Guías digitales" → guías
   - Debajo, un enlace: "¿Ya hiciste tu plan conmigo? → Tu Sleep Coach"
5. **NUEVA · Primeras noches bonitas** (detalle en el punto 6)
6. **Planes desde los 6 meses**: Consulta Sueño Express, Plan Sueño en Calma, Plan Noches Bonitas (marcado "MÁS ELEGIDO"), Noches Bonitas Contigo y Tu Sleep Coach. Con sus textos y precios actuales y el descuento de noviembre funcionando igual.
7. **NUEVA · Guías digitales** (detalle en el punto 7)
8. **Testimonios** y "Así se vive el acompañamiento" (como están)
9. **Preguntas frecuentes** (las actuales + las nuevas del punto 8)
10. **Llamado final** ("Un poquito más de descanso…") + **pie de página** nuevo (punto 9)

## 6. NUEVA sección: Primeras noches bonitas

Esta sección **reemplaza la tarjeta actual "Asesoría Hábitos Saludables"**.

- Etiqueta: "BASES SALUDABLES DESDE EL INICIO"
- Título: "Primeras noches **bonitas**"
- Texto: "Para embarazadas y bebés de 0 a 5 meses. Entiende el sueño de tu bebé y construye hábitos saludables desde el principio, sin entrenamiento de sueño y sin dejarlo llorar."
- Lo que aprende (lista con palomitas): sueño seguro y ambiente de descanso · cómo funciona el sueño en los primeros meses · ventanas de sueño y señales de cansancio · siestas, noches y tomas · rutinas flexibles · la regresión de los 4 meses · un plan de acción de 7 días.
- **Dos tarjetas, lado a lado** (una debajo de la otra en celular):

**A) Primeras noches bonitas · Digital**
- Incluye: Guía para leer (36 páginas) + Cuaderno de trabajo para llenar e imprimir (10 páginas)
- Precio: **$490 MXN** (con equivalentes en USD y COP en el selector de moneda)
- Texto pequeño: "Descarga inmediata en PDF"
- Botón: "Comprar y descargar" → `[ENLACE DE PAGO GUÍA + CUADERNO]`

**B) Primeras noches bonitas · Con asesoría 1 a 1** (marcar como "RECOMENDADO")
- Incluye: Videollamada individual de 90 minutos · Guía para leer · Cuaderno de trabajo · Resumen escrito con tus ajustes
- Precio: **$1,900 MXN** (el precio actual de la asesoría), con el descuento de noviembre igual que los demás servicios
- Botón: "Quiero mi asesoría" → https://ig.me/m/nochesbonitas.mx

- Debajo de las tarjetas, una nota: "¿Compraste la versión digital y después quieres la asesoría o un plan? Te descuento lo que pagaste si contratas en los siguientes 30 días."
- Pon a un lado de la sección las imágenes de portada de la guía y del cuaderno: `[IMAGEN PORTADA GUÍA]` y `[IMAGEN PORTADA CUADERNO]`. Yo te las paso.

## 7. NUEVA sección: Guías digitales

- Etiqueta: "PARA LLEVAR CONTIGO"
- Título: "Guías **digitales**"
- Texto: "Herramientas prácticas para momentos específicos, para leer a tu ritmo."
- **Tarjeta: Guía de viaje** 🧳
  - "Para que todos duerman bien, también de vacaciones. Bebés y niños de 0 a 5 años."
  - Incluye: cómo planear pensando en el sueño · el día del viaje · cambio de horario · rutinas en el camino · dormir fuera de casa · momentos S.O.S. · volver a la rutina · checklists para empacar · tu plan de viaje para llenar.
  - 34 páginas en PDF · descarga inmediata
  - Precio: `[PRECIO GUÍA DE VIAJE]` (estoy pensando entre $290 y $350 MXN)
  - Botón: "Comprar y descargar" → `[ENLACE DE PAGO GUÍA DE VIAJE]`
  - Imagen: `[IMAGEN PORTADA GUÍA DE VIAJE]`
- Deja preparado el diseño para agregar más guías después (tarjetas en cuadrícula).

## 8. Preguntas frecuentes nuevas

Agrégalas a las actuales, con el mismo formato de acordeón:
- **¿Cómo recibo mi guía?** Después de pagar te llega el PDF por correo y lo puedes descargar al momento.
- **¿Puedo llenar el cuaderno en el celular?** Sí. Puedes escribir directo en el PDF o imprimirlo.
- **¿Qué diferencia hay entre la versión digital y la asesoría?** La digital es para aprender a tu ritmo. En la asesoría, además, vemos juntas el caso de tu bebé en una videollamada de 90 minutos.
- **¿Sirve si todavía estoy embarazada?** Sí, es el mejor momento para prepararte.

## 9. Pie de página, vista previa y aspectos legales

- **Pie de página:** logo, frase de marca, enlaces rápidos (El enfoque, Sobre mí, Planes, Primeras noches bonitas, Guías digitales, Testimonios), Instagram, el botón "Escríbeme por Instagram" y los enlaces a **Aviso de privacidad** y **Términos y condiciones**.
- **Páginas nuevas:**
  - `aviso-de-privacidad.html`: plantilla de aviso de privacidad para México, con mis datos marcados como `[NOMBRE COMPLETO]`, `[CORREO DE CONTACTO]` y `[CIUDAD]`.
  - `terminos.html`: qué incluye cada producto digital, cómo se entrega, que es para uso personal y no se puede compartir, la política de devoluciones `[POLÍTICA DE DEVOLUCIONES]` y que el contenido es informativo y no sustituye la consulta con el pediatra.
  - Las dos páginas con el mismo diseño del sitio.
- **Vista previa al compartir:** agrega `og:title`, `og:description`, `og:image` (`[IMAGEN DE VISTA PREVIA 1200×630]`), `og:url` y `twitter:card`, para que al compartir el enlace por WhatsApp o Instagram se vea una tarjeta bonita.
- **Ícono de pestaña (favicon):** usa la luna del logo.

## 10. Revisión final

- Revisa cada sección en celular (375 px) y en computadora.
- Revisa que las letras se carguen bien en iPhone y Android.
- Revisa que el selector de moneda y el descuento de noviembre funcionen también en las tarjetas nuevas.
- Revisa que todos los enlaces funcionen.
- Al final, dame la **lista de marcadores pendientes** (enlaces de pago, imágenes, precios y datos legales) para que yo te los pase.

## Tasks
T1 | S1?S8 | delegated: independent UI unit | implemented; verified locally
T2 | S6,S7,S10 | delegated: independent currency unit | implemented; verified locally
T3 | S9 + Instagram override | inline | implemented; verified locally
T4 | S10 | independent verification: risk4 async currency | implemented; verified locally
## Log
L1: User asks to read assets/prompt-cambios-sitio.md and apply changes respecting brand/style, replacing purchase links with Instagram and optionally selection-aware messages.

L2: Implemented all requested UI sections. Purchase overridden to editable/copyable Instagram messages; no auto checkout/delivery. Actual mockups inspected; separate covers avoid embedded immediate-download promises. Pending travel price and legal fields.
L3: Tests33/33; independent verification32/32 before final placeholder-message assertion. CDP375/1440 no horizontal overflow, all23images and18local links pass, requested fonts load. Clipboard success/failure, focus/scroll restoration verified. PhysicaliPhone/Android andauthenticatedInstagram not tested. RDD globallyoff. Engram mirror unavailable unknown_project.
L4: Risk items3/4 shared price and async request behavior independently verified with no blockers. Local only; no push.

L5: User set travel guide to15USD withMXN/COP conversion, exempt asdigitalproduct; plansintro now belowheading.33tests pass. Wi-Fi IPv4192.168.1.72 checked; preview command py -m http.server8766 --bind0.0.0.0.
