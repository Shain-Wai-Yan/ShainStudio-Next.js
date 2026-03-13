'use client';
import React from 'react';
import Link from 'next/link';
import { FaBullhorn, FaChartLine, FaUsers, FaComments, FaRobot, FaChartPie, FaBullseye, FaBrain, FaAward, FaUsersCog, FaArrowRight } from 'react-icons/fa';

const Hero = () => {
  return (
    <section className="relative bg-slate-900 text-white py-20 min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-400 rounded-full opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-yellow-500 rounded-full opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-32 h-32 bg-yellow-300 rounded-full opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-1/2 right-1/2 w-24 h-24 bg-white rounded-full opacity-10 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-pretty">
              Welcome to <span className="text-yellow-400">Shain's Studio</span>
            </h1>
            <p className="text-lg md:text-2xl font-light text-gray-300 mb-8">
              Where creativity meets results.
            </p>
            <p className="max-w-xl mx-auto lg:mx-0 text-gray-400 mb-10 leading-relaxed">
              Explore my journey through marketing excellence, professional achievements, and creative solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/portfolio" className="inline-flex items-center justify-center bg-yellow-400 text-slate-900 hover:bg-yellow-500 font-bold py-3 px-8 rounded-lg transition-transform duration-300 hover:scale-105 shadow-lg">
                View My Portfolio
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-slate-900 font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg">
                Contact Me
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center perspective-1000">
            <div className="w-64 h-64 relative transform-style-3d animate-rotate-y">
              <div className="absolute w-full h-full bg-white/10 border border-yellow-400/50 flex items-center justify-center text-xl font-semibold transform-face-front">Marketing</div>
              <div className="absolute w-full h-full bg-white/10 border border-yellow-400/50 flex items-center justify-center text-xl font-semibold transform-face-back">Strategy</div>
              <div className="absolute w-full h-full bg-white/10 border border-yellow-400/50 flex items-center justify-center text-xl font-semibold transform-face-right">Creativity</div>
              <div className="absolute w-full h-full bg-white/10 border border-yellow-400/50 flex items-center justify-center text-xl font-semibold transform-face-left">Results</div>
              <div className="absolute w-full h-full bg-white/10 border border-yellow-400/50 flex items-center justify-center text-xl font-semibold transform-face-top">Innovation</div>
              <div className="absolute w-full h-full bg-white/10 border border-yellow-400/50 flex items-center justify-center text-xl font-semibold transform-face-bottom">Excellence</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-sm text-gray-300">Scroll to explore</span>
        <svg className="w-6 h-6 text-yellow-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </section>
  );
};

const expertiseData = [
  {
    icon: <FaBullhorn size={48} className="text-yellow-400" />,
    title: 'Digital Marketing',
    description: 'Strategic campaigns that drive engagement, conversions, and brand awareness across digital channels.',
  },
  {
    icon: <FaChartLine size={48} className="text-yellow-400" />,
    title: 'Market Analysis',
    description: 'In-depth research and analysis to identify market trends, opportunities, and competitive advantages.',
  },
  {
    icon: <FaUsers size={48} className="text-yellow-400" />,
    title: 'Brand Development',
    description: 'Creating compelling brand identities that resonate with target audiences and drive business growth.',
  },
  {
    icon: <FaComments size={48} className="text-yellow-400" />,
    title: 'Content Strategy',
    description: 'Developing engaging content that tells your brand story and connects with your audience.',
  },
];

const Expertise = () => {
  return (
    <section className="bg-slate-50 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900">My Expertise</h2>
          <p className="mt-4 text-lg text-slate-600">Areas where I deliver exceptional results</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {expertiseData.map((item, index) => (
            <div key={index} className="group perspective-1000">
              <div className="relative w-full h-64 transform-style-3d transition-transform duration-700 group-hover:rotate-y-180">
                {/* Front of the card */}
                <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg flex flex-col items-center justify-center p-6 border-2 border-slate-100">
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-800 text-center">{item.title}</h3>
                </div>
                {/* Back of the card */}
                <div className="absolute w-full h-full backface-hidden bg-slate-900 rounded-xl shadow-lg flex flex-col items-center justify-center p-6 text-white rotate-y-180">
                  <p className="text-center text-gray-200 mb-4 text-sm leading-relaxed">{item.description}</p>
                  <Link href="/portfolio" className="mt-4 bg-yellow-400 text-slate-900 font-semibold py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors duration-300">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AiShowcase = () => {
  return (
    <section className="relative bg-slate-900 text-white py-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">
            AI-Powered Marketing
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            Leveraging artificial intelligence to transform your marketing strategy
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex justify-center items-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 flex items-center justify-center animate-pulse-slow">
                <div className="w-full h-full rounded-full bg-yellow-500/10"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FaBrain className="text-yellow-400 text-8xl md:text-9xl opacity-80" />
              </div>
              {/* Connections */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-connection"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 0',
                    animationDelay: `${i * 1.5}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h3 className="text-3xl font-bold mb-6">The Future of Marketing is Here</h3>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
              I combine traditional marketing expertise with cutting-edge AI tools to create innovative, data-driven strategies that deliver exceptional results.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="flex items-center gap-3">
                <FaRobot className="text-yellow-400 text-2xl flex-shrink-0" />
                <span className="font-medium text-sm">AI-Powered Content</span>
              </div>
              <div className="flex items-center gap-3">
                <FaChartPie className="text-yellow-400 text-2xl flex-shrink-0" />
                <span className="font-medium text-sm">Predictive Analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <FaBullseye className="text-yellow-400 text-2xl flex-shrink-0" />
                <span className="font-medium text-sm">Audience Insights</span>
              </div>
              <div className="flex items-center gap-3">
                <FaBrain className="text-yellow-400 text-2xl flex-shrink-0" />
                <span className="font-medium text-sm">Prompt Engineering</span>
              </div>
            </div>
            <Link href="/portfolio" className="inline-flex items-center justify-center bg-yellow-400 text-slate-900 hover:bg-yellow-500 font-bold py-3 px-8 rounded-lg transition-transform duration-300 hover:scale-105 shadow-lg">
              See AI Marketing in Action
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const marketingSkills = [
  { name: 'Traditional Marketing', level: 98 },
  { name: 'Digital Marketing', level: 95 },
  { name: 'Analytics', level: 85 },
];

const creativeSkills = [
  { name: 'Branding & Strategy', level: 92 },
  { name: 'Social Media Design', level: 85 },
  { name: 'Content Writing', level: 60 },
];

const Skills = () => {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900">Professional Skills</h2>
          <p className="mt-4 text-lg text-slate-600">Tools and techniques I've mastered</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Marketing Skills */}
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Marketing</h3>
            <div className="space-y-6">
              {marketingSkills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base font-medium text-slate-700">{skill.name}</span>
                    <span className="text-sm font-medium text-slate-700">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creative Skills */}
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Creative</h3>
            <div className="space-y-6">
              {creativeSkills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base font-medium text-slate-700">{skill.name}</span>
                    <span className="text-sm font-medium text-slate-700">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-slate-900 to-blue-800 h-full rounded-full transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const certificates = [
  {
    icon: <FaAward size={40} className="text-yellow-400" />,
    title: 'Digital Marketing',
    description: 'Certified Digital Marketing Professional',
  },
  {
    icon: <FaChartPie size={40} className="text-yellow-400" />,
    title: 'Analytics',
    description: 'Advanced Analytics Certification',
  },
  {
    icon: <FaUsersCog size={40} className="text-yellow-400" />,
    title: 'Business Management',
    description: 'ICM Business Management and Administration Course',
  },
];

const CertificatePreview = () => {
  return (
    <section className="relative bg-fixed bg-cover bg-center bg-no-repeat py-24" style={{ backgroundImage: "url('/images/certificate-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white">Professional Certifications</h2>
          <p className="mt-4 text-lg text-gray-300">Credentials that validate my expertise</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {certificates.map((cert, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-gray-200/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
              <div className="flex justify-center mb-4">{cert.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{cert.title}</h3>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">{cert.description}</p>
              <Link href="/certificate" className="inline-block text-yellow-400 font-semibold hover:text-yellow-300 transition-colors duration-300">
                View Certificate
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/certificate" className="inline-flex items-center justify-center bg-yellow-400 text-slate-900 hover:bg-yellow-500 font-bold py-3 px-8 rounded-lg transition-transform duration-300 hover:scale-105 shadow-lg">
            View All Certificates
          </Link>
        </div>
      </div>
    </section>
  );
};

const Cta = () => {
  return (
    <section className="relative bg-slate-800 py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-5 z-0">
        <div className="absolute inset-0 bg-cta-pattern"></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Marketing?</h2>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Let's discuss how my expertise can help achieve your business goals.
        </p>
        <div>
          <Link href="/contact" className="inline-flex items-center gap-3 bg-yellow-400 text-slate-900 hover:bg-yellow-500 font-bold py-4 px-10 rounded-lg transition-transform duration-300 hover:scale-105 shadow-lg text-lg">
            <span>Get In Touch</span>
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  return (
    <main>
      <Hero />
      <Expertise />
      <AiShowcase />
      <Skills />
      <CertificatePreview />
      <Cta />
    </main>
  );
};

export default Home;
