"use client";

import Link from "next/link";
import { useCallback } from "react";

import { track } from "@/lib/analytics";
import { buttonClassNames } from "@/components/ui/Button";

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
    <Link
      href={href}
      className={buttonClassNames({ variant: "secondary", size: "lg" })}
      onClick={handleClick}
    >
      Explore the remedy
    </Link>
  );
}
