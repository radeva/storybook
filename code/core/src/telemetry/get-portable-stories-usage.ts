import { execaCommand } from 'execa';

import { createFileSystemCache, resolvePathInStorybookCache } from '../common';

const cache = createFileSystemCache({
  basePath: resolvePathInStorybookCache('portable-stories'),
  ns: 'storybook',
  ttl: 24 * 60 * 60 * 1000, // 24h
});

export const getPortableStoriesFileCountUncached = async () => {
  const { stdout } = await execaCommand(`git grep -m1 -c composeStor`, {
    cwd: process.cwd(),
    shell: true,
  });
  return stdout.split('\n').filter(Boolean).length;
};

const CACHE_KEY = 'portableStories';
export const getPortableStoriesFileCount = async () => {
  let cached = await cache.get(CACHE_KEY);
  if (!cached) {
    try {
      const count = await getPortableStoriesFileCountUncached();
      cached = { count };
      await cache.set(CACHE_KEY, cached);
    } catch (err: any) {
      // exit code 1 if no matches are found
      const count = err.exitCode === 1 ? 0 : null;
      cached = { count };
    }
  }
  return cached.count;
};
