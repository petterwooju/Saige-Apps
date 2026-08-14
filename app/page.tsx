"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import appsData from "@/content/apps.json";

type Locale = "zh" | "en" | "ko";
type LocalizedText = Record<Locale, string>;

type AppEntry = {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  coverAlt: LocalizedText;
  url: string;
  cover: string;
  status: "stable" | "beta" | "experimental" | "maintenance" | "archived";
  category: string;
  tags: Record<Locale, string[]>;
  accent: { primary: string; soft: string };
  publishedAt: string;
  hidden: boolean;
};

const copy = {
  zh: {
    eyebrow: "SAIGE TOOL COLLECTION",
    title: "好用的工具，\n都在这里。",
    intro:
      "SaigeAPPs 收集我为 SaigeVision 工作流制作的轻量网页应用。无需安装，打开即可使用。",
    browse: "查看所有应用",
    collection: "持续生长的工具集合",
    tools: "在线工具",
    languages: "界面语言",
    since: "开始于",
    sectionEyebrow: "AVAILABLE NOW",
    sectionTitle: "所有应用",
    sectionIntro: "每个工具都解决一个具体问题。点击卡片即可在新窗口中打开。",
    open: "打开应用",
    newWindow: "在新窗口打开",
    comingEyebrow: "WHAT’S NEXT",
    comingTitle: "更多工具，正在路上。",
    comingText: "新的网页应用会自动加入这里，让 SaigeAPPs 和你的工作流一起成长。",
    footer: "一次做好一个实用工具。",
    status: {
      stable: "正式",
      beta: "Beta",
      experimental: "实验性",
      maintenance: "维护中",
      archived: "已归档",
    },
  },
  en: {
    eyebrow: "SAIGE TOOL COLLECTION",
    title: "Useful tools,\nall in one place.",
    intro:
      "SaigeAPPs is a growing collection of lightweight web apps made for smoother SaigeVision workflows. No installation required.",
    browse: "Browse all apps",
    collection: "A growing tool collection",
    tools: "Live tools",
    languages: "Interface languages",
    since: "Started",
    sectionEyebrow: "AVAILABLE NOW",
    sectionTitle: "All apps",
    sectionIntro: "Each tool solves one focused problem. Open any card in a new tab to get started.",
    open: "Open app",
    newWindow: "Opens in a new tab",
    comingEyebrow: "WHAT’S NEXT",
    comingTitle: "More useful tools are on the way.",
    comingText: "New web apps will join this collection as SaigeAPPs grows alongside your workflow.",
    footer: "One useful tool at a time.",
    status: {
      stable: "Stable",
      beta: "Beta",
      experimental: "Experimental",
      maintenance: "Maintenance",
      archived: "Archived",
    },
  },
  ko: {
    eyebrow: "SAIGE TOOL COLLECTION",
    title: "유용한 도구를,\n한곳에 모았습니다.",
    intro:
      "SaigeAPPs는 SaigeVision 작업 흐름을 더 가볍게 만드는 웹 도구 모음입니다. 설치 없이 바로 사용할 수 있습니다.",
    browse: "모든 앱 보기",
    collection: "계속 성장하는 도구 모음",
    tools: "사용 가능한 도구",
    languages: "지원 언어",
    since: "시작",
    sectionEyebrow: "AVAILABLE NOW",
    sectionTitle: "모든 앱",
    sectionIntro: "각 도구는 하나의 명확한 문제를 해결합니다. 카드를 눌러 새 탭에서 시작하세요.",
    open: "앱 열기",
    newWindow: "새 탭에서 열기",
    comingEyebrow: "WHAT’S NEXT",
    comingTitle: "더 많은 도구를 준비하고 있습니다.",
    comingText: "새로운 웹 앱이 추가되며 SaigeAPPs도 작업 흐름과 함께 계속 성장합니다.",
    footer: "유용한 도구를 하나씩.",
    status: {
      stable: "정식",
      beta: "Beta",
      experimental: "실험",
      maintenance: "점검 중",
      archived: "보관됨",
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

const localeLabels: Record<Locale, string> = {
  zh: "中文",
  en: "EN",
  ko: "한국어",
};

const htmlLang: Record<Locale, string> = {
  zh: "zh-CN",
  en: "en",
  ko: "ko",
};

export default function Home() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [localeReady, setLocaleReady] = useState(false);
  const text = copy[locale];
  const apps = useMemo(
    () => (appsData as AppEntry[]).filter((app) => !app.hidden),
    [],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("saigeapps-locale");
    if (saved === "zh" || saved === "en" || saved === "ko") {
      setLocale(saved);
    } else if (window.navigator.language.toLowerCase().startsWith("ko")) {
      setLocale("ko");
    } else if (window.navigator.language.toLowerCase().startsWith("en")) {
      setLocale("en");
    }
    setLocaleReady(true);
  }, []);

  useEffect(() => {
    if (!localeReady) return;
    document.documentElement.lang = htmlLang[locale];
    window.localStorage.setItem("saigeapps-locale", locale);
  }, [locale, localeReady]);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#apps">
        {text.browse}
      </a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SaigeAPPs home">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span className="brand-name">SaigeAPPs</span>
        </a>

        <div className="header-actions">
          <span className="app-count" aria-label={`${apps.length} applications`}>
            {String(apps.length).padStart(2, "0")} APPS
          </span>
          <div className="language-switcher" role="group" aria-label={text.languages}>
            {(Object.keys(localeLabels) as Locale[]).map((item) => (
              <button
                className="language-button"
                type="button"
                key={item}
                aria-pressed={locale === item}
                onClick={() => setLocale(item)}
              >
                {localeLabels[item]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span aria-hidden="true" />
              {text.eyebrow}
            </p>
            <h1 id="hero-title">
              {text.title.split("\n").map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className="hero-intro">{text.intro}</p>
            <a className="primary-link" href="#apps">
              {text.browse}
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <aside className="hero-panel" aria-label={text.collection}>
            <div className="panel-topline">
              <span>SAIGE / APPS</span>
              <span className="live-dot">LIVE</span>
            </div>
            <div className="panel-number">{String(apps.length).padStart(2, "0")}</div>
            <p>{text.collection}</p>
            <dl className="panel-stats">
              <div>
                <dt>{text.tools}</dt>
                <dd>{apps.length}</dd>
              </div>
              <div>
                <dt>{text.languages}</dt>
                <dd>03</dd>
              </div>
              <div>
                <dt>{text.since}</dt>
                <dd>2026</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className="apps-section" id="apps" aria-labelledby="apps-title">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">02 / {text.sectionEyebrow}</p>
              <h2 id="apps-title">{text.sectionTitle}</h2>
            </div>
            <p>{text.sectionIntro}</p>
          </div>

          <div className="app-grid">
            {apps.map((app, index) => {
              const cardStyle = {
                "--accent-from": app.accent.primary,
                "--accent-to": app.accent.primary,
                "--accent-soft": app.accent.soft,
              } as CSSProperties;

              return (
                <article className="app-card" style={cardStyle} key={app.slug}>
                  <a
                    className="app-link"
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${app.name[locale]} — ${text.newWindow}`}
                  >
                    <div className="browser-frame">
                      <div className="browser-bar" aria-hidden="true">
                        <span className="browser-dots"><i /><i /><i /></span>
                        <span className="browser-address">
                          {new URL(app.url).hostname.replace("-beta", "")}
                        </span>
                        <span className="status-pill">{text.status[app.status]}</span>
                      </div>
                      <div className="screenshot-wrap">
                        {/* Static screenshots intentionally use a native image for predictable cross-origin rendering. */}
                        <img
                          src={app.cover}
                          alt={app.coverAlt[locale]}
                          width="1265"
                          height="712"
                          loading={index === 0 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      </div>
                    </div>

                    <div className="card-content">
                      <div className="card-meta">
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <span>{app.category === "saigevision" ? "SaigeVision" : app.category}</span>
                      </div>
                      <div className="card-title-row">
                        <h3>{app.name[locale]}</h3>
                        <span className="open-icon" aria-hidden="true">↗</span>
                      </div>
                      <p className="card-description">{app.description[locale]}</p>
                      <div className="card-footer">
                        <ul className="tag-list" aria-label="Tags">
                          {app.tags[locale].slice(0, 3).map((tag) => (
                            <li key={tag}>{tag}</li>
                          ))}
                        </ul>
                        <span className="open-label">{text.open}</span>
                      </div>
                    </div>
                  </a>
                </article>
              );
            })}
          </div>
        </section>

        <section className="coming-section" aria-labelledby="coming-title">
          <div className="coming-index" aria-hidden="true">03</div>
          <div>
            <p className="section-eyebrow">{text.comingEyebrow}</p>
            <h2 id="coming-title">{text.comingTitle}</h2>
            <p>{text.comingText}</p>
          </div>
          <div className="coming-symbol" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span className="brand-name">SaigeAPPs</span>
        </div>
        <p>{text.footer}</p>
        <span>© 2026</span>
      </footer>
    </div>
  );
}
