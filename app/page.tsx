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
  accent: { primary: string; soft: string };
  hidden: boolean;
};

const copy = {
  zh: {
    skip: "跳到应用",
    languages: "界面语言",
    sectionTitle: "应用",
    sectionIntro: "为 SaigeVision 工作流制作的轻量网页工具。",
    open: "打开",
    newWindow: "在新窗口打开",
    status: {
      stable: "正式",
      beta: "Beta",
      experimental: "实验性",
      maintenance: "维护中",
      archived: "已归档",
    },
  },
  en: {
    skip: "Skip to apps",
    languages: "Interface language",
    sectionTitle: "Apps",
    sectionIntro: "Lightweight web tools for SaigeVision workflows.",
    open: "Open",
    newWindow: "Opens in a new tab",
    status: {
      stable: "Stable",
      beta: "Beta",
      experimental: "Experimental",
      maintenance: "Maintenance",
      archived: "Archived",
    },
  },
  ko: {
    skip: "앱으로 이동",
    languages: "언어 선택",
    sectionTitle: "앱",
    sectionIntro: "SaigeVision 워크플로를 위한 가벼운 웹 도구입니다.",
    open: "열기",
    newWindow: "새 탭에서 열기",
    status: {
      stable: "정식",
      beta: "Beta",
      experimental: "실험",
      maintenance: "점검 중",
      archived: "보관됨",
    },
  },
} as const;

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
        {text.skip}
      </a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="SaigeAPPs home">
          <span className="brand-mark" aria-hidden="true">S</span>
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
        <section className="apps-section" id="apps" aria-labelledby="apps-title">
          <div className="section-heading">
            <h1 id="apps-title">{text.sectionTitle}</h1>
            <p>{text.sectionIntro}</p>
          </div>

          <div className="app-grid">
            {apps.map((app, index) => {
              const cardStyle = {
                "--accent": app.accent.primary,
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
                        <span className="status-pill">{text.status[app.status]}</span>
                      </div>
                      <div className="screenshot-wrap">
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
                      <div className="card-title-row">
                        <h2>{app.name[locale]}</h2>
                        <span className="open-label" aria-hidden="true">
                          {text.open} ↗
                        </span>
                      </div>
                      <p className="card-description">{app.description[locale]}</p>
                    </div>
                  </a>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span className="brand-name">SaigeAPPs</span>
        </div>
        <span>© 2026</span>
      </footer>
    </div>
  );
}
