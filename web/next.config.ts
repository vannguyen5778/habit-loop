import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  // Serwist requires webpack — opt out of Turbopack for builds
  turbopack: {},
  // Disable the Next.js dev toolbar
  devIndicators: false,
};

export default withSerwist(nextConfig);
