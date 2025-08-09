'use client';

import Link from 'next/link';
import { toAbsoluteUrl } from '@/lib/helpers';


export function SidebarHeader() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2.5 px-3.5 h-[70px]">
        <Link href="/">
          <img
            src={'https://keenthemes.com/metronic/tailwind/nextjs/demo6/media/app/mini-logo-circle.svg'}
            className="h-[34px]"
            alt=""
          />
        </Link>
        <div className="cursor-pointer text-mono font-medium flex items-center justify-between gap-2 w-[190px]">
          <span>
            Optimal Throw
          </span>
        </div>
      </div>
    </div>
  );
}
