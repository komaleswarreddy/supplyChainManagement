import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Copy, Download, Eye, Play, Pause, RefreshCw } from 'lucide-react';

interface ForecastActionsProps {
  forecastId: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onView: (id: string) => void;
  onExport: (id: string) => void;
  onRun: (id: string) => void;
  onPause: (id: string) => void;
  onRefresh: (id: string) => void;
  status?: string;
}

export function ForecastActions({
  forecastId,
  onEdit,
  onDelete,
  onDuplicate,
  onView,
  onExport,
  onRun,
  onPause,
  onRefresh,
  status = 'active'
}: ForecastActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(forecastId)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(forecastId)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDuplicate(forecastId)}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport(forecastId)}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRefresh(forecastId)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </DropdownMenuItem>
        {status === 'active' ? (
          <DropdownMenuItem onClick={() => onPause(forecastId)}>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onRun(forecastId)}>
            <Play className="mr-2 h-4 w-4" />
            Run
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => onDelete(forecastId)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 