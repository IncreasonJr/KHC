// /home/caleb/Desktop/PROJECTS/KHC/src/hooks/useMembers.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberService } from '../services/memberService';
import { givingService } from '../services/givingService';

// 1. Hook for all members list
export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: () => memberService.getMembers(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// 2. Hook for singular member details
export const useMember = (id) => {
  return useQuery({
    queryKey: ['member', id],
    queryFn: () => memberService.getMemberById(id),
    enabled: !!id, // Only run if ID exists
  });
};

// 3. Hook to create a member
export const useCreateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newMember) => memberService.createMember(newMember),
    onSuccess: () => {
      // Invalidate members query cache to trigger fetch sync
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

// 4. Hook to update a member
export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => memberService.updateMember(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', variables.id] });
    },
  });
};

// 5. Hook to delete a member
export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => memberService.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['giving'] });
    },
  });
};

// 6. Hook for giving records (optionally filtered by memberId)
export const useGiving = (memberId = null) => {
  return useQuery({
    queryKey: ['giving', memberId],
    queryFn: () => givingService.getGivingRecords(memberId),
  });
};

// 7. Hook for dashboard giving aggregates
export const useGivingStats = () => {
  return useQuery({
    queryKey: ['giving-stats'],
    queryFn: () => givingService.getGivingStats(),
  });
};

// 8. Hook to record a contribution
export const useCreateGiving = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newGiving) => givingService.createGiving(newGiving),
    onSuccess: (data, variables) => {
      // Refetch financial data caches
      queryClient.invalidateQueries({ queryKey: ['giving'] });
      queryClient.invalidateQueries({ queryKey: ['giving-stats'] });
      if (variables.member_id) {
        queryClient.invalidateQueries({ queryKey: ['giving', variables.member_id] });
      }
    },
  });
};
