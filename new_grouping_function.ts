import type { IndsatsStepsWithEntries, StepWithGroupedEntries, ProgressEntry } from './src/lib/database-service';

function groupEntriesByStepTiming(
  steps: IndsatsStepsWithEntries[], 
  allEntries: ProgressEntry[]
): StepWithGroupedEntries[] {
  const groupedSteps: StepWithGroupedEntries[] = [];
  
  // Sort steps by step number
  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);
  
  // If we have no steps, return empty
  if (sortedSteps.length === 0) {
    return [];
  }
  
  for (const step of sortedSteps) {
    
    // Get all periods for this step
    const periods = step.activePeriods || [];
    
    // Log each period
    periods.forEach((period, index) => {
   });
    
    // Find entries that fall within any of the step's active periods
    const stepEntries = allEntries.filter(entry => {
      // Only include barometer and dagens smiley entries (exclude sengetider)
      if (entry.toolType === 'sengetider') {
        return false;
      }
      
      const entryDate = new Date(entry.createdAt);
      
      // First, try to match against specific periods if they exist
      if (periods.length > 0) {
        // Check if this entry falls within ANY period of this step
        const isInAnyPeriod = periods.some(period => {
          const periodStart = new Date(period.startDate);
          const periodEnd = period.endDate ? new Date(period.endDate) : null;
          
          const afterStart = entryDate >= periodStart;
          const beforeEnd = !periodEnd || entryDate <= periodEnd;
          
          const isInThisPeriod = afterStart && beforeEnd;
          
          if (isInThisPeriod) {
         }
          
          return isInThisPeriod;
        });
        
        return isInAnyPeriod;
      } else if (step.startDate || step.targetEndDate) {
        // Use step's own date range
        const stepStart = step.startDate ? new Date(step.startDate) : null;
        const stepEnd = step.targetEndDate ? new Date(step.targetEndDate) : null;
        
        const afterStart = !stepStart || entryDate >= stepStart;
        const beforeEnd = !stepEnd || entryDate <= stepEnd;
        
        const isInStepRange = afterStart && beforeEnd;
        
        if (isInStepRange) {
      }
        
        return isInStepRange;
      } else {
        // Fallback: Use step's own date range if no periods are defined
        const stepStart = step.startDate ? new Date(step.startDate) : null;
        const stepEnd = step.targetEndDate ? new Date(step.targetEndDate) : null;
        
        if (stepStart || stepEnd) {
          const afterStart = !stepStart || entryDate >= stepStart;
          const beforeEnd = !stepEnd || entryDate <= stepEnd;
          
          const isInStepRange = afterStart && beforeEnd;
          
          if (isInStepRange) {
     }
          
          return isInStepRange;
        } else {
          // Smart distribution based on entry creation date and step order
          // Distribute entries across steps based on their creation date relative to step timing
          
          // Sort entries by creation date to understand chronological order
          const allEntriesSorted = [...allEntries].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          // Find this entry's position in the chronological order
          const entryIndex = allEntriesSorted.findIndex(e => 
            e.id === entry.id && e.toolType === entry.toolType
          );
          
          if (entryIndex === -1) return false;
          
          // Distribute entries evenly across steps based on chronological position
          const totalEntries = allEntriesSorted.length;
          const totalSteps = sortedSteps.length;
          const entriesPerStep = Math.ceil(totalEntries / totalSteps);
          
          // Calculate which step this entry should belong to
          const targetStepIndex = Math.floor(entryIndex / entriesPerStep);
          const targetStep = sortedSteps[Math.min(targetStepIndex, totalSteps - 1)];
          
          const belongsToThisStep = step.id === targetStep.id;
          
          if (belongsToThisStep) {
        return true;
          }
          
          return false;
        }
      }
    });
    
    
    // Calculate overall time range and total duration
    let overallStartDate: string | null = null;
    let overallEndDate: string | null = null;
    let totalDurationDays: number | null = null;
    
    if (periods.length > 0) {
      // Overall start is the earliest period start
      overallStartDate = periods.reduce((earliest: string | null, period) => {
        return !earliest || period.startDate < earliest ? period.startDate : earliest;
      }, null as string | null);
      
      // Overall end is the latest period end (or null if any period is ongoing)
      const hasOngoingPeriod = periods.some(p => !p.endDate);
      if (!hasOngoingPeriod) {
        overallEndDate = periods.reduce((latest: string | null, period) => {
          const periodEndDate = period.endDate || null;
          return !latest || !periodEndDate || periodEndDate > latest ? periodEndDate : latest;
        }, null as string | null);
      }
      
      // Calculate total duration across all periods
      if (overallStartDate) {
        const startDate = new Date(overallStartDate);
        const endDate = overallEndDate ? new Date(overallEndDate) : new Date();
        totalDurationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    
    // Fallback to step's own dates if no periods exist
    if (!overallStartDate && !overallEndDate) {
      overallStartDate = step.startDate || null;
      overallEndDate = step.targetEndDate || null;
      
      // Calculate duration if we have step dates
      if (overallStartDate) {
        const startDate = new Date(overallStartDate);
        const endDate = overallEndDate ? new Date(overallEndDate) : new Date();
        totalDurationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    groupedSteps.push({
      ...step,
      entries: stepEntries,
      groupedEntries: stepEntries,
      timePerriod: {
        startDate: overallStartDate || new Date().toISOString(),
        endDate: overallEndDate || new Date().toISOString()
      },
      durationDays: totalDurationDays || 0
    });
  }
  
  return groupedSteps;
}