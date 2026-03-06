'use client';

import { useCallback, useRef, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';
import { CheckCircledIcon } from '@radix-ui/react-icons';

import { useSignUpWithEmailAndPassword } from '@kit/supabase/hooks/use-sign-up-with-email-password';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { useCaptchaToken } from '../captcha/client';
import { AuthErrorAlert } from './auth-error-alert';
import { PasswordSignUpForm } from './password-sign-up-form';

interface EmailPasswordSignUpContainerProps {
  displayTermsCheckbox?: boolean;
  readOnlyEmail?: boolean;
  invitationId?: string;
  defaultValues?: {
    email: string;
  };

  onSignUp?: (userId?: string) => unknown;
  emailRedirectTo: string;
  customSignUpAction?: (credentials: { 
    email: string; 
    password: string; 
    invitationId: string;
    firstName: string;
    lastName: string;
  }) => Promise<unknown>;
}

export function EmailPasswordSignUpContainer({
  defaultValues,
  onSignUp,
  emailRedirectTo,
  displayTermsCheckbox,
  readOnlyEmail,
  invitationId,
  customSignUpAction,
}: EmailPasswordSignUpContainerProps) {
  const { captchaToken, resetCaptchaToken } = useCaptchaToken();

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const signUpMutation = useSignUpWithEmailAndPassword();
  const redirecting = useRef(false);
  const [showVerifyEmailAlert, setShowVerifyEmailAlert] = useState(false);

  const loading = signUpMutation.isPending || redirecting.current || isPending;

  const onSignupRequested = useCallback(
    async (credentials: { 
        email: string; 
        password: string; 
        repeatPassword: string;
        firstName: string;
        lastName: string;
    }) => {
      if (loading) {
        return;
      }

      try {
        if (customSignUpAction) {
          await customSignUpAction({
            ...credentials,
            invitationId: invitationId ?? ''
          });

          redirecting.current = true;

          startTransition(() => {
            router.push(emailRedirectTo);
          });

          return;
        }

        const data = await signUpMutation.mutateAsync({
          ...credentials,
          emailRedirectTo,
          captchaToken,
        });

        if (data.session) {
          redirecting.current = true;

          startTransition(() => {
            router.push(emailRedirectTo);
          });

          return;
        }

        setShowVerifyEmailAlert(true);

        if (onSignUp) {
          onSignUp(data.user?.id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        resetCaptchaToken();
      }
    },
    [
      captchaToken,
      customSignUpAction,
      emailRedirectTo,
      invitationId,
      loading,
      onSignUp,
      resetCaptchaToken,
      router,
      signUpMutation,
    ],
  );

  return (
    <>
      <If condition={showVerifyEmailAlert}>
        <SuccessAlert />
      </If>

      <If condition={!showVerifyEmailAlert}>
        <AuthErrorAlert error={signUpMutation.error} />

        <PasswordSignUpForm
          onSubmit={onSignupRequested}
          loading={loading}
          defaultValues={defaultValues}
          displayTermsCheckbox={displayTermsCheckbox}
          readOnlyEmail={readOnlyEmail}
        />
      </If>
    </>
  );
}

function SuccessAlert() {
  return (
    <Alert variant={'success'}>
      <CheckCircledIcon className={'w-4'} />

      <AlertTitle>
        <Trans i18nKey={'auth:emailConfirmationAlertHeading'} />
      </AlertTitle>

      <AlertDescription data-test={'email-confirmation-alert'}>
        <Trans i18nKey={'auth:emailConfirmationAlertBody'} />
      </AlertDescription>
    </Alert>
  );
}
