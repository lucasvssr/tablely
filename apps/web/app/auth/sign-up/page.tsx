import { use } from 'react';
import Link from 'next/link';

import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { SignUpContainer } from './_components/sign-up-container';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:signUp'),
  };
};

interface SignUpPageProps {
  searchParams: Promise<{ next?: string; email?: string; invitationId?: string }>;
}

function SignUpPage(props: SignUpPageProps) {
  const searchParams = use(props.searchParams);
  const next = searchParams.next;
  const email = searchParams.email;
  const invitationId = searchParams.invitationId;

  const paths = {
    callback: pathsConfig.auth.callback,
    appHome: next || pathsConfig.app.home,
    home: next || pathsConfig.app.home,
  };

  const signInPath = new URL(pathsConfig.auth.signIn, 'http://localhost');
  if (next) signInPath.searchParams.set('next', next);
  if (email) signInPath.searchParams.set('email', email);

  const signInUrl = signInPath.pathname + signInPath.search;

  return (
    <>
      <Heading level={5} className={'tracking-tight'}>
        <Trans i18nKey={'auth:signUpHeading'} />
      </Heading>

      <SignUpContainer
        providers={authConfig.providers}
        displayTermsCheckbox={authConfig.displayTermsCheckbox}
        paths={paths}
        email={email}
        invitationId={invitationId}
        next={next}
      />

      <div className={'flex justify-center'}>
        <Button asChild variant={'link'} size={'sm'}>
          <Link href={signInUrl}>
            <Trans i18nKey={'auth:alreadyHaveAccountStatement'} />
          </Link>
        </Button>
      </div>
    </>
  );
}

export default withI18n(SignUpPage);
