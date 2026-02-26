import type { JwtPayload } from '@supabase/supabase-js';

import { Alert } from '@kit/ui/alert';
import { Trans } from '@kit/ui/trans';

import { UpdatePasswordForm } from './update-password-form';

export function UpdatePasswordFormContainer(
  props: React.PropsWithChildren<{
    callbackPath: string;
    user: JwtPayload;
  }>,
) {
  const user = props.user;

  if (!user) {
    return null;
  }

  const canUpdatePassword = user.amr?.some(
    (item: { method: string }) => item.method === `password`,
  );

  if (!canUpdatePassword) {
    return <WarnCannotUpdatePasswordAlert />;
  }

  return (
    <UpdatePasswordForm
      callbackPath={props.callbackPath}
      userEmail={user.email}
    />
  );
}

function WarnCannotUpdatePasswordAlert() {
  return (
    <Alert variant={'warning'}>
      <Trans i18nKey={'account:cannotUpdatePassword'} />
    </Alert>
  );
}
