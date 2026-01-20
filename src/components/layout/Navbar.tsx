import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { copy } from '../../content/copy';
import { cn } from '../../lib/utils';
import { BrandLogo } from '../shared/BrandLogo';
import { Button } from '../ui/button';
import { Container } from './Container';

const links = [
  { label: copy.nav.home, href: '#inicio' },
  { label: copy.nav.trade, href: '#negociar' },
  { label: copy.nav.quote, href: '#cotacao' },
  { label: copy.nav.about, href: '#sobre' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <a href="#inicio" className="flex items-center gap-3">
          <BrandLogo className="h-9 sm:h-10" />
          <span className="sr-only">{copy.brand}</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="outline" size="sm">
            {copy.nav.login}
          </Button>
          <a href="#registro">
            <Button size="sm">{copy.nav.start}</Button>
          </a>
        </div>
        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition hover:text-foreground lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="text-lg">≡</span>
        </button>
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
              <Button variant="outline" size="lg">
                {copy.nav.login}
              </Button>
              <a href="#registro" onClick={() => setOpen(false)}>
                <Button className="w-full" size="lg">
                  {copy.nav.start}
                </Button>
              </a>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
