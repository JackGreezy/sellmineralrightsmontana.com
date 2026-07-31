// Funcionad genérica reutilizable entre diferentes bloques

function gsapGeneric() {
  // Esperamos a que GSAP esté disponible.
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    setTimeout(() => {
      gsapGeneric()
    }, 100)

    return
  }

  // Si llega aquí es que GSAP está disponible
  gsap.registerPlugin(ScrollTrigger)
}

gsapGeneric()
