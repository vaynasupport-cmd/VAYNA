import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAccounts, createAccount, updateAccount, deleteAccount } from '@/api/accounts'
import { useAuth } from '@features/auth/useAuth'

const ACCOUNTS_QUERY_KEY = ['accounts']

export function useAccountsQuery() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: getAccounts,
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCreateAccountMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (data: Parameters<typeof createAccount>[1]) => {
      if (!user) throw new Error('User not authenticated')
      return createAccount(user.id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
    },
  })
}

export function useUpdateAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateAccount>[1] }) => 
      updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
    },
  })
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
    },
  })
}
