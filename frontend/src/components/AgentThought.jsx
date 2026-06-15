import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, Circle, Database, FileText, ExternalLink } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui';
import { Badge } from './ui';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, title: 'Analyzing Request', status: 'completed' },
  { id: 2, title: 'Searching Knowledge Base', status: 'completed' },
  { id: 3, title: 'Formulating Strategy', status: 'in-progress' },
  { id: 4, title: 'Generating Response', status: 'pending' },
];

const sources = [
  { id: 1, title: 'Customer Database', type: 'database', relevance: 0.95 },
  { id: 2, title: 'Campaign History', type: 'file', relevance: 0.88 },
  { id: 3, title: 'Market Research', type: 'external', relevance: 0.76 },
];

function AgentThought({ thinking, sources: thoughtSources, onExpand }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="thoughts" className="border-0">
          <AccordionTrigger
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'w-full flex items-center justify-between p-4 rounded-xl bg-blue-50/50 border border-blue-200/50 hover:bg-blue-50/80 transition-all',
              thinking && 'animate-pulse'
            )}
          >
            <div className="flex items-center gap-3 flex-1">
              <Brain className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {thinking ? 'Thinking...' : 'Agent Thought Process'}
                </p>
                {!thinking && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {completedSteps}/{steps.length} steps
                    </span>
                  </div>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="pt-0">
            <div className="p-4 mt-2 rounded-xl bg-white border border-gray-200 space-y-4">
              {/* Steps */}
              <div className="space-y-2">
                {steps.map((step, index) => {
                  const StepIcon = step.status === 'completed'
                    ? CheckCircle
                    : step.status === 'in-progress'
                    ? Circle
                    : Circle;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <StepIcon
                        className={cn(
                          'w-4 h-4 shrink-0',
                          step.status === 'completed'
                            ? 'text-emerald-500'
                            : step.status === 'in-progress'
                            ? 'text-blue-500 animate-pulse'
                            : 'text-gray-400'
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm',
                          step.status === 'completed'
                            ? 'text-gray-900'
                            : step.status === 'in-progress'
                            ? 'text-blue-600 font-medium'
                            : 'text-gray-400'
                        )}
                      >
                        {step.title}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Sources */}
              {thoughtSources && thoughtSources.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">Data Sources</p>
                  <div className="space-y-2">
                    {thoughtSources.map((source) => (
                      <div key={source.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-100">
                        <div className="flex items-center gap-2">
                          {source.type === 'database' && <Database className="w-4 h-4 text-blue-500" />}
                          {source.type === 'file' && <FileText className="w-4 h-4 text-gray-600" />}
                          {source.type === 'external' && <ExternalLink className="w-4 h-4 text-gray-600" />}
                          <span className="text-sm text-gray-900">{source.title}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {(source.relevance * 100).toFixed(0)}% match
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}

export default AgentThought;