// Encapsular el código en un IIFE (Immediately Invoked Function Expression)
;(() => {
  // ============================================================================
  // VARIABLES GLOBALES
  // ============================================================================
  let dependenciesReady = false
  let dependencyObserver = null
  let isInitialized = false
  let scriptLoadHandler = null
  let heroInstances = []
  let resizeTimeout = null

  // ============================================================================
  // VERIFICACIÓN DE DEPENDENCIAS
  // ============================================================================

  // Función para verificar dependencias mínimas (solo GSAP y SplitType)
  function checkMinimalDependencies() {
    return typeof gsap !== 'undefined' && typeof SplitType !== 'undefined'
  }

  // Función para verificar si ScrollTrigger está disponible y registrarlo
  function checkScrollTriggerAvailable() {
    if (!checkMinimalDependencies() || typeof ScrollTrigger === 'undefined') {
      return false
    }

    if (gsap.ScrollTrigger) {
      return true
    }

    // Intentar registrar ScrollTrigger
    try {
      gsap.registerPlugin(ScrollTrigger)
      if (gsap.ScrollTrigger) {
        return true
      }
      gsap.ScrollTrigger = ScrollTrigger
      return true
    } catch (error) {
      console.warn('Hero: Error registrando ScrollTrigger:', error.message)
      try {
        gsap.ScrollTrigger = ScrollTrigger
        return true
      } catch (fallbackError) {
        console.warn(
          'Hero: ScrollTrigger no disponible:',
          fallbackError.message,
        )
        return false
      }
    }
  }

  // Función unificada para verificar dependencias y ejecutar callback
  function checkAndExecute(callback) {
    if (checkScrollTriggerAvailable()) {
      callback(true)
    } else if (checkMinimalDependencies()) {
      callback(false)
    }
  }

  // ============================================================================
  // SISTEMA DE DETECCIÓN DE DEPENDENCIAS
  // ============================================================================

  function setupDependencyObserver() {
    if (dependencyObserver) return

    const onDependenciesReady = (hasScrollTrigger = false) => {
      if (dependenciesReady || isInitialized) return

      dependenciesReady = true
      isInitialized = true

      if (dependencyObserver) {
        dependencyObserver.disconnect()
        dependencyObserver = null
      }
      HeroInteraction()
    }

    // Verificar inmediatamente
    checkAndExecute(onDependenciesReady)
    if (dependenciesReady) return

    // Configurar observador único
    dependencyObserver = new MutationObserver(() =>
      checkAndExecute(onDependenciesReady),
    )
    dependencyObserver.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'type'],
    })

    // Event listeners para carga de scripts
    scriptLoadHandler = () => checkAndExecute(onDependenciesReady)
    document.addEventListener('DOMContentLoaded', scriptLoadHandler)
    window.addEventListener('load', scriptLoadHandler)

    // Verificar estado actual del documento
    if (document.readyState !== 'loading') {
      scriptLoadHandler()
    }
  }

  // ============================================================================
  // CONFIGURACIÓN DE ELEMENTOS
  // ============================================================================

  // Función para añadir contenedores a elementos de fondo
  function addBackgroundContainers() {
    const heroBackgroundElements = document.querySelectorAll(
      'figure.hero__background, video.hero__video',
    )

    for (const element of heroBackgroundElements) {
      const isAlreadyWrapped = element.parentElement.classList.contains(
        'hero__background-container',
      )

      if (!isAlreadyWrapped) {
        const container = document.createElement('div')
        container.className = 'hero__background-container'
        element.parentElement.insertBefore(container, element)
        container.appendChild(element)
      }
    }
  }

  // Función para aplicar SplitType y configurar elementos básicos
  function initializeSplitType(title) {
    const hasBrTags = title.innerHTML.includes('<br')

    if (!hasBrTags) {
      const cleanText = title.textContent || title.innerText
      title.innerHTML = cleanText
    }

    const split = new SplitType(title, {
      types: 'chars, words, lines',
      tagName: 'span',
      absolute: false,
      wordClass: 'hero__title-split-word',
      lineClass: 'hero__title-split-line',
      charClass: 'hero__title-split-char',
    })

    return split
  }

  // Función para añadir clases de compatibilidad
  function addCompatibilityClasses(title) {
    const splitChars = title.querySelectorAll('.hero__title-split-char')
    const splitWords = title.querySelectorAll('.hero__title-split-word')
    const splitLines = title.querySelectorAll('.hero__title-split-line')

    for (const char of splitChars) {
      char.classList.add('char')
    }

    for (const word of splitWords) {
      word.classList.add('word')
    }

    for (const line of splitLines) {
      line.classList.add('line')
    }

    return { splitWords, splitLines }
  }

  // Función para aplicar colores a líneas de Hero M
  function applyHeroMColors(title, splitLines) {
    const isHeroM = title.closest(
      '.hero_cat_m, .hero_cat_m2, .hero_cat_m3, .hero_cat_m_video, .hero_cat_m2_video, .hero_cat_m3_video',
    )

    if (!isHeroM || splitLines.length === 0) return

    // Primera línea: color inverso
    if (splitLines[0]) {
      splitLines[0].style.color = 'var(--pd-color-text-title-inverse)'
      const firstLineWords = splitLines[0].querySelectorAll(
        '.word, .hero__title-split-word',
      )
      for (const word of firstLineWords) {
        word.style.setProperty(
          '--after-color',
          'var(--pd-color-text-title-inverse)',
        )
      }
    }

    // Segunda línea: color normal
    if (splitLines[1]) {
      splitLines[1].style.color = 'var(--pd-color-text-title-featured)'
      const secondLineWords = splitLines[1].querySelectorAll(
        '.word, .hero__title-split-word',
      )
      for (const word of secondLineWords) {
        word.style.setProperty(
          '--after-color',
          'var(--pd-color-text-title-featured)',
        )
      }
    }
  }

  // Función para extraer información de colores del HTML original
  function extractColorInformation(title) {
    const wordNodes = []
    let wordIndex = 0

    // Recorremos los nodos hijos del título para identificar palabras y si están en un <span>
    for (const node of title.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.trim().split(/\s+/)
        for (const word of words) {
          if (word) {
            wordNodes.push({
              text: word,
              highlighted: false,
              index: wordIndex++,
            })
          }
        }
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName === 'SPAN'
      ) {
        const words = node.textContent.trim().split(/\s+/)
        for (const word of words) {
          if (word) {
            wordNodes.push({
              text: word,
              highlighted: true,
              index: wordIndex++,
            })
          }
        }
      }
    }

    const colorInfo = {
      hasSpecialColors: false,
      specialWords: [],
      wordNodes,
      specialClassName: title.querySelectorAll('span')[0]?.className,
    }

    // Buscar spans que tengan clases especiales o que no sean generados por SplitType
    const spans = title.querySelectorAll('span')

    for (const span of spans) {
      // Si el span no es generado por SplitType, es probablemente un span de color
      if (
        !span.classList.contains('hero__title-split-word') &&
        !span.classList.contains('hero__title-split-char') &&
        !span.classList.contains('hero__title-split-line')
      ) {
        colorInfo.hasSpecialColors = true
        const text = span.textContent || span.innerText

        // Dividir el texto en palabras y guardar cada una
        const words = text.trim().split(/\s+/)

        for (const word of words) {
          if (word.trim()) {
            colorInfo.specialWords.push({
              text: word.trim(),
              className: span.className,
            })
          }
        }
      }
    }

    return colorInfo
  }

  // Función para aplicar colores después del split
  function applyColorsAfterSplit(title, colorInfo, splitWords) {
    if (!colorInfo.hasSpecialColors || colorInfo.specialWords.length === 0) {
      return
    }

    // Recorrer todas las palabras divididas y aplicar colores si coinciden
    splitWords.forEach((word, index) => {
      const wordIsHighlighted = colorInfo.wordNodes[index].highlighted

      const wordText = word.textContent.trim()

      // Buscar si esta palabra estaba en un span especial
      const specialWord = colorInfo.specialWords.find(
        (sw) => sw.text === wordText,
      )

      if (wordIsHighlighted) {
        // Aplicar la clase original del span
        word.classList.add('hero__title-original-span')

        // También aplicar a todos los caracteres de esta palabra
        const chars = word.querySelectorAll('.hero__title-split-char')
        for (const char of chars) {
          char.classList.add('hero__title-original-span')
        }
      }
    })
  }

  // Función para configurar elementos iniciales
  function setupHeroInitialElements(title, image) {
    // Guardar el HTML original si no lo hemos hecho ya
    if (!title.dataset.originalHtml) {
      title.dataset.originalHtml = title.innerHTML
    }
    // Restaurar SIEMPRE el HTML original antes de hacer nada
    title.innerHTML = title.dataset.originalHtml

    // PASO 1: Extraer información de colores ANTES del split
    const colorInfo = extractColorInformation(title)

    // PASO 2: Inicializar SplitType
    const split = initializeSplitType(title)

    // PASO 3: Añadir clases de compatibilidad
    const { splitWords, splitLines } = addCompatibilityClasses(title)

    // PASO 4: Reaplicar los colores basándose en la información extraída
    if (colorInfo.hasSpecialColors) {
      applyColorsAfterSplit(title, colorInfo, splitWords)
    }

    // PASO 5: Configurar animaciones iniciales
    if (split.chars && split.chars.length > 0) {
      gsap.set(split.chars, { opacity: 0 })
    }

    if (image) {
      gsap.set(image, { scale: 1.2 })
    }

    gsap.set(title, { visibility: 'visible' })

    // PASO 6: Aplicar colores específicos para Hero M
    applyHeroMColors(title, splitLines)

    return split
  }

  // Función para verificar si es un hero de home
  function isHomeHeroType(title) {
    return title.closest(
      '.hero_home_1, .hero_home_2, .hero_home_3, .hero-video',
    )
  }

  // Función para configurar elementos de subtítulo y botones
  function setupSubtitleAndButtons(title, isHomeHero) {
    const heroContainer = title.closest('.hero, .hero-video')
    const subtitleElement = heroContainer?.querySelector('.hero__subtitle')
    const buttonsElement = heroContainer?.querySelector('.hero__buttons')

    const elementsToAnimate = []
    if (subtitleElement && isHomeHero) {
      gsap.set(subtitleElement, {
        opacity: 0,
        y: 10,
        visibility: 'visible',
      })
      elementsToAnimate.push(subtitleElement)
    }

    if (buttonsElement && isHomeHero) {
      gsap.set(buttonsElement, {
        opacity: 0,
        y: 10,
        force3D: true,
        rotationZ: 0.01, // NOTE fuerza el 3D para evitar problemas de renderizado
        visibility: 'visible',
      })
      elementsToAnimate.push(buttonsElement)
    }

    return { elementsToAnimate }
  }

  // ============================================================================
  // ANIMACIONES
  // ============================================================================

  // Función para animar la imagen de fondo
  function animateBackgroundImage(image, timeline) {
    if (image) {
      gsap.to(
        image,
        {
          scale: 1,
          duration: 5,
          ease: 'expo.out',
        },
        0,
      )
    }
  }

  // Función para animar las palabras del título
  function animateTitleWords(split, timeline) {
    // Verificar que split.words exista y tenga elementos
    if (!split.words || split.words.length === 0) {
      return
    }

    for (const word of split.words) {
      const wordChars = word.querySelectorAll('.hero__title-split-char, .char')

      // Verificar que wordChars tenga elementos antes de animar
      if (wordChars.length === 0) {
        continue
      }

      timeline
        .to(word, {
          '--line-opacity': 1,
          duration: 0.1,
          ease: 'linear',
        })
        .to(word, {
          '--line-opacity': 0,
          duration: 0.06,
          ease: 'linear',
        })
        .to(wordChars, {
          opacity: 1,
          duration: 0.03,
          stagger: 0.03,
          ease: 'linear',
        })
    }
  }

  // Función para animar subtítulo y botones
  function animateSubtitleAndButtons(elementsToAnimate, timeline) {
    // Verificar que elementsToAnimate tenga elementos
    if (!elementsToAnimate || elementsToAnimate.length === 0) {
      return
    }

    requestAnimationFrame(() => {
      timeline.to(
        elementsToAnimate,
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'expo.out',
          force3D: true,
          overwrite: 'auto',
        },
        '+=0.1',
      )
    })
  }

  // ============================================================================
  // GESTIÓN DE INSTANCIAS
  // ============================================================================

  // Función para limpiar instancias anteriores
  const cleanupHeroInstances = () => {
    for (const instance of heroInstances) {
      if (instance && typeof instance.kill === 'function') {
        instance.kill()
      }
    }
    heroInstances = []

    // Limpiar instancias de ScrollTrigger relacionadas con hero
    if (typeof ScrollTrigger !== 'undefined') {
      const heroClasses = [
        'hero_home_1',
        'hero_home_2',
        'hero_home_3',
        'hero_cat_l',
        'hero_cat_l2',
        'hero_cat_l3',
        'hero_cat_special',
        'hero_cat_m',
        'hero_cat_m2',
        'hero_cat_m3',
        'hero_cat_m_video',
        'hero_cat_m2_video',
        'hero_cat_m3_video',
        'hero-video',
      ]

      for (const trigger of ScrollTrigger.getAll()) {
        const element = trigger.vars?.trigger
        if (
          element &&
          heroClasses.some((className) => element.classList.contains(className))
        ) {
          trigger.kill()
        }
      }
    }
  }

  // Función para crear instancias de hero
  const createHeroInstances = () => {
    if (!checkMinimalDependencies()) {
      console.warn('Hero: Dependencias mínimas no disponibles')
      return
    }

    const h1Titles = document.querySelectorAll('[class*="hero"] .hero__title')
    if (h1Titles.length === 0) {
      console.log('Hero: No se encontraron elementos de título')
      return
    }

    const hasScrollTrigger = checkScrollTriggerAvailable()

    addBackgroundContainers()

    for (const title of h1Titles) {
      try {
        const split = setupHeroInitialElements(
          title,
          document.querySelector('.hero__background img'),
        )
        const isHomeHero = isHomeHeroType(title)
        const { elementsToAnimate } = setupSubtitleAndButtons(title, isHomeHero)
        const tl = gsap.timeline()

        animateBackgroundImage(
          document.querySelector('.hero__background img'),
          tl,
        )
        animateTitleWords(split, tl)

        if (isHomeHero && elementsToAnimate.length > 0) {
          animateSubtitleAndButtons(elementsToAnimate, tl)
        }

        heroInstances.push(tl)
      } catch (error) {
        console.error('Hero: Error al configurar elemento:', error)
      }
    }
  }

  // Función principal refactorizada
  function HeroInteraction() {
    // Limpiar instancias anteriores
    cleanupHeroInstances()

    // Crear nuevas instancias
    createHeroInstances()
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  // Función para manejar resize con debounce
  const handleResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout)

    resizeTimeout = setTimeout(() => {
      cleanupHeroInstances()
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh()
      createHeroInstances()
    }, 150)
  }

  // Función para limpiar event listeners
  const cleanup = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
      resizeTimeout = null
    }
    if (dependencyObserver) {
      dependencyObserver.disconnect()
      dependencyObserver = null
    }
    if (scriptLoadHandler) {
      document.removeEventListener('DOMContentLoaded', scriptLoadHandler)
      window.removeEventListener('load', scriptLoadHandler)
      scriptLoadHandler = null
    }
    cleanupHeroInstances()
    window.removeEventListener('resize', handleResize)
  }

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  // Inicializar el sistema de detección de dependencias
  setupDependencyObserver()
  let lastWidth = window.innerWidth

  const handleResizeWidthOnly = () => {
    const widthChanged = window.innerWidth !== lastWidth

    if (widthChanged) {
      lastWidth = window.innerWidth
      handleResize()
    }
  }

  // Escuchar solo cambios de anchura
  window.addEventListener('resize', handleResizeWidthOnly)

  // Limpiar al descargar la página
  window.addEventListener('beforeunload', cleanup)
})() // Cerrar el IIFE
