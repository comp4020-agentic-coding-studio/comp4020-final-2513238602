import { expect, inject, it } from 'vitest';

it('serves the same JavaScript with negotiated build-time gzip and a correct identity fallback',async()=>{
  const base=inject('baseUrl');
  const html=await (await fetch(base)).text();
  const asset=html.match(/src="([^\"]+\.js)"/)?.[1];expect(asset).toBeTruthy();
  const gzip=await fetch(new URL(asset!,base),{headers:{'accept-encoding':'gzip'}});
  const identity=await fetch(new URL(asset!,base),{headers:{'accept-encoding':'gzip;q=0, identity'}});
  expect(gzip.headers.get('content-encoding')).toBe('gzip');expect(identity.headers.get('content-encoding')).toBeNull();
  expect(gzip.headers.get('vary')).toBe('Accept-Encoding');expect(gzip.headers.get('content-type')).toContain('javascript');
  expect(Number(gzip.headers.get('content-length'))).toBeLessThan(Number(identity.headers.get('content-length')));
  expect(await gzip.text()).toBe(await identity.text());
});
