import { PersonalAccountSettingsContainer } from '@kit/accounts/personal-account-settings';
import { PageBody, PageHeader } from '@kit/ui/page';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { getPersonalAccount, getMfaFactors } from '~/lib/server/accounts/queries';

const callbackPath = pathsConfig.auth.callback;

const features = {
  enableAccountDeletion: true,
  enablePasswordUpdate: authConfig.providers.password,
};

const paths = {
  callback: callbackPath + `?next=${pathsConfig.app.profileSettings}`,
};

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:settingsTab');

  return {
    title,
  };
};

async function PersonalAccountSettingsPage() {
  const userPromise = requireUserInServerComponent();
  const i18n = await createI18nServerInstance();

  const [user, account, initialFactors] = await Promise.all([
    userPromise,
    userPromise.then((user) => getPersonalAccount(user.id)),
    getMfaFactors(),
  ]);

  const userId = user.id;

  return (
    <>
      <PageHeader
        title={i18n.t('account:settingsTab')}
        description={i18n.t('account:settingsTabDescription', { defaultValue: 'Gérez vos informations personnelles et votre compte.' })}
        displaySidebarTrigger={false}
      />
      <PageBody>
        <div className={'flex w-full flex-1 flex-col lg:max-w-2xl'}>
          <PersonalAccountSettingsContainer
            userId={userId}
            user={user}
            account={account ?? undefined}
            paths={paths}
            features={features}
            initialFactors={initialFactors}
          />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(PersonalAccountSettingsPage);
