import { motion } from 'framer-motion'
import { VaynaLogo } from '@/components/VaynaLogo'

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b] overflow-hidden"
      style={{
        // Use a static radial gradient instead of heavy CSS blurs for much better performance (60fps) during app boot
        backgroundImage: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.08) 0%, rgba(9, 9, 11, 1) 60%)'
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: "transform, opacity" }}
        className="relative z-10 flex flex-col items-center gap-12 sm:gap-16 w-full px-4"
      >
        <div className="flex justify-center items-center w-full transform scale-[0.65] sm:scale-90 md:scale-110 lg:scale-125 origin-center">
          <VaynaLogo size={72} showText />
        </div>
        
        {/* Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          style={{ willChange: "opacity" }}
          className="flex flex-col items-center gap-5"
        >
          {/* Animated elegant line */}
          <div className="w-48 sm:w-64 h-[2px] bg-white/10 overflow-hidden relative rounded-full">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
              style={{ willChange: "transform" }}
              className="absolute inset-y-0 w-[40%] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.8)]"
            />
          </div>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ willChange: "opacity" }}
            className="text-[9px] sm:text-[11px] font-semibold tracking-[0.35em] text-cyan-400/70 uppercase text-center"
          >
            Chargement
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

