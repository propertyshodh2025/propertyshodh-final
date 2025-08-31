import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
// Carousel removed: using continuous marquee scroll
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslatableText } from '@/components/TranslatableText';
import { formatINRShort } from '@/lib/locale';
import { translateEnum } from '@/lib/staticTranslations';

interface MiniProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  images?: string[] | null;
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

  const nowIso = useMemo(() => new Date().toISOString(), []);

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id,title,price,location,images,featured_at,featured_until')
          .eq('is_featured', true)
          .eq('listing_status', 'Active')
          .or(`featured_until.is.null,featured_until.gt.${nowIso}`)
          .order('featured_at', { ascending: false })
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
    fetchFeatured();
    return () => {
      isMounted = false;
    };
  }, [nowIso]);

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
    const speed = 60; // px/s tuned for smaller cards
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
                  className="flex-none shrink-0 w-[130px] sm:w-[150px] md:w-[170px] lg:w-[190px] xl:w-[210px]"
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
                          alt={`${p.title} featured property image`}
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
