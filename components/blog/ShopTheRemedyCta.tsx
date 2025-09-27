"use client";

import Link from "next/link";
import { useCallback } from "react";

import { track } from "@/lib/analytics";

interface ShopTheRemedyCtaProps {
  href: string;
  productName: string;
  postSlug: string;
}

export function ShopTheRemedyCta({ href, productName, postSlug }: ShopTheRemedyCtaProps) {
  const handleClick = useCallback(() => {
    track("shop_module_clicked", {
      href,
      product_name: productName,
      post_slug: postSlug,
    });
  }, [href, postSlug, productName]);

  return (
    <Link href={href} className="btn btn--secondary btn--lg" onClick={handleClick}>
      Explore the remedy
    </Link>
  );
}
