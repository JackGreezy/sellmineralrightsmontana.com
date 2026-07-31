function VideoSection() {
  // NOTE > Agregar ratios al que dar soporte
  const KNOWN_RATIOS = {
    'has-ratio-17-9': 17 / 9,
  }

  // setRatio > Establece el ratio del video
  // --------------------------------------------------
  const setRatio = ($video) => {
    const $videoContainer = $video.closest('.video-section__video')
    const ratio = $video.videoWidth / $video.videoHeight

    for (const [className, refRatio] of Object.entries(KNOWN_RATIOS)) {
      if (Math.abs(ratio - refRatio) < 0.01) {
        $videoContainer.classList.add(className)
        return
      }
    }
  }

  // alignVideo > Alinea el video con el final del título
  // --------------------------------------------------
  const alignVideo = ($section) => {
    const $container = $section.querySelector('.video-section__video')
    const $title = $section.querySelector('.video-section__title')

    if (
      !$section.classList.contains('video-section--size-s') ||
      !window.matchMedia('(min-width: 768px)').matches
    ) {
      $container.style.marginTop = ''
      return
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const titleBottom =
          $title.getBoundingClientRect().bottom + window.scrollY
        const containerTop =
          $container.getBoundingClientRect().top + window.scrollY
        const currentMarginTop =
          Number.parseFloat(getComputedStyle($container).marginTop) || 0

        const offset = titleBottom - containerTop + currentMarginTop
        $container.style.marginTop = `${offset}px`
      })
    })
  }

  // handleLocalVideo > Manejo de video local
  // --------------------------------------------------
  const handleLocalVideo = ($video) => {
    const onReady = () => {
      setRatio($video)
      const $section = $video.closest('.video-section')
      alignVideo($section)
    }

    if ($video.readyState >= 1 && $video.videoWidth && $video.videoHeight) {
      onReady()
    } else {
      $video.addEventListener('loadedmetadata', onReady, { once: true })
    }
  }

  // init > Inicializa componente video
  // --------------------------------------------------
  const init = () => {
    const $sections = document.querySelectorAll('.video-section')

    for (const $section of $sections) {
      const $video = $section.querySelector('.video-section__frame video')
      if ($video) handleLocalVideo($video)
      else alignVideo($section)
    }

    // Re-aplicar en resize
    window.addEventListener('resize', () => {
      const $resizableSections = document.querySelectorAll(
        '.video-section--size-s',
      )
      for (const $section of $resizableSections) {
        alignVideo($section)
      }
    })
  }

  return { init }
}

VideoSection().init()
