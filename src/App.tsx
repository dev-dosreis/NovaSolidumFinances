import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { Divider } from './components/shared/Divider';
import { AboutSection } from './components/sections/AboutSection';
import { CTASection } from './components/sections/CTASection';
import { CotacaoSection } from './components/sections/CotacaoSection';
import { FeatureGrid } from './components/sections/FeatureGrid';
import { Hero } from './components/sections/Hero';
import { RegisterSection } from './components/sections/RegisterSection';
import { Steps } from './components/sections/Steps';
import { TradingSection } from './components/sections/TradingSection';
import { useCryptoPrices } from './hooks/useCryptoPrices';

function App() {
  const { prices, status, lastUpdated } = useCryptoPrices();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero prices={prices} status={status} lastUpdated={lastUpdated} />
        <CotacaoSection prices={prices} status={status} lastUpdated={lastUpdated} />
        <Steps />
        <FeatureGrid />
        <TradingSection />
        <RegisterSection />
        <AboutSection />
        <Divider />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
