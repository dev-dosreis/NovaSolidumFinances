import { copy } from '../../content/copy';
import { BrandMark } from '../shared/BrandMark';
import { Container } from './Container';

export function Footer() {
  const brandWords = copy.brand.split(' ');
  const brandPrimary = brandWords.slice(0, 2).join(' ');
  const brandSecondary = brandWords.slice(2).join(' ');

  return (
    <footer className="border-t border-border/70 bg-white">
      <Container className="space-y-10 py-12">
        <div className="flex flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground md:flex-row">
          <span>{copy.footer.rights}</span>
          <span className="hidden md:inline">|</span>
          <a href="#" className="transition hover:text-foreground">
            {copy.footer.terms}
          </a>
          <span className="hidden md:inline">|</span>
          <a href="#" className="transition hover:text-foreground">
            {copy.footer.compliance}
          </a>
          <span className="hidden md:inline">|</span>
          <a href="#" className="transition hover:text-foreground">
            {copy.footer.support}
          </a>
        </div>
        <p className="mx-auto max-w-4xl text-xs leading-relaxed text-muted-foreground">
          {copy.footer.disclaimer}
        </p>
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-3">
            <BrandMark className="h-9 w-9" />
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-[0.28em] text-brand-navy font-display">
                {brandPrimary}
              </p>
              <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground font-display">
                {brandSecondary}
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/5511914998141"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground transition hover:text-primary"
          >
            {copy.footer.credit}
          </a>
        </div>
      </Container>
    </footer>
  );
}
