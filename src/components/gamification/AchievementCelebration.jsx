import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

export default function AchievementCelebration({ achievement, onClose }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (achievement) {
      // Trigger confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [achievement]);

  if (!achievement) return null;

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gray-800/90 border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>

            {/* Pro badge */}
            <div className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold text-sm shadow-lg z-10">
              🏆 INTInc PRO
            </div>

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-purple-500 via-orange-400 to-amber-500 rounded-3xl p-8 text-center overflow-hidden shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
              
              {/* Icon container */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="relative mx-auto w-40 h-40 mb-6"
              >
                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-3xl rotate-45 shadow-2xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Award className="w-20 h-20 text-white drop-shadow-lg" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl font-bold text-white mb-4 drop-shadow-lg"
                style={{ fontFamily: 'Inter, serif' }}
              >
                Skill Mastered!
              </motion.h1>

              {/* Skill name */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl font-semibold text-purple-900/80 mb-8 uppercase tracking-wide"
              >
                {achievement.skillName || achievement.name}
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex gap-4 mb-8"
              >
                {/* XP Earned */}
                <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="text-xs font-semibold text-purple-900/80 mb-1 uppercase tracking-wide">XP Earned</div>
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 text-white" fill="white" />
                    <span className="text-3xl font-bold text-white">+{achievement.xpEarned || 500}</span>
                  </div>
                </div>

                {/* Rank */}
                <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="text-xs font-semibold text-purple-900/80 mb-1 uppercase tracking-wide">Global Rank</div>
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-5 h-5 text-white" />
                    <span className="text-3xl font-bold text-white">Top {achievement.rank || 3}%</span>
                  </div>
                </div>
              </motion.div>

              {/* Level progress */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mb-6"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="text-left">
                    <div className="text-xs font-semibold text-purple-900/80 uppercase tracking-wide">Current Level</div>
                    <div className="text-4xl font-bold text-white">{achievement.currentLevel || 14}</div>
                  </div>
                  <div className="px-6 py-2 bg-gradient-to-r from-purple-600 to-orange-600 rounded-full text-white font-bold text-sm shadow-lg">
                    LEVEL UP!
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-purple-900/80 uppercase tracking-wide">Next Level</div>
                    <div className="text-4xl font-bold text-white">{achievement.nextLevel || 15}</div>
                  </div>
                </div>
                <div className="h-3 bg-black/20 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${achievement.progress || 75}%` }}
                    transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg"
                  />
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <Button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-bold py-6 rounded-2xl text-lg shadow-xl"
                >
                  Return to Hub →
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}