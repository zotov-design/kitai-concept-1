// Explicit ?qa=1 only. Small visible overlay makes measured results reviewable.
const output=document.createElement('output');
output.id='qa-metrics';
output.style.cssText='position:fixed;z-index:9999;bottom:4px;left:4px;padding:6px 9px;background:#fff;color:#152c40;font:11px monospace;border:1px solid #bbb;pointer-events:none';
document.body.append(output);
let cls=0,longTasks=0,maxTask=0;
const render=()=>output.textContent=`QA: CLS ${cls.toFixed(4)} | tasks>50ms ${longTasks} | max ${Math.round(maxTask)}ms`;
render();
if(PerformanceObserver.supportedEntryTypes.includes('layout-shift'))new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)cls+=entry.value;render();}).observe({type:'layout-shift',buffered:true});
if(PerformanceObserver.supportedEntryTypes.includes('longtask'))new PerformanceObserver(list=>{for(const entry of list.getEntries()){longTasks++;maxTask=Math.max(maxTask,entry.duration);}render();}).observe({type:'longtask',buffered:true});
