import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user';
import type { PaginationParams } from '@/types/common';
import type { UserFilters } from '@/types/user';

export function useUsers() {
  const queryClient = useQueryClient();

  const useUserList = (params: PaginationParams & UserFilters) => {
    return useQuery({
      queryKey: ['users', params],
      queryFn: () => userService.getUsers(params),
    });
  };

  const useUser = (id: string) => {
    return useQuery({
      queryKey: ['user', id],
      queryFn: () => userService.getUserById(id),
      select: (response) => response.data,
    });
  };

  const useCreateUser = () => {
    return useMutation({
      mutationFn: userService.createUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    });
  };

  const useUpdateUser = () => {
    return useMutation({
      mutationFn: ({ id, data }) => userService.updateUser(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    });
  };

  const useDeleteUser = () => {
    return useMutation({
      mutationFn: userService.deleteUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    });
  };

  const useGroups = () => {
    return useQuery({
      queryKey: ['groups'],
      queryFn: () => userService.getGroups(),
      select: (response) => response.data,
    });
  };

  const useGroup = (id: string) => {
    return useQuery({
      queryKey: ['group', id],
      queryFn: () => userService.getGroupById(id),
      select: (response) => response.data,
    });
  };

  const useCreateGroup = () => {
    return useMutation({
      mutationFn: userService.createGroup,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['groups'] });
      },
    });
  };

  const useUpdateGroup = () => {
    return useMutation({
      mutationFn: ({ id, data }) => userService.updateGroup(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['group', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['groups'] });
      },
    });
  };

  const useDeleteGroup = () => {
    return useMutation({
      mutationFn: userService.deleteGroup,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['groups'] });
      },
    });
  };

  const useRoles = () => {
    return useQuery({
      queryKey: ['roles'],
      queryFn: () => userService.getRoles(),
      select: (response) => response.data,
    });
  };

  const useRole = (id: string) => {
    return useQuery({
      queryKey: ['role', id],
      queryFn: () => userService.getRoleById(id),
      select: (response) => response.data,
    });
  };

  const useCreateRole = () => {
    return useMutation({
      mutationFn: userService.createRole,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      },
    });
  };

  const useUpdateRole = () => {
    return useMutation({
      mutationFn: ({ id, data }) => userService.updateRole(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['role', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      },
    });
  };

  const useDeleteRole = () => {
    return useMutation({
      mutationFn: userService.deleteRole,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      },
    });
  };

  return {
    useUserList,
    useUser,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useGroups,
    useGroup,
    useCreateGroup,
    useUpdateGroup,
    useDeleteGroup,
    useRoles,
    useRole,
    useCreateRole,
    useUpdateRole,
    useDeleteRole,
  };
}