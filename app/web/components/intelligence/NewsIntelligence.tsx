"use client";
import {useMemo,useState} from 'react';
import {useTerminal} from '../../store/terminal';
import geography from '../../lib/intelligence-geography.json';
import {useIntel,type Digest,type Headline,safeLink,dateTime} from './data';
import FeedStatus from './FeedStatus';
export default function NewsIntelligence(){
 const q=useIntel<Digest>('headlines');const focus=useTerminal(s=>s.intelFocus);const symbol=useTerminal(s=>s.activeSymbol);const setSymbol=useTerminal(s=>s.setActiveSymbol);const [category,setCategory]=useState('all');const [linked,setLinked]=useState(true);const [search,setSearch]=useState('');const [priority,setPriority]=useState(true);
 const categories=Object.keys(q.data?.data.categories||{});
 const items=useMemo(()=>{
  const seen=new Set<string>();const country=focus?.country?geography.countries[focus.country as keyof typeof geography.countries]:undefined;
  const terms=focus?(country?.searchAliases||focus.keywords||[focus.name]).map(s=>s.toLowerCase()):[];
  return Object.entries(q.data?.data.categories||{}).flatMap(([c,v])=>category==='all'||category===c?v.items:[]).filter(i=>{if(seen.has(i.link))return false;seen.add(i.link);const text=`${i.title} ${i.snippet||''} ${i.locationName||''}`.toLowerCase();return (!search||text.includes(search.toLowerCase()))&&(!linked||!terms.length||terms.some(t=>text.includes(t)));}).sort((a,b)=>(priority?(Number(b.isAlert)-Number(a.isAlert)||(b.importanceScore||0)-(a.importanceScore||0)):0)||b.publishedAt-a.publishedAt);
 },[q.data,focus,category,linked,search,priority]);
 return <div className="intel-feed"><div className="intel-controls"><select aria-label="News category" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">ALL REGIONS</option>{categories.map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}</select><button className="term-btn" onClick={()=>setPriority(!priority)}>{priority?"PRIORITY":"LATEST"}</button><input aria-label="Search intelligence headlines" placeholder="Filter headlines…" value={search} onChange={e=>setSearch(e.target.value)}/><button className="term-btn" aria-pressed={linked} onClick={()=>setLinked(!linked)}>{linked?'LINKED':'UNLINKED'}</button></div>
 <div className="intel-caption">{linked&&focus?`Context: ${focus.name}`:'Global intelligence'} · {items.length} stories · Active ticker {symbol}</div>
 <div className="intel-scroll">{items.slice(0,100).map((i:Headline)=><article className="intel-story" key={i.link}><div className="intel-story-meta"><span className={i.isAlert?'amber':'dim'}>{i.threat?.category?.toUpperCase()||'NEWS'}</span><span>{i.source} · {dateTime(i.publishedAt)}</span></div><a href={safeLink(i.link)} target="_blank" rel="noopener noreferrer">{i.title}</a>{i.snippet&&<p>{i.snippet.replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').slice(0,260)}</p>}{i.tickers?.map(t=><button className="term-btn" key={t} onClick={()=>setSymbol(t)}>{t} ↗</button>)}</article>)}{!items.length&&!q.isPending&&<div className="intel-empty">{q.error?q.error.message:'No matching headlines. Unlink the panel or change the filter.'}</div>}</div><FeedStatus pending={q.isPending} error={q.error} fetchedAt={q.data?.fetchedAt}/></div>;
}
