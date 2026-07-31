// Función para verificar si las dependencias están disponibles
// -----------------------------------------------------------------------
function checkDependencies() {
  return typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined'
}

// Función para crear animaciones con chaflones
// -----------------------------------------------------------------------
function createVideoFullscreenScrollAnimations(videoElement) {
  const video = videoElement

  // Aplicar clip-path con chaflones al contenedor del video
  gsap.fromTo(
    video,
    {
      clipPath:
        'polygon(30vw 25vw, 70vw 25vw, 75vw 30vw, 75vw 70vw, 70vw 75vw, 30vw 75vw, 25vw 70vw, 25vw 30vw)', // Forma centrada al inicio
    },
    {
      clipPath:
        'polygon(0vw 0vw, 100vw 0vw, 100vw 0vw, 100vw 100vw, 100vw 100vw, 0vw 100vw, 0vw 0vw, 0vw 0vw)', // Completo al final
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: video,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 1,
        markers: false,
        onUpdate: (self) => {
          console.log('VideoFullscreen: Progreso del scroll:', self.progress)
        },
      },
    },
  )
}

// Función para inicializar animaciones
// -----------------------------------------------------------------------
function initVideoFullscreenAnimations() {
  if (!checkDependencies()) {
    setTimeout(() => {
      initVideoFullscreenAnimations()
    }, 200)
    return
  }

  const videoSections = document.querySelectorAll(
    '.video-section--fullscreen .video-section__video.has-animation',
  )

  for (const videoElement of videoSections) {
    createVideoFullscreenScrollAnimations(videoElement)
  }
}

// Ejecutar automáticamente la función
initVideoFullscreenAnimations()
