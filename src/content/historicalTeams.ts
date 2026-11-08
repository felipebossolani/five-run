import type { Attributes, Team } from '../domain/types';
import { players } from './catalog';

// Editorial season snapshots. Values are subjective estimates on the game's scale;
// sources document participation and context, not numerical skill measurements.
type Snapshot = [id:string, values:[number,number,number,number,number,number], note:string];
type Entry = [id:string, name:string, year:number, color:string, source:string, notes:string, five:Snapshot[]];
const entries: Entry[] = [
['chicago-1996','Chicago Bulls',1996,'#be4d40','https://www.nba.com/game/sea-vs-chi-0049500063/box-score','1995–96 roster; five selected by game groups.',[
['ron-harper',[70,78,82,88,65,78],'Veteran guard; defense and secondary creation.'],['michael-jordan',[90,98,87,96,70,93],'1995–96 return: elite scoring and defense; athleticism below his earlier peak.'],['scottie-pippen',[82,88,92,97,80,91],'Versatile perimeter defense and creation.'],['dennis-rodman',[47,72,64,96,99,88],'Rebounding and defense anchor; limited outside shooting.'],['luc-longley',[63,77,70,79,80,66],'Starting center; size and passing over speed.']]],
['golden-state-2017','Golden State Warriors',2017,'#dca94c','https://ak-static-int.nba.com/wp-content/uploads/sites/3/2016/10/2016-17-Media-Guide-Warriors.pdf','2016–17 media guide roster; Pachulia represents the center slot.',[
['stephen-curry',[99,91,94,74,55,88],'High-volume perimeter shooting and creation.'],['klay-thompson',[98,83,72,86,62,84],'Off-ball shooting and perimeter defense.'],['kevin-durant',[96,97,85,87,78,94],'Versatile high-efficiency scoring.'],['draymond-green',[76,79,91,98,87,87],'Defensive versatility and team creation.'],['zaza-pachulia',[55,72,72,78,83,62],'Screening, passing and rebounding; limited mobility.']]],
['los-angeles-2001','Los Angeles Lakers',2001,'#a384bd','https://www.nba.com/game/phi-vs-lal-0040000083/box-score','2000–01 roster; Fisher and Grant both featured in the title season.',[
['derek-fisher',[82,75,79,79,56,75],'Perimeter shooting and guard defense.'],['kobe-bryant',[87,96,86,92,66,97],'Young two-way scoring guard.'],['rick-fox',[81,76,76,85,70,73],'Wing shooting and defensive role.'],['horace-grant',[66,79,70,85,86,76],'Veteran interior defense and rebounding.'],['shaquille-o-neal',[45,99,78,92,96,99],'Dominant interior scoring and rebounding.']]],
['boston-1986','Boston Celtics',1986,'#6d9b73','https://www.nba.com/news/legendary-moments-celtics-go-40-1-home-1985-86','NBA describes the starting frontcourt and backcourt.',[
['dennis-johnson',[73,81,87,93,64,83],'Defensive guard and passer.'],['danny-ainge',[85,78,81,81,60,80],'Scoring guard and perimeter shooting.'],['larry-bird',[97,92,96,86,90,79],'Shooting, playmaking and rebounding forward.'],['kevin-mchale',[77,98,75,95,87,81],'Post scoring and interior defense.'],['robert-parish',[72,90,67,91,91,80],'Interior defense and rebounding.']]],
['san-antonio-2014','San Antonio Spurs',2014,'#a8b6b5','https://www.nba.com/game/sas-vs-mia-0041300403/game-charts','2013–14 roster; Duncan remains a forward in the catalog.',[
['tony-parker',[82,93,91,76,50,88],'Penetration and orchestration.'],['manu-ginobili',[87,84,90,83,65,79],'Veteran secondary creator and perimeter scorer.'],['kawhi-leonard',[82,84,73,95,81,89],'2014 defensive wing; creation below later peak.'],['tim-duncan',[72,88,80,94,91,72],'Veteran interior anchor rather than peak mobility.'],['tiago-splitter',[50,77,73,86,82,72],'Screening, interior defense and finishing.']]],
['miami-2013','Miami Heat',2013,'#d67c58','https://statsdmz.nba.com/pdfs/20130606/20130606_SASMIA_book.pdf','2012–13 roster; Bosh is a forward in the game; Andersen fills the center slot.',[
['mario-chalmers',[84,77,78,81,57,78],'Spot-up guard and perimeter defense.'],['dwyane-wade',[77,94,88,89,70,91],'Slashing and secondary creation.'],['lebron-james',[86,99,97,95,82,99],'Peak all-around creation and transition finishing.'],['chris-bosh',[84,88,75,87,83,84],'Mobile big and midrange scoring.'],['chris-andersen',[47,80,58,87,84,83],'Reserve rim protection and interior finishing.']]],
['houston-1994','Houston Rockets',1994,'#ba6555','https://ak-static-int.nba.com/wp-content/uploads/sites/3/2016/10/2016-17-Media-Guide-Rockets.pdf','1993–94 roster; Thorpe was on this team before his 1995 trade.',[
['kenny-smith',[87,78,83,74,51,78],'Perimeter shooting and ball handling.'],['vernon-maxwell',[82,82,78,87,58,85],'Defensive guard and outside scoring.'],['robert-horry',[82,78,74,83,76,84],'Young stretch forward and defender.'],['otis-thorpe',[59,88,68,86,91,84],'Interior finishing and rebounding.'],['hakeem-olajuwon',[80,99,77,99,96,97],'Two-way interior centerpiece.']]],
['detroit-2004','Detroit Pistons',2004,'#688aa7','https://www.nba.com/pistons/features/truebluepistons_120511.html','2003–04 roster; the Wallaces occupy separate forward and center slots.',[
['chauncey-billups',[88,82,89,88,61,82],'Half-court creation and outside shooting.'],['richard-hamilton',[91,84,77,85,59,88],'Movement shooting and stamina.'],['tayshaun-prince',[78,80,77,94,75,82],'Long perimeter defender.'],['rasheed-wallace',[86,89,73,95,85,84],'Spacing and interior defense.'],['ben-wallace',[43,75,58,99,98,95],'Rim protection and rebounding, limited shooting.']]],
['philadelphia-1983','Philadelphia 76ers',1983,'#ad7170','https://www.nba.com/sixers/76ers-alumni/moses-malone','1982–83 roster; Jones is a selected reserve, not a claim of a fixed starting five.',[
['maurice-cheeks',[73,83,92,95,56,87],'Passing and point-of-attack defense.'],['andrew-toney',[86,91,80,78,56,85],'Perimeter and driving scorer.'],['julius-erving',[81,95,84,89,81,94],'Wing finishing and open-court athleticism.'],['bobby-jones',[68,82,73,97,83,87],'Defensive forward and transition finisher.'],['moses-malone',[61,97,66,91,99,91],'Interior scoring and elite offensive rebounding.']]],
['new-york-1970','New York Knicks',1970,'#d79361','https://www.nba.com/news/history-season-review-1969-70','1969–70 roster; year labels the championship season.',[
['walt-frazier',[84,90,92,97,70,88],'Two-way guard and creator.'],['dick-barnett',[87,84,78,77,55,76],'Experienced perimeter scorer.'],['bill-bradley',[82,79,81,78,69,74],'Off-ball forward and passer.'],['dave-debusschere',[75,84,74,96,92,84],'Defensive forward and rebounder.'],['willis-reed',[75,91,70,94,94,83],'Post scoring and interior defense.']]],
['los-angeles-1987','Los Angeles Lakers',1987,'#b996cc','https://www.basketball-reference.com/teams/LAL/1987.html','1986–87 roster; Abdul-Jabbar is assessed as a veteran.',[
['magic-johnson',[82,91,99,77,78,88],'Offensive orchestration and transition passing.'],['byron-scott',[89,84,77,82,59,87],'Perimeter shooting and transition scoring.'],['james-worthy',[79,95,82,84,76,94],'Fast-break finishing and wing scoring.'],['a-c-green',[68,82,68,84,88,84],'Rebounding and interior support.'],['kareem-abdul-jabbar',[83,91,79,83,82,65],'Veteran post scoring and passing; reduced mobility.']]],
['milwaukee-1971','Milwaukee Bucks',1971,'#789786','https://www.nba.com/bucks/history/1971-championship-team','1970–71 roster; Greg Smith is selected at forward.',[
['oscar-robertson',[84,88,97,79,77,80],'Veteran playmaking and scoring.'],['jon-mcglocklin',[88,81,77,74,53,75],'Perimeter scoring and off-ball role.'],['bob-dandridge',[83,88,80,85,79,86],'Two-way wing.'],['greg-smith',[66,79,67,84,88,80],'Interior rebounding and defense.'],['kareem-abdul-jabbar',[78,99,78,97,96,95],'Young center with elite interior scoring and mobility.']]],

];

const localizedNames: Record<string, string> = {'United States':'Estados Unidos', 'Spain':'Espanha', 'Yugoslavia':'Iugoslávia', 'Lithuania':'Lituânia', 'Brazil':'Brasil'};
const catalog = new Map(players.map(player => [player.id, player]));
export const historicalTeams: Team[] = entries.map(([id,name,year,color,source,rosterNotes,five]) => ({
  id, name: {'pt-BR': localizedNames[name] ?? name, en: name}, color, playerIds: five.map(([playerId]) => playerId),
  historical: {year, label:{'pt-BR':`${localizedNames[name] ?? name} ${year}`, en:`${name} ${year}`}, sources:[source], rosterNotes},
  attributeOverrides: Object.fromEntries(five.map(([playerId, values, note]) => {
    const [shooting,finishing,playmaking,defense,rebounding,athleticism] = values;
    const attributes: Attributes = {shooting,finishing,playmaking,defense,rebounding,athleticism};
    const profile = catalog.get(playerId);
    return [playerId, {attributes, year, sourceUrls:[...new Set([source, ...(profile ? [profile.sources.find(s => /individual/i.test(s.supports))?.url ?? profile.sources[0]?.url].filter((url): url is string => Boolean(url)) : [])])], notes:`Editorial estimate for ${year}; ${note} The cited sources support roster and historical context, not a numerical measurement. Review pending.`}];
  })),
}));
