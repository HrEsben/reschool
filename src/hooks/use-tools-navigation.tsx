"use client";

import { useState, useMemo } from 'react';

interface ToolItem {
  id: string;
  name: string;
  title: string; // The actual display title
  count: number;
  type: 'barometer' | 'dagens-smiley' | 'sengetider' | 'indsatstrappe';
}

interface UseToolsNavigationProps {
  barometers?: Array<{ id: number; topic: string }>;
  dagensSmiley?: Array<{ id: number; topic: string }>;
  sengetider?: Array<{ id: number }>;
  indsatstrappe?: { hasActive: boolean }; // Simple flag to indicate if there's an active indsatstrappe
}

export function useToolsNavigation({
  barometers = [],
  dagensSmiley = [],
  sengetider = [],
  indsatstrappe,
}: UseToolsNavigationProps = {}) {
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [toolOrder, setToolOrder] = useState<Array<{ id: string; name: string; type: string }>>(() => {
    // Try to load saved order from localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tools-navigation-order');
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed;
        }
      } catch (error) {
        console.warn('Failed to load saved tool order:', error);
      }
    }
    return [];
  });

  // Generate tools with current data
  const tools: ToolItem[] = useMemo(() => {
    const allTools: ToolItem[] = [];
    
    // Add individual barometers
    barometers.forEach(barometer => {
      allTools.push({
        id: `barometer-${barometer.id}`,
        name: 'Barometer',
        title: barometer.topic,
        count: 1,
        type: 'barometer'
      });
    });
    
    // Add individual dagens smiley tools
    dagensSmiley.forEach(smiley => {
      allTools.push({
        id: `dagens-smiley-${smiley.id}`,
        name: 'Dagens Smiley',
        title: smiley.topic,
        count: 1,
        type: 'dagens-smiley'
      });
    });
    
    // Add sengetider (always just one entry, regardless of count)
    if (sengetider.length > 0) {
      allTools.push({
        id: 'sengetider',
        name: 'Sengetider',
        title: 'Sengetider',
        count: 1,
        type: 'sengetider'
      });
    }

    // Add indsatstrappe (always show in navigation, even if not created yet)
    allTools.push({
      id: 'indsatstrappe',
      name: 'Indsatstrappe',
      title: 'Indsatstrappe',
      count: 1,
      type: 'indsatstrappe'
    });
    
    // Apply saved order if it exists
    if (toolOrder.length > 0) {
      const orderedTools: ToolItem[] = [];
      
      // First, add tools in the saved order
      toolOrder.forEach(orderItem => {
        const tool = allTools.find(t => t.id === orderItem.id);
        if (tool) {
          orderedTools.push(tool);
        }
      });
      
      // Then add any new tools that weren't in the saved order
      allTools.forEach(tool => {
        if (!orderedTools.find(t => t.id === tool.id)) {
          orderedTools.push(tool);
        }
      });
      
      return orderedTools;
    }
    
    return allTools;
  }, [barometers, dagensSmiley, sengetider, toolOrder]);

  // Filter tools that have content (count > 0)
  const visibleTools = useMemo(() => {
    return tools; // All tools are now individual instances, so show them all
  }, [tools]);

  const handleReorder = (newOrder: ToolItem[]) => {
    // Convert back to the base format for storage
    const newToolOrder = newOrder.map(tool => ({
      id: tool.id,
      name: tool.name,
      type: tool.type,
    }));
    
    setToolOrder(newToolOrder);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tools-navigation-order', JSON.stringify(newToolOrder));
      } catch (error) {
        console.warn('Failed to save tool order:', error);
      }
    }
  };

  const toggleReorderMode = () => {
    setIsReorderMode(prev => !prev);
  };

  const resetOrder = () => {
    setToolOrder([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tools-navigation-order');
    }
  };

  return {
    tools: visibleTools,
    isReorderMode,
    toggleReorderMode,
    handleReorder,
    resetOrder,
    hasCustomOrder: toolOrder.length > 0,
  };
}
