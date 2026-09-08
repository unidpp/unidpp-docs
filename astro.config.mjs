// @ts-check
import { defineConfig } from 'astro/config';

import starlight from '@astrojs/starlight';

// https://astro.build/config/
export default defineConfig({
  site: 'https://docs.unidpp.org',
  integrations: [
    starlight({
      title: 'UniDPP Docs',
      description:
        'Operator documentation for the UniDPP digital product passport platform: the operator manifest, the console, the service references, federation, and deployment guides.',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/unidpp' },
      ],
      sidebar: [
        {
          label: 'Get started',
          items: [
            { label: 'Five-minute tour', slug: 'get-started/tour' },
            { label: 'Run the reference stack', slug: 'get-started/reference-stack' },
            { label: 'Your first passport, pack, and verification', slug: 'get-started/first-passport' },
          ],
        },
        {
          label: "Operator's manual",
          items: [
            { label: 'The operator manifest reference', slug: 'operators/manifest' },
            { label: 'Deployment profiles', slug: 'operators/profiles' },
            { label: 'The admin console', slug: 'operators/console' },
            { label: 'Multi-tenant operations', slug: 'operators/multi-tenant' },
            { label: 'Backup and restore', slug: 'operators/backup-restore' },
            { label: 'Security posture', slug: 'operators/security' },
          ],
        },
        {
          label: 'Service references',
          items: [{ autogenerate: { directory: 'services' } }],
        },
        {
          label: 'Architecture',
          items: [{ label: 'Architecture pointers', slug: 'architecture' }],
        },
        {
          label: 'Federation',
          items: [
            { label: 'Running a national peer (JP)', slug: 'federation/jp-peer' },
            { label: 'Cross-register mappings', slug: 'federation/cross-register' },
            { label: 'UNTP and EN 18222 interop', slug: 'federation/untp' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'The 15-minute whitelabel deployment', slug: 'quickstart-whitelabel' },
          ],
        },
      ],
    }),
  ],
});
