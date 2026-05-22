import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, Send, CheckCircle, ArrowLeft, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { VaynaLogo } from '@/components/VaynaLogo'

export function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // URL de l'API Formspree
    const FORMSPREE_URL = "https://formspree.io/f/xvzyrzww"

    // Si vous n'avez pas encore mis votre lien, on simule un envoi
    if (FORMSPREE_URL.includes("VOTRE_ID_ICI")) {
      setTimeout(() => {
        setIsSubmitted(true)
        setIsSubmitting(false)
      }, 800)
      return
    }

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        alert("Une erreur est survenue lors de l'envoi.")
      }
    } catch (error) {
      console.error(error)
      alert("Erreur de connexion.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)', color: '#f0f4ff', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden', position: 'relative' }}>
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,245,255,0.08), transparent 70%)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,47,190,0.06), transparent 70%)', filter: 'blur(80px)' }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(0,245,255,0.08)', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group" style={{ textDecoration: 'none' }}>
            <div className="group-hover:scale-105 transition-transform duration-300">
              <VaynaLogo size={28} showText />
            </div>
          </Link>
          <Link 
            to="/"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            style={{ border: '1px solid rgba(0,245,255,0.2)', background: 'transparent', color: 'rgba(240,244,255,0.7)', textDecoration: 'none' }}
          >
              <ArrowLeft size={16} /> Retour
          </Link>
        </div>
      </motion.div>

      {/* Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative inline-flex items-center gap-2 px-6 py-3 rounded-2xl border mb-8"
            style={{ background: 'rgba(0,245,255,0.1)', borderColor: 'rgba(0,245,255,0.3)' }}
          >
            <MessageSquare className="text-primary relative z-10" size={32} style={{ color: '#00f5ff' }} />
            <span className="text-2xl font-bold relative z-10" style={{ color: '#00f5ff' }}>Support & Contact</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">Comment pouvons-nous aider ?</h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto" style={{ color: 'rgba(240,244,255,0.5)' }}>Notre équipe est à votre disposition pour résoudre vos problèmes ou répondre à vos questions. Nous vous répondrons dans les plus brefs délais.</p>
        </motion.div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-12 rounded-2xl max-w-2xl mx-auto"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,245,255,0.2)', backdropFilter: 'blur(20px)' }}
          >
            <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 24px' }} />
            <h2 className="text-3xl font-bold mb-4">Message envoyé !</h2>
            <p className="text-lg mb-8" style={{ color: 'rgba(240,244,255,0.5)' }}>Merci de nous avoir contactés. Nous reviendrons vers vous très rapidement.</p>
            <button onClick={() => setIsSubmitted(false)} className="px-6 py-3 rounded-xl font-medium transition-all" style={{ border: '1px solid rgba(0,245,255,0.3)', background: 'rgba(0,245,255,0.1)', color: '#00f5ff' }}>Envoyer un autre message</button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <Mail style={{ color: '#00f5ff' }} /> Email Direct
                </h3>
                <p className="mb-4" style={{ color: 'rgba(240,244,255,0.5)' }}>Vous préférez utiliser votre propre boîte mail ou envoyer des pièces jointes ?</p>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=vayna.support@gmail.com" target="_blank" rel="noopener noreferrer" className="text-lg font-medium hover:underline transition-all" style={{ color: '#00f5ff' }}>vayna.support@gmail.com</a>
              </div>
              <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <Zap style={{ color: '#7b2fbe' }} /> Temps de réponse
                </h3>
                <p style={{ color: 'rgba(240,244,255,0.5)' }}>Nous répondons généralement en moins de <strong>24 heures</strong> ouvrées.</p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-8 rounded-2xl space-y-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
            >
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(240,244,255,0.7)' }}>Nom complet</label>
                <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Votre nom" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', height: '48px' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(240,244,255,0.7)' }}>Adresse email</label>
                <Input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="vous@exemple.com" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', height: '48px' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(240,244,255,0.7)' }}>Comment pouvons-nous vous aider ?</label>
                <textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="Décrivez votre problème ou posez votre question..." rows={5} className="w-full rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' }} />
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all hover:scale-105" style={{ background: isSubmitting ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00f5ff, #007bff)', color: isSubmitting ? 'rgba(255,255,255,0.5)' : '#0a0a0f', boxShadow: isSubmitting ? 'none' : '0 4px 20px rgba(0,245,255,0.3)', fontSize: '16px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                <Send size={20} /> {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </motion.form>
          </div>
        )}
      </div>
    </div>
  )
}
