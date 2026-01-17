/**
 * Value Reinforcement
 * Displays metrics showing value delivered to power/premium users
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ValueReinforcement({ metrics }) {
  if (!metrics) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <Card className="card-glow border border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Your Impact This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {/* Time Saved */}
            {metrics.time_saved_estimate_hours !== undefined && (
              <motion.div variants={itemVariants} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {metrics.time_saved_estimate_hours}h
                </div>
                <div className="text-xs text-gray-400">Time saved</div>
              </motion.div>
            )}

            {/* Deals Compared */}
            {metrics.deals_compared_count !== undefined && (
              <motion.div variants={itemVariants} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-bold text-cyan-400 mb-1">
                  {metrics.deals_compared_count}
                </div>
                <div className="text-xs text-gray-400">Deals analyzed</div>
              </motion.div>
            )}

            {/* Scenarios Created */}
            {metrics.scenario_models_created !== undefined && (
              <motion.div variants={itemVariants} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {metrics.scenario_models_created}
                </div>
                <div className="text-xs text-gray-400">Scenarios tested</div>
              </motion.div>
            )}

            {/* Strategy Improvement */}
            {metrics.portfolio_precision_improvement_percent !== undefined && (
              <motion.div variants={itemVariants} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-amber-400 mb-1">
                  +{metrics.portfolio_precision_improvement_percent}%
                </div>
                <div className="text-xs text-gray-400">Match accuracy</div>
              </motion.div>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* Insight Card */}
      <motion.div variants={itemVariants} className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg">
        <h4 className="font-semibold text-white mb-2">Why you're seeing value</h4>
        <p className="text-sm text-gray-300">
          With deal comparisons and scenario modeling, you're making faster, more confident investment decisions. Your deals saved have grown {metrics.saved_deals_growth_7days || 0} this week.
        </p>
      </motion.div>
    </motion.div>
  );
}