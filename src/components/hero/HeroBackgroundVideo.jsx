import { useEffect, useRef } from 'react';
import defaultHeroVideo from '../../assets/videos/hero-bg.mp4';

/**
 * Full-width background video component with dark/red translucent overlay
 */
export default function HeroBackgroundVideo({
  videoSrc = defaultHeroVideo,
  posterSrc = '/assets/hero.png',
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    // Ensure video plays reliably even on stricter mobile browsers
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented by browser policy; muted fallback is already set
        });
      }
    }
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
      {/* HTML5 Full-Bleed Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={posterSrc}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectFit: 'cover' }}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support HTML5 background video.
      </video>

      {/* Dark Translucent Gradient Overlay for High Contrast & Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/35 z-1" />

      {/* Subtle Red Ambient Brand Tint */}
      <div className="absolute inset-0 bg-gradient-to-tr from-red-950/40 via-transparent to-slate-950/20 z-2 mix-blend-multiply" />

      {/* Bottom Vignette for Smooth Transition */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent z-2" />
    </div>
  );
}
