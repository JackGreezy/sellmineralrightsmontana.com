// Gallery.js
function initGallery() {
  const galleries = document.querySelectorAll('[data-js="gallery"]')

  for (const gallery of galleries) {
    const dialog = gallery.querySelector('#lightbox')
    const lightboxImage = gallery.querySelector('#lightboxImage')
    const lightboxClose = gallery.querySelector('#lightboxClose')

    // Solo configura el lightbox si existen todos los elementos necesarios
    if (dialog && lightboxImage && lightboxClose) {
      for (const button of gallery.querySelectorAll(
        '[data-js="gallery__image-button"]',
      )) {
        const img = button.querySelector('img')

        const openModal = () => {
          lightboxImage.src = img.src
          dialog.showModal()
        }

        button.addEventListener('click', openModal)

        button.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openModal()
          }
        })
      }

      lightboxClose.addEventListener('click', () => {
        dialog.close()
        lightboxImage.src = ''
      })

      dialog.addEventListener('click', (e) => {
        const lightboxFigure = dialog.querySelector('.lightbox-figure')
        if (!lightboxFigure.contains(e.target)) {
          dialog.close()
          lightboxImage.src = ''
        }
      })
    }

    const carousel = gallery.querySelector('[data-js="gallery__carousel"]')

    if (!carousel) {
      return
    }

    const prevButton = gallery.querySelector('#prev')
    const nextButton = gallery.querySelector('#next')
    const controls =
      gallery.querySelector('.section-title__controls') ||
      gallery.querySelector('.article-gallery__controls')
    const shouldShowControls = carousel.scrollWidth > carousel.clientWidth
    if (shouldShowControls && controls) {
      controls.style.display = 'grid'
    }

    function updateButtonState() {
      const slides = carousel.querySelectorAll(
        '[data-js="gallery__carousel-slide"]',
      )
      if (!slides.length) return

      const firstSlide = slides[0]
      const lastSlide = slides[slides.length - 1]

      const carouselRect = carousel.getBoundingClientRect()
      const firstRect = firstSlide.getBoundingClientRect()
      const lastRect = lastSlide.getBoundingClientRect()

      const isAtStart = firstRect.left >= carouselRect.left - 8
      const isAtEnd = lastRect.right <= carouselRect.right + 8

      prevButton.disabled = isAtStart
      nextButton.disabled = isAtEnd
    }

    updateButtonState()
    window.addEventListener('resize', () => {
      const shouldShowControls = carousel.scrollWidth > carousel.clientWidth
      const dynamicControls =
        gallery.querySelector('.section-title__controls') ||
        gallery.querySelector('.article-gallery__controls')
      if (dynamicControls) {
        dynamicControls.style.display = shouldShowControls ? 'grid' : 'none'
      }
      updateButtonState()
    })

    function scrollToSlide(direction) {
      const slides = carousel.querySelectorAll(
        '[data-js="gallery__carousel-slide"]',
      )
      if (!slides.length) return

      let currentIndex = 0
      let minDelta = Number.POSITIVE_INFINITY
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i]
        const delta = Math.abs(slide.offsetLeft - carousel.scrollLeft)
        if (delta < minDelta) {
          minDelta = delta
          currentIndex = i
        }
      }

      let targetIndex = currentIndex + direction
      if (targetIndex < 0) targetIndex = 0
      if (targetIndex >= slides.length) targetIndex = slides.length - 1
      const targetSlide = slides[targetIndex]
      if (!targetSlide) return
      let targetScrollLeft = targetSlide.offsetLeft

      const isMobile = window.innerWidth <= 992
      if (targetIndex === 0 && isMobile) {
        targetScrollLeft = 0
      }

      carousel.scrollTo({ left: targetScrollLeft, behavior: 'smooth' })

      function waitForScroll() {
        if (Math.abs(carousel.scrollLeft - targetSlide.offsetLeft) < 2) {
          updateButtonState()
          return
        }
        requestAnimationFrame(waitForScroll)
      }
      requestAnimationFrame(waitForScroll)
    }

    prevButton.addEventListener('click', () => {
      scrollToSlide(-1)
    })
    prevButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        scrollToSlide(-1)
      }
    })

    nextButton.addEventListener('click', () => {
      scrollToSlide(1)
    })
    nextButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        scrollToSlide(1)
      }
    })

    carousel.addEventListener('scroll', updateButtonState)
  }
}

initGallery()
