function initLinkMenu() {
  const containers = document.querySelectorAll('[data-js="link-menu"]')

  let headerHeight = 0
  let anchorHeight = 0

  const anchorMenu = document.querySelector('.anchor-menu')

  function isInViewport(element) {
    const rect = element.getBoundingClientRect()
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    )
  }

  // Si hay elementos sticky desplazar el navigation para que no se tape
  // ------------------------------------------------------
  const setAnchorNavigationTop = () => {
    const $headerPage = document.querySelector('.header-menu--page')
    const $anchorMenu = document.querySelector('.anchor-menu')
    const $linkNavigation = document.querySelectorAll('.link-menu__navigation') // nos curamos en salud por si hay dos linksmenus

    headerHeight = $headerPage ? $headerPage.offsetHeight : 0
    anchorHeight = $anchorMenu ? $anchorMenu.offsetHeight : 0
    for (const linkNav of $linkNavigation) {
      linkNav.style.top = `${headerHeight + anchorHeight}px`
    }
  }

  setAnchorNavigationTop()
  window.addEventListener('resize', () => {
    setAnchorNavigationTop()
  })

  // funcionalidad base de los links menus
  // ------------------------------------------------------

  for (const container of containers) {
    // Evitar que se active por JS el primer elemento. Necesario para locations block
    const preventFirstSelection = container.dataset.preventFirstSelection

    for (const enlace of container.querySelectorAll(
      'a[data-js="submenu-link"]',
    )) {
      enlace.addEventListener('click', function (e) {
        e.preventDefault()
        const id = this.getAttribute('href').substring(1)
        const dest = container.querySelector(`#${id}`)

        if (dest) {
          const offset = headerHeight + anchorHeight
          const posicion =
            dest.getBoundingClientRect().top + window.pageYOffset - offset

          window.scrollTo({
            top: posicion,
            behavior: 'smooth',
          })
        }
      })
    }

    const sections = container.querySelectorAll('section[data-area]')

    if (sections.length === 0) {
      console.error('No se encontraron secciones con [data-area] en el DOM.')
      return
    }

    // Añadir la clase "active" al primer elemento con clase .link-menu__navigation-submenu-item
    const navigationList = container.querySelector(
      '.link-menu__navigation-list',
    )

    if (navigationList && !preventFirstSelection) {
      const allNavItems = navigationList.querySelectorAll(
        'ul > li.menu__navigation-item',
      )
      allNavItems.forEach((li, idx) => {
        if (idx === 0) {
          li.classList.add('active')
        } else {
          li.classList.remove('active')
        }
      })

      // Solo la sección cuyo data-area coincide con el primer nav-area debe estar activa
      const allContentAreas = container.querySelectorAll(
        '.link-menu__content > [data-area]',
      )
      if (allNavItems.length > 0) {
        const firstNavArea = allNavItems[0].dataset.navArea
        for (const area of allContentAreas) {
          if (area.dataset.area === firstNavArea) {
            area.classList.add('active')
          } else {
            area.classList.remove('active')
          }
        }
      }
    }

    // Añadir la clase "no-submenu" a los elementos li[data-nav-area] sin ul.link-menu__navigation-submenu
    const navAreaElementsChildren =
      container.querySelectorAll('li[data-nav-area]')
    for (const navEl of navAreaElementsChildren) {
      const submenu = navEl.querySelector('ul.link-menu__navigation-submenu')
      if (!submenu) {
        navEl.classList.add('no-submenu')
      }
    }

    // Manejamos el evento scroll de manera individual por cada contenedor
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY
      const links = container.querySelectorAll('nav ul li a')
      const activeArea = container.querySelector('section[data-area].active')

      if (!activeArea) return

      const sections = activeArea.querySelectorAll('section[id]')
      if (sections.length === 0 || links.length === 0) return

      let currentSectionIndex = -1

      // Recorremos las secciones dentro de este contenedor
      for (const [index, section] of sections.entries()) {
        const sectionTop = section.getBoundingClientRect().top
        const offset = headerHeight + anchorHeight

        // Si el top de la sección está visible (debajo del offset pero dentro del viewport)
        if (sectionTop >= offset && sectionTop < window.innerHeight) {
          currentSectionIndex = index
          break // Tomamos el primero cuyo top es visible
        }

        // Si el top ya pasó el threshold, guardamos como candidato
        // (por si ninguno tiene el top visible)
        if (sectionTop <= offset) {
          currentSectionIndex = index
        }
      }

      if (currentSectionIndex !== -1) {
        // Eliminar clase 'active' de todos los enlaces dentro del contenedor actual
        for (const link of links) {
          link.classList.remove('active')
        }

        const currentId = sections[currentSectionIndex].id
        const activeLink = container.querySelector(
          `nav ul li a[href="#${currentId}"]`,
        )
        if (activeLink) {
          // Añadir clase 'active' al enlace correspondiente dentro del contenedor
          activeLink.classList.add('active')
        }
      }
    })

    // Manejamos el clic en los elementos li[data-nav-area]
    const navElements = Array.from(
      container.querySelectorAll('[data-nav-area]'),
    )
    const contentAreas = Array.from(container.querySelectorAll('[data-area]'))

    navElements.forEach((navEl, index) => {
      navEl.addEventListener('click', () => {
        let extraOffset = 0

        if (anchorMenu && isInViewport(anchorMenu)) {
          extraOffset = 30
        }

        const targetEl = contentAreas[index]

        if (targetEl && !targetEl.classList.contains('active')) {
          // Quitar 'active' de todos los elementos con data-area
          for (const el of contentAreas) {
            el.classList.remove('active')
          }

          // Agregar 'active' al elemento correspondiente
          targetEl.classList.add('active')

          // Scroll con offset personalizado
          const offset = headerHeight + anchorHeight
          const y =
            targetEl.getBoundingClientRect().top +
            window.scrollY -
            offset +
            extraOffset
          window.scrollTo({ top: y, behavior: 'smooth' })

          // Quitar 'active' de todos los li[data-nav-area]
          for (const li of container.querySelectorAll(
            'li[data-nav-area].active',
          )) {
            li.classList.remove('active')
          }

          // Agregar 'active' al li clicado
          navEl.classList.add('active')
        }
      })
    })

    const navAreaElements = Array.from(
      container.querySelectorAll('li[data-nav-area]'),
    )
    navAreaElements.forEach((navEl, index) => {
      navEl.addEventListener('click', () => {
        const submenu = navEl.querySelector('.link-menu__navigation-submenu')

        // Solo colapsar si no se clicó en el elemento ya activo
        if (navEl.classList.contains('active')) {
          return
        }

        // Colapsar el submenú del elemento que estaba activo
        for (const otherSubmenu of container.querySelectorAll(
          '.link-menu__navigation-submenu',
        )) {
          if (otherSubmenu !== submenu) {
            otherSubmenu.classList.remove('active')
          }
        }

        // Expandir el submenú del nuevo elemento
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`
        }

        // Quitar 'active' de todos los li[data-nav-area]
        for (const activeNavEl of container.querySelectorAll(
          'li[data-nav-area].active',
        )) {
          activeNavEl.classList.remove('active')
        }

        // Agregar 'active' al li clicado
        navEl.classList.add('active')
      })
    })

    // Asegurarnos de que el submenú del primer elemento activo se expanda
    const firstActiveNavEl = container.querySelector('li[data-nav-area].active')
    if (firstActiveNavEl) {
      const firstActiveSubmenu = firstActiveNavEl.querySelector(
        '.link-menu__navigation-submenu',
      )
      if (firstActiveSubmenu) {
        firstActiveSubmenu.style.maxHeight = `${firstActiveSubmenu.scrollHeight}px`
      }
    }

    const submenuItems = container.querySelectorAll(
      '.link-menu__navigation-submenu',
    )

    // Iterar sobre cada elemento y calcular su altura
    for (const submenu of submenuItems) {
      // Obtener la altura total del contenido, sin importar si está oculto
      const height = submenu.scrollHeight

      // Establecer la altura máxima en línea para cada submenu
      submenu.style.maxHeight = `${height}px`
    }
  }
}

initLinkMenu()
