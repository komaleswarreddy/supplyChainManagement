import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractService } from '@/services/contract';
import type { PaginationParams } from '@/types/common';
import type { ContractFilters } from '@/types/contract';

export function useContracts() {
  const queryClient = useQueryClient();

  const useContractList = (params: PaginationParams & ContractFilters) => {
    return useQuery({
      queryKey: ['contracts', params],
      queryFn: () => contractService.getContracts(params),
    });
  };

  const useContract = (id: string) => {
    return useQuery({
      queryKey: ['contract', id],
      queryFn: () => contractService.getContractById(id),
      select: (response) => response.data,
    });
  };

  const useCreateContract = () => {
    return useMutation({
      mutationFn: contractService.createContract,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contracts'] });
      },
    });
  };

  const useUpdateContract = () => {
    return useMutation({
      mutationFn: ({ id, data }) => contractService.updateContract(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['contract', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['contracts'] });
      },
    });
  };

  const useSubmitContract = () => {
    return useMutation({
      mutationFn: contractService.submitContract,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['contract', id] });
        queryClient.invalidateQueries({ queryKey: ['contracts'] });
      },
    });
  };

  const useApproveContract = () => {
    return useMutation({
      mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
        contractService.approveContract(id, comment),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['contract', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['contracts'] });
      },
    });
  };

  const useRejectContract = () => {
    return useMutation({
      mutationFn: ({ id, comment }: { id: string; comment: string }) =>
        contractService.rejectContract(id, comment),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['contract', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['contracts'] });
      },
    });
  };

  const useActivateContract = () => {
    return useMutation({
      mutationFn: contractService.activateContract,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['contract', id] });
        queryClient.invalidateQueries({ queryKey: ['contracts'] });
      },
    });
  };

  const useTerminateContract = () => {
    return useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) =>
        contractService.terminateContract(id, reason),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['contract', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['contracts'] });
      },
    });
  };

  const useUploadDocument = () => {
    return useMutation({
      mutationFn: ({ id, document }) => contractService.uploadDocument(id, document),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['contract', variables.id] });
      },
    });
  };

  return {
    useContractList,
    useContract,
    useCreateContract,
    useUpdateContract,
    useSubmitContract,
    useApproveContract,
    useRejectContract,
    useActivateContract,
    useTerminateContract,
    useUploadDocument,
  };
}