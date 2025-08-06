import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Plus, Users, Mail, X, Check, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { useTenantStore } from '@/stores/tenant-store';

interface TenantUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  isOwner: boolean;
  status: string;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export default function TenantUsersPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('USER');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTenantUsers = async () => {
      try {
        setIsLoading(true);
        const [usersResponse, invitationsResponse] = await Promise.all([
          api.get(`/tenants/${id}/users`),
          api.get(`/tenants/${id}/invitations`),
        ]);
        setUsers(usersResponse.data);
        setInvitations(invitationsResponse.data);
      } catch (error) {
        console.error('Failed to fetch tenant users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantUsers();
  }, [id]);

  const handleInviteUser = async () => {
    try {
      setIsInviting(true);
      await api.post(`/tenants/${id}/invitations`, {
        email: inviteEmail,
        role: inviteRole,
      });
      
      // Refresh invitations
      const response = await api.get(`/tenants/${id}/invitations`);
      setInvitations(response.data);
      
      // Reset form
      setInviteEmail('');
      setInviteRole('USER');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to invite user:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await api.delete(`/tenants/${id}/invitations/${invitationId}`);
      
      // Refresh invitations
      const response = await api.get(`/tenants/${id}/invitations`);
      setInvitations(response.data);
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await api.delete(`/tenants/${id}/users/${userId}`);
      
      // Refresh users
      const response = await api.get(`/tenants/${id}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Building2 className="mr-2 h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">Organization Users</h1>
            <p className="text-muted-foreground">
              {currentTenant?.name || 'Organization'} - Manage users and invitations
            </p>
          </div>
        </div>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Invite User
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Invite User</AlertDialogTitle>
              <AlertDialogDescription>
                Send an invitation to join your organization
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="USER">User</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </div>
            </div>
            <AlertDialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteUser}
                disabled={!inviteEmail || isInviting}
              >
                {isInviting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Inviting...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border">
          <div className="border-b bg-muted/50 px-4 py-3">
            <h2 className="flex items-center text-lg font-semibold">
              <Users className="mr-2 h-5 w-5" />
              Users
            </h2>
          </div>
          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{user.role}</Badge>
                          {user.isOwner && (
                            <Badge variant="secondary">Owner</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === 'ACTIVE' ? 'success' : 'default'}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveUser(user.userId)}
                          disabled={user.isOwner}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="border-b bg-muted/50 px-4 py-3">
            <h2 className="flex items-center text-lg font-semibold">
              <Mail className="mr-2 h-5 w-5" />
              Pending Invitations
            </h2>
          </div>
          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.length > 0 ? (
                  invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invitation.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={invitation.status === 'PENDING' ? 'warning' : 'success'}
                        >
                          {invitation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(invitation.expiresAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invitation.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No pending invitations
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}