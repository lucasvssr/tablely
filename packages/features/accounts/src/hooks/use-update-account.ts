import { useMutation } from '@tanstack/react-query';

import { updateAccountAction } from '../server/server-actions';

export function useUpdateAccountData(accountId: string) {
  const mutationKey = ['account:data', accountId];

  const mutationFn = async (data: { name?: string; picture_url?: string | null }) => {
    return updateAccountAction(data);
  };

  return useMutation({
    mutationKey,
    mutationFn,
  });
}
