import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

// Compress at build time, not on the course's small running machine. Keep the
// originals for clients that do not accept gzip and for content-type detection.
function compress(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) compress(path);
    else if (/\.(js|css)$/.test(entry.name))
      writeFileSync(`${path}.gz`, gzipSync(readFileSync(path), { level: 9 }));
  }
}
compress('dist');
