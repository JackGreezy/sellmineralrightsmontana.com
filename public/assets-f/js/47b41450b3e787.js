function TagLink() {
  // handleClick > manejar click del tag
  // --------------------------------------------------
  const handleClick = ($tag) => {
    const searchValue = $tag.getAttribute('data-search')
    console.log('data-search', searchValue)

    // Emitir evento personalizado
    const event = new CustomEvent('taglink:search', {
      detail: { search: searchValue },
      bubbles: true, // Permite que el evento suba en el DOM
    })

    $tag.dispatchEvent(event)
  }

  // handleClickClose > eliminar tag
  // --------------------------------------------------
  const handleClickClose = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const $tag = event.target.closest('.tag-link')
    if ($tag) $tag.remove()
  }

  // init > Inicializa componente tag
  // --------------------------------------------------
  const init = (container = document) => {
    const $tagsSearch = container.querySelectorAll('.tag-link[data-search]')
    const $tagsClose = container.querySelectorAll('.tag-link .tag-link__close')

    for (const $tag of $tagsSearch) {
      if ($tag.dataset.init === 'true') continue // evitar listener múltiples
      $tag.addEventListener('click', () => handleClick($tag))
      $tag.dataset.init = 'true'
    }

    for (const $close of $tagsClose) {
      if ($close.dataset.init === 'true') continue // evitar listener múltiples
      $close.addEventListener('click', (event) => handleClickClose(event))
      $close.dataset.init = 'true'
    }
  }

  return { init }
}

TagLink().init()
window.TagLink = TagLink
