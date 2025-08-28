'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Container } from '@/components/common/container';
import Image from 'next/image';

export function Header() {
  const pathname = usePathname();
  // Remove unused state since it's not being used anywhere
  // const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Remove unused effect since isSheetOpen is not used
  // useEffect(() => {
  //   setIsSheetOpen(false);
  // }, [pathname]);

  return (
    <header className="flex lg:hidden items-center fixed z-10 top-0 start-0 end-0 shrink-0 bg-mono dark:bg-background h-(--header-height)">
      <Container className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/">
          <Image
            src={toAbsoluteUrl('/media/app/mini-logo-circle-success.svg')}
            className="h-[34px]"
            alt=""
          />
        </Link>
      </Container>
    </header>
  );
}
