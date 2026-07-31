// Encapsular el código en un IIFE (Immediately Invoked Function Expression)
;(() => {
  // Función para verificar si las dependencias están disponibles
  // -----------------------------------------------------------------------
  function checkDependencies() {
    return typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined'
  }

  // Función para configurar elementos iniciales
  // -----------------------------------------------------------------------
  function setupSpecialProjectInitialElements(specialProjects) {
    for (const project of specialProjects) {
      const image = project.querySelector('.special-project__figure img')

      if (image) {
        // Buscar el contenedor padre que contiene los <li>
        const container = project.closest('ul, ol')
        const listItems = container ? container.querySelectorAll('li') : []

        // Solo aplicar estado inicial si hay exactamente un <li>
        if (listItems.length === 1) {
          // Configurar estado inicial
          gsap.set(image, {
            y: 20,
            scale: 1.2,
            opacity: 0.8,
          })
        }
      }
    }
  }

  // Función para animar las imágenes del SpecialProject
  // -----------------------------------------------------------------------
  function animateSpecialProjectImages(specialProjects) {
    for (const project of specialProjects) {
      const image = project.querySelector('.special-project__figure img')

      if (image) {
        // Buscar el contenedor padre que contiene los <li>
        const container = project.closest('ul, ol')
        const listItems = container ? container.querySelectorAll('li') : []

        // Solo aplicar el efecto si hay exactamente un <li>
        if (listItems.length === 1) {
          // Crear ScrollTrigger que anime progresivamente con el scroll
          ScrollTrigger.create({
            trigger: project,
            start: 'top 80%',
            end: 'bottom 20%',
            onUpdate: (self) => {
              // Calcular el progreso del scroll (0 a 1)
              const progress = self.progress

              // Aplicar transformaciones basadas en el progreso
              gsap.set(image, {
                y: 20 * (1 - progress),
                scale: 1.2 - 0.2 * progress,
                opacity: 0.8 + 0.2 * progress,
              })
            },
            markers: false,
          })
        }
      }
    }
  }

  // Función principal
  // -----------------------------------------------------------------------
  function SpecialProjectInteraction() {
    if (!checkDependencies()) {
      setTimeout(() => {
        SpecialProjectInteraction()
      }, 200)
      return
    }

    const specialProjects = document.querySelectorAll('.special-project')

    // Verificar que los elementos existan antes de continuar
    if (specialProjects.length === 0) {
      console.warn(
        'SpecialProject.js: No se encontraron elementos special-project. Esperando...',
      )
      requestAnimationFrame(() => {
        SpecialProjectInteraction()
      })
      return
    }

    setupSpecialProjectInitialElements(specialProjects)
    animateSpecialProjectImages(specialProjects)
  }

  // Esperar a que el DOM esté listo antes de ejecutar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SpecialProjectInteraction)
  } else {
    // Si el DOM ya está listo, usar requestAnimationFrame para asegurar que los elementos estén renderizados
    requestAnimationFrame(() => {
      requestAnimationFrame(SpecialProjectInteraction)
    })
  }
})() // Cerrar el IIFE
