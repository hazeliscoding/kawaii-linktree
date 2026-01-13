import type { LinkItem } from './link-item';

export type SiteConfig = {
  profile: {
    name: string;
    handle: string;
    bio: string;
    avatarUrl: string;
  };
  links: LinkItem[];
  footer: {
    text: string;
  };
};
