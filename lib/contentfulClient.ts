import "server-only";

import { createClient, type Environment } from "contentful-management";

const DEFAULT_ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT ?? "master";

let environmentPromise: Promise<Environment> | null = null;

const getClient = () => {
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!managementToken) {
    throw new Error("CONTENTFUL_MANAGEMENT_TOKEN environment variable is required");
  }

  return createClient({ accessToken: managementToken });
};

export const getContentfulEnvironment = async (): Promise<Environment> => {
  if (!environmentPromise) {
    environmentPromise = (async () => {
      const spaceId = process.env.CONTENTFUL_SPACE_ID;
      if (!spaceId) {
        throw new Error("CONTENTFUL_SPACE_ID environment variable is required");
      }

      const client = getClient();
      const space = await client.getSpace(spaceId);
      return space.getEnvironment(DEFAULT_ENVIRONMENT);
    })();
  }

  return environmentPromise;
};

export type ContentfulLocaleValue<T> = {
  [locale: string]: T;
};

export const withDefaultLocale = <T>(value: T, locale = "en-US"): ContentfulLocaleValue<T> => ({
  [locale]: value,
});
