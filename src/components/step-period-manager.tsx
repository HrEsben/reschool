import React, { useState } from 'react';
import { useStepPeriods, useCreateStepPeriod } from '@/lib/queries';

interface StepPeriodManagerProps {
  planId: number;
  stepId: number;
  stepTitle: string;
}

export function StepPeriodManager({ planId, stepId, stepTitle }: StepPeriodManagerProps) {
  const [isCreatingPeriod, setIsCreatingPeriod] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);

  const { data: periods, isLoading } = useStepPeriods(planId, stepId);
  const createPeriodMutation = useCreateStepPeriod();

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createPeriodMutation.mutateAsync({
        planId,
        stepId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isCustomPeriod,
      });
      
      // Reset form
      setStartDate('');
      setEndDate('');
      setIsCustomPeriod(false);
      setIsCreatingPeriod(false);
    } catch (error) {
      console.error('Failed to create step period:', error);
    }
  };

  const handleActivateNow = () => {
    createPeriodMutation.mutate({
      planId,
      stepId,
      isCustomPeriod: false,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('da-DK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <div className="p-4">Loading step periods...</div>;
  }

  const activePeriod = periods?.find(p => !p.endDate);
  const hasActivePeriod = !!activePeriod;

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        ⏰ Aktivperioder for &quot;{stepTitle}&quot;
      </h3>

      {/* Current Status */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        {hasActivePeriod ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Aktiv siden {formatDate(activePeriod.startDate)}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
            Ikke aktiv
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!hasActivePeriod && (
          <button
            onClick={handleActivateNow}
            disabled={createPeriodMutation.isPending}
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Aktiver nu
          </button>
        )}
        
        <button
          onClick={() => setIsCreatingPeriod(true)}
          disabled={createPeriodMutation.isPending}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Tilføj periode
        </button>
      </div>

      {/* Create Period Form */}
      {isCreatingPeriod && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <form onSubmit={handleCreatePeriod} className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isCustomPeriod"
                checked={isCustomPeriod}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsCustomPeriod(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isCustomPeriod" className="text-sm">
                Brugerdefineret periode (til backdating)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                  Startdato {!isCustomPeriod && '(valgfri)'}
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                  required={isCustomPeriod}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {isCustomPeriod && (
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                    Slutdato (valgfri)
                  </label>
                  <input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsCreatingPeriod(false)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Annuller
              </button>
              <button
                type="submit"
                disabled={createPeriodMutation.isPending}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {createPeriodMutation.isPending ? 'Opretter...' : 'Opret periode'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Period History */}
      {periods && periods.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Periodehistorik:</h4>
          <div className="space-y-2">
            {periods.map((period) => (
              <div key={period.id} className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📅</span>
                    <span className="text-sm">
                      {formatDateTime(period.startDate)}
                      {period.endDate ? ` → ${formatDateTime(period.endDate)}` : ' → Nu'}
                    </span>
                  </div>
                  
                  {!period.endDate && (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      Aktiv
                    </span>
                  )}
                </div>
                
                {period.activatedByName && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                    <span>👤</span>
                    Aktiveret af {period.activatedByName}
                    {period.deactivatedByName && ` • Deaktiveret af ${period.deactivatedByName}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {periods && periods.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <div className="text-4xl mb-2 opacity-50">⏰</div>
          <p className="text-sm">Ingen perioder oprettet endnu</p>
          <p className="text-xs">Opret en periode for at begynde at spore aktivitet</p>
        </div>
      )}
    </div>
  );
}