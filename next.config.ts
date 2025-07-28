import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL(`${process.env.NEXT_PUBLIC_ACTUAL_BACKEND_URL}employee/profile-picture/**`)],
  }
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
