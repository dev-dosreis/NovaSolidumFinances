import { useTranslation } from 'react-i18next';

export function useContent() {
  const { t } = useTranslation();

  return {
    brand: t('brand'),
    nav: {
      home: t('nav.home'),
      trade: t('nav.trade'),
      quote: t('nav.quote'),
      about: t('nav.about'),
      start: t('nav.start'),
      login: t('nav.login'),
    },
    hero: {
      title: t('hero.title'),
      subtitle: t('hero.subtitle'),
    },
    liveTicker: {
      pair: t('liveTicker.pair'),
      status: t('liveTicker.status'),
      bullet: t('liveTicker.bullet'),
    },
    trading: {
      title: t('trading.title'),
      description: t('trading.description'),
      ctaTitle: t('trading.ctaTitle'),
      ctaDescription: t('trading.ctaDescription'),
      ctaButton: t('trading.ctaButton'),
      features: [
        {
          title: t('trading.features.0.title'),
          description: t('trading.features.0.description'),
        },
        {
          title: t('trading.features.1.title'),
          description: t('trading.features.1.description'),
        },
        {
          title: t('trading.features.2.title'),
          description: t('trading.features.2.description'),
        },
        {
          title: t('trading.features.3.title'),
          description: t('trading.features.3.description'),
        },
      ],
    },
    about: {
      title: t('about.title'),
      quote: t('about.quote'),
      text: t('about.text'),
      highlight: t('about.highlight'),
      mission: {
        title: t('about.mission.title'),
        description: t('about.mission.description'),
      },
      vision: {
        title: t('about.vision.title'),
        description: t('about.vision.description'),
      },
      values: {
        title: t('about.values.title'),
        list: [
          t('about.values.list.0'),
          t('about.values.list.1'),
          t('about.values.list.2'),
          t('about.values.list.3'),
          t('about.values.list.4'),
          t('about.values.list.5'),
        ],
      },
      history: {
        title: t('about.history.title'),
        text: t('about.history.text'),
        quote: t('about.history.quote'),
      },
      whatWeDo: {
        title: t('about.whatWeDo.title'),
        quote: t('about.whatWeDo.quote'),
        pfTitle: t('about.whatWeDo.pfTitle'),
        pfList: [
          t('about.whatWeDo.pfList.0'),
          t('about.whatWeDo.pfList.1'),
          t('about.whatWeDo.pfList.2'),
          t('about.whatWeDo.pfList.3'),
          t('about.whatWeDo.pfList.4'),
        ],
        pjTitle: t('about.whatWeDo.pjTitle'),
        pjList: [
          t('about.whatWeDo.pjList.0'),
          t('about.whatWeDo.pjList.1'),
          t('about.whatWeDo.pjList.2'),
          t('about.whatWeDo.pjList.3'),
          t('about.whatWeDo.pjList.4'),
        ],
      },
      ecosystem: {
        title: t('about.ecosystem.title'),
        quote: t('about.ecosystem.quote'),
        text: t('about.ecosystem.text'),
        items: [
          {
            title: t('about.ecosystem.items.0.title'),
            description: t('about.ecosystem.items.0.description'),
          },
          {
            title: t('about.ecosystem.items.1.title'),
            description: t('about.ecosystem.items.1.description'),
          },
          {
            title: t('about.ecosystem.items.2.title'),
            description: t('about.ecosystem.items.2.description'),
          },
        ],
      },
      differentiators: {
        title: t('about.differentiators.title'),
        quote: t('about.differentiators.quote'),
        items: [
          {
            title: t('about.differentiators.items.0.title'),
            description: t('about.differentiators.items.0.description'),
          },
          {
            title: t('about.differentiators.items.1.title'),
            description: t('about.differentiators.items.1.description'),
          },
          {
            title: t('about.differentiators.items.2.title'),
            description: t('about.differentiators.items.2.description'),
          },
          {
            title: t('about.differentiators.items.3.title'),
            description: t('about.differentiators.items.3.description'),
          },
        ],
      },
    },
    finalCta: {
      title: t('finalCta.title'),
      button: t('finalCta.button'),
    },
    footer: {
      rights: t('footer.rights'),
      terms: t('footer.terms'),
      compliance: t('footer.compliance'),
      support: t('footer.support'),
      disclaimer: t('footer.disclaimer'),
      credit: t('footer.credit'),
    },
    crypto: [
      { name: 'Bitcoin', symbol: 'BTC', icon: '/assets/coins/btc.png' },
      { name: 'Ethereum', symbol: 'ETH', icon: '/assets/coins/eth.png' },
      { name: 'Solana', symbol: 'SOL', icon: '/assets/coins/sol.png' },
      { name: 'BNB', symbol: 'BNB', icon: '/assets/coins/bnb.png' },
      { name: 'Tether', symbol: 'USDT', icon: '/assets/coins/usdt.png' },
      { name: 'USD Coin', symbol: 'USDC', icon: '/assets/coins/usdc.png' },
    ],
  };
}
