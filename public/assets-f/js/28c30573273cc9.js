function MetricsInteraction() {
  // Esperamos a que GSAP esté disponible.
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    setTimeout(() => {
      MetricsInteraction()
    }, 200)
    return
  }

  const metricsSections = document.querySelectorAll('.metrics')

  metricsSections.forEach((metricsSection, index) => {
    // Configuramos ScrollTrigger para cada sección de metrics
    ScrollTrigger.create({
      trigger: metricsSection,
      start: 'top 70%',
      onEnter: () => {
        animateMetrics(metricsSection)
      },
    })
  })
}

function animateMetrics(metricsSection) {
  // Seleccionamos todos los items de la lista actual
  const metricsItems = metricsSection.querySelectorAll('.metrics__item')

  // Configuramos el stagger con un delay breve entre cada elemento
  const staggerDelay = 0.2 // 200ms entre cada elemento

  // Animación stagger para cada item
  metricsItems.forEach((item, index) => {
    animateSingleItem(item, index * staggerDelay)
  })
}

function animateSingleItem(item, delay) {
  const tl = gsap.timeline({ delay: delay })

  // 1. Animamos la línea vertical usando la variable CSS
  tl.to(
    item,
    {
      duration: 1,
      '--line-scale': 1, // Animamos la variable CSS
      ease: 'expo.out',
    },
    0,
  )

  // 2. Aparece la cifra con fade in
  const numbers = item.querySelector('.metrics__numbers, figure')
  if (numbers) {
    tl.to(
      numbers,
      {
        duration: 1,
        opacity: 1,
        y: 0,
        transform: 'translateX(0)',
        ease: 'expo.out',
      },
      0.3,
    )
  }

  // 3. Aparece la descripción con fade in
  const description = item.querySelector('.metrics__description')
  if (description) {
    tl.to(
      description,
      {
        duration: 1,
        opacity: 1,
        y: 0,
        transform: 'translateX(0)',
        ease: 'expo.out',
      },
      0.5,
    )
  }
  // 3. Aparece la descripción con fade in
  const predescription = item.querySelector('.metrics__predescription')
  if (predescription) {
    tl.to(
      predescription,
      {
        duration: 1,
        opacity: 1,
        y: 0,
        transform: 'translateX(0)',
        ease: 'expo.out',
      },
      0.1,
    )
  }
}

MetricsInteraction()
