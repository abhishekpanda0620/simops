import { useState, useEffect, useCallback } from 'react';
import type { Stage } from '@/types/pipeline';

interface AnimationState {
  activeStageIndex: number;
  activeJobIndex: number;
  activeStepIndex: number;
  isAnimating: boolean;
  isPaused: boolean;
  speed: number; // ms per stage
}

interface UsePipelineAnimationOptions {
  stages: Stage[];
  autoStart?: boolean;
  speed?: number;
  onComplete?: () => void;
}

export function usePipelineAnimation({
  stages,
  autoStart = true,
  speed = 2000,
  onComplete
}: UsePipelineAnimationOptions) {
  const [state, setState] = useState<AnimationState>({
    activeStageIndex: -1,
    activeJobIndex: -1,
    activeStepIndex: -1,
    isAnimating: false,
    isPaused: false,
    speed
  });

  // Start animation
  const start = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeStageIndex: 0,
      activeJobIndex: -1,
      activeStepIndex: -1,
      isAnimating: true,
      isPaused: false
    }));
  }, []);

  // Pause animation
  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  // Resume animation
  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  // Reset animation
  const reset = useCallback(() => {
    setState({
      activeStageIndex: -1,
      activeJobIndex: -1,
      activeStepIndex: -1,
      isAnimating: false,
      isPaused: false,
      speed
    });
  }, [speed]);

  // Set speed
  const setSpeed = useCallback((newSpeed: number) => {
    setState(prev => ({ ...prev, speed: newSpeed }));
  }, []);

  // Animation loop - stops at failed/skipped stages
  useEffect(() => {
    if (!state.isAnimating || state.isPaused) return;
    if (stages.length === 0) return;

    // Check if current stage is failed or skipped - stop animation
    const currentStage = stages[state.activeStageIndex];
    if (currentStage && (currentStage.status === 'failed' || currentStage.status === 'skipped')) {
      setState(prev => ({
        ...prev,
        isAnimating: false
      }));
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setState(prev => {
        const nextIndex = prev.activeStageIndex + 1;
        
        // Check if next stage exists
        if (nextIndex >= stages.length) {
          // Animation complete
          onComplete?.();
          return {
            ...prev,
            isAnimating: false,
            activeStageIndex: stages.length - 1
          };
        }
        
        return {
          ...prev,
          activeStageIndex: nextIndex
        };
      });
    }, state.speed);

    return () => clearTimeout(timer);
  }, [state.isAnimating, state.isPaused, state.activeStageIndex, state.speed, stages, onComplete]);

  // Auto-start on mount
  useEffect(() => {
    if (autoStart && stages.length > 0) {
      const startTimer = setTimeout(start, 500);
      return () => clearTimeout(startTimer);
    }
  }, [autoStart, stages.length, start]);

  // Check if a stage is active (currently animating)
  const isStageActive = useCallback((index: number) => {
    return state.isAnimating && state.activeStageIndex === index;
  }, [state.isAnimating, state.activeStageIndex]);

  // Check if a stage is complete (animation has passed it)
  const isStageComplete = useCallback((index: number) => {
    return state.activeStageIndex > index;
  }, [state.activeStageIndex]);

  // Check if a stage is pending (animation hasn't reached it yet)
  const isStagePending = useCallback((index: number) => {
    return state.activeStageIndex < index;
  }, [state.activeStageIndex]);

  return {
    ...state,
    start,
    pause,
    resume,
    reset,
    setSpeed,
    isStageActive,
    isStageComplete,
    isStagePending
  };
}
