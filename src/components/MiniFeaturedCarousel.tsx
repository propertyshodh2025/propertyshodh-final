import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslatableText } from '@/components/TranslatableText';
import { formatINRShort } from '@/lib/locale';
import { translateEnum } from '@/lib/staticTranslations';
import { Badge } from '@/components/ui/badge'; // Import Badge component

interface MiniProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  images?: string[] | null;
  created_at: string;
  is_featured?: boolean; // Add is_featured to the interface
  featured_at?: string; // Add featured_at to the interface
}

export const MiniFeaturedCarousel: React.FC = () => {
  const [items, setItems] = useState<MiniProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [duration, setDuration] = useState<number>(20); // fallback/unused with JS ticker
  const offsetRef = React.useRef(0);
  const singleWidthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const pausedRef = React.useRef(false);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => { // Renamed function to reflect its purpose
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id,title,price,location,images,created_at,is_featured,featured_at') // Select is_featured and featured_at
          .eq('approval_status', 'approved')
          .eq('listing_status', 'active')
          .eq('is_featured', true) // Filter for featured properties
          .order('featured_at', { ascending: false }) // Order by featured_at for featured properties
          .limit(12);
        if (error) throw error;
        if (isMounted) {
          const unique = Array.from(new Map(((data as any) || []).map((d: any) => [d.id, d])).values());
          setItems(unique as MiniProperty[]);
        }
      } catch (e) {
        console.error('Failed to load featured properties', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFeatured(); // Call the updated fetch function
    return () => {
      isMounted = false;
    };
  }, []);

  const displayItems = useMemo(() => {
    const unique = Array.from(new Map(items.map((d) => [d.id, d])).values());
    return unique;
  }, [items]);

  // Measure content width to set smooth marquee duration
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => {
      const totalWidth = el.scrollWidth; // width of two copies combined
      const half = totalWidth / 2; // single set width
      singleWidthRef.current = half; // store for JS ticker loop
      const pxPerSecond = 120; // control speed (fallback for CSS animation)
      const d = Math.max(half / pxPerSecond, 10);
      setDuration(d);
    };

    measure();

    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(() => measure());
      ro.observe(el);
    } catch {}

    const onResize = () => measure();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
    };
  }, [displayItems]);

  // JS-driven continuous ticker for perfect seamless loop
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let last = performance.now();
    const speed = 90; // Increased speed for larger cards
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!pausedRef.current && !mql.matches) {
        let offset = offsetRef.current - speed * dt;
        const w = singleWidthRef.current || el.scrollWidth / 2;
        if (w > 0) {
          while (offset <= -w) offset += w; // wrap seamlessly
        }
        offsetRef.current = offset;
        el.style.transform = `translateX(${offset}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [displayItems]);

  if (loading || items.length === 0) return null;

   return (
    <section aria-label="Featured properties" className="w-full mt-6 sm:mt-8 mb-0 -mb-8 sm:-mb-16">
      <div className="max-w-5xl mx-auto relative py-0">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 sm:h-14 rounded-full bg-muted/40" />
        
        
        <div className="relative z-10 ticker overflow-hidden" onMouseEnter={() => (pausedRef.current = true)} onMouseLeave={() => (pausedRef.current = false)}>
          <style>{`
            @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
            @media (prefers-reduced-motion: reduce) { .marquee { animation: none !important; transform: translateX(0) !important; } }
            .ticker:hover .marquee { animation-play-state: paused; }
          `}</style>
          <div
            ref={trackRef}
            className="marquee flex flex-nowrap items-stretch gap-1 will-change-transform"
            style={{ transform: 'translateX(0)' }}
          >
            {[...displayItems, ...displayItems].map((p, idx) => {
              const isClone = idx >= displayItems.length;
              return (
                <div
                  key={`${p.id}-${idx}`}
                  className="flex-none shrink-0 w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] xl:w-[260px]" // Increased width
                  aria-hidden={isClone}
                >
                  <article
                    role="button"
                    tabIndex={isClone ? -1 : 0}
                    onClick={() => navigate(`/property/${p.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && !isClone && navigate(`/property/${p.id}`)}
                    className="h-full cursor-pointer select-none rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden rounded-t-lg bg-muted">
                      {p.images && p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt={`${p.title} property image`}
                          loading="lazy"
                          className="block h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px]">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-0.5 sm:p-1 space-y-0.5">
                      <h3 className="text-[9px] sm:text-[10px] font-semibold line-clamp-1"><TranslatableText text={p.title} context="property.title" /></h3>
                      <p className="text-[8px] sm:text-[9px] text-muted-foreground line-clamp-1">{translateEnum(p.location, language)}</p>
                      <p className="text-[11px] sm:text-[12px] font-semibold">{formatINRShort(p.price, language)}</p>
                    </div>
                    {p.is_featured && (
                      <Badge 
                        variant="default" 
                        className="absolute top-2 right-2 bg-yellow-500/80 backdrop-blur-sm text-white"
                      >
                        Featured
                      </Badge>
                    )}
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <link rel="canonical" href="/" />
    </section>
  );
};

export default MiniFeaturedCarousel;