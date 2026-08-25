/**
 * Where the support screen points.
 *
 * Set a URL to empty string to hide that option — the screen renders whatever
 * is non-empty, so a link that isn't set up yet simply doesn't appear rather
 * than shipping a dead button.
 */
export type SupportLinkKey = 'kofi' | 'github' | 'bmc';

export type SupportLink = {
  key: SupportLinkKey;
  url: string;
};

export const SUPPORT_LINKS: SupportLink[] = [
  { key: 'kofi', url: 'https://ko-fi.com/robtar97' },
  { key: 'github', url: 'https://github.com/sponsors/RobTar97' },
  { key: 'bmc', url: 'https://buymeacoffee.com/robtar97' },
];

export const activeSupportLinks = () => SUPPORT_LINKS.filter((l) => l.url.trim().length > 0);
