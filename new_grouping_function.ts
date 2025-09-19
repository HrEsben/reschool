import type { IndsatsStepsWithEntries, StepWithGroupedEntries, ProgressEntry } from './src/lib/database-service';

function groupEntriesByStepTiming(
  steps: IndsatsStepsWithEntries[], 
  allEntries: ProgressEntry[]
): StepWithGroupedEntries[] {
  const groupedSteps: StepWithGroupedEntries[] = [];
  
  console.log('=== GROUP ENTRIES BY STEP TIMING DEBUG (Using Periods) ===');
  console.log(`Total steps: ${steps.length}, Total entries: ${allEntries.length}`);
  
  // Sort steps by step number
  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);
  
  // If we have no steps, return empty
  if (sortedSteps.length === 0) {
    console.log('No steps found, returning empty array');
    return [];
  }
  
  for (const step of sortedSteps) {
    console.log(`\n--- Processing Step ${step.stepNumber} ---`);
    console.log(`Step has ${step.activePeriods?.length || 0} periods`);
    
    // Get all periods for this step
    const periods = step.activePeriods || [];
    
    // Log each period
    periods.forEach((period, index) => {
      console.log(`  Period ${index + 1}: ${period.startDate} to ${period.endDate || 'ongoing'}`);
    });
    
    // Find entries that fall within any of the step's active periods OR distribute them intelligently
    const stepEntries = allEntries.filter(entry => {
      // Only include barometer and dagens smiley entries (exclude sengetider)
      if (entry.toolType === 'sengetider') {
        return false;
      }
      
      const entryDate = new Date(entry.createdAt);
      
      // First, try to match against specific periods if they exist
      if (periods.length > 0) {
        const isInAnyPeriod = periods.some(period => {
          const periodStart = new Date(period.startDate);
          const periodEnd = period.endDate ? new Date(period.endDate) : null;
          
          const afterStart = entryDate >= periodStart;
          const beforeEnd = !periodEnd || entryDate <= periodEnd;
          
          const isInThisPeriod = afterStart && beforeEnd;
          
          if (isInThisPeriod) {
            console.log(`  Entry ${entry.id} (${entry.toolType}) at ${entryDate.toISOString()} matches period: ${period.startDate} to ${period.endDate || 'ongoing'}`);
          }
          
          return isInThisPeriod;
        });
        
        return isInAnyPeriod;
      } else {
        // Fallback: Use step's own date range if no periods are defined
        const stepStart = step.startDate ? new Date(step.startDate) : null;
        const stepEnd = step.targetEndDate ? new Date(step.targetEndDate) : null;
        
        if (stepStart || stepEnd) {
          const afterStart = !stepStart || entryDate >= stepStart;
          const beforeEnd = !stepEnd || entryDate <= stepEnd;
          
          const isInStepRange = afterStart && beforeEnd;
          
          if (isInStepRange) {
            console.log(`  Entry ${entry.id} (${entry.toolType}) at ${entryDate.toISOString()} matches step date range: ${step.startDate || 'no start'} to ${step.targetEndDate || 'no end'}`);
          }
          
          return isInStepRange;
        } else {
          // Smart distribution: Show entries for current active step(s) only
          // If step is completed, don't show entries unless it's the most recently completed step
          // If step is not completed, show entries for the first non-completed step
          const currentStepIndex = sortedSteps.findIndex(s => !s.isCompleted);
          const currentStep = currentStepIndex >= 0 ? sortedSteps[currentStepIndex] : sortedSteps[sortedSteps.length - 1];
          
          // Also include the most recently completed step
          const completedSteps = sortedSteps.filter(s => s.isCompleted);
          const lastCompletedStep = completedSteps.length > 0 ? completedSteps[completedSteps.length - 1] : null;
          
          const isCurrentOrLastCompleted = step.id === currentStep.id || 
                                         (lastCompletedStep && step.id === lastCompletedStep.id);
          
          if (isCurrentOrLastCompleted) {
            console.log(`  Entry ${entry.id} (${entry.toolType}) included for ${step.id === currentStep.id ? 'current' : 'last completed'} step ${step.stepNumber}`);
            return true;
          }
          
          return false;
        }
      }
    });
    
    console.log(`Step ${step.stepNumber} matched ${stepEntries.length} entries across ${periods.length} periods`);
    
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
    // Note: No fallback to plan dates - if steps have no periods, they show "Ingen datoer angivet"
    
    groupedSteps.push({
      ...step,
      groupedEntries: stepEntries,
      timePerriod: {
        startDate: overallStartDate,
        endDate: overallEndDate
      },
      durationDays: totalDurationDays
    });
  }
  
  return groupedSteps;
}