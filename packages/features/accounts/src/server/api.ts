import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

/**
 * Class representing an API for interacting with user accounts.
 * @constructor
 * @param {SupabaseClient<Database>} client - The Supabase client instance.
 */
class AccountsApi {
  constructor(private readonly client: SupabaseClient<Database>) { }

  /**
   * @name getAccount
   * @description Get the account data for the given ID.
   * @param id
   */
  async getAccount(id: string) {
    const { data, error } = await this.client
      .from('profiles')
      .select('id, name:display_name, picture_url:avatar_url')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data as { id: string; name: string | null; picture_url: string | null };
  }
  /**
   * @name updateAccount
   * @description Update the account data for the given ID.
   * @param id
   * @param data
   */
  async updateAccount(
    id: string,
    data: { name?: string; picture_url?: string | null },
  ) {
    const updatePayload: Record<string, any> = {};
    if (data.name !== undefined) updatePayload.display_name = data.name;
    if (data.picture_url !== undefined) updatePayload.avatar_url = data.picture_url;

    const { error } = await this.client
      .from('profiles')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}

export function createAccountsApi(client: SupabaseClient<Database>) {
  return new AccountsApi(client);
}
