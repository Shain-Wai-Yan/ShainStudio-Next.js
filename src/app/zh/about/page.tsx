'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaGlobe, FaLaptopCode, FaLightbulb } from 'react-icons/fa';
import MarTechStack from '@/components/MarTechStack';

export default function AboutPageZh() {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          element.classList.add('animated');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

const calculateAge = () => {
  const birthDate = new Date(2002, 5, 20); // June 20, 2002 (months are 0-indexed)
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayOccurred =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hasBirthdayOccurred) age--;
  return age;
};

  return (
    <main className="bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-32 md:py-40 text-center overflow-hidden bg-gradient-to-b from-[#191970] to-[#2a2a9a] dark:from-[#a67c00] dark:to-[#704700]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            关于 <span className="text-[#ffd700] dark:text-[#f9df85]">我</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-100">
            营销专家和数字讲故事者
          </p>
        </div>
      </section>

      {/* Profile Section */}
      <section className="py-12 md:py-20 px-4 md:px-0 bg-background-alt relative" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23191970' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="bg-background rounded-2xl shadow-lg p-8 md:p-12 text-center relative overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-primary-gradient" style={{ backgroundSize: '200% 200%' }}></div>

            {/* Profile Image */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-52 h-52 md:w-56 md:h-56">
                <div className="relative w-full h-full">
                  <Image
                    src="/images/profile.jpeg"
                    alt="明元易 - 营销专家"
                    fill
                    className="rounded-full object-cover border-4 border-background shadow-lg hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  {/* Rotating border */}
                  <div className="absolute -inset-3 rounded-full border-2 border-dashed border-accent animate-rotate-circle pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Name and Alias */}
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-2 font-secondary hover:text-accent transition-colors">
              明元易
            </h2>
            <p className="text-lg text-muted mb-6 font-primary">（Shain Wai Yan | xolbine）</p>

            {/* Motto */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 dark:from-accent/5 dark:to-primary/5 rounded-lg p-6 mb-0 border-l-4 border-accent hover:scale-105 transition-transform duration-400">
              <p className="text-2xl font-bold text-primary dark:text-white mb-2 font-secondary" lang="zh">
                有志者事竟成
              </p>
              <p className="text-base md:text-lg text-muted italic font-primary">
                "有志者，立长志；无志者，常立志"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-12 md:py-20 px-4 md:px-0 bg-background relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Bio Content */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-6 font-secondary relative inline-block pb-4">
                我的故事
                <div className="absolute bottom-0 left-0 w-16 h-1 bg-accent rounded"></div>
              </h2>

              <p className="text-base md:text-lg text-text leading-relaxed mb-6 text-justify font-primary animate-on-scroll">
                出于天性好奇、坚持不懈，我在资源有限的环境中，探索出无限可能。从乡村课堂到亲手打造由 Strapi、Cloudflare Workers 和自定义逻辑驱动的高级网站——没有计算机科学学位，我依靠自学走出了一条非传统的路。我擅长跨文化沟通，也善于整合系统。我的热情源于营销、叙事与技术的交汇处，致力于打造既能打动人心，又能被机器理解的数字体验。凭借市场营销的专业背景以及独立构建结构化、可扩展且注重 SEO 的平台经验，我总能在创意与执行之间找到最佳平衡。我不仅仅是在追求一份职业，更是在构建一个有意义的使命——持续成长、回馈社会，永不满足于平庸。始终学习，持续创造，我在数据与故事之间如鱼得水。不论是策划活动、解读 SEO，还是头脑风暴传播创意，我始终痴迷于品牌如何与全球用户建立深层连接。
              </p>

              {/* Divider */}
              <div className="h-1 my-8 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50 animate-shimmer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
              </div>

              {/* What I Bring Section */}
              <h3 className="text-2xl md:text-3xl font-bold text-primary dark:text-white mb-6 font-secondary relative inline-block pb-3 animate-on-scroll">
                我能带来的价值
                <div className="absolute bottom-0 left-0 w-16 h-1 bg-accent rounded"></div>
              </h3>

              {/* Skills */}
              <ul className="space-y-6">
                <li className="flex gap-4 animate-on-scroll hover:translate-x-2 transition-transform duration-300">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-gradient flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
                    <FaGlobe className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-primary dark:text-white mb-1 font-secondary">
                      三语沟通能力
                    </h4>
                    <p className="text-muted font-primary">
                      缅甸语（母语）、英语和中文 —— 在跨文化交流中架起沟通桥梁。
                    </p>
                  </div>
                </li>

                <li className="flex gap-4 animate-on-scroll hover:translate-x-2 transition-transform duration-300">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-gradient flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
                    <FaLaptopCode className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-primary dark:text-white mb-1 font-secondary">
                      数字化核心技能
                    </h4>
                    <p className="text-muted font-primary">
                      熟悉 SEO、社交媒体策略、数据分析及内容创作。
                    </p>
                  </div>
                </li>

                <li className="flex gap-4 animate-on-scroll hover:translate-x-2 transition-transform duration-300">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-gradient flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
                    <FaLightbulb className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-primary dark:text-white mb-1 font-secondary">
                      持续的好奇心
                    </h4>
                    <p className="text-muted font-primary">
                      带着新颖的视角，从每一个项目中不断学习与成长。
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-6">
              {/* Info Card */}
              <div className="bg-background rounded-xl shadow-md p-6 border-t-4 border-accent hover:shadow-lg hover:scale-105 transition-all duration-300 animate-on-scroll">
                <h3 className="text-xl font-bold text-primary dark:text-white mb-4 font-secondary relative pb-3">
                  个人信息
                  <div className="absolute bottom-0 left-0 w-10 h-1 bg-accent rounded"></div>
                </h3>
                <ul className="space-y-3 font-primary text-sm">
                  <li className="pb-3 border-b border-gray-200 dark:border-gray-700 hover:translate-x-1 transition-transform">
                    <span className="font-bold text-primary dark:text-white">年龄：</span>
                   <span className="text-muted ml-2">{calculateAge()} 岁</span>
                  </li>
                  <li className="pb-3 border-b border-gray-200 dark:border-gray-700 hover:translate-x-1 transition-transform">
                    <span className="font-bold text-primary dark:text-white">学历：</span>
                    <span className="text-muted ml-2">东枝大学 英语专业 四年级在读</span>
                  </li>
                  <li className="pb-3 border-b border-gray-200 dark:border-gray-700 hover:translate-x-1 transition-transform">
                    <span className="font-bold text-primary dark:text-white">已完成课程：</span>
                    <span className="text-muted ml-2">Strategy First University 市场营销与品牌管理专业文凭（荣誉毕业）</span>
                  </li>
                  <li className="hover:translate-x-1 transition-transform">
                    <span className="font-bold text-primary dark:text-white">专业证书：</span>
                    <div className="text-muted ml-2 mt-1 text-xs">
                      <p>• Google 数字营销与电子商务专业证书</p>
                      <p>• Meta 社交媒体营销专业证书</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Quote Card */}
              <div className="bg-gradient-to-br from-primary/3 to-accent/3 dark:from-accent/3 dark:to-primary/3 rounded-xl p-6 border-l-4 border-accent shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 animate-on-scroll">
                <blockquote className="relative text-base md:text-lg italic text-text font-primary leading-relaxed hover:scale-105 transition-transform duration-300">
                  <span className="text-5xl text-accent/20 absolute -top-4 -left-2 font-serif">"</span>
                  <p className="pl-6">市场营销不再是你制造了什么，而是你讲述了什么故事。</p>
                  <cite className="block text-right font-bold text-primary dark:text-white mt-4 not-italic">– Seth Godin</cite>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 md:py-20 px-4 md:px-0 bg-background-alt relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white text-center mb-12 font-secondary relative pb-4 inline-block w-full">
            我的成长旅程
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-accent rounded"></div>
          </h2>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent hidden md:block transform -translate-x-1/2"></div>

            {/* Timeline Items */}
            <div className="space-y-12">
              {/* Item 1 */}
              <div className="relative animate-on-scroll">
                <div className="md:flex items-center md:gap-8">
                  <div className="md:w-1/2 md:text-right md:pr-8">
                    <div className="bg-background rounded-lg p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                      <h3 className="text-xl font-bold text-primary dark:text-white mb-2 font-secondary">开启大学生活</h3>
                      <span className="inline-block px-3 py-1 bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent rounded-full text-sm font-bold mb-3">2019</span>
                      <p className="text-muted font-primary">
                        我在东枝大学开始了英语专业的本科学习，迈出了学术探索的第一步。
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center w-5 h-5 bg-white border-4 border-accent rounded-full -top-1"></div>
                  <div className="md:w-1/2 md:pl-8"></div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="relative animate-on-scroll">
                <div className="md:flex items-center md:gap-8 flex-row-reverse">
                  <div className="md:w-1/2 md:text-left md:pl-8">
                    <div className="bg-background rounded-lg p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                      <h3 className="text-xl font-bold text-primary dark:text-white mb-2 font-secondary">开始学习中文</h3>
                      <span className="inline-block px-3 py-1 bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent rounded-full text-sm font-bold mb-3">2023</span>
                      <p className="text-muted font-primary">
                        为了拓展语言技能，我开始自学中文，提升了跨文化沟通能力。
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center w-5 h-5 bg-white border-4 border-accent rounded-full top-6"></div>
                  <div className="md:w-1/2 md:pr-8"></div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative animate-on-scroll">
                <div className="md:flex items-center md:gap-8">
                  <div className="md:w-1/2 md:text-right md:pr-8">
                    <div className="bg-background rounded-lg p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                      <h3 className="text-xl font-bold text-primary dark:text-white mb-2 font-secondary">进修商业与市场营销</h3>
                      <span className="inline-block px-3 py-1 bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent rounded-full text-sm font-bold mb-3">2024</span>
                      <p className="text-muted font-primary">
                        在 Strategy First University 学习市场营销基础，正式踏入商业领域。
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center w-5 h-5 bg-white border-4 border-accent rounded-full top-6"></div>
                  <div className="md:w-1/2 md:pl-8"></div>
                </div>
              </div>

              {/* Item 4 */}
              <div className="relative animate-on-scroll">
                <div className="md:flex items-center md:gap-8 flex-row-reverse">
                  <div className="md:w-1/2 md:text-left md:pl-8">
                    <div className="bg-background rounded-lg p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                      <h3 className="text-xl font-bold text-primary dark:text-white mb-2 font-secondary">获得数字营销与电商证书</h3>
                      <span className="inline-block px-3 py-1 bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent rounded-full text-sm font-bold mb-3">2025</span>
                      <p className="text-muted font-primary">
                        通过 Coursera 开始修读 Google 专业认证课程，提升数字营销和电商技能。
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center w-5 h-5 bg-white border-4 border-accent rounded-full top-6"></div>
                  <div className="md:w-1/2 md:pr-8"></div>
                </div>
              </div>

              {/* Item 5 */}
              <div className="relative animate-on-scroll">
                <div className="md:flex items-center md:gap-8">
                  <div className="md:w-1/2 md:text-right md:pr-8">
                    <div className="bg-background rounded-lg p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                      <h3 className="text-xl font-bold text-primary dark:text-white mb-2 font-secondary">学习社交媒体营销</h3>
                      <span className="inline-block px-3 py-1 bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent rounded-full text-sm font-bold mb-3">2025</span>
                      <p className="text-muted font-primary">
                        通过 Coursera 修读 Meta 专业认证课程，进一步提升社交媒体策略能力。
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center w-5 h-5 bg-white border-4 border-accent rounded-full top-6"></div>
                  <div className="md:w-1/2 md:pl-8"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mar-Tech Stack Section */}
      <MarTechStack language="zh" />

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 md:px-0 bg-primary-gradient relative overflow-hidden" style={{ backgroundSize: '200% 200%' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-secondary animate-fade-in-up">
            准备好一起合作了吗？
          </h2>
          <p className="text-lg md:text-xl text-white opacity-90 mb-8 font-primary animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            让我们创造一些了不起的东西。联系我，讨论我们如何合作。
          </p>
          <a
            href="/zh/contact"
            className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold py-3 px-8 rounded hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden group animate-fade-in-up font-secondary"
            style={{ animationDelay: '0.4s' }}
          >
            <span className="relative z-10">联系我</span>
            <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded"></div>
          </a>
        </div>
      </section>
    </main>
  );
}
