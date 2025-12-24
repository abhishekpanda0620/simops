import { Link2 } from 'lucide-react';
import { GitMerge } from 'lucide-react';
import { PanelHeader, AnalogyBox, KeyPointsList } from '@/components/topology/panels/EnhancedPanelComponents';
import type { PipelineEducation } from '@/data/pipelineEducation';

interface PipelineInfoPanelProps {
  education: PipelineEducation | null;
  onClose: () => void;
}

export function PipelineInfoPanel({ education, onClose }: PipelineInfoPanelProps) {
  // Don't render sidebar at all when no education selected (closed by default)
  if (!education) {
    return null;
  }

  return (
    <div className="w-80 shrink-0 bg-surface-900 border-l border-surface-700 flex flex-col overflow-hidden">
      <PanelHeader 
        title={education.title} 
        icon={GitMerge} 
        onClose={onClose} 
      />
      
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {education.analogy && <AnalogyBox analogy={education.analogy} />}
        
        <div className="mb-6">
          <p className="text-sm text-surface-300 leading-relaxed bg-surface-800/50 p-4 rounded-lg border border-surface-700">
            {education.description}
          </p>
        </div>
        
        {education.tips && <KeyPointsList points={education.tips} />}
        
        {education.relatedConcepts && education.relatedConcepts.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Related Concepts
            </h3>
            <div className="flex flex-wrap gap-2">
              {education.relatedConcepts.map((concept, i) => (
                <span 
                  key={i} 
                  className="text-xs bg-surface-800 text-surface-300 px-2 py-1 rounded"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
