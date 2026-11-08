import { players } from '../src/content/catalog';
import { FEATURED_PLAYER_IDS, FEATURED_PLAYER_SET } from '../src/content/featured';
import { historicalTeams } from '../src/content/historicalTeams';
import { ATTRIBUTES, DRAFT_OPTIONS, RULES_VERSION } from '../src/domain/config';
import { newRun, offerDraft, choosePlayer, startTournament, playNext, overall, teamProfile } from '../src/domain/game';
import { random, shuffle } from '../src/domain/random';
import type { Group, Player, Run } from '../src/domain/types';

const byId = new Map(players.map(p => [p.id,p]));
const slots: Group[] = ['G','G','F','F','C'];
for (const id of FEATURED_PLAYER_IDS) if (!byId.has(id)) throw Error(`Missing featured player: ${id}`);
const sizes = Object.fromEntries((['G','F','C'] as Group[]).map(g => [g,players.filter(p=>p.group===g).length]));
const featuredCounts = Object.fromEntries((['G','F','C'] as Group[]).map(g => [g,FEATURED_PLAYER_IDS.filter(id=>byId.get(id)!.group===g).length]));
function noFeatured(n:number,k:number,draws:number) {
  let p=1; for(let i=0;i<draws;i++) p *= (n-k-i)/(n-i); return p;
}
function quantile(a:number[],q:number) {
  const b=[...a].sort((x,y)=>x-y); return b[Math.floor((b.length-1)*q)];
}
const quantiles=(a:number[])=>Object.fromEntries([.1,.5,.9].map(q=>[`p${q*100}`,Number(quantile(a,q).toFixed(2))]));
// Rules v3's uniform candidate distribution, reproduced locally: do not call
// offerDraft here, because the production function implements rules v4.
function uniformOffer(input:Run):Run {
  const r=structuredClone(input);
  if(r.status!=='draft'||r.offeredPlayerIds.length) return r;
  r.offeredPlayerIds=shuffle(players.filter(p=>p.group===slots[r.draftRound]&&!r.seenPlayerIds.includes(p.id)),
    random(`${r.seed}:draft:${r.draftRound}`)).slice(0,DRAFT_OPTIONS).map(p=>p.id);
  r.seenPlayerIds.push(...r.offeredPlayerIds);
  return r;
}
type Policy = 'maxOVR'|'preferFeatured'|'random';
const order=(a:Player,b:Player)=>overall(b)-overall(a)||a.id.localeCompare(b.id);
function choose(r:Run,policy:Policy):Player {
  const offered=r.offeredPlayerIds.map(id=>byId.get(id)!);
  if(policy==='random') {
    // Independent audit RNG: does not consume either the draft or match RNG.
    return offered[Math.floor(random(`${r.seed}:audit:choice:${r.draftRound}`)()*offered.length)];
  }
  const highlighted=offered.filter(p=>FEATURED_PLAYER_SET.has(p.id));
  return (policy==='preferFeatured' && highlighted.length ? highlighted : offered).sort(order)[0];
}
const n=Number(process.argv[2] ?? 2000);
if (!Number.isInteger(n)||n<1) throw Error('run count must be a positive integer');
const started=performance.now();
function batch(featuredDistribution:boolean,policy:Policy) {
  const chosenOvr:number[]=[], attrMeans:Record<string,number[]>=Object.fromEntries(ATTRIBUTES.map(a=>[a,[]]));
  let offeredAny=0,offeredAll=0,chosenFeatured=0,chosenAll=0,groupsWon=0,groupGames=0,qualified=0,finals=0,titles=0;
  const offeredRounds=[0,0,0,0,0];
  for(let i=0;i<n;i++){
    let r=newRun(`draft-audit-v4-20261102-${i}`),roundsWithFeatured=0,featuredChosen=0;
    for(let round=0;round<5;round++){
      r=featuredDistribution ? offerDraft(r) : uniformOffer(r);
      const hasFeatured=r.offeredPlayerIds.some(id=>FEATURED_PLAYER_SET.has(id));
      offeredRounds[round]+=Number(hasFeatured);roundsWithFeatured+=Number(hasFeatured);
      const pick=choose(r,policy);featuredChosen+=Number(FEATURED_PLAYER_SET.has(pick.id));
      r=choosePlayer(r,pick.id);
    }
    offeredAny+=Number(roundsWithFeatured>0);offeredAll+=Number(roundsWithFeatured===5);
    chosenFeatured+=featuredChosen;chosenAll+=Number(featuredChosen===5);
    const roster=r.chosenPlayerIds.map(id=>byId.get(id)!);
    chosenOvr.push(roster.reduce((s,p)=>s+overall(p),0)/5);
    for(const a of ATTRIBUTES) attrMeans[a].push(roster.reduce((s,p)=>s+p.attributes[a],0)/5);
    r=startTournament(r);
    while(r.status!=='ended') r=playNext(r);
    const group=r.results.filter(m=>m.stage==='groups'&&(m.homeId==='user'||m.awayId==='user'));
    groupGames+=group.length;groupsWon+=group.filter(m=>m.winnerId==='user').length;
    qualified+=Number(group.length===3 && r.knockout.semifinals.some(p=>p.includes('user')));
    finals+=Number(r.knockout.final.includes('user'));
    titles+=Number(r.knockout.champion==='user');
  }
  return {runs:n,offeredAnyFeatured:offeredAny/n,offeredAllFive:offeredAll/n,perRoundFeatured:offeredRounds.map(x=>x/n),
    chosenFeaturedMean:chosenFeatured/n,chosenAllFive:chosenAll/n,
    chosenMeanOvr:quantiles(chosenOvr),chosenMeanAttributes:Object.fromEntries(ATTRIBUTES.map(a=>[a,quantiles(attrMeans[a])])),
    groupGameWinRate:groupsWon/groupGames,groupQualification:qualified/n,semifinalWinConditional:qualified?finals/qualified:0,
    finalAppearance:finals/n,finalWinConditional:finals?titles/finals:0,titleRate:titles/n};
}
const gNo6=noFeatured(sizes.G,featuredCounts.G,6),fNo6=noFeatured(sizes.F,featuredCounts.F,6);
const gBoth=1-2*gNo6+noFeatured(sizes.G,featuredCounts.G,12);
const fBoth=1-2*fNo6+noFeatured(sizes.F,featuredCounts.F,12);
const cSeen=1-noFeatured(sizes.C,featuredCounts.C,6);
const out={
  assumptions:'Same seed strings and current rules version for both distributions; recognition is editorial, not measured popularity; OVR is weighted and rounded. Random choice has a separate audit RNG.',
  rulesVersion:RULES_VERSION,sizes,featuredCounts,featuredIds:FEATURED_PLAYER_IDS,
  analyticalUniform:{perRound:{G:1-gNo6,F:1-fNo6,C:cSeen},
    anyFive:1-noFeatured(sizes.G,featuredCounts.G,12)*noFeatured(sizes.F,featuredCounts.F,12)*noFeatured(sizes.C,featuredCounts.C,6),
    allFive:gBoth*fBoth*cSeen},
  historical:historicalTeams.map(t=>({id:t.id,name:t.name.en,meanOvr:t.playerIds.reduce((s,id)=>{const p=byId.get(id)!;return s+overall({...p,attributes:t.attributeOverrides![id].attributes});},0)/5,attributes:teamProfile(t)})),
  scenarios:Object.fromEntries((['maxOVR','preferFeatured','random'] as Policy[]).map(policy=>[policy,{uniform:batch(false,policy),featured:batch(true,policy)}])),
  runtimeSeconds:(performance.now()-started)/1000,
};
console.log(JSON.stringify(out,null,2));
