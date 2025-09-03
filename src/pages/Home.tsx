import { HeroSection } from '@/components/HeroSection';
import { SearchBar } from '@/components/SearchBar';
import { PropertyCard } from '@/components/PropertyCard';
import { MiniFeaturedCarousel } from '@/components/MiniFeaturedCarousel';
import { MiniLatestCarousel } from '@/components/MiniLatestCarousel'; // Import the new component
import { RecentlyViewedProperties } from '@/components/RecentlyViewedProperties';
import { Testimonials } from '@/components/Testimonials';
import { MarketInsights } from '@/components/MarketInsights';
import { MarketData } from '@/components/MarketData';
import { CallToAction } from '@/components/CallToAction';
import { FAQ } from '@/components/FAQ';
import { ContactUs } from '@/components/ContactUs';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <SearchBar />
          <section className="my-8">
            <MiniFeaturedCarousel />
          </section>
          <section className="my-8">
            <MiniLatestCarousel /> {/* Using the new MiniLatestCarousel */}
          </section>
          <section className="my-8">
            <RecentlyViewedProperties />
          </section>
          <section className="my-8">
            <MarketInsights />
          </section>
          <section className="my-8">
            <MarketData />
          </section>
          <section className="my-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Explore Our Properties</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discover a wide range of properties tailored to your needs.
            </p>
            <Link to="/properties">
              <Button size="lg">View All Properties</Button>
            </Link>
          </section>
          <section className="my-8">
            <Testimonials />
          </section>
          <section className="my-8">
            <FAQ />
          </section>
          <section className="my-8">
            <CallToAction />
          </section>
          <section className="my-8">
            <ContactUs />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;