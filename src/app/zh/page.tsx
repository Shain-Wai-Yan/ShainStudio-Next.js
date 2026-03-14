'use client';
import React from 'react';
import Link from 'next/link';
import { FaBullhorn, FaChartLine, FaUsers, FaComments, FaRobot, FaChartPie, FaBullseye, FaBrain, FaAward, FaUsersCog, FaArrowRight } from 'react-icons/fa';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#ffffff', marginTop: '80px', padding: '2rem' }}>
      {/* Animated background shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#191970', top: '-100px', right: '-100px', animation: 'float 15s ease-in-out infinite' }}></div>
        <div className="absolute w-48 h-48 rounded-full opacity-10" style={{ backgroundColor: '#191970', bottom: '-50px', left: '-50px', animation: 'float 20s ease-in-out infinite reverse' }}></div>
        <div className="absolute w-36 h-36 rounded-full opacity-10" style={{ backgroundColor: '#191970', top: '40%', right: '20%', animation: 'float 18s ease-in-out infinite 2s' }}></div>
        <div className="absolute w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: '#191970', bottom: '30%', left: '15%', animation: 'float 12s ease-in-out infinite 1s' }}></div>
        <div className="absolute w-20 h-20 rounded-full opacity-10" style={{ backgroundColor: '#191970', top: '20%', left: '10%', animation: 'float 10s ease-in-out infinite 3s' }}></div>
      </div>

      {/* Animated dots pattern */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#191970 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 style={{ color: '#0f0f45' }} className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-pretty">
              欢迎来到<span className="text-gold-gradient animate-gold-shimmer">Shain的工作室</span>
            </h1>
            <p style={{ color: '#666666' }} className="text-lg md:text-2xl font-light mb-8">
              创意与成果完美结合。
            </p>
            <p style={{ color: '#666666' }} className="max-w-xl mx-auto lg:mx-0 opacity-90 mb-10 leading-relaxed">
              探索我通过营销卓越、专业成就和创意解决方案的历程。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/zh/portfolio" style={{ backgroundColor: '#0f0f45' }} className="inline-flex items-center justify-center text-white font-bold py-3 px-8 rounded-lg transition-transform duration-300 hover:scale-105 shadow-lg">
                查看我的作品集
              </Link>
              <Link href="/zh/contact" style={{ borderColor: '#0f0f45', color: '#0f0f45' }} className="inline-flex items-center justify-center border-2 hover:bg-[#0f0f45] hover:text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105">
                联系我
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center" style={{ perspective: '1000px' }}>
            <div style={{ width: '200px', height: '200px', position: 'relative', transformStyle: 'preserve-3d', animation: 'cubeRotate 20s infinite linear' }}>
              <div style={{ position: 'absolute', width: '200px', height: '200px', backgroundColor: '#191970', borderColor: '#ffd700', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: 'white', transform: 'translateZ(100px)' }} className="flex items-center justify-center text-xl font-semibold text-white">营销</div>
              <div style={{ position: 'absolute', width: '200px', height: '200px', backgroundColor: '#191970', borderColor: '#ffd700', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: 'white', transform: 'rotateY(180deg) translateZ(100px)' }} className="flex items-center justify-center text-xl font-semibold text-white">策略</div>
              <div style={{ position: 'absolute', width: '200px', height: '200px', backgroundColor: '#191970', borderColor: '#ffd700', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: 'white', transform: 'rotateY(90deg) translateZ(100px)' }} className="flex items-center justify-center text-xl font-semibold text-white">创意</div>
              <div style={{ position: 'absolute', width: '200px', height: '200px', backgroundColor: '#191970', borderColor: '#ffd700', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: 'white', transform: 'rotateY(-90deg) translateZ(100px)' }} className="flex items-center justify-center text-xl font-semibold text-white">成果</div>
              <div style={{ position: 'absolute', width: '200px', height: '200px', backgroundColor: '#191970', borderColor: '#ffd700', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: 'white', transform: 'rotateX(90deg) translateZ(100px)' }} className="flex items-center justify-center text-xl font-semibold text-white">创新</div>
              <div style={{ position: 'absolute', width: '200px', height: '200px', backgroundColor: '#191970', borderColor: '#ffd700', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: 'white', transform: 'rotateX(-90deg) translateZ(100px)' }} className="flex items-center justify-center text-xl font-semibold text-white">卓越</div>
            </div>
            <style>{`
              @keyframes cubeRotate {
                from { transform: rotateX(0) rotateY(0) rotateZ(0); }
                to { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
              }
            `}</style>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <span style={{ color: '#666666' }} className="text-sm">向下滚动以浏览</span>
        <svg style={{ color: '#0f0f45' }} className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </section>
  );
};

const expertiseData = [
  {
    icon: <FaBullhorn size={48} style={{ color: '#ffd700' }} />,
    title: '数字营销',
    description: '跨数字渠道推动参与度、转化率和品牌知名度的战略性活动。',
  },
  {
    icon: <FaChartLine size={48} style={{ color: '#ffd700' }} />,
    title: '市场分析',
    description: '深入研究和分析，以确定市场趋势、机会和竞争优势。',
  },
  {
    icon: <FaUsers size={48} style={{ color: '#ffd700' }} />,
    title: '品牌开发',
    description: '创建与目标受众产生共鸣并推动业务增长的引人注目的品牌身份。',
  },
  {
    icon: <FaComments size={48} style={{ color: '#ffd700' }} />,
    title: '内容策略',
    description: '开发讲述品牌故事并与受众联系的引人入胜的内容。',
  },
];

const Expertise = () => {
  return (
    <section style={{ backgroundColor: '#f9f9f9', padding: '5rem 2rem', position: 'relative' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 style={{ color: '#191970', fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 'bold', position: 'relative', display: 'inline-block' }} className="relative">
            我的专长
            <span style={{ content: '""', position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '4px', background: 'linear-gradient(to right, #191970, #ffd700)', borderRadius: '2px' }} className="absolute"></span>
          </h2>
          <p style={{ color: '#666666', fontSize: '1.2rem', marginTop: '2rem' }} className="max-w-xl mx-auto">我能卓越交付的领域</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {expertiseData.map((item, index) => (
            <div key={index} style={{ height: '300px', perspective: '1000px' }} className="expertise-card group">
              <div style={{ position: 'relative', width: '100%', height: '100%', transition: 'transform 0.8s', transformStyle: 'preserve-3d' }} className="card-inner group-hover:rotate-y-180">
                <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', transition: 'all 0.3s ease' }}>
                  <div className="mb-6">{item.icon}</div>
                  <h3 style={{ fontSize: '1.5rem', color: '#191970', textAlign: 'center', fontWeight: 'bold' }}>{item.title}</h3>
                </div>
                <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)', backgroundColor: '#191970', color: 'white', transform: 'rotateY(180deg)', textAlign: 'center', transition: 'all 0.3s ease' }}>
                  <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', color: 'white', fontSize: '0.95rem' }}>{item.description}</p>
                  <Link href="/zh/portfolio" style={{ display: 'inline-block', padding: '0.5rem 1.5rem', backgroundColor: '#ffd700', color: '#191970', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.3s ease' }} className="hover:bg-white hover:-translate-y-1">
                    了解更多
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .card-inner.group-hover\:rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </section>
  );
};

const AiShowcase = () => {
  return (
    <section style={{ backgroundColor: '#f9f9f9', padding: '5rem 2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(to right, rgba(25, 25, 112, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(25, 25, 112, 0.05) 1px, transparent 1px)', backgroundSize: '30px 30px', zIndex: 0 }}></div>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(circle, rgba(25, 25, 112, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px', animation: 'floatParticles 60s linear infinite', zIndex: 0 }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="text-center mb-16">
          <h2 style={{ color: '#191970', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            AI驱动的营销
          </h2>
          <p style={{ color: '#666666', fontSize: '1.2rem' }} className="max-w-3xl mx-auto">
            利用人工智能转变您的营销策略
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', gap: '3rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', minWidth: '300px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #191970', opacity: 0, animation: 'brainPulse 3s infinite' }}></div>

              <div style={{ width: '140px', height: '140px', background: 'linear-gradient(135deg, #191970, #2a2a9a)', borderRadius: '50%', boxShadow: '0 0 40px rgba(25, 25, 112, 0.4), inset 0 0 30px rgba(255, 215, 0, 0.1)', position: 'relative', zIndex: 2, animation: 'pulse 3s infinite alternate', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'float 4s ease-in-out infinite' }}>
                  <circle cx="50" cy="50" r="45" stroke="#ffd700" strokeWidth="2" opacity="0.6" />
                  <circle cx="50" cy="50" r="35" stroke="#ffd700" strokeWidth="1.5" opacity="0.4" />
                  <circle cx="50" cy="50" r="8" fill="#ffd700" />
                  <circle cx="30" cy="35" r="5" fill="#ffd700" opacity="0.8" />
                  <circle cx="70" cy="35" r="5" fill="#ffd700" opacity="0.8" />
                  <circle cx="25" cy="60" r="5" fill="#ffd700" opacity="0.8" />
                  <circle cx="75" cy="60" r="5" fill="#ffd700" opacity="0.8" />
                  <line x1="50" y1="50" x2="30" y2="35" stroke="#ffd700" strokeWidth="1.5" opacity="0.6" />
                  <line x1="50" y1="50" x2="70" y2="35" stroke="#ffd700" strokeWidth="1.5" opacity="0.6" />
                  <line x1="50" y1="50" x2="25" y2="60" stroke="#ffd700" strokeWidth="1.5" opacity="0.6" />
                  <line x1="50" y1="50" x2="75" y2="60" stroke="#ffd700" strokeWidth="1.5" opacity="0.6" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, padding: '2rem', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', minWidth: '300px' }}>
            <h3 style={{ color: '#191970', fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 'bold' }}>营销的未来已经到来</h3>
            <p style={{ color: '#333333', marginBottom: '2rem', lineHeight: '1.7', fontSize: '1.05rem' }}>
              我结合传统营销专业知识和尖端的AI工具，创建创新的、数据驱动的策略，以实现卓越的成果。
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <FaRobot style={{ color: '#191970', fontSize: '1.2rem' }} />
                <span style={{ color: '#333333', fontWeight: '500', fontSize: '0.95rem' }}>AI内容生成</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <FaChartPie style={{ color: '#191970', fontSize: '1.2rem' }} />
                <span style={{ color: '#333333', fontWeight: '500', fontSize: '0.95rem' }}>预测分析</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <FaBullseye style={{ color: '#191970', fontSize: '1.2rem' }} />
                <span style={{ color: '#333333', fontWeight: '500', fontSize: '0.95rem' }}>受众洞察</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <FaBrain style={{ color: '#191970', fontSize: '1.2rem' }} />
                <span style={{ color: '#333333', fontWeight: '500', fontSize: '0.95rem' }}>提示工程</span>
              </div>
            </div>
            <Link href="/zh/portfolio" style={{ display: 'inline-block', padding: '0.8rem 2rem', backgroundColor: '#191970', color: 'white', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.3s ease' }} className="hover:brightness-110 hover:shadow-lg">
              查看AI营销实战
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 20px rgba(25, 25, 112, 0.3); }
          100% { transform: scale(1.1); box-shadow: 0 0 40px rgba(25, 25, 112, 0.5); }
        }
        @keyframes brainPulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes floatParticles {
          0% { background-position: 0 0; }
          100% { background-position: 100px 100px; }
        }
      `}</style>
    </section>
  );
};

const marketingSkills = [
  { name: '传统营销', level: 98 },
  { name: '数字营销', level: 95 },
  { name: '数据分析', level: 85 },
];

const creativeSkills = [
  { name: '品牌与策略', level: 92 },
  { name: '社交媒体设计', level: 85 },
  { name: '内容写作', level: 60 },
];

const Skills = () => {
  return (
    <section style={{ backgroundColor: '#ffffff' }} className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 style={{ color: '#0f0f45' }} className="text-4xl font-bold">专业技能</h2>
          <p style={{ color: '#666666' }} className="mt-4 text-lg">我掌握的工具和技术</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 style={{ color: '#191970' }} className="text-2xl font-bold mb-6">营销</h3>
            <div className="space-y-6">
              {marketingSkills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: '#333333' }} className="text-base font-medium">{skill.name}</span>
                    <span style={{ color: '#191970' }} className="text-sm font-medium">{skill.level}%</span>
                  </div>
                  <div style={{ backgroundColor: '#f9f9f9', borderColor: 'rgba(255, 215, 0, 0.1)' }} className="w-full rounded-full h-2.5 overflow-hidden border">
                    <div
                      className="bg-gold-gradient h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ color: '#191970' }} className="text-2xl font-bold mb-6">创意</h3>
            <div className="space-y-6">
              {creativeSkills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: '#333333' }} className="text-base font-medium">{skill.name}</span>
                    <span style={{ color: '#191970' }} className="text-sm font-medium">{skill.level}%</span>
                  </div>
                  <div style={{ backgroundColor: '#f9f9f9' }} className="w-full rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-primary-gradient h-full rounded-full transition-all duration-500"
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
    icon: <FaAward size={40} style={{ color: '#ffd700' }} />,
    title: '数字营销',
    description: '认证数字营销专业人士',
  },
  {
    icon: <FaChartPie size={40} style={{ color: '#ffd700' }} />,
    title: '数据分析',
    description: '高级数据分析认证',
  },
  {
    icon: <FaUsersCog size={40} style={{ color: '#ffd700' }} />,
    title: '商业管理',
    description: 'ICM商业管理和行政课程',
  },
];

const CertificatePreview = () => {
  return (
    <section className="relative" style={{ padding: '5rem 2rem', backgroundColor: '#ffffff' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(25, 25, 112, 0.01) 10px, rgba(25, 25, 112, 0.01) 20px), radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(25, 25, 112, 0.05) 0%, transparent 50%)' }}></div>
      
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'linear-gradient(135deg, #191970, #2a2a9a)', borderRadius: '50%', opacity: 0.05, zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: 'linear-gradient(135deg, #ffd700, #ffe347)', borderRadius: '50%', opacity: 0.03, zIndex: 0 }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#191970', marginBottom: '0.5rem', position: 'relative', display: 'inline-block', letterSpacing: '0.5px' }}>
            专业证书
            <span style={{ content: '""', position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '4px', background: 'linear-gradient(to right, #191970, #ffd700)', borderRadius: '2px' }} className="absolute"></span>
          </h2>
          <p style={{ color: '#666666', fontSize: '1.2rem', marginTop: '2rem', fontWeight: '500' }}>验证我专业知识的证书</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {certificates.map((cert, index) => (
            <div 
              key={index} 
              style={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e0e0e0', 
                borderRadius: '12px', 
                padding: '2rem', 
                boxShadow: '0 4px 15px rgba(25, 25, 112, 0.08)',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                overflow: 'hidden'
              }} 
              className="text-center group hover:shadow-2xl hover:-translate-y-3"
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ffd700'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255, 215, 0, 0) 0%, rgba(255, 215, 0, 0.05) 100%)', opacity: 0, transition: 'opacity 0.4s ease', zIndex: 1 }} className="group-hover:opacity-100"></div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 2, transition: 'transform 0.4s ease' }} className="group-hover:scale-110">
                {cert.icon}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#191970', marginBottom: '0.5rem', position: 'relative', zIndex: 2 }}>{cert.title}</h3>
              <p style={{ color: '#333333', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6', position: 'relative', zIndex: 2 }}>{cert.description}</p>
              <Link 
                href="/zh/certificate" 
                style={{ 
                  display: 'inline-block', 
                  color: '#191970', 
                  fontWeight: '600', 
                  textDecoration: 'none', 
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  zIndex: 2,
                  padding: '0.5rem 1rem'
                }} 
                className="hover:text-[#ffd700] hover:scale-105"
              >
                查看证书 →
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-16">
          <Link 
            href="/zh/certificate" 
            style={{ 
              display: 'inline-block', 
              padding: '1rem 2.5rem', 
              background: 'linear-gradient(135deg, #191970 0%, #2a2a9a 50%, #191970 100%)', 
              backgroundSize: '200% 200%',
              color: 'white', 
              fontWeight: 'bold', 
              borderRadius: '6px', 
              textDecoration: 'none', 
              transition: 'all 0.4s ease', 
              boxShadow: '0 6px 20px rgba(25, 25, 112, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }} 
            className="hover:scale-105 hover:shadow-lg"
            onMouseEnter={(e) => e.currentTarget.style.backgroundPosition = '100% 0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundPosition = '0 0'}
          >
            查看所有证书
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes certificateFade {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .grid > div {
          animation: certificateFade 0.6s ease forwards;
        }
        .grid > div:nth-child(1) { animation-delay: 0.1s; }
        .grid > div:nth-child(2) { animation-delay: 0.2s; }
        .grid > div:nth-child(3) { animation-delay: 0.3s; }
      `}</style>
    </section>
  );
};

const Cta = () => {
  return (
    <section style={{ backgroundColor: '#191970' }} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute inset-0 bg-cta-pattern"></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl font-bold text-white mb-4">准备好改变您的营销了吗?</h2>
        <p style={{ color: '#b0b0b0' }} className="mt-4 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          让我们讨论我的专业知识如何帮助您实现业务目标。
        </p>
        <div>
          <Link href="/zh/contact" className="inline-flex items-center gap-3 bg-gold-gradient text-[#0f0f45] font-bold py-4 px-10 rounded-lg transition-transform duration-300 hover:scale-105 shadow-gold text-lg">
            <span>获取联系方式</span>
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
