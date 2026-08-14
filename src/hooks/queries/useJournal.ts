import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/api/journal'
import { useAuth } from '@features/auth/useAuth'

const JOURNAL_QUERY_KEY = ['journalEntries']

export function useJournalQuery() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: JOURNAL_QUERY_KEY,
    queryFn: getJournalEntries,
    enabled: !!user,
  })
}

export function useCreateJournalMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (data: Parameters<typeof createJournalEntry>[1]) => {
      if (!user) throw new Error('User not authenticated')
      return createJournalEntry(user.id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_QUERY_KEY })
    },
  })
}

export function useUpdateJournalMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateJournalEntry>[1] }) => 
      updateJournalEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_QUERY_KEY })
    },
  })
}

export function useDeleteJournalMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_QUERY_KEY })
    },
  })
}
