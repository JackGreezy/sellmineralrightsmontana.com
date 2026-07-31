// Encapsular el código en un IIFE (Immediately Invoked Function Expression)
;(() => {
  // Configuraciones base
  // -----------------------------------------------------------------------
  const BASE_CONFIG = {
    start: 'top bottom',
    end: 'bottom top',
    scale: 1.3,
    opacity: 1,
  }

  const ANIMATION_PRESETS = {
    hero: { from: { y: '8vh' }, to: { y: '-8vh' } },
    divider: { from: { y: '7vh' }, to: { y: '-5vh' } },
    dividerClosing: { from: { y: '11vh' }, to: { y: '-10vh' } }, // Efecto más pronunciado para type-closing
    bodyText: { from: { y: '8vh' }, to: { y: '-10vh' } },
    eventBanner: { from: { y: '8vh' }, to: { y: '-8vh' } },
  }

  const INITIAL_PRESETS = {
    hero: {
      y: '8vh',
      scale: BASE_CONFIG.scale,
      opacity: BASE_CONFIG.opacity,
    },
    divider: {
      y: '8vh',
      scale: BASE_CONFIG.scale,
      opacity: BASE_CONFIG.opacity,
    },
    dividerClosing: {
      y: '11vh',
      scale: BASE_CONFIG.scale,
      opacity: BASE_CONFIG.opacity,
    },
    bodyText: {
      y: '6vh',
      scale: BASE_CONFIG.scale,
      opacity: BASE_CONFIG.opacity,
    },
    eventBanner: {
      y: '8vh',
      scale: BASE_CONFIG.scale,
      opacity: BASE_CONFIG.opacity,
    },
  }

  // Configuraciones centralizadas para todos los tipos de parallax
  // -----------------------------------------------------------------------

  const PARALLAX_CONFIGS = {
    hero: {
      imageSelector: '.hero__background img',
      trigger: '.hero__background img',
      ...BASE_CONFIG,
      animation: ANIMATION_PRESETS.hero,
      initial: INITIAL_PRESETS.hero,
    },
    divider: {
      imageSelector: '.divider-image__figure img',
      trigger: '.divider-image__figure img',
      ...BASE_CONFIG,
      animation: ANIMATION_PRESETS.divider,
      initial: INITIAL_PRESETS.divider,
    },
    dividerClosing: {
      imageSelector: '.divider-image__figure img',
      trigger: '.divider-image__figure img',
      ...BASE_CONFIG,
      animation: ANIMATION_PRESETS.dividerClosing,
      initial: INITIAL_PRESETS.dividerClosing,
    },
    bodyText: {
      imageSelector: '.body-text__image img',
      trigger: '.body-text__image img',
      ...BASE_CONFIG,
      animation: ANIMATION_PRESETS.bodyText,
      initial: INITIAL_PRESETS.bodyText,
    },
    eventBanner: {
      imageSelector: '.banner-image img',
      trigger: '.banner-image img',
      ...BASE_CONFIG,
      animation: ANIMATION_PRESETS.eventBanner,
      initial: INITIAL_PRESETS.eventBanner,
    },
  }

  // Funciones utilitarias para parallax
  // -----------------------------------------------------------------------
  const detectElementType = (element) => {
    // Detectar tipo específico de divider
    if (element.classList.contains('type-closing')) {
      return 'dividerClosing'
    }
    if (element.classList.contains('divider-image')) {
      return 'divider'
    }
    if (element.classList.contains('event-banner-wrapper')) {
      return 'eventBanner'
    }
    if (element.classList.contains('body-text')) {
      return 'bodyText'
    }
    // Por defecto, asumir que es hero
    return 'hero'
  }

  const findImage = (element, config) => {
    const selector = config.imageSelector
    return selector === 'self' ? element : element.querySelector(selector)
  }

  const findTrigger = (element, config) => {
    if (config.trigger === 'self') return element

    // Si el trigger es el mismo selector que la imagen, buscar la imagen dentro del elemento
    // Esto es importante para que el parallax se active cuando la imagen entra en viewport
    if (config.trigger === config.imageSelector) {
      const trigger = element.querySelector(config.trigger)
      return trigger
    }

    const trigger = element.closest(config.trigger)
    return trigger
  }

  const createScrollTriggerConfig = (trigger, config) => ({
    trigger,
    start: config.start,
    end: config.end,
    scrub: true,
  })

  // Función común para configurar elementos iniciales
  // -----------------------------------------------------------------------
  function setupParallaxInitialElements(elements, type) {
    for (const element of elements) {
      // Determinar el tipo real del elemento
      const actualType = detectElementType(element)
      const config = PARALLAX_CONFIGS[actualType]

      if (!config) continue

      const image = findImage(element, config)
      if (image) {
        gsap.set(image, config.initial)
      }
    }
  }

  // Función común para animar imágenes con efecto parallax
  // -----------------------------------------------------------------------
  function animateParallaxImages(elements, type) {
    const instances = []

    for (const element of elements) {
      // Determinar el tipo real del elemento
      const actualType = detectElementType(element)
      const config = PARALLAX_CONFIGS[actualType]

      if (!config) {
        continue
      }

      const image = findImage(element, config)
      if (!image) {
        continue
      }

      const trigger = findTrigger(element, config)
      if (!trigger) {
        continue
      }

      const scrollTriggerConfig = createScrollTriggerConfig(trigger, config)

      const instance = gsap.fromTo(image, config.animation.from, {
        ...config.animation.to,
        ease: 'none',
        scrollTrigger: scrollTriggerConfig,
      })

      instances.push(instance)
    }

    return instances
  }

  // Variables globales para gestión de instancias
  // -----------------------------------------------------------------------
  let parallaxInstances = []
  let resizeTimeout = null

  // Variables para gestión de dependencias
  // -----------------------------------------------------------------------
  let dependenciesReady = false
  let dependencyObserver = null
  let isInitialized = false
  let scriptLoadHandler = null

  // Función para limpiar instancias anteriores
  // -----------------------------------------------------------------------
  const cleanupParallaxInstances = () => {
    for (const instance of parallaxInstances) {
      if (instance && typeof instance.kill === 'function') {
        instance.kill()
      }
    }
    parallaxInstances = []

    // Limpiar también todas las instancias de ScrollTrigger relacionadas con parallax
    if (typeof ScrollTrigger !== 'undefined') {
      const parallaxClasses = [
        'hero_cat_100bg',
        'hero_cat_estudios',
        'hero_cat_tendencia',
        'divider-image',
        'type-closing',
        'event-banner-wrapper',
        'body-text',
      ]

      const allTriggers = ScrollTrigger.getAll()
      for (const trigger of allTriggers) {
        const triggerElement = trigger.vars?.trigger
        if (
          triggerElement &&
          parallaxClasses.some((className) =>
            triggerElement.classList.contains(className),
          )
        ) {
          trigger.kill()
        }
      }
    }
  }

  // Funciones de verificación de dependencias
  // -----------------------------------------------------------------------
  const checkMinimalDependencies = () => {
    return typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined'
  }

  const checkScrollTriggerAvailable = () => {
    if (!checkMinimalDependencies()) return false

    if (gsap.ScrollTrigger) {
      return true
    }

    try {
      gsap.registerPlugin(ScrollTrigger)
      if (gsap.ScrollTrigger) {
        return true
      }
      gsap.ScrollTrigger = ScrollTrigger
      return true
    } catch (error) {
      try {
        gsap.ScrollTrigger = ScrollTrigger
        return true
      } catch (fallbackError) {
        console.warn('ScrollTrigger registration failed:', error.message)
        console.warn('ScrollTrigger fallback failed:', fallbackError.message)
        return false
      }
    }
  }

  const checkAndExecute = (callback) => {
    if (dependenciesReady || checkScrollTriggerAvailable()) {
      dependenciesReady = true
      callback(true)
      return true
    }
    return false
  }

  const setupDependencyObserver = (onDependenciesReady) => {
    if (isInitialized) return
    isInitialized = true

    // Verificar dependencias inmediatamente
    if (checkAndExecute(onDependenciesReady)) {
      return
    }

    // Configurar observer para cambios en el DOM
    dependencyObserver = new MutationObserver(() => {
      if (checkAndExecute(onDependenciesReady)) {
        dependencyObserver.disconnect()
        dependencyObserver = null
      }
    })

    dependencyObserver.observe(document, {
      childList: true,
      subtree: true,
    })

    // Configurar listener para carga de scripts
    scriptLoadHandler = () => {
      if (checkAndExecute(onDependenciesReady)) {
        document.removeEventListener('DOMContentLoaded', scriptLoadHandler)
        window.removeEventListener('load', scriptLoadHandler)
        scriptLoadHandler = null
      }
    }

    document.addEventListener('DOMContentLoaded', scriptLoadHandler)
    window.addEventListener('load', scriptLoadHandler)
  }

  // Función para crear instancias de parallax
  // -----------------------------------------------------------------------
  const createParallaxInstances = () => {
    if (!checkMinimalDependencies()) {
      console.warn(
        'HeroParallax: Dependencias no disponibles, no se pueden crear instancias',
      )
      return
    }

    if (!checkScrollTriggerAvailable()) {
      console.warn(
        'HeroParallax: ScrollTrigger no disponible, no se pueden crear instancias',
      )
      return
    }

    // Buscar elementos
    const elements = {
      heroes: document.querySelectorAll(
        '.hero_cat_100bg, .hero_cat_100bg2, .hero_cat_100bg3, .hero_cat_estudios, .hero_cat_tendencia',
      ),
      dividers: document.querySelectorAll('.divider-image, .type-closing'),
      eventBanners: document.querySelectorAll('.event-banner-wrapper'),
      bodyTexts: document.querySelectorAll('.body-text'),
    }

    // Procesar cada tipo
    for (const [type, elementList] of Object.entries(elements)) {
      if (elementList.length > 0) {
        const configType = type === 'heroes' ? 'hero' : type.slice(0, -1) // 'heroes' -> 'hero'

        setupParallaxInitialElements(elementList, configType)

        // Crear animaciones y guardar instancias
        const instances = animateParallaxImages(elementList, configType)
        parallaxInstances.push(...instances)
      }
    }
  }

  // Función principal refactorizada
  // -----------------------------------------------------------------------
  const initHeroParallax = () => {
    // Limpiar instancias anteriores
    cleanupParallaxInstances()

    // Crear nuevas instancias
    createParallaxInstances()
  }

  // Función para manejar resize con debounce
  // -----------------------------------------------------------------------
  const handleResize = () => {
    // Limpiar timeout anterior
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }

    // Debounce: esperar 150ms después del último resize
    resizeTimeout = setTimeout(() => {
      // Limpiar instancias anteriores primero
      cleanupParallaxInstances()

      // Refrescar ScrollTrigger para recalcular posiciones
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh()
      }

      // Crear nuevas instancias con las dimensiones actualizadas
      createParallaxInstances()
    }, 150)
  }

  // Función para limpiar event listeners
  // -----------------------------------------------------------------------
  const cleanup = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
      resizeTimeout = null
    }
    cleanupParallaxInstances()
    window.removeEventListener('resize', handleResize)

    // Limpiar observer de dependencias
    if (dependencyObserver) {
      dependencyObserver.disconnect()
      dependencyObserver = null
    }

    // Limpiar event listeners de scripts
    if (scriptLoadHandler) {
      document.removeEventListener('DOMContentLoaded', scriptLoadHandler)
      window.removeEventListener('load', scriptLoadHandler)
      scriptLoadHandler = null
    }
  }

  // Configurar sistema de dependencias reactivo
  setupDependencyObserver(() => {
    initHeroParallax()

    let lastWidth = window.innerWidth

    const handleResizeWidthOnly = () => {
      const widthChanged = window.innerWidth !== lastWidth

      if (widthChanged) {
        lastWidth = window.innerWidth
        handleResize()
      }
    }

    window.addEventListener('resize', handleResizeWidthOnly)
  })

  // Limpiar al descargar la página
  window.addEventListener('beforeunload', cleanup)
})()
