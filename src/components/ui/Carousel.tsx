
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselProps {
  children: React.ReactNode[];
  itemsPerView?: number;
  spacing?: number;
  className?: string;
  autoScroll?: boolean;
  autoScrollInterval?: number;
  showArrows?: boolean;
  showScrollbar?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  itemsPerView = 4,
  spacing = 16,
  className,
  autoScroll = false,
  autoScrollInterval = 5000,
  showArrows = true,
  showScrollbar = false,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const totalSlides = Math.max(0, children.length - (itemsPerView - 1));
  
  // Ensure we don't go beyond possible slides
  const maxSlide = Math.max(0, children.length - itemsPerView);
  
  // Handle autoscroll
  useEffect(() => {
    if (!autoScroll || isDragging) return;
    
    const interval = setInterval(() => {
      if (currentSlide >= maxSlide) {
        setCurrentSlide(0);
      } else {
        setCurrentSlide(prev => prev + 1);
      }
    }, autoScrollInterval);
    
    return () => clearInterval(interval);
  }, [currentSlide, autoScroll, autoScrollInterval, maxSlide, isDragging]);
  
  // Handle sliding logic
  useEffect(() => {
    if (!carouselRef.current) return;
    
    const itemWidth = carouselRef.current.offsetWidth / itemsPerView;
    carouselRef.current.scrollTo({
      left: currentSlide * (itemWidth + spacing),
      behavior: 'smooth'
    });
  }, [currentSlide, itemsPerView, spacing]);
  
  const handlePrev = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };
  
  const handleNext = () => {
    setCurrentSlide(prev => Math.min(maxSlide, prev + 1));
  };
  
  // Mouse drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk;
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    
    if (!carouselRef.current) return;
    
    const itemWidth = carouselRef.current.offsetWidth / itemsPerView;
    const newSlide = Math.round(carouselRef.current.scrollLeft / (itemWidth + spacing));
    setCurrentSlide(Math.max(0, Math.min(maxSlide, newSlide)));
  };
  
  // Touch functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const x = e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk;
    }
  };
  
  return (
    <div className={cn("carousel-container", className)}>
      {/* Left fade gradient */}
      <div className="fade-mask left-0" />
      
      {/* Right fade gradient */}
      <div className="fade-mask fade-mask-right" />
      
      {/* Left navigation button */}
      {showArrows && currentSlide > 0 && (
        <button 
          onClick={handlePrev} 
          className="nav-button left-2"
          aria-label="Previous"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      
      {/* Carousel content */}
      <div
        ref={carouselRef}
        className={cn(
          "flex overflow-x-hidden scroll-smooth gap-x-[--gap]",
          { "cursor-grab": !isDragging, "cursor-grabbing": isDragging }
        )}
        style={{ '--gap': `${spacing}px` } as React.CSSProperties}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {React.Children.map(children, (child, index) => (
          <div 
            className="flex-shrink-0 transition-transform duration-300 ease-out"
            style={{ 
              width: `calc((100% - (${itemsPerView - 1} * ${spacing}px)) / ${itemsPerView})`,
              transform: isDragging ? 'scale(0.98)' : 'scale(1)'
            }}
          >
            {child}
          </div>
        ))}
      </div>
      
      {/* Right navigation button */}
      {showArrows && currentSlide < maxSlide && (
        <button 
          onClick={handleNext} 
          className="nav-button right-2"
          aria-label="Next"
        >
          <ChevronRight size={20} />
        </button>
      )}
      
      {/* Scrollbar indicator */}
      {showScrollbar && totalSlides > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30 mx-4">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ 
              width: `${100 / totalSlides}%`,
              transform: `translateX(${currentSlide * 100}%)`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Carousel;
