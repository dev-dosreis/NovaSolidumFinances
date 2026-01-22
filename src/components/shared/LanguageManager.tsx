import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Component to manage HTML lang attribute and document direction
 * Updates based on current i18n language
 */
export function LanguageManager() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = i18n.language.split('-')[0];

    // Update HTML lang attribute
    document.documentElement.lang = currentLang;

    // Set direction (RTL for Arabic, Hebrew, etc. - future support)
    document.documentElement.dir = 'ltr';

    // Update meta tags for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    const ogLocale = document.querySelector('meta[property="og:locale"]');

    if (metaDescription) {
      const descriptions = {
        pt: 'Somos a ponte entre o real e o digital. Transformando ativos digitais em soluções reais para o seu dia a dia.',
        es: 'Somos el puente entre lo real y lo digital. Transformando activos digitales en soluciones reales para tu día a día.',
        en: 'We are the bridge between real and digital. Transforming digital assets into real solutions for your daily life.',
      };
      metaDescription.setAttribute('content', descriptions[currentLang as keyof typeof descriptions] || descriptions.en);
    }

    if (ogLocale) {
      const locales = {
        pt: 'pt_BR',
        es: 'es_ES',
        en: 'en_US',
      };
      ogLocale.setAttribute('content', locales[currentLang as keyof typeof locales] || 'en_US');
    }
  }, [i18n.language]);

  return null;
}
