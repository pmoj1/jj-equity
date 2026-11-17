import { dateTime } from './data';
export default function FeedStatus({pending,error,fetchedAt,sourceTime}:{pending:boolean;error:Error|null;fetchedAt?:number;sourceTime?:number}){
 return <div className="intel-status"><span className={error?'down':pending?'dim':'up'}>{error?'RECONNECTING':pending?'LOADING':'CONNECTED'}</span><span>{sourceTime?`Source ${dateTime(sourceTime)}`:fetchedAt?`Fetched ${dateTime(fetchedAt)}`:'Awaiting feed'}</span>{error&&<span title={error.message}>{error.message}</span>}</div>;
}
