function HeaderVisibility() {
  const state = {
    isOverHero: false,
    isScrollingDown: true,
  }

  let navigationMenu = null
  let globalMenu = null

  let heroElem = null
  let pageContent = null

  // setScrollDirectionClass > Añade clases al body según la dirección del scroll
  // -------------------------------------------------------------------------
  const setScrollDirectionClass = () => {
    let lastScrollTop = window.scrollY || document.documentElement.scrollTop
    let isScrollListenerActive = false

    window.addEventListener('scrollend', (e) => {
      // si se hace scroll to top muy rápido no se ponía transparent
      updateHeaderTransparency()
      updateHeaderPosition()
    })

    window.addEventListener('scroll', () => {
      const currentScrollTop =
        window.scrollY || document.documentElement.scrollTop

      const isScrollingDown = currentScrollTop > lastScrollTop

      // Avoid negative scroll values
      lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop

      if (isScrollListenerActive) {
        return
      }

      isScrollListenerActive = true

      state.isScrollingDown = isScrollingDown

      if (isScrollingDown) {
        // Scrolling down
        document.body.classList.remove('scrolling-up')
        document.body.classList.add('scrolling-down')
      } else {
        // Scrolling up
        document.body.classList.remove('scrolling-down')
        document.body.classList.add('scrolling-up')
      }

      updateHeaderTransparency()
      updateHeaderPosition()

      setTimeout(() => {
        isScrollListenerActive = false
      }, 0) // tiempo de animación del header
    })
  }

  // setStickyObserver > Observa si un elemento se vuelve sticky
  // -------------------------------------------------------------------------
  const setStickyObserver = (stickyElem, stickyClass) => {
    if (!stickyElem) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isSticky = entry.intersectionRatio < 1
        document.body.classList.toggle(stickyClass, isSticky)
      },
      { threshold: [1] },
    )

    observer.observe(stickyElem)
  }

  // observeHeroIntersection > Observa si el header está superpuesto con el hero
  // -------------------------------------------------------------------------
  const observeHeroIntersection = () => {
    const headerHeight = navigationMenu.offsetHeight

    const observer = new IntersectionObserver(
      ([entry]) => {
        state.isOverHero = entry.isIntersecting
        pageContent.classList.toggle('is-over-hero', entry.isIntersecting)
        updateHeaderTransparency()
        updateHeaderPosition()
      },
      {
        root: null,
        threshold: 0,
        rootMargin: `-${headerHeight}px 0px 0px 0px`, // empieza a contar justo debajo del header
      },
    )

    observer.observe(heroElem)
  }

  const updateHeaderPosition = () => {
    if (window.scrollY < 1) {
      document.body.classList.remove('scrolling-down')
      document.body.classList.add('scrolling-up')

      document.body.classList.add('page-on-top')
    } else {
      document.body.classList.remove('page-on-top')
    }
  }

  // Aplica o elimina la clase transparente
  // -------------------------------------------------------------------------
  const updateHeaderTransparency = () => {
    if (!heroElem) return

    const heroRect = heroElem.getBoundingClientRect()
    const isAtTopOfHero = heroRect.top >= 0

    let shouldBeTransparent
    if (window.scrollY < 1) {
      shouldBeTransparent = true
    } else {
      shouldBeTransparent =
        state.isOverHero &&
        (state.isScrollingDown || (!state.isScrollingDown && isAtTopOfHero))
    }

    pageContent.classList.toggle('has-header-transparent', shouldBeTransparent)
  }

  // setHeaderVisibility > Inicializa todos los observadores
  // -------------------------------------------------------------------------
  const init = () => {
    navigationMenu = document.querySelector('[data-js="header-menu--page"]')
    globalMenu = document.querySelector('[data-js="header-menu--global"]')

    heroElem =
      document.querySelector('.hero') || document.querySelector('.hero-video')
    pageContent = document.querySelector('.page-content')

    setStickyObserver(navigationMenu, 'is-navigation-sticky')
    setStickyObserver(globalMenu, 'is-menu-global-sticky')

    setScrollDirectionClass()
    if (heroElem) observeHeroIntersection()
  }

  return { init }
}

HeaderVisibility().init()
