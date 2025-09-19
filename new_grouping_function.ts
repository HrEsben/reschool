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
    
    // Find entries that fall within any of the step's active periods
    const stepEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      
      // Check if entry falls within any period for this step
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
    });
    
    console.log(`Step ${step.stepNumber} matched ${stepEntries.length} entries across ${periods.length} periods`);
    
    // Calculate overall time range and total duration
    let overallStartDate: string | null = null;
    let overallEndDate: string | null = null;
    let totalDurationDays: number | null = null;
    
    if (periods.length > 0) {
      // Overall start is the earliest period start
      overallStartDate = periods.reduce((earliest, period) => {
        return !earliest || period.startDate < earliest ? period.startDate : earliest;
      }, null as string | null);
      
      // Overall end is the latest period end (or null if any period is ongoing)
      const hasOngoingPeriod = periods.some(p => !p.endDate);
      if (!hasOngoingPeriod) {
        overallEndDate = periods.reduce((latest, period) => {
          return !latest || !period.endDate || period.endDate > latest ? period.endDate : latest;
        }, null as string | null);
      }
      
      // Calculate total duration across all periods
      if (overallStartDate) {
        const startDate = new Date(overallStartDate);
        const endDate = overallEndDate ? new Date(overallEndDate) : new Date();
        totalDurationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    
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