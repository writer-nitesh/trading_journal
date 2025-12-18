'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DynamicFilters({ selectedFilter, onFilterChange }) {
  const filterOptions = [
    { key: 'strategy', label: 'Strategy', description: 'Group by trading strategies' },
    { key: 'mistake', label: 'Mistake', description: 'Group by trading mistakes' },
    { key: 'day', label: 'Day', description: 'Group by trading days' },
    { key: 'emotion', label: 'Emotion', description: 'Group by emotions' },
    { key: 'timeSlot', label: 'Time Slot', description: 'Group by time periods' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-3">Group Charts By:</h3>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.key}
              variant={selectedFilter.type === option.key ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange({ type: option.key, value: 'all' })}
              className="h-9"
            >
              {option.label}
              {selectedFilter.type === option.key && (
                <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                  Active
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

    </div>
  );
}
