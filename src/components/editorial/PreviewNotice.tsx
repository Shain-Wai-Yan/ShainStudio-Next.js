'use client';
import {useState} from 'react';
/** An overlay leaves published page dimensions unchanged and can be hidden for visual review. */
export default function PreviewNotice({locale,status}:{locale:'en'|'zh';status:'draft'|'published'}) {
  const [visible,setVisible]=useState(true);
  return <aside aria-label="Saved preview controls" className="fixed bottom-3 left-3 z-[100] max-w-[calc(100vw-1.5rem)] rounded-lg border border-amber-500/40 bg-white/95 px-3 py-2 text-xs text-gray-900 shadow-lg backdrop-blur dark:bg-gray-900/95 dark:text-gray-100">
    {visible && <p className="mb-2 max-w-xs">{status==='draft'?'Saved draft':'Published version'} · {locale==='zh'?'中文':'English'}. Save in Strapi, then refresh this preview. Links expire after five minutes. Navigation opens published pages.</p>}
    <div className="flex gap-3"><button type="button" onClick={()=>setVisible(!visible)} className="underline">{visible?'Hide preview notice':'Preview'}</button>{visible && <button type="button" onClick={()=>window.location.reload()} className="font-semibold underline">Refresh saved draft</button>}</div>
  </aside>;
}
