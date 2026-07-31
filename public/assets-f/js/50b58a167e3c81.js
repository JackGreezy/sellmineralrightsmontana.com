// setNavigationSubmenu > Inicializa el menú de navegación
// ---------------------------------------------------------------------------------
function setNavigationSubmenu() {
  const triggers = document.querySelectorAll('[data-js="navsubmenu-trigger"]')

  for (const trigger of triggers) {
    const submenuWrap = trigger.closest('[data-js="navsubmenu-wrap"]')
    setNavigationSubmenuOpen({ trigger, submenuWrap })
    setNavigationSubmenuClose(submenuWrap)
    setNavigationSubmenuBack(submenuWrap)
    // setNavigationInnerLevels(submenuWrap)
  }

  let resizeTimeout
  window.addEventListener('resize', () => {
    document.body.classList.add('window-is-resizing')
    forceSubmenuClose()

    // Limpiar cualquier timeout previo
    clearTimeout(resizeTimeout)

    // Establecer un nuevo timeout para eliminar la clase después de 500ms
    resizeTimeout = setTimeout(() => {
      document.body.classList.remove('window-is-resizing')
    }, 500)
  })

  // cuando se abra el submenu, se cierra el search
  document.addEventListener('search:open', () => {
    forceSubmenuClose()
    disableScroll()
  })
}

// closeAllSubmenusOpened > cerrar submenus abiertos
// ---------------------------------------------------------------------------------
function closeAllSubmenusOpened() {
  const submenusWraps = document.querySelectorAll(
    '[data-js="navsubmenu-wrap"].is-submenu-visible',
  )
  for (const submenuWrap of submenusWraps) {
    submenuWrap.classList.remove('is-submenu-visible')

    const buttonTrigger = submenuWrap.querySelector(
      '[data-js="navsubmenu-trigger"]',
    )
    buttonTrigger.setAttribute('aria-expanded', 'false')
  }
}

// setNavigationSubmenuOpen > abrir/cerrar submenus
// ---------------------------------------------------------------------------------
function setNavigationSubmenuOpen({ trigger, submenuWrap }) {
  trigger.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (submenuWrap.classList.contains('is-submenu-visible')) {
      closeAllSubmenusOpened()
      enableScroll()
    } else {
      closeAllSubmenusOpened()
      submenuWrap.classList.add('is-submenu-visible')
      disableScroll()

      // Emitir evento personalizado
      const event = new CustomEvent('submenu:open', {
        detail: { state: 'open' },
        bubbles: true,
      })
      trigger.dispatchEvent(event)
      trigger.setAttribute('aria-expanded', 'true')
    }
  })
}

// setNavigationSubmenuClose > cerrar todos los submenus abiertos
// ---------------------------------------------------------------------------------
function setNavigationSubmenuClose(submenuWrap) {
  const closeTriggers = submenuWrap.querySelectorAll(
    '[data-js="navsubmenu-close"]',
  )

  for (const trigger of closeTriggers) {
    trigger.addEventListener('click', () => {
      forceSubmenuClose()
    })
  }

  const overlayClose = document.querySelector('[data-js="navsubmenu-overlay"]')

  if (overlayClose) {
    overlayClose.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()

      forceSubmenuClose()
    })
  }
}

// setNavigationSubmenuBack > navegar al nivel anterior
// ---------------------------------------------------------------------------------
function setNavigationSubmenuBack(submenuWrap) {
  const backTriggers = submenuWrap.querySelectorAll(
    '[data-js="navsubmenu-back"]',
  )

  for (const trigger of backTriggers) {
    trigger.addEventListener('click', () => {
      // tercer nivel
      const innerLevelVisible = submenuWrap.querySelector(
        '.navsubmenu--items.is-inner-level-opened',
      )
      if (innerLevelVisible) {
        navigationAnimationHideInner(innerLevelVisible)
        return
      }

      // segundo nivel
      const hasSubmenuVisible =
        submenuWrap.classList.contains('is-submenu-visible')
      if (hasSubmenuVisible) {
        submenuWrap.classList.remove('is-submenu-visible')
        const buttonTrigger = submenuWrap.querySelector(
          '[data-js="navsubmenu-trigger"]',
        )
        buttonTrigger.setAttribute('aria-expanded', 'false')
      }
    })
  }
}

// forceSubmenuClose > Forzar el cerrado de todos los submenus que estén abiertos.
// ---------------------------------------------------------------------------------
function forceSubmenuClose() {
  // limpiar clases body (1º nivel mobile/tablet)
  document.body.classList.remove(
    'is-menu__responsive-opened',
    'is-language-selector-opened',
    'is-site-selector-opened',
  )
  enableScroll()

  // limpiar clases de los submenus (2 nivel)
  closeAllSubmenusOpened()

  // limpiar clases de los submenus internos (3 nivel)
  const thirdLevelLists = document.querySelectorAll(
    '[data-js="navsubmenu--items"].is-inner-level-opened',
  )
  for (const item of thirdLevelLists) {
    item.classList.remove(
      'is-inner-level-opened',
      'is-hide-current-level',
      'showing-current-level',
      'is-visible-current-level',
    )

    const childOpenend = item.querySelector('.is-current-level-active')
    if (childOpenend) {
      childOpenend.classList.remove('is-current-level-active')
    }
  }
}

// setNavigationInnerLevels > abrir/ocultar navegacion 3º nivel
// ---------------------------------------------------------------------------------
// function setNavigationInnerLevels(wrap) {
//   const changeMenuSpeed = 300

//   const lists = wrap.querySelectorAll('[data-js="navsubmenu--items"]')
//   for (const list of lists) {
//     // const openTriggers = list.querySelectorAll(
//     //   '[data-js="navsubmenu-level-trigger"]',
//     // )
//     // const closeTrigger = list.querySelectorAll(
//     //   '[data-js="navsubmenu-inner-close-trigger"]',
//     // )

//     // for (const trigger of openTriggers) {
//     //   trigger.addEventListener('click', (e) => {
//     //     e.preventDefault()
//     //     e.stopPropagation()
//     //     navigationAnimationShowInner(list, trigger, changeMenuSpeed)
//     //   })
//     // }

//     // for (const trigger of closeTrigger) {
//     //   trigger.addEventListener('click', (e) => {
//     //     e.preventDefault()
//     //     e.stopPropagation()
//     //     navigationAnimationHideInner(list, changeMenuSpeed)
//     //   })
//     // }
//   }
// }

// navigationAnimationShowInner > abrir navegacion 3º nivel
// ---------------------------------------------------------------------------------
// function navigationAnimationShowInner(list, trigger, speed) {
//   list.classList.add('hiding-current-level')
//   trigger.classList.add('is-current-level-active')

//   setTimeout(() => {
//     list.classList.add('is-hide-current-level')

//     setTimeout(() => {
//       list.classList.add('is-inner-level-opened')
//       list.classList.remove('hiding-current-level')
//     }, 100)
//   }, speed)
// }

// navigationAnimationHideInner > ocultar navegacion 3º nivel
// ---------------------------------------------------------------------------------
function navigationAnimationHideInner(list, speed = 300) {
  list.classList.add('showing-current-level')

  setTimeout(() => {
    list.classList.remove('is-inner-level-opened')
    list.classList.add('is-visible-current-level')

    setTimeout(() => {
      list.classList.remove('is-hide-current-level')
      list.classList.remove('showing-current-level')
      list.classList.remove('is-visible-current-level')

      list
        .querySelector('.is-current-level-active')
        .classList.remove('is-current-level-active')
    }, 100)
  }, speed)
}

// disableScroll > Deshabilitar el scroll del body
// ---------------------------------------------------------------------------------
function disableScroll() {
  const scrollBarWidth =
    window.innerWidth - document.documentElement.clientWidth

  if (scrollBarWidth > 0) {
    document.documentElement.style.setProperty(
      '--scrollbar-compensation',
      `${scrollBarWidth}px`,
    )
  }
  document.body.classList.add('is-menu__desktop-opened')
}

// enableScroll > habilitar el scroll del body
// ---------------------------------------------------------------------------------
function enableScroll() {
  document.documentElement.style.removeProperty('--scrollbar-compensation')
  document.body.classList.remove('is-menu__desktop-opened')
}

setNavigationSubmenu()
