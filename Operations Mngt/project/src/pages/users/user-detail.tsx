import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUsers } from '@/hooks/useUsers';
import { ArrowLeft, Edit, Key, Lock, Shield, User } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const statusColors = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
  locked: 'destructive',
} as const;

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const { useUser, useDeleteUser } = useUsers();
  const { data: user, isLoading } = useUser(id!);
  const { mutate: deleteUser, isLoading: isDeleting } = useDeleteUser();

  if (isLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleEdit = () => {
    confirm(() => navigate(`/users/${user.id}/edit`));
  };

  const handleDelete = () => {
    confirm(() => {
      deleteUser(user.id, {
        onSuccess: () => {
          navigate('/users');
        },
      });
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/users')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <User className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
          <Badge variant={statusColors[user.status]} className="h-6 px-3 text-sm">
            {user.status}
          </Badge>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Employee ID</h3>
                  <p className="mt-1">{user.employeeId || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                  <p className="mt-1">{user.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                  <p className="mt-1">{user.title || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                  <p className="mt-1">{user.phoneNumber || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="mt-1">{format(new Date(user.createdAt), 'PPp')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Login</h3>
                  <p className="mt-1">{user.lastLogin ? format(new Date(user.lastLogin), 'PPp') : 'Never'}</p>
                </div>
              </div>

              {user.metadata && (
                <div className="border-t p-6">
                  <h3 className="mb-4 font-semibold">Additional Information</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Cost Center</h4>
                      <p className="mt-1">{user.metadata.costCenter || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                      <p className="mt-1">{user.metadata.location || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Division</h4>
                      <p className="mt-1">{user.metadata.division || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-semibold">Roles</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">Permissions</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.permissions.map((permission) => (
                      <Badge key={permission} variant="outline">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="grid gap-6">
                  <div>
                    <h3 className="font-semibold">System Preferences</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Language</h4>
                        <p className="mt-1">{user.preferences?.language}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Timezone</h4>
                        <p className="mt-1">{user.preferences?.timezone}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Theme</h4>
                        <p className="mt-1 capitalize">{user.preferences?.theme}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold">Notification Preferences</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Email Notifications</h4>
                        <p className="mt-1">{user.preferences?.notifications.email ? 'Enabled' : 'Disabled'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">In-App Notifications</h4>
                        <p className="mt-1">{user.preferences?.notifications.inApp ? 'Enabled' : 'Disabled'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Desktop Notifications</h4>
                        <p className="mt-1">{user.preferences?.notifications.desktop ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="grid gap-6">
                  <div>
                    <h3 className="font-semibold">Security Settings</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Multi-Factor Authentication</h4>
                        <p className="mt-1">{user.mfaEnabled ? 'Enabled' : 'Disabled'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Password Last Changed</h4>
                        <p className="mt-1">
                          {user.passwordLastChanged
                            ? format(new Date(user.passwordLastChanged), 'PP')
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Reset Password
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Configure MFA
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Lock Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="mb-4 font-semibold">Recent Activity</h3>
                <p className="text-sm text-muted-foreground">No recent activity to display.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              'Delete User'
            )}
          </Button>
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

export default UserDetail;