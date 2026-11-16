"use client";
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../lib/api';
export type Envelope<T> = {data:T;fetchedAt:number};
export function useIntel<T>(dataset:string, interval=120000){
 return useQuery({queryKey:['intelligence',dataset],queryFn:()=>apiGet<Envelope<T>>('/api/intelligence/'+dataset),staleTime:60000,refetchInterval:interval,retry:1});
}
export type Headline = {title:string;source:string;link:string;publishedAt:number;snippet?:string;tickers?:string[];locationName?:string;isAlert?:boolean;importanceScore?:number;threat?:{level:string;category:string}};
export type Digest = {categories:Record<string,{items:Headline[]}>};
export type Risk = {region:string;combinedScore:number;trend:string;computedAt:number;methodologyVersion?:string};
export type Risks = {ciiScores:Risk[]};
export type Quake = {id:string;place:string;magnitude:number;depthKm:number;location:{latitude:number;longitude:number};occurredAt:number;sourceUrl:string;source:string};
export type Choke = {id:string;name:string;lat:number;lon:number;disruptionScore:number;description:string;status:string;affectedRoutes:string[];transitSummary?:{officialLatestDate?:string;officialLatestTotal?:number;dataAvailable?:boolean;todayCountsAvailable?:boolean;todayTotal?:number};flowEstimate?:{currentMbd:number;baselineMbd:number;source:string}};
export function dateTime(n?:number){return n ? new Date(n).toLocaleString('en-AU',{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'Timestamp unavailable';}
export function safeLink(url:string){try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.href:undefined;}catch{return undefined;}}
export const countryName=(code:string)=>{try{return new Intl.DisplayNames(['en'],{type:'region'}).of(code)||code;}catch{return code;}};
// Approximate geographic centres used only to frame the map, not for event locations.
export const centres:Record<string,[number,number]>={US:[-98,39],RU:[100,60],CN:[104,35],IR:[54,32],UA:[31,49],SY:[38,35],YE:[48,15],IQ:[44,33],PK:[69,30],MX:[-102,24],LB:[36,34],SA:[45,24],KP:[127,40],MM:[96,21],VE:[-66,7],AF:[67,34],IL:[35,31],IN:[79,22],CU:[-79,22],BR:[-52,-12],AE:[54,24],QA:[51,25],TR:[35,39],TW:[121,24],FR:[2,47],DE:[10,51],GB:[-2,54],JP:[138,37],EG:[30,27],KR:[128,36],PL:[19,52],AU:[134,-25]};
