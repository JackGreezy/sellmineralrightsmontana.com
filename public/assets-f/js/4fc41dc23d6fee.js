function AnchorMenu($container) {
  // Selectores de la página
  let $headerPage = null
  let $sections = null

  // Selectores propios del anchor
  let $anchorMenu = $container
  let $navLinks = null
  let $anchorList = null
  let $anchorItems = null
  let $prevButton = null
  let $nextButton = null

  // Controlar posición visible en la lista
  let scrollIndex = 0

  // Controlar el observer para evitar colapso entre scroll de página y click de ítem
  let observerActive = true
  let observer = null

  // controlar desplazamiento sticky respecto header
  let anchorInitialOffsetTop = 0
  let previousScrollY = window.scrollY

  // Limpiar estados activos en este menú específicamente
  const clearActiveLinks = () => {
    $navLinks.forEach(($link) => $link.classList.remove('is-active'))
  }

  // Activa el enlace de anclaje que corresponde a la sección visible.
  // @param {HTMLElement} $actualLink - Enlace que debe ser activado.
  // ------------------------------------------------------
  const activeAnchor = ($actualLink) => {
    clearActiveLinks()
    $actualLink.classList.add('is-active')

    const $actualItem = $actualLink.closest('.anchor-menu__item')
    if ($actualItem && $anchorList) {
      $anchorList.scrollTo({
        left: $actualItem.offsetLeft,
        behavior: 'smooth',
      })
    }
  }

  // Desplaza el navegador hacia la sección correspondiente con un ajuste preciso
  // @param {HTMLElement} target - Elemento de destino al que desplazarse.
  // ------------------------------------------------------
  const scrollToAnchor = (target) => {
    const currentScroll = window.scrollY || document.documentElement.scrollTop
    const targetTop = target.getBoundingClientRect().top + currentScroll

    const headerHeight = $headerPage?.offsetHeight || 0
    const anchorMenuHeight = $anchorMenu?.offsetHeight || 0

    // Si vamos hacia arriba, hay que dejar espacio para el header
    const isGoingDown = targetTop > currentScroll
    const offset = isGoingDown
      ? anchorMenuHeight
      : anchorMenuHeight + headerHeight

    const scrollTo = targetTop - offset
    window.scrollTo({
      top: Math.max(scrollTo, 0),
      behavior: 'smooth',
    })
  }

  // Establece el comportamiento de los enlaces cuando se hace clic en ellos.
  // ------------------------------------------------------
  const handleClick = () => {
     $navLinks.forEach(($link) => {
      $link.addEventListener('click', (event) => {
        event.preventDefault()
        const targetId = $link.getAttribute('href').slice(1)
        const target = document.getElementById(targetId)

        if (target) {
          activeAnchor($link)
          scrollToAnchor(target)

          observerActive = false
          disconnectIntersectionObserver()

          setTimeout(() => {
            observerActive = true
            connectIntersectionObserver()
          }, 1000)
        }
      })
    })
  }

  // Función para desactivar el IntersectionObserver
  // ------------------------------------------------------
  const disconnectIntersectionObserver = () => {
    if (observer) {
      observer.disconnect()
    }
  }

  // Función para activar el IntersectionObserver nuevamente
  // ------------------------------------------------------
  const connectIntersectionObserver = () => {
    if (observerActive && observer && $sections) {
      $sections.forEach(s => observer.observe(s))

    }
  }

  // Observa cuando las secciones entran en el viewport y activa el enlace correspondiente.
  // ------------------------------------------------------
  const handleIntersection = () => {
    const observerOptions = {
      root: null, // Observar el viewport
      rootMargin: '0px 0px -50% 0px', // Detectar cuando la parte superior de la sección cruce el 50% del viewport
      threshold: 0,
    }

    observer = new IntersectionObserver((entries) => {
      if (!observerActive) return
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id
          const $activeLink = $anchorMenu.querySelector(`.anchor-menu__link[href="#${sectionId}"]`)
          if ($activeLink) {
            activeAnchor($activeLink)
          }
        }
      })
    }, observerOptions)

    connectIntersectionObserver()
  }

  // Desplaza el menú de anclajes hacia el ítem actual
  // ------------------------------------------------------
  const scrollToItem = () => {
    const item = $anchorItems[scrollIndex]
    if (item) {
      $anchorList.scrollTo({
        left: item.offsetLeft,
        behavior: 'smooth',
      })
    }
  }

  // Actualiza el estado de los botones según si hay más scroll disponible
  // ------------------------------------------------------
  const updateButtonState = () => {
    const $anchorControls = $anchorMenu.querySelector('.anchor-menu__controls')
    if (!$anchorControls || !$anchorList) return

    const needsArrows = $anchorList.scrollWidth > $anchorList.clientWidth
    $anchorControls.classList.toggle('is-visible', needsArrows)

    if (needsArrows) {
      const scrollLeft = $anchorList.scrollLeft
      const maxScrollLeft = $anchorList.scrollWidth - $anchorList.clientWidth
      
      if ($prevButton) $prevButton.disabled = scrollLeft <= 0
      if ($nextButton) $nextButton.disabled = scrollLeft >= maxScrollLeft - 0
    }
  }

  // Actualiza el index de desplazamiento según la posición actual del scroll
  // ------------------------------------------------------
  const updateScrollIndex = () => {
    let minDiff = Number.POSITIVE_INFINITY
    let index = 0
    const scrollLeft = $anchorList.scrollLeft

    $anchorItems.forEach((item, i) => {
      const diff = Math.abs(item.offsetLeft - scrollLeft)
      if (diff < minDiff) {
        minDiff = diff
        index = i
      }
    })

    scrollIndex = index
  }

  // Click flechas de navegacion
  // ------------------------------------------------------
  const handleArrowClicks = () => {
    $prevButton?.addEventListener('click', () => {
      if (scrollIndex > 0) {
        scrollIndex--
        scrollToItem()
      }
    })

    $nextButton?.addEventListener('click', () => {
      if (scrollIndex < $anchorItems.length - 1) {
        scrollIndex++
        scrollToItem()
      }
    })
  }

  // Habilitar swipe horizontal en dispositivos táctiles
  // ------------------------------------------------------
  const enableHorizontalTouchScroll = () => {
    let startX = 0
    let startY = 0
    let isScrollingHorizontally = false

    $anchorList.addEventListener(
      'touchstart',
      (e) => {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
        isScrollingHorizontally = false
      },
      { passive: true },
    )

    $anchorList.addEventListener(
      'touchmove',
      (e) => {
        const dx = e.touches[0].clientX - startX
        const dy = e.touches[0].clientY - startY

        if (!isScrollingHorizontally && Math.abs(dx) > Math.abs(dy)) {
          isScrollingHorizontally = true
        }

        if (isScrollingHorizontally) {
          e.preventDefault()
          $anchorList.scrollLeft -= dx
        }
      },
      { passive: false },
    )
  }

  // handleAnchorOffsetOnScroll > controla el translate del anchor respecto al header
  // ------------------------------------------------------
  const handleAnchorOffsetOnScroll = () => {
    const currentScrollY = window.scrollY
    const isScrollingUp = currentScrollY < previousScrollY
    previousScrollY = currentScrollY

    const anchorTopAbsolute =
      $anchorMenu.getBoundingClientRect().top + currentScrollY
    const hasScrolledPastAnchor = currentScrollY > anchorInitialOffsetTop

    const shouldApplyOffset =
      isScrollingUp &&
      hasScrolledPastAnchor &&
      anchorTopAbsolute > anchorInitialOffsetTop + 1

    $anchorMenu.classList.toggle('has-offset', shouldApplyOffset)
  }

  // Inicializa todos los eventos y comportamientos del menú de anclajes.
  // ------------------------------------------------------
  const init = () => {
    $headerPage = document.querySelector('.header-menu--page')
    $sections = document.querySelectorAll('[data-anchor="true"]')

    // Selectores locales
    $navLinks = $anchorMenu.querySelectorAll('.anchor-menu__link')
    $anchorList = $anchorMenu.querySelector('.anchor-menu__list')
    $anchorItems = $anchorMenu.querySelectorAll('.anchor-menu__item')
    $prevButton = $anchorMenu.querySelector('.anchor-menu__prev')
    $nextButton = $anchorMenu.querySelector('.anchor-menu__next')

    if ($sections.length) {
      handleClick()
      handleIntersection()
    }

    handleArrowClicks()
    updateButtonState()

    anchorInitialOffsetTop = $anchorMenu.offsetTop
    window.addEventListener('scroll', handleAnchorOffsetOnScroll)

    window.addEventListener('resize', () => {
      updateScrollIndex()
      updateButtonState()
    })

    // Actualizar botones si se hace scroll manual
    $anchorList.addEventListener('scroll', () => {
      updateScrollIndex()
      updateButtonState()
    })

    // swipe en dispositivos táctiles
    enableHorizontalTouchScroll()
  }

  return { init }
}

(function() {
  const menus = document.querySelectorAll('.anchor-menu');
  menus.forEach(m => AnchorMenu(m).init());
})();
