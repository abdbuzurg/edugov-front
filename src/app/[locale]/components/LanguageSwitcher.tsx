'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react'; // Import React for event handling

export default function LanguageSwitcher() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname
  const currentLocale = params.locale as string;
  useEffect(() => {
    if (typeof window !== undefined) {
      localStorage.setItem("currentLocale", currentLocale)
    }
  }, [])

  // Define the locales you support
  const locales = [
    { code: 'en', label: 'English' }, // Changed labels for better display in a select dropdown
    { code: 'ru', label: 'Русский' },
    { code: 'tg', label: 'Тоҷикӣ' },
  ];

  const handleLocaleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value;
    // Construct the new path while preserving the current route segments
    // pathname will be like /en/some/path, so we need to remove the current locale segment
    const pathSegments = pathname.split('/').filter(segment => segment !== currentLocale && segment !== '');
    const newPath = `/${newLocale}/${pathSegments.join('/')}`;
    router.push(newPath);
  };

  return (

    <select
      value={currentLocale}
      onChange={handleLocaleChange}
      className="
          bg-[#095088] text-white border-none text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-none focus:outline-none  
        "
    >
      {locales.map((locale) => (
        <option key={locale.code} value={locale.code}>
          {locale.label}
        </option>
      ))}
    </select>

  );
}
