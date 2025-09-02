'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Camera, MessageCircle, Users, Cloud, Sparkles, ArrowRight, CheckCircle, Upload, Zap, Github, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';

export default function LandingPage() {
  const features = [
    {
      icon: <Camera className="h-8 w-8" />,
      title: 'AI Diagnosis Penyakit',
      description: 'Upload foto tanaman dan dapatkan diagnosis penyakit akurat dengan AI terdepan',
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: 'Chatbot PakTani',
      description: 'Konsultasi interaktif tentang cara bertani sehat dan penggunaan pestisida aman',
      gradient: 'from-green-500 to-teal-600',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Forum Diskusi',
      description: 'Bergabung dengan komunitas petani untuk berbagi pengalaman dan tips',
      gradient: 'from-orange-500 to-red-600',
    },
    {
      icon: <Cloud className="h-8 w-8" />,
      title: 'Prakiraan Cuaca',
      description: 'Prediksi cuaca akurat dengan analisis khusus untuk kebutuhan pertanian',
      gradient: 'from-cyan-500 to-blue-600',
    },
  ];

  const teamMembers = [
    {
      name: 'M. Rifqi Dzaky Adzhad',
      role: 'Anggota Tim',
      description: 'Spesialis dalam pengembangan AI dan machine learning untuk pertanian. Memiliki pengalaman 5+ tahun dalam computer vision.',
      image: '/member1.jpeg',
      social: {
        github: 'https://github.com/Liamours',
        linkedin: 'https://www.linkedin.com/in/rifqiazhad0210/',
        email: 'ahmad@cektani.com',
      },
    },
    {
      name: 'Aprilinza Muhammad Yusup',
      role: 'Ketua Tim',
      description: 'Ahli pertanian dengan latar belakang agronomis. Memastikan solusi yang dikembangkan sesuai dengan kebutuhan petani.',
      image: '/member2.jpeg',
      social: {
        github: 'https://github.com/aprilianza',
        linkedin: 'https://www.linkedin.com/in/aprilianza-yusup/',
        email: 'siti@cektani.com',
      },
    },
    {
      name: 'Fathan Arya Maulana',
      role: 'Anggota Tim',
      description: 'Pengembang full-stack dengan fokus pada user experience. Memastikan aplikasi mudah digunakan oleh semua kalangan petani.',
      image: '/member3.jpeg',
      social: {
        github: 'https://github.com/FathanAM0',
        linkedin: 'https://www.linkedin.com/in/fathanam24/',
        email: 'budi@cektani.com',
      },
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Foto',
      description: 'Ambil foto tanaman yang ingin didiagnosis',
      icon: <Upload className="h-6 w-6" />,
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'AI kami menganalisis foto secara mendalam',
      icon: <Zap className="h-6 w-6" />,
    },
    {
      number: '03',
      title: 'Dapatkan Hasil',
      description: 'Terima diagnosis dan saran pengobatan',
      icon: <CheckCircle className="h-6 w-6" />,
    },
  ];

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: 'easeOut' }
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  };

  const slideInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section - Full Page */}
      <section id="hero" className="min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1
            }}
          />
          <motion.div 
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            className="space-y-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-green-700 via-emerald-600 to-lime-500 bg-clip-text text-transparent mb-4"
              variants={fadeInUp}
            >
              CekTani
            </motion.h1>

            <motion.h2 
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
              variants={fadeInUp}
            >
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Diagnosis Penyakit Tanaman</span>
              <br />
              <span className="text-gray-900">dengan Artificial Intelligence</span>
            </motion.h2>

            <motion.p 
              className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 leading-relaxed"
              variants={fadeInUp}
            >
              Deteksi penyakit tanaman secara instan dengan teknologi AI terdepan. Dapatkan diagnosis akurat dan saran pengobatan hanya dengan satu foto.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeInUp}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300"
                  onClick={() => (window.location.href = '/auth/login')}
                >
                  Mulai Diagnosis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Full Page */}
      <section id="features" className="min-h-screen py-20 flex items-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Solusi Lengkap untuk
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"> Pertanian Modern</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Nikmati pengalaman pertanian yang lebih cerdas dengan teknologi AI terdepan</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                  <CardHeader className="text-center">
                    <motion.div 
                      className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 text-center">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section - Full Page */}
      <section id="how-it-works" className="min-h-screen py-20 flex items-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Mudah Digunakan dalam
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> 3 Langkah</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Proses diagnosis yang simpel dan cepat untuk semua kalangan petani</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="text-center group"
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative mb-8">
                  <motion.div 
                    className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white shadow-2xl"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.icon}
                  </motion.div>
                  <motion.div 
                    className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    {step.number}
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 text-lg">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section - Full Page */}
      <section id="team" className="min-h-screen py-20 flex items-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Bertemu dengan
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> Tim Ornithon</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Dibuat oleh tim ornithon</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={index % 2 === 0 ? slideInLeft : slideInRight}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <motion.div 
                      className="relative inline-block mb-6"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Image 
                        src={member.image} 
                        alt={member.name} 
                        width={256}
                        height={256}
                        className="rounded-full object-cover border-4 border-white/20 shadow-2xl" 
                      />
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20"
                        animate={{ 
                          opacity: [0.2, 0.4, 0.2],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-green-400 font-semibold mb-4 text-lg">{member.role}</p>

                    <motion.div 
                      className="flex items-center justify-center gap-3"
                      variants={staggerContainer}
                      initial="initial"
                      whileInView="animate"
                      viewport={{ once: true }}
                    >
                      <motion.div variants={scaleIn}>
                        <Button variant="ghost" size="icon" className="text-white hover:text-green-400 h-8 w-8" onClick={() => window.open(member.social.github, '_blank')}>
                          <Github className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <motion.div variants={scaleIn}>
                        <Button variant="ghost" size="icon" className="text-white hover:text-blue-400 h-8 w-8" onClick={() => window.open(member.social.linkedin, '_blank')}>
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-green-600 to-teal-600 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            className="space-y-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold"
              variants={fadeInUp}
            >
              Siap Meningkatkan
              <span className="text-yellow-300"> Hasil Panen</span>?
            </motion.h2>
            <motion.p 
              className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Bergabunglah dengan komunitas petani yang telah merasakan manfaat teknologi AI untuk pertanian
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300"
                  onClick={() => (window.location.href = '/auth/login')}
                >
                  Mulai Gratis Sekarang
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="bg-gray-900 text-white py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CekTani. Tim Ornithon</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}