import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { cn } from '../../lib/utils';
import { BrandLogo } from '../shared/BrandLogo';
import { LanguageSelector } from '../shared/LanguageSelector';
import { Button } from '../ui/button';
import { Container } from './Container';

export function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const links = [
    { label: t('nav.home'), href: '#inicio' },
    { label: t('nav.trade'), href: '#negociar' },
    { label: t('nav.quote'), href: '#cotacao' },
    { label: t('nav.about'), href: '#sobre' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <a href="#inicio" className="flex items-center gap-3">
          <BrandLogo className="h-9 sm:h-10" />
          <span className="sr-only">{t('brand')}</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSelector />
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">{t('nav.login')}</Link>
          </Button>
          <a href="#registro">
            <Button size="sm">{t('nav.start')}</Button>
          </a>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSelector />
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition hover:text-foreground"
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="text-lg">≡</span>
          </button>
        </div>
      </Container>
      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            className={cn('border-t border-border/60 bg-background/95 shadow-sm lg:hidden')}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Container className="flex flex-col gap-4 overflow-hidden py-6">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <a href="#registro" onClick={() => setOpen(false)}>
                <Button className="w-full" size="lg">
                  {t('nav.start')}
                </Button>
              </a>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
