import { NextIntlClientProvider, hasLocale } from 'next-intl';
import NavigationBar from './components/NavigationBar';
import Providers from '../providers';
import "../globals.css";
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { serverSideApi } from '@/api/serverSide';
import { cookies } from 'next/headers';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const cookieStore = await cookies()

  const currentUser = await serverSideApi.me(cookieStore)
  let profileLink: string | null = null
  if (currentUser) {
    profileLink = `/${locale}/${currentUser.type}/${currentUser.uniqueID}`
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <Providers>
            <NavigationBar
              locale={locale}
              profileLink={profileLink}
            />
            {children}
          </Providers>
        </NextIntlClientProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />
      </body>
    </html>
  );
}
