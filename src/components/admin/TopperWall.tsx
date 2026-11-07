import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { AdminTopper } from './types';
import { Trophy, Star, Sparkles } from 'lucide-react';

/**
 * TopperWall.tsx
 * Example public-facing component that subscribes live to the `toppers` collection
 * where `isVisible == true` and displays students ordered by their defined priority `order`.
 */
export const TopperWall: React.FC = () => {
  const [toppers, setToppers] = useState<AdminTopper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Public query: only visible toppers, sorted by order ascending
    const q = query(
      collection(db, 'toppers'),
      where('isVisible', '==', true),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: AdminTopper[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as AdminTopper);
      });
      setToppers(fetched);
      setIsLoading(false);
    }, (error) => {
      console.warn('Could not subscribe to live toppers:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading Wall of Fame...</div>;
  }

  if (toppers.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-[#D5B06C] text-xs font-mono uppercase tracking-widest">
          Realtime Wall of Fame
        </span>
        <h2 className="text-3xl font-extrabold text-white mt-1">Our Top Academic Performers</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {toppers.map((t) => (
          <div 
            key={t.id} 
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#76D9EF]">{t.standard}</span>
                {t.featured && (
                  <span className="text-[10px] font-bold text-[#D5B06C] flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Featured
                  </span>
                )}
              </div>

              {t.photoUrl ? (
                <img 
                  src={t.photoUrl} 
                  alt={t.name} 
                  className="w-16 h-16 rounded-full object-cover mb-4 border border-slate-700" 
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#D5B06C]/10 text-[#D5B06C] flex items-center justify-center text-2xl font-bold mb-4">
                  {t.name.charAt(0)}
                </div>
              )}

              <h3 className="text-lg font-bold text-white">{t.name}</h3>
              <div className="text-2xl font-extrabold text-[#D5B06C] my-1 font-display">
                {t.percentage}
              </div>
              <p className="text-xs text-slate-400">{t.examName}</p>

              {t.quote && (
                <p className="text-xs text-slate-300 italic mt-3 pt-3 border-t border-slate-800">
                  &ldquo;{t.quote}&rdquo;
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
