"use client";

import * as React from "react";
import Image from "next/image";
import { motion, type Transition } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export interface PerspectiveCarouselItem {
  src?: string;
  initials?: string;
  title: string;
  subtitle?: string;
  alt?: string;
}

export interface PerspectiveCarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: PerspectiveCarouselItem[];
  activeIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  loop?: boolean;
  slideWidth?: number;
  rotationStep?: number;
  inactiveScale?: number;
  transition?: Transition;
  showControls?: boolean;
  showDots?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
}

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  bounce: 0.14,
  duration: 0.9,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// styled-jsx only auto-scopes plain DOM tags — it skips motion.div and
// next/image's <Image>, so their layout rules live as inline styles instead
// of in the <style jsx> block below (see perspective-carousel "corrupted
// layout" incident: those selectors silently never matched).
const trackStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "max-content",
};

const slideBaseStyle: React.CSSProperties = {
  display: "flex",
  width: "100%",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  willChange: "transform",
  transformStyle: "preserve-3d",
};

const imageStyle: React.CSSProperties = {
  borderRadius: "var(--radius-card, 16px)",
  objectFit: "cover",
  boxShadow: "var(--shadow-panel, 0 10px 30px rgba(0, 0, 0, 0.35))",
  userSelect: "none",
};

const labelStyle: React.CSSProperties = { textAlign: "center" };

export function PerspectiveCarousel({
  items,
  activeIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  loop = false,
  slideWidth = 200,
  rotationStep = 60,
  inactiveScale = 0.85,
  transition = DEFAULT_TRANSITION,
  showControls = true,
  showDots = true,
  autoplay = false,
  autoplayInterval = 4500,
  className,
  onKeyDown,
  tabIndex,
  ...props
}: PerspectiveCarouselProps) {
  const maxIndex = Math.max(0, items.length - 1);
  const [uncontrolledIndex, setUncontrolledIndex] = React.useState(() =>
    clamp(defaultActiveIndex, 0, maxIndex)
  );
  const currentIndex = clamp(activeIndex ?? uncontrolledIndex, 0, maxIndex);
  const safeSlideWidth = Math.max(96, slideWidth);
  const safeInactiveScale = clamp(inactiveScale, 0.5, 1);

  const currentIndexRef = React.useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  const autoplayIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const selectSlide = React.useCallback(
    (nextIndex: number) => {
      if (!items.length) return;

      const resolvedIndex = loop
        ? (nextIndex + items.length) % items.length
        : clamp(nextIndex, 0, maxIndex);

      if (activeIndex === undefined) {
        setUncontrolledIndex(resolvedIndex);
      }

      onActiveIndexChange?.(resolvedIndex);
    },
    [activeIndex, items.length, loop, maxIndex, onActiveIndexChange]
  );

  // Autoplay always wraps around, independent of the `loop` boundary
  // behaviour used for manual/keyboard navigation.
  React.useEffect(() => {
    if (!autoplay || items.length <= 1) return;
    autoplayIntervalRef.current = setInterval(() => {
      selectSlide((currentIndexRef.current + 1) % items.length);
    }, autoplayInterval);
    return () => {
      if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
    };
  }, [autoplay, autoplayInterval, items.length, selectSlide]);

  // Manual navigation (click/keyboard) stops autoplay so it can't land a
  // tick mid-interaction and silently skip a slide.
  const selectSlideManual = React.useCallback(
    (nextIndex: number) => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
      selectSlide(nextIndex);
    },
    [selectSlide]
  );

  if (!items.length) {
    return null;
  }

  const isPreviousDisabled = !loop && currentIndex === 0;
  const isNextDisabled = !loop && currentIndex === maxIndex;
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectSlideManual(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectSlideManual(currentIndex + 1);
    }
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Perspective image carousel"
      tabIndex={tabIndex ?? 0}
      onKeyDown={handleKeyDown}
      className={`pcarousel ${className ?? ""}`}
      {...props}
    >
      <div className="pcarousel-viewport">
        <div className="pcarousel-center">
          <motion.div
            style={trackStyle}
            animate={{ x: -(currentIndex * safeSlideWidth + safeSlideWidth / 2) }}
            transition={transition}
          >
            {items.map((item, index) => {
              const isActive = currentIndex === index;
              return (
                <div
                  key={`${item.title}-${index}`}
                  className="pcarousel-slot"
                  style={{ width: safeSlideWidth }}
                >
                  <motion.div
                    style={slideBaseStyle}
                    animate={{
                      rotateY: (currentIndex - index) * rotationStep,
                      scale: isActive ? 1 : safeInactiveScale,
                    }}
                    transition={transition}
                  >
                    <button
                      type="button"
                      aria-label={`Show ${item.title}`}
                      aria-current={isActive ? "true" : undefined}
                      className="pcarousel-frame"
                      onClick={() => selectSlideManual(index)}
                    >
                      {item.src ? (
                        <Image
                          src={item.src}
                          alt={item.alt ?? item.title}
                          fill
                          draggable={false}
                          sizes="(max-width: 768px) 45vw, 260px"
                          style={imageStyle}
                        />
                      ) : (
                        <div className="pcarousel-initials" style={imageStyle} aria-hidden="true">
                          {item.initials ?? item.title.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </button>

                    <motion.div
                      style={labelStyle}
                      animate={{
                        filter: isActive ? "blur(0px)" : "blur(2px)",
                        opacity: isActive ? 1 : 0,
                      }}
                      transition={transition}
                    >
                      <p className="pcarousel-title">{item.title}</p>
                      {item.subtitle && <p className="pcarousel-subtitle">{item.subtitle}</p>}
                    </motion.div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {showControls && (
        <div className="pcarousel-controls glass-panel">
          <button
            type="button"
            aria-label="Show previous slide"
            disabled={isPreviousDisabled}
            className="pcarousel-arrow"
            onClick={() => selectSlideManual(currentIndex - 1)}
          >
            <FaChevronLeft size={14} />
          </button>

          {showDots && (
            <div className="pcarousel-dots">
              {items.map((item, index) => (
                <button
                  key={`${item.title}-${index}`}
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${item.title}`}
                  aria-current={currentIndex === index ? "true" : undefined}
                  className={`pcarousel-dot ${currentIndex === index ? "is-active" : ""}`}
                  onClick={() => selectSlideManual(index)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            aria-label="Show next slide"
            disabled={isNextDisabled}
            className="pcarousel-arrow"
            onClick={() => selectSlideManual(currentIndex + 1)}
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      )}

      <style jsx>{`
        .pcarousel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          width: 100%;
          outline: none;
        }
        .pcarousel-viewport {
          position: relative;
          width: 100%;
          height: 356px;
          overflow: hidden;
          perspective: 1200px;
        }
        .pcarousel-center {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translateY(-50%);
        }
        .pcarousel-slot {
          flex-shrink: 0;
          perspective: 1200px;
        }
        .pcarousel-frame {
          position: relative;
          aspect-ratio: 3 / 4;
          width: 100%;
          cursor: pointer;
          padding: 0;
          border: none;
          background: none;
        }
        .pcarousel-initials {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-head, inherit);
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--text-primary, #f5f5f7);
          background: var(--accent, linear-gradient(135deg, #7c3aed, #06b6d4));
        }
        .pcarousel-title {
          margin: 0;
          font-family: var(--font-head, inherit);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary, #f5f5f7);
          white-space: nowrap;
        }
        .pcarousel-subtitle {
          margin: 2px 0 0;
          font-size: 0.78rem;
          color: var(--text-secondary, rgba(245, 245, 247, 0.65));
          white-space: nowrap;
        }
        .pcarousel-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 8px;
          border-radius: 999px;
        }
        .pcarousel-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--text-primary, #f5f5f7);
          cursor: pointer;
          transition: background-color 0.25s, opacity 0.25s;
        }
        .pcarousel-arrow:hover:not(:disabled) {
          background: var(--glass-fill-strong, rgba(255, 255, 255, 0.12));
        }
        .pcarousel-arrow:disabled {
          cursor: not-allowed;
          opacity: 0.35;
        }
        .pcarousel-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .pcarousel-dot {
          height: 8px;
          width: 8px;
          border-radius: 999px;
          border: none;
          background: var(--text-faint, rgba(245, 245, 247, 0.35));
          opacity: 0.5;
          cursor: pointer;
          padding: 0;
          transition: width 0.3s, opacity 0.3s, background 0.3s;
        }
        .pcarousel-dot.is-active {
          width: 26px;
          opacity: 1;
          background: var(--accent, linear-gradient(135deg, #7c3aed, #06b6d4));
        }
      `}</style>
    </div>
  );
}

export default PerspectiveCarousel;
