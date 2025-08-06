import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useLogistics } from '@/hooks/useLogistics';
import { ArrowLeft, ClipboardList, ArrowRight, Clock, User, CheckCircle, XCircle, Play } from 'lucide-react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const statusColors = {
  PENDING: 'default',
  ASSIGNED: 'secondary',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
} as const;

const priorityColors = {
  LOW: 'default',
  MEDIUM: 'secondary',
  HIGH: 'warning',
  URGENT: 'destructive',
} as const;

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const [actualDuration, setActualDuration] = React.useState<number>(0);
  
  const { 
    useWarehouseTask, 
    useAssignWarehouseTask, 
    useStartWarehouseTask, 
    useCompleteWarehouseTask,
    useUpdateWarehouseTask
  } = useLogistics();
  
  const { data: task, isLoading } = useWarehouseTask(id!);
  const { mutate: assignTask, isLoading: isAssigning } = useAssignWarehouseTask();
  const { mutate: startTask, isLoading: isStarting } = useStartWarehouseTask();
  const { mutate: completeTask, isLoading: isCompleting } = useCompleteWarehouseTask();
  const { mutate: updateTask, isLoading: isUpdating } = useUpdateWarehouseTask();

  const handleAssign = () => {
    // In a real app, you would show a user selection dialog
    // For now, we'll just use a hardcoded user ID
    assignTask({ id: id!, userId: 'user-2' });
  };

  const handleStart = () => {
    startTask(id!);
  };

  const handleComplete = () => {
    confirm(() => {
      completeTask({ id: id!, actualDuration });
    });
  };

  const handleCancel = () => {
    confirm(() => {
      updateTask({
        id: id!,
        data: { status: 'CANCELLED' }
      });
    });
  };

  if (isLoading || !task) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/logistics/tasks')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <ClipboardList className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{task.type.replace('_', ' ')} Task</h1>
                <p className="text-sm text-muted-foreground">
                  ID: {task.id.substring(0, 8)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[task.status]} className="h-6 px-3 text-sm">
              {task.status}
            </Badge>
            <Badge variant={priorityColors[task.priority]} className="h-6 px-3 text-sm">
              {task.priority}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Task Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                    <p className="mt-1">{task.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Reference</h3>
                    <p className="mt-1">{task.referenceNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Due By</h3>
                    <p className="mt-1">{format(new Date(task.dueBy), 'PPp')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Estimated Duration</h3>
                    <p className="mt-1">{task.estimatedDuration} minutes</p>
                  </div>
                  {task.actualDuration && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Actual Duration</h3>
                      <p className="mt-1">{task.actualDuration} minutes</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                    <p className="mt-1">{task.createdBy.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                    <p className="mt-1">{format(new Date(task.createdAt), 'PPp')}</p>
                  </div>
                  {task.assignedTo && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Assigned To</h3>
                        <p className="mt-1">{task.assignedTo.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Assigned At</h3>
                        <p className="mt-1">{format(new Date(task.assignedAt!), 'PPp')}</p>
                      </div>
                    </>
                  )}
                  {task.startedAt && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Started At</h3>
                      <p className="mt-1">{format(new Date(task.startedAt), 'PPp')}</p>
                    </div>
                  )}
                  {task.completedAt && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Completed At</h3>
                      <p className="mt-1">{format(new Date(task.completedAt), 'PPp')}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {task.notes && (
                <div className="border-t p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="mt-1">{task.notes}</p>
                </div>
              )}
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Items</h2>
                <div className="space-y-4">
                  {task.items.map((item, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">{item.itemName}</h3>
                        <Badge variant="outline">{item.itemCode}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>{' '}
                          <span className="font-medium">{item.quantity} {item.uom}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Locations</h2>
                
                {task.sourceLocation && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Source Location</h3>
                    <div className="mt-2 rounded-lg border p-3">
                      <p className="font-medium">{task.sourceLocation.zoneName}</p>
                      <div className="mt-1 text-sm">
                        <p>{task.sourceLocation.aisleName} &gt; {task.sourceLocation.rackName} &gt; {task.sourceLocation.binName}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {task.destinationLocation && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Destination Location</h3>
                    <div className="mt-2 rounded-lg border p-3">
                      <p className="font-medium">{task.destinationLocation.zoneName}</p>
                      <div className="mt-1 text-sm">
                        <p>{task.destinationLocation.aisleName} &gt; {task.destinationLocation.rackName} &gt; {task.destinationLocation.binName}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {task.sourceLocation && task.destinationLocation && (
                  <div className="flex justify-center my-4">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Task Actions</h2>
                
                {task.status === 'PENDING' && (
                  <Button 
                    className="w-full mb-2 flex items-center gap-2" 
                    onClick={handleAssign}
                    disabled={isAssigning}
                  >
                    {isAssigning ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4" />
                        Assign Task
                      </>
                    )}
                  </Button>
                )}
                
                {task.status === 'ASSIGNED' && (
                  <Button 
                    className="w-full mb-2 flex items-center gap-2" 
                    onClick={handleStart}
                    disabled={isStarting}
                  >
                    {isStarting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Start Task
                      </>
                    )}
                  </Button>
                )}
                
                {task.status === 'IN_PROGRESS' && (
                  <>
                    <div className="mb-4">
                      <Label htmlFor="actualDuration">Actual Duration (minutes)</Label>
                      <Input
                        id="actualDuration"
                        type="number"
                        min="1"
                        value={actualDuration}
                        onChange={(e) => setActualDuration(parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      className="w-full mb-2 flex items-center gap-2" 
                      onClick={handleComplete}
                      disabled={isCompleting || actualDuration <= 0}
                    >
                      {isCompleting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Complete Task
                        </>
                      )}
                    </Button>
                  </>
                )}
                
                {['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(task.status) && (
                  <Button 
                    variant="destructive" 
                    className="w-full flex items-center gap-2"
                    onClick={handleCancel}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Cancel Task
                      </>
                    )}
                  </Button>
                )}
                
                {task.status === 'COMPLETED' && (
                  <div className="text-center text-muted-foreground">
                    This task has been completed.
                  </div>
                )}
                
                {task.status === 'CANCELLED' && (
                  <div className="text-center text-muted-foreground">
                    This task has been cancelled.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Action"
        description="Are you sure you want to proceed with this action? This cannot be undone."
        confirmText="Continue"
        onConfirm={onConfirm}
      />
    </div>
  );
}