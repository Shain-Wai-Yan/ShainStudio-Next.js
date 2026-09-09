import type { Metadata } from 'next';
import Link from 'next/link';
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/locales';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/seo';
import { getPhotography, repository } from '@/lib/server/photography-data';
import { YOUTUBE_CHANNELS } from '@/lib/youtube-channels';
import { getYouTubeWorkerHeaders, getYouTubeWorkerUrl } from '@/lib/server/youtube-worker';
import HobbiesPursuitList, { type PursuitItem } from '@/components/hobbies/HobbiesPursuitList';

interface Props {
  params: Promise<{ locale: string }>;
}

const copy = {
  en: {
    eyebrow: 'Personal Studio',
    titleTop: 'Beyond',
    titleBottom: 'Work',
    intro:
      'A dedicated space for the interests and creative projects I return to for curiosity, craft, and the simple pleasure of making something outside of work.',
    statsLabels: {
      photos: 'Archived Photos',
      views: 'YouTube Views',
      videos: 'YouTube Videos',
      collections: 'Photo Collections',
    },
    sectionLabel: 'Current Pursuits',
    explore: 'Explore',
    photography: {
      number: '01',
      title: 'Photography',
      category: 'Visual & Still Light',
      description:
        'Capturing moments, places, natural light, and the quiet details I wanted to remember across Taunggyi, Inle Lake, Yangon, and travels.',
    },
    amv: {
      number: '02',
      title: 'AMV Editing',
      category: 'Motion & Music Cuts',
      description:
        'Rhythm, emotion, and stories reshaped through music and video cuts. A personal creative outlet exploring pacing and kinetic timing.',
    },
    gaming: {
      number: '03',
      title: 'Gaming',
      category: 'Playthroughs & Guides',
      description:
        'Gameplay walkthroughs, game guides, and memorable playthroughs paired with custom background music.',
    },
    backHome: 'Back to home',
    footerStudio: 'Shain Studio',
    footerYear: 'Est. 2024',
  },
  zh: {
    eyebrow: '个人创作空间',
    titleTop: '工作',
    titleBottom: '之外',
    intro:
      '这里记录着我在工作之外的个人兴趣与业余创作，收录出于好奇、探索与纯粹热爱的创作项目。',
    statsLabels: {
      photos: '已归档照片',
      views: 'YouTube 播放量',
      videos: 'YouTube 视频',
      collections: '摄影主题分类',
    },
    sectionLabel: '近期兴趣',
    explore: '查看',
    photography: {
      number: '01',
      title: '摄影',
      category: '光影与生活瞬间',
      description:
        '记录东枝、茵莱湖、仰光及旅途中的自然风光、城市建筑与宁静光影，留存那些值得记住的细节。',
    },
    amv: {
      number: '02',
      title: 'AMV 编辑',
      category: '动漫视频与节拍剪辑',
      description:
        '用音乐与动态影像重新编排节律与情绪，出于个人对音乐卡点与画面节奏的热爱与探索。',
    },
    gaming: {
      number: '03',
      title: '游戏',
      category: '实况与攻略',
      description:
        '游戏通关实况、攻略解析与精彩瞬间。记录游戏世界中的策略探索与趣味体验。',
    },
    backHome: '返回主页',
    footerStudio: '明元易工作室',
    footerYear: '创立于 2024',
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const path = locale === 'zh' ? '/zh/hobbies' : '/hobbies';
  const title = locale === 'zh' ? '工作之外 | 明元易' : 'Beyond Work | Shain Wai Yan';
  const description =
    locale === 'zh'
      ? '明元易在工作之外的个人兴趣空间：摄影、AMV 视频剪辑与游戏。'
      : 'Explore the interests, personal projects, and creative hobbies that Shain Wai Yan pursues beyond work.';

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        en: `${SITE_URL}/hobbies`,
        zh: `${SITE_URL}/zh/hobbies`,
        'x-default': `${SITE_URL}/hobbies`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

/**
 * Fetch dynamic data for hobbies: exact photo count, target photo (xu3bmcyepjhtd4mcpb8y6vf4), and live YouTube stats (AMV + Gaming combined)
 */
async function getDynamicHobbyData(locale: string) {
  let photoTotal = 209;
  let collectionCount = 7;
  const targetPhotoId = 'xu3bmcyepjhtd4mcpb8y6vf4';
  let featuredPhotoImage =
    'https://res.cloudinary.com/dl00p17ca/image/upload/v1774771797/Mayoralty_frame_357db71323.jpg';
  let featuredPhotoTitle = 'Mayoralty at Yangon';
  let ytViews = 134426 + 119637;
  let ytVideos = 25 + 20;
  let amvVideos = 25;
  let gamingVideos = 20;

  // 1. Fetch exact photo count and the requested target photo from Strapi
  try {
    const [feed, photo] = await Promise.all([
      getPhotography(new URLSearchParams({ pageSize: '1', language: locale })),
      repository.getPhoto(targetPhotoId, locale === 'zh' ? 'zh' : 'en'),
    ]);

    if (typeof feed.total === 'number' && feed.total > 0) {
      photoTotal = feed.total;
    }
    if (photo && photo.image) {
      featuredPhotoImage = photo.image;
      featuredPhotoTitle = photo.title || featuredPhotoTitle;
    }
    const collections = await repository.getCollections(locale === 'zh' ? 'zh' : 'en');
    if (Array.isArray(collections) && collections.length > 0) {
      collectionCount = collections.length;
    }
  } catch (error) {
    console.warn('[HobbiesPage] Photo data fetch fallback:', error);
  }

  // 2. Fetch dynamically updated YouTube channel views and videos for BOTH channels
  try {
    const workerBase = getYouTubeWorkerUrl();
    const workerHeaders = getYouTubeWorkerHeaders();
    const [amvRes, gamingRes] = await Promise.allSettled([
      fetch(
        `${workerBase}/api/youtube/channel?channelId=${YOUTUBE_CHANNELS.amv.channelId}`,
        {
          next: { revalidate: 300 },
          signal: AbortSignal.timeout(5000),
          headers: workerHeaders,
        }
      ),
      fetch(
        `${workerBase}/api/youtube/channel?channelId=${YOUTUBE_CHANNELS.gaming.channelId}`,
        {
          next: { revalidate: 300 },
          signal: AbortSignal.timeout(5000),
          headers: workerHeaders,
        }
      ),
    ]);

    let amvViews = 134426;
    let gamingViews = 119637;

    if (amvRes.status === 'fulfilled' && amvRes.value.ok) {
      const amvData = await amvRes.value.json();
      const stats = amvData?.items?.[0]?.statistics;
      if (stats?.viewCount) {
        amvViews = Number(stats.viewCount);
      }
      if (stats?.videoCount) {
        amvVideos = Number(stats.videoCount);
      }
    }

    if (gamingRes.status === 'fulfilled' && gamingRes.value.ok) {
      const gamingData = await gamingRes.value.json();
      const stats = gamingData?.items?.[0]?.statistics;
      if (stats?.viewCount) {
        gamingViews = Number(stats.viewCount);
      }
      if (stats?.videoCount) {
        gamingVideos = Number(stats.videoCount);
      }
    }

    ytViews = amvViews + gamingViews;
    ytVideos = amvVideos + gamingVideos;
  } catch (error) {
    console.warn('[HobbiesPage] YouTube stats fetch fallback:', error);
  }

  return {
    photoTotal,
    collectionCount,
    featuredPhotoImage,
    featuredPhotoTitle,
    ytViews,
    ytVideos,
    amvVideos,
    gamingVideos,
  };
}

export default async function HobbiesPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = copy[locale];
  const basePath = locale === 'zh' ? '/zh' : '';

  // Fetch dynamic numbers and preview image
  const data = await getDynamicHobbyData(locale);

  const statsItems = [
    {
      value: data.photoTotal.toLocaleString(),
      label: t.statsLabels.photos,
    },
    {
      value: data.ytViews.toLocaleString(),
      label: t.statsLabels.views,
    },
    {
      value: String(data.ytVideos),
      label: t.statsLabels.videos,
    },
    {
      value: String(data.collectionCount),
      label: t.statsLabels.collections,
    },
  ];

  const pursuits: PursuitItem[] = [
    {
      ...t.photography,
      href: `${basePath}/hobbies/photography`,
      accent: 'from-amber-500 to-orange-400',
      badge: `${data.photoTotal} ${locale === 'zh' ? '张照片' : 'photos'}`,
      previewImage: data.featuredPhotoImage,
      previewLabel:
        locale === 'zh'
          ? `${data.featuredPhotoTitle} · 仰光`
          : `${data.featuredPhotoTitle} · Yangon`,
    },
    {
      ...t.amv,
      href: `${basePath}/hobbies/amv-editing`,
      accent: 'from-indigo-500 to-purple-400',
      badge: `${data.amvVideos} ${locale === 'zh' ? '个视频 · YouTube' : 'videos · YouTube'}`,
      previewImage: 'https://i.ytimg.com/vi/Q1fT0PJOZsI/hqdefault.jpg',
      previewLabel: locale === 'zh' ? '进击的巨人 · 24帧卡点' : 'Attack on Titan · 24fps',
    },
    {
      ...t.gaming,
      href: `${basePath}/hobbies/gaming`,
      accent: 'from-emerald-500 to-teal-400',
      badge: `${data.gamingVideos} ${locale === 'zh' ? '个视频 · YouTube' : 'videos · YouTube'}`,
      previewImage: 'https://i.ytimg.com/vi/Iv4PM0YN5V8/hqdefault.jpg',
      previewLabel: 'Rathgricy Fallen Feather · RO',
    },
  ];

  return (
    <main className="min-h-screen bg-white text-neutral-900 transition-colors duration-300 dark:bg-[#0c0d12] dark:text-neutral-100">
      {/* Hero Header */}
      <section className="relative mx-auto max-w-7xl px-6 pt-28 pb-14 sm:px-10 md:pt-36 md:pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_.6fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#191970] dark:text-[#d4af37]">
              {t.eyebrow}
            </p>
            {/* Title with "Beyond" on top and "Work" on bottom */}
            <h1
              className="font-serif text-[clamp(4.5rem,13vw,10rem)] font-bold tracking-[-0.06em] leading-[0.82] text-neutral-950 dark:text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="block">{t.titleTop}</span>
              <span className="block">{t.titleBottom}</span>
            </h1>
          </div>
          <div className="border-l-2 border-neutral-200 pl-6 dark:border-neutral-800">
            <p className="text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
              {t.intro}
            </p>
          </div>
        </div>

        {/* Real Data Strip below Beyond Work Heading */}
        <div className="mt-12 grid grid-cols-2 gap-6 border-t border-neutral-200/80 pt-8 sm:grid-cols-4 sm:gap-8 dark:border-neutral-800">
          {statsItems.map((item, i) => (
            <div key={i}>
              <div
                className="font-serif text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl dark:text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {item.value}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Horizontal Editorial Rows with Smooth Cursor-Following Image Hover Reveal */}
      <HobbiesPursuitList
        pursuits={pursuits}
        exploreLabel={t.explore}
        sectionLabel={t.sectionLabel}
      />

      {/* Clean Footer */}
      <footer className="mx-auto flex max-w-7xl items-center justify-between border-t border-neutral-200 px-6 py-12 text-xs text-neutral-500 sm:px-10 dark:border-neutral-800 dark:text-neutral-400">
        <Link
          href={basePath || '/'}
          className="font-medium text-neutral-700 transition-colors hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
        >
          ← {t.backHome}
        </Link>
        <span>
          {t.footerStudio} · {t.footerYear}
        </span>
      </footer>
    </main>
  );
}
