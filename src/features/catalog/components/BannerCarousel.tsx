import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '../../../shared/types';

type Slide = Banner & { url: string; key: string };

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const slides = useMemo(
    () =>
      banners.flatMap((banner) =>
        (banner.imageUrls?.length
          ? banner.imageUrls
          : banner.imageUrl
            ? [banner.imageUrl]
            : []
        ).map((url, position) => ({
          ...banner,
          url,
          key: banner.id + '-' + position,
        }))
      ),
    [banners]
  );
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<Slide | null>(null);
  const position = slides.length ? index % slides.length : 0;
  const next = useCallback(
    (direction: number) => {
      if (slides.length < 2) return;
      setPrevious(slides[position]);
      setIndex((position + direction + slides.length) % slides.length);
    },
    [position, slides]
  );
  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      if (!document.hidden) next(1);
    }, 3500);
    return () => clearInterval(timer);
  }, [slides.length, next]);
  useEffect(() => {
    if (!previous) return;
    const timer = setTimeout(() => setPrevious(null), 1250);
    return () => clearTimeout(timer);
  }, [previous]);
  useEffect(() => {
    if (slides.length < 2) return;
    const preload = new Image();
    preload.src = slides[(position + 1) % slides.length].url;
  }, [slides, position]);
  if (!slides.length) return null;
  const slide = slides[position];
  return (
    <section
      className="banner-carousel"
      aria-roledescription="karusel"
      aria-label="Reklamat dhe ofertat"
    >
      {previous && <BannerSlide slide={previous} previous />}
      <BannerSlide key={slide.key} slide={slide} entering={!!previous} />
      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="carousel-arrow previous"
            onClick={() => next(-1)}
            aria-label="Reklama e mëparshme"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className="carousel-arrow next"
            onClick={() => next(1)}
            aria-label="Reklama e radhës"
          >
            <ChevronRight />
          </button>
        </>
      )}
    </section>
  );
}
function BannerSlide({
  slide,
  previous = false,
  entering = false,
}: {
  slide: Slide;
  previous?: boolean;
  entering?: boolean;
}) {
  return (
    <div
      className={
        'banner-slide' + (previous ? ' previous-slide' : entering ? ' entering-slide' : '')
      }
      aria-hidden={previous || undefined}
    >
      <img src={slide.url} alt={previous ? '' : slide.title} />
      <div className="banner-shade" />
      <div className="banner-caption">
        <span className="eyebrow">E VEÇANTË NË TRYEZË</span>
        <h2>{slide.title}</h2>
        <p>{slide.text}</p>
      </div>
    </div>
  );
}
