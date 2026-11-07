import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Volume2, 
  VolumeX, 
  Sun, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { audioEngine } from '../utils/audio';
import { scrollToSection } from '../utils/navigation';

interface CinematicControlsProps {
  isZenMode: boolean;
  onToggleZenMode: () => void;
  lightingPreset: 'cinematic' | 'technical' | 'warm';
  onChangeLighting: (preset: 'cinematic' | 'technical' | 'warm') => void;
  activeSection: string;
}

export const CinematicControls: React.FC<CinematicControlsProps> = ({
  isZenMode,
  onToggleZenMode,
  lightingPreset,
  onChangeLighting,
  activeSection
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const chapters = [
    { id: 'hero', label: 'Monument' },
    { id: 'foundations', label: 'Class 9-10' },
    { id: 'senior-secondary', label: 'Class 11-12' },
    { id: 'neet', label: 'NEET' },
    { id: 'jee', label: 'JEE' },
    { id: 'library', label: 'Library' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'toppers', label: 'Toppers' },
    { id: 'testimonials', label: 'Stories' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleAudioToggle = () => {
    const status = audioEngine.toggle();
    setIsAudioPlaying(status);
  };

  const jumpTo = (id: string) => {
    scrollToSection(id);
  };

  // Keyboard shortcut 'H' to toggle dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h' && !['input', 'textarea', 'select'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-transform duration-500 ease-out flex flex-col items-center"
      style={{
        maxWidth: 'min(940px, 94vw)',
        transform: isCollapsed 
          ? 'translateX(-50%) translateY(calc(100% - 32px))' 
          : 'translateX(-50%) translateY(0)'
      }}
    >
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="px-4 py-1 rounded-t-lg bg-[#07111F]/90 hover:bg-[#101923] border-t border-x border-white/10 text-[11px] font-mono tracking-wider uppercase text-[#A9B3C1] hover:text-[#F7F7F4] flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors"
        title="Toggle HUD (Hotkey: H)"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-[#D5B06C]" />
            <span>Show 3D Controls</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-[#D5B06C]" />
            <span>Hide HUD [H]</span>
          </>
        )}
      </button>

      {/* Main Glass Control Dock */}
      <div className="w-full bg-[#07111F]/90 border border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Chapter Jumper */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full sm:max-w-none no-scrollbar">
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-[#D5B06C] mr-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Orbit:</span>
          </span>
          {chapters.map((ch) => {
            const isActive = activeSection === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => jumpTo(ch.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#D5B06C] text-[#07111F] font-semibold shadow-sm'
                    : 'text-[#A9B3C1] hover:text-[#F7F7F4] hover:bg-white/5'
                }`}
              >
                {ch.label}
              </button>
            );
          })}
        </div>

        {/* Right: Lighting, Audio & Cinema Mode */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          
          {/* Lighting Mode Selector */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => onChangeLighting('cinematic')}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                lightingPreset === 'cinematic' ? 'bg-[#D5B06C]/20 text-[#D5B06C]' : 'text-[#A9B3C1]'
              }`}
              title="Cinematic Lighting"
            >
              Gold
            </button>
            <button
              onClick={() => onChangeLighting('technical')}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                lightingPreset === 'technical' ? 'bg-[#76D9EF]/20 text-[#76D9EF]' : 'text-[#A9B3C1]'
              }`}
              title="Technical Lighting"
            >
              Cyan
            </button>
            <button
              onClick={() => onChangeLighting('warm')}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                lightingPreset === 'warm' ? 'bg-amber-500/20 text-amber-300' : 'text-[#A9B3C1]'
              }`}
              title="Warm Library Lighting"
            >
              Warm
            </button>
          </div>

          {/* Procedural Web Audio Ambient Sound Toggle */}
          <button
            onClick={handleAudioToggle}
            className={`p-2 rounded-lg border transition-colors flex items-center justify-center cursor-pointer ${
              isAudioPlaying 
                ? 'bg-[#D5B06C]/20 border-[#D5B06C]/40 text-[#D5B06C]' 
                : 'bg-white/5 border-white/10 text-[#A9B3C1] hover:text-[#F7F7F4]'
            }`}
            title={isAudioPlaying ? 'Mute Procedural Synth' : 'Enable Ambient Atmospheric Synth'}
          >
            {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Cinema / Zen View Toggle (Hides HTML overlays to view pure 3D) */}
          <button
            onClick={onToggleZenMode}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              isZenMode
                ? 'bg-[#76D9EF] text-[#07111F] border-[#76D9EF] font-semibold'
                : 'bg-white/5 border-white/10 text-[#F7F7F4] hover:bg-white/10'
            }`}
            title="Inspect 3D Environment without HTML overlays"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isZenMode ? 'Exit Cinema' : 'Cinema Mode'}</span>
          </button>

        </div>

      </div>
    </div>
  );
};
