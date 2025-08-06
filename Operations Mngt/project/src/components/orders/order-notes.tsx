import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/useToast';
import { 
  MessageSquare, 
  Plus, 
  User, 
  Eye, 
  EyeOff, 
  Clock,
  Edit,
  Trash2,
  Pin,
  Flag
} from 'lucide-react';
import { format } from 'date-fns';
import { OrderNote } from '@/types/order';

interface OrderNotesProps {
  orderId: string;
  notes: OrderNote[];
  onAddNote?: (note: Omit<OrderNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateNote?: (noteId: string, note: Partial<OrderNote>) => Promise<void>;
  onDeleteNote?: (noteId: string) => Promise<void>;
  readonly?: boolean;
}

const addNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  type: z.enum(['internal', 'customer']),
  visibility: z.enum(['public', 'private']),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

type AddNoteForm = z.infer<typeof addNoteSchema>;

const noteTypeColors = {
  internal: 'bg-blue-100 text-blue-800',
  customer: 'bg-green-100 text-green-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export function OrderNotes({ 
  orderId, 
  notes, 
  onAddNote, 
  onUpdateNote, 
  onDeleteNote, 
  readonly = false 
}: OrderNotesProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AddNoteForm>({
    resolver: zodResolver(addNoteSchema),
    defaultValues: {
      type: 'internal',
      visibility: 'private',
      priority: 'medium',
    },
  });

  const onSubmit = async (data: AddNoteForm) => {
    if (!onAddNote) return;

    setIsSubmitting(true);
    try {
      await onAddNote({
        ...data,
        orderId,
        authorId: 'current-user', // This would come from auth context
        authorName: 'Current User', // This would come from auth context
      });
      
      toast({
        title: 'Note Added',
        description: 'Your note has been added successfully.',
      });
      
      setIsAddDialogOpen(false);
      reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!onDeleteNote) return;

    try {
      await onDeleteNote(noteId);
      toast({
        title: 'Note Deleted',
        description: 'The note has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePinNote = async (noteId: string, isPinned: boolean) => {
    if (!onUpdateNote) return;

    try {
      await onUpdateNote(noteId, { isPinned: !isPinned });
      toast({
        title: isPinned ? 'Note Unpinned' : 'Note Pinned',
        description: `The note has been ${isPinned ? 'unpinned' : 'pinned'} successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Sort notes: pinned first, then by creation date (newest first)
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Order Notes ({notes.length})
          </CardTitle>
          {!readonly && onAddNote && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Order Note</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="content">Note Content *</Label>
                    <Textarea
                      id="content"
                      {...register('content')}
                      rows={4}
                      placeholder="Enter your note here..."
                      error={errors.content?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Note Type</Label>
                      <Select
                        value={watch('type')}
                        onValueChange={(value) => setValue('type', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Internal Note</SelectItem>
                          <SelectItem value="customer">Customer Note</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="visibility">Visibility</Label>
                      <Select
                        value={watch('visibility')}
                        onValueChange={(value) => setValue('visibility', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={watch('priority') || 'medium'}
                      onValueChange={(value) => setValue('priority', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Adding...' : 'Add Note'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Notes Yet</h3>
            <p className="text-muted-foreground mb-4">
              No notes have been added to this order.
            </p>
            {!readonly && onAddNote && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Note
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedNotes.map((note, index) => (
              <div key={note.id}>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={note.authorAvatar} />
                    <AvatarFallback>
                      {note.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{note.authorName}</span>
                        <Badge className={noteTypeColors[note.type]} size="sm">
                          {note.type === 'internal' ? (
                            <User className="h-3 w-3 mr-1" />
                          ) : (
                            <MessageSquare className="h-3 w-3 mr-1" />
                          )}
                          {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                        </Badge>
                        
                        {note.visibility === 'private' ? (
                          <Badge variant="outline" size="sm">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        ) : (
                          <Badge variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        )}
                        
                        {note.priority && note.priority !== 'medium' && (
                          <Badge className={priorityColors[note.priority]} size="sm">
                            <Flag className="h-3 w-3 mr-1" />
                            {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
                          </Badge>
                        )}

                        {note.isPinned && (
                          <Badge variant="outline" size="sm">
                            <Pin className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}
                        {note.updatedAt && note.updatedAt !== note.createdAt && (
                          <span className="ml-1">(edited)</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    </div>

                    {!readonly && (onUpdateNote || onDeleteNote) && (
                      <div className="flex items-center gap-2">
                        {onUpdateNote && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePinNote(note.id, note.isPinned || false)}
                          >
                            <Pin className="h-3 w-3 mr-1" />
                            {note.isPinned ? 'Unpin' : 'Pin'}
                          </Button>
                        )}
                        
                        {onUpdateNote && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingNote(note.id)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                        
                        {onDeleteNote && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {index < sortedNotes.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default OrderNotes; 