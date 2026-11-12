const MAX_JSON_BYTES = 8 * 1024 * 1024;

/** Bound decoded response bytes before parsing, including chunked responses
 * without Content-Length. Shared by published reads and signed draft previews. */
export async function readBoundedCmsJson(response: Response): Promise<unknown> {
  if (Number(response.headers.get('content-length')) > MAX_JSON_BYTES) {
    await response.body?.cancel();
    throw new Error('CMS response exceeds its size limit');
  }
  const reader=response.body?.getReader();
  if (!reader) throw new Error('Empty CMS response');
  const chunks:Uint8Array[]=[];let size=0;
  try {
    while (true) {
      const {done,value}=await reader.read();if(done)break;
      size+=value.byteLength;
      if(size>MAX_JSON_BYTES){await reader.cancel();throw new Error('CMS response exceeds its size limit');}
      chunks.push(value);
    }
  } finally {reader.releaseLock();}
  return JSON.parse(Buffer.concat(chunks,size).toString('utf8'));
}
