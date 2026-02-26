import type { JwtPayload } from '@supabase/supabase-js';

import { UpdateEmailForm } from './update-email-form';

export function UpdateEmailFormContainer(props: {
  callbackPath: string;
  user: JwtPayload;
}) {
  const user = props.user;

  if (!user) {
    return null;
  }

  return (
    <UpdateEmailForm callbackPath={props.callbackPath} userEmail={user.email} />
  );
}
