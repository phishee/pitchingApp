'use client';

import { ReactNode } from 'react';
import { BrandedLayout } from './layouts/branded';

export default function Layout({ children }: { children: ReactNode }) {
  return <BrandedLayout>{children}</BrandedLayout>;
}
