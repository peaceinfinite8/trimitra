import { motion, useReducedMotion } from 'framer-motion'

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 52,
    scale: 0.985,
    clipPath: 'inset(0 0 18% 0)',
    filter: 'blur(8px)',
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    clipPath: 'inset(0 0 0% 0)',
    filter: 'blur(0px)',
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const groupVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.985,
    filter: 'blur(6px)',
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function SectionReveal({ children, className = '', style, ...rest }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      className={className}
      style={style}
      {...rest}
      variants={sectionVariants}
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'show'}
      viewport={{ once: true, amount: 0.16 }}
      animate={
        prefersReducedMotion
          ? { opacity: 1, y: 0, scale: 1, clipPath: 'inset(0 0 0% 0)', filter: 'blur(0px)' }
          : undefined
      }
      data-gsap-section
    >
      {children}
    </motion.section>
  )
}

export function StaggerGroup({ children, className = '', style, once = false, amount = 0.2 }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      style={style}
      variants={groupVariants}
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'show'}
      viewport={{ once, amount }}
      animate={prefersReducedMotion ? {} : undefined}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '', style }) {
  return (
    <motion.div className={className} style={style} variants={itemVariants} data-gsap-float>
      {children}
    </motion.div>
  )
}
