function setNavigationResponsive() {
  const triggers = document.querySelectorAll('[data-js="toggle_header_menu"]')

  for (const trigger of triggers) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      document.body.classList.toggle('is-menu__responsive-opened')
    })
  }
}

function setLanguageSelector() {
  const triggers = document.querySelectorAll(
    '[data-js="topbar-combo--trigger"]',
  )

  for (const trigger of triggers) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()

      trigger.classList.toggle('is-closed')
      document.body.classList.toggle(`is-${trigger.id}-opened`)
      const expanse = trigger.getAttribute('aria-expanded') === 'true'
      trigger.setAttribute('aria-expanded', `${!expanse}`)
    })

    // Detectar scroll y cerrar si está abierto
    window.addEventListener('scroll', () => {
      if (!trigger.classList.contains('is-closed')) {
        trigger.classList.add('is-closed')
        document.body.classList.remove(`is-${trigger.id}-opened`)
      }
    })
  }
}

setNavigationResponsive()
setLanguageSelector()
