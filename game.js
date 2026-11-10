import * as THREE from 'three';

const canvas = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#252523');
scene.fog = new THREE.FogExp2('#242320', .023);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 100);
camera.position.set(0, 10.5, 19.5);
camera.lookAt(0, 1, -1.3);
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.HemisphereLight('#d5c9b0', '#37302b', 2));
const moon = new THREE.DirectionalLight('#f0d7aa', 3.2);
moon.position.set(-5, 12, 8); moon.castShadow = true;
moon.shadow.mapSize.set(1024,1024); moon.shadow.camera.left=-16; moon.shadow.camera.right=16; moon.shadow.camera.top=18; moon.shadow.camera.bottom=-14;
scene.add(moon);
const fill = new THREE.PointLight('#c56537', 30, 18); fill.position.set(0,4,-7); scene.add(fill);
const world = new THREE.Group(); scene.add(world);
const mat = (color, roughness=.86, metalness=0) => new THREE.MeshStandardMaterial({color, roughness, metalness});
const materials = {
 stone:['#55514a','#625c52','#4b4842','#70685c','#59564f'].map(c=>mat(c)),
 wall:mat('#655a49'), dark:mat('#292824'), wood:mat('#473427'), trim:mat('#897657'), gold:mat('#b58d50',.5,.35), iron:mat('#7d7b70',.4,.65), red:mat('#8f2823'), cloth:mat('#d4c6a9'), skin:mat('#a77b5d'), black:mat('#282d2c'), glow:new THREE.MeshBasicMaterial({color:'#ff9b43'})
};
function mesh(geometry, material, parent=world, pos=[0,0,0]) { const m=new THREE.Mesh(geometry,material); m.position.set(...pos); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m; }
function box(parent,pos,size,material,rotation) { const m=mesh(new THREE.BoxGeometry(...size),material,parent,pos); if(rotation)m.rotation.set(...rotation); return m; }
function cylinder(parent,pos,rTop,rBot,height,material,segments=8,rotation) { const m=mesh(new THREE.CylinderGeometry(rTop,rBot,height,segments),material,parent,pos); if(rotation)m.rotation.set(...rotation); return m; }
function sphere(parent,pos,r,material,scale=[1,1,1],segments=12) { const m=mesh(new THREE.SphereGeometry(r,segments,Math.max(6,segments>>1)),material,parent,pos); m.scale.set(...scale); return m; }
function makeStoneTexture() {
 const c=document.createElement('canvas'); c.width=512;c.height=512;const x=c.getContext('2d');x.fillStyle='#57534b';x.fillRect(0,0,512,512);
 for(let row=0;row<12;row++){const y=row*44-4,offset=row%2?0:41;for(let col=-1;col<7;col++){const px=col*82+offset,shade=53+Math.random()*30;x.fillStyle=`rgb(${shade},${shade-2},${shade-7})`;x.fillRect(px+2,y+2,74,34);x.strokeStyle='rgba(25,24,21,.7)';x.lineWidth=3;x.strokeRect(px+2,y+2,74,34);x.fillStyle='rgba(210,190,154,.09)';x.fillRect(px+6,y+5,62,2);}}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(3,5);return tex;
}
const ground=mesh(new THREE.PlaneGeometry(27,38),new THREE.MeshStandardMaterial({map:makeStoneTexture(),roughness:1}),world,[0,-.12,-2]);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;
function buildFacade(x,z,w,h) {
 box(world,[x,h/2,z],[w,h,1.05],materials.wall);
 for(let y=1.6;y<h-1;y+=2.35){for(let xx=x-w/2+.5;xx<x+w/2-.2;xx+=2.1){box(world,[xx,y,z+.55],[.13,.14,.12],materials.wood);box(world,[xx,y+1.05,z+.55],[.1,1.9,.12],materials.wood);if(Math.abs(xx-x)<w/2-.7){box(world,[xx,y+.92,z+.67],[.64,1,.1],materials.dark);box(world,[xx-.36,y+1.48,z+.72],[.13,1.12,.13],materials.trim);box(world,[xx+.36,y+1.48,z+.72],[.13,1.12,.13],materials.trim);box(world,[xx,y+2.03,z+.72],[.84,.13,.14],materials.trim);box(world,[xx,y+1.45,z+.79],[.06,1,.04],materials.wood);}}}
 for(let xx=x-w/2;xx<=x+w/2;xx+=2.1)box(world,[xx,.45,z+.62],[.16,.9,.16],materials.wood);
 for(let xx=x-w/2;xx<x+w/2;xx+=2.1)box(world,[xx,h-.35,z+.61],[.18,.7,.18],materials.wood);
 box(world,[x,h-.1,z],[w+.3,.3,1.2],materials.wood);
 for(let xx=x-w/2;xx<x+w/2;xx+=.5)box(world,[xx,h+.1,z],[.12,.35,1.3],materials.wood);
 const roof=mesh(new THREE.ConeGeometry(w*.78,1.6,4),materials.dark,world,[x,h+.85,z]);roof.rotation.y=Math.PI/4;roof.scale.set(1,1,.72);
}
buildFacade(-8.1,-8.6,9,8);buildFacade(8.1,-9.6,9,9);
box(world,[0,3,-12],[9,6,1.2],mat('#49443b'));box(world,[0,3.8,-11.3],[3.1,4.7,.35],materials.dark);box(world,[0,1.8,-11.05],[2.25,3.4,.18],mat('#372e25'));
for(const x of [-2.2,2.2]){box(world,[x,3.1,-11.15],[.44,6.2,.6],materials.trim);box(world,[x,6.25,-11.15],[.76,.36,.78],materials.gold);}
box(world,[0,6.2,-11.2],[5.3,.5,.75],materials.wood);
for(const s of [-1,1]){box(world,[s*12,2,-1],[.7,4,23],materials.wall);for(let z=-10;z<9;z+=2.3){box(world,[s*11.7,4,z],[1.2,1.1,.6],materials.trim);box(world,[s*11.7,4.6,z],[1.25,.25,.68],materials.wood);}}
const fireLights=[];
function torch(x,z){const p=new THREE.Group();world.add(p);p.position.set(x,0,z);cylinder(p,[0,1.6,0],.09,.12,3.2,materials.wood,7);box(p,[0,2.85,0],[.6,.13,.6],materials.wood);for(let a=0;a<4;a++){const angle=a*Math.PI/2;box(p,[Math.cos(angle)*.23,3.08,Math.sin(angle)*.23],[.08,.45,.08],materials.iron,[0,0,-angle]);}sphere(p,[0,3.12,0],.2,materials.glow,[.7,1.5,.7],8);const light=new THREE.PointLight('#ff8c38',17,8,2);light.position.set(x,3.2,z);scene.add(light);fireLights.push({light,base:17,seed:Math.random()*10});}
for(const [x,z] of [[-6.3,-4.5],[6.6,-6.8],[-6.8,3],[7,2.2]])torch(x,z);
function barrel(x,z){const g=new THREE.Group();world.add(g);g.position.set(x,0,z);cylinder(g,[0,.54,0],.43,.34,1.08,materials.wood,10);for(const y of [.14,.9])cylinder(g,[0,y,0],.39,.39,.09,materials.iron,10);for(let a=0;a<8;a++){const t=a*Math.PI/4;box(g,[Math.sin(t)*.32,.55,Math.cos(t)*.32],[.055,.75,.055],materials.trim,[0,t,0]);}}
barrel(-8.6,1);barrel(8.4,-1.7);barrel(-9.2,-7);box(world,[8.7,.5,5],[1,1,1],materials.wood,[0,.4,0]);box(world,[8.72,1.03,5],[1.1,.12,1.1],materials.trim,[0,.4,0]);
function banner(x,z){box(world,[x,3.4,z],[.1,6.8,.1],materials.wood);box(world,[x+.45,6.5,z],[1,.09,.09],materials.gold);mesh(new THREE.PlaneGeometry(1.05,1.85),materials.red,world,[x+.47,5.48,z]).rotation.y=.12;box(world,[x+.47,5.6,z+.035],[.12,.85,.05],materials.cloth);box(world,[x+.47,5.75,z+.07],[.48,.13,.05],materials.cloth);}
banner(-8.1,-3.6);banner(8.35,-4.2);
function cross(parent,x,y,z,size,colorMat){box(parent,[x,y,z],[size*.22,size,.055],colorMat);box(parent,[x,y+size*.1,z+.005],[size*.78,size*.2,.06],colorMat);}
function humanoid(kind='enemy',variant=0){
 const player=kind==='player',root=new THREE.Group(),visual=new THREE.Group();root.add(visual);world.add(root);
 const armor=player?mat('#ddd4bf',.48,.23):[mat('#4b2824',.55,.25),mat('#49433b',.5,.4),mat('#333a3c',.48,.5)][variant%3];
 const cloth=player?mat('#a32f28'):[mat('#8d3026'),mat('#7d211e'),mat('#67513a')][variant%3];
 const darkMetal=mat(player?'#7b796e':'#262a29',.38,.67),pale=player?mat('#ebe1ca',.42,.3):mat('#a49a87',.42,.45);
 const parts={root,visual,arms:[],legs:[],armor,cloth,kind,variant};
 cylinder(visual,[0,.98,0],.4,.48,.5,cloth,8);
 const body=mesh(new THREE.BoxGeometry(.78,.86,.46),armor,visual,[0,1.53,0]);body.rotation.x=-.04;
 box(visual,[0,1.23,.245],[.52,.55,.055],cloth);cross(visual,0,1.25,.285,player?.44:.28,player?materials.cloth:materials.cloth);
 for(const s of [-1,1]){sphere(visual,[s*.48,1.86,0],.24,armor,[1.15,.85,1]);cylinder(visual,[s*.48,1.76,0],.18,.22,.15,darkMetal,8);}
 cylinder(visual,[0,2.13,0],.28,.31,.48,darkMetal,8);sphere(visual,[0,2.36,0],.29,armor,[1,.83,1],10);box(visual,[0,2.13,.263],[.42,.1,.035],materials.dark);box(visual,[0,2.14,.287],[.29,.025,.02],mat('#c5a363',.45,.5));box(visual,[0,2.42,-.01],[.1,.38,.12],cloth,[.12,0,.03]);
 box(visual,[0,.88,.25],[.5,.8,.07],cloth,[.09,0,0]);if(player)cross(visual,0,.91,.3,.43,materials.red);
 for(const s of [-1,1]){const leg=new THREE.Group();leg.position.set(s*.23,.77,0);visual.add(leg);parts.legs.push(leg);cylinder(leg,[0,-.25,0],.16,.19,.52,darkMetal,8);box(leg,[0,-.53,.1],[.37,.19,.58],mat('#35332e'));const arm=new THREE.Group();arm.position.set(s*.48,1.77,0);visual.add(arm);parts.arms.push(arm);cylinder(arm,[s*.05,-.24,0],.13,.16,.51,armor,8,[0,0,-s*.12]);sphere(arm,[s*.07,-.52,.02],.15,darkMetal,[1,1.15,.9],8);}
 const shield=new THREE.Group();shield.position.set(-.7,1.2,.22);shield.rotation.y=-.12;visual.add(shield);parts.shield=shield;cylinder(shield,[0,0,0],.38,.38,.12,materials.gold,8,[Math.PI/2,0,0]);cylinder(shield,[0,0,.06],.32,.32,.035,player?materials.red:darkMetal,8,[Math.PI/2,0,0]);cross(shield,0,0,.09,.38,player?materials.cloth:cloth);
 const sword=new THREE.Group();sword.position.set(.66,1.28,.14);visual.add(sword);parts.sword=sword;box(sword,[0,-.12,.02],[.09,.32,.1],materials.wood);box(sword,[0,.02,.02],[.34,.07,.12],materials.gold);box(sword,[0,.48,.02],[.12,.88,.075],pale);const tip=mesh(new THREE.ConeGeometry(.085,.24,4),pale,sword,[0,1.03,.02]);tip.rotation.z=Math.PI;box(sword,[0,.55,.065],[.025,.48,.012],mat('#fff0d3',.28,.5));box(visual,[0,1.25,.31],[.14,.14,.07],materials.gold);
 const shadow=mesh(new THREE.CircleGeometry(player?.55:.48,16),new THREE.MeshBasicMaterial({color:'#11100e',transparent:true,opacity:.38,depthWrite:false}),world,[0,.012,0]);shadow.rotation.x=-Math.PI/2;parts.shadow=shadow;
 parts.hp=player?100:variant===2?65:45;parts.maxHp=parts.hp;parts.alive=true;parts.cool=0;parts.attack=0;parts.flash=0;parts.vx=0;parts.vz=0;parts.movePhase=Math.random()*6;
 if(!player){const bar=new THREE.Group();visual.add(bar);bar.position.set(0,2.85,.02);mesh(new THREE.PlaneGeometry(.72,.075),mat('#261c19'),bar);parts.healthBar=mesh(new THREE.PlaneGeometry(.68,.045),mat('#b74331'),bar,[0,0,.006]);}
 return parts;
}
const hero=humanoid('player');hero.root.position.set(0,0,4.2);hero.root.rotation.y=Math.PI;hero.shadow.position.set(0,.014,4.2);
const enemies=[];
function spawnEnemy(x,z,variant=0){const e=humanoid('enemy',variant);e.root.position.set(x,0,z);e.root.rotation.y=Math.PI;e.shadow.position.set(x,.015,z);e.speed=variant===2?1.22:1.55;enemies.push(e);return e;}

const keys=new Set();let active=false,over=false,paused=false,score=0,streak=0,streakTimer=0,wave=1,kills=0,spawnTimer=1.5,attackCooldown=0,dodgeCooldown=0,dodgeTime=0,invulnerable=0,toastTimer=0,worldTime=0;
let soundOn=false,audioContext=null;
const ui={healthFill:document.querySelector('#healthFill'),healthNumber:document.querySelector('#healthNumber'),score:document.querySelector('#score'),combo:document.querySelector('#combo'),wave:document.querySelector('#waveText'),objective:document.querySelector('#objectiveText'),toast:document.querySelector('#toast'),intro:document.querySelector('#intro'),end:document.querySelector('#gameOver'),loading:document.querySelector('#loading')};
function showToast(text){ui.toast.textContent=text;ui.toast.classList.add('show');toastTimer=1.8;}
function updateHud(){ui.healthFill.style.width=`${Math.max(0,hero.hp)}%`;ui.healthNumber.textContent=Math.max(0,Math.ceil(hero.hp));ui.score.textContent=String(score).padStart(3,'0');ui.combo.textContent=`x${Math.max(1,streak)}`;ui.wave.textContent=`WAVE ${String(wave).padStart(2,'0')}`;}
function playTone(freq,duration,type='sine'){if(!soundOn)return;try{audioContext??=new AudioContext();if(audioContext.state==='suspended')audioContext.resume();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(.035,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+duration);}catch{}}
function beginGame(){if(active)return;active=true;over=false;ui.intro.classList.add('hidden');showToast('THE OATH ENDS HERE');setTimeout(()=>{if(!over)spawnEnemy(-2.2,-2.5,0);},200);setTimeout(()=>{if(!over)spawnEnemy(2.4,-4.2,1);},850);}
function resetGame(){for(const e of enemies){world.remove(e.root);world.remove(e.shadow);}enemies.length=0;hero.hp=100;hero.root.position.set(0,0,4.2);hero.root.rotation.y=Math.PI;hero.visual.position.y=0;score=0;streak=0;kills=0;wave=1;spawnTimer=1.5;attackCooldown=dodgeCooldown=dodgeTime=invulnerable=0;over=false;active=true;ui.end.classList.add('hidden');updateHud();showToast('A NEW OATH');spawnEnemy(-2.2,-2.5,0);spawnEnemy(2.4,-4.2,1);}
function endGame(){over=true;active=false;document.querySelector('#endTitle').textContent='FALLEN IN ACRE';document.querySelector('#endCopy').textContent=`You cut down ${kills} foe${kills===1?'':'s'} and scored ${score}. The oath is not yet fulfilled.`;ui.end.classList.remove('hidden');}
const effects=[],pickups=[];
const slashMat=new THREE.MeshBasicMaterial({color:'#f5d69c',transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false});
function damageEnemy(e,amount,dir){e.hp-=amount;e.flash=.12;e.root.position.x+=dir.x*.18;e.root.position.z+=dir.z*.18;e.attack=0;if(e.healthBar)e.healthBar.scale.x=Math.max(.02,e.hp/e.maxHp);if(e.hp<=0){e.alive=false;e.deathTimer=.65;e.root.rotation.z=(Math.random()-.5)*1.1;score+=100+Math.min(200,streak*10);streak++;kills++;streakTimer=4;updateHud();playTone(125,.11,'sawtooth');if(kills%5===0)createPickup(e.root.position.clone());if(kills===4){ui.objective.textContent='Survive the next wave';showToast('THE PATROL IS BROKEN');}}}
function createPickup(pos){const group=new THREE.Group();world.add(group);group.position.copy(pos);const ring=mesh(new THREE.TorusGeometry(.23,.045,6,18),mat('#dfb767',.45,.35),group,[0,.28,0]);ring.rotation.x=Math.PI/2;sphere(group,[0,.52,0],.15,mat('#e2bd73',.42,.15),[.8,1.3,.8],8);pickups.push({group,life:12});showToast('A VIAL OF LIFE');}
function doAttack(){if(!active||over||paused||attackCooldown>0)return;attackCooldown=.48;hero.attack=.34;hero.sword.rotation.set(-.3,0,-1.7);playTone(185,.065,'triangle');let nearest=null,nearestDist=2.35;for(const e of enemies){if(!e.alive)continue;const dist=Math.hypot(e.root.position.x-hero.root.position.x,e.root.position.z-hero.root.position.z);if(dist<nearestDist){nearest=e;nearestDist=dist;}}if(nearest)faceTo(hero,nearest.root.position.x-hero.root.position.x,nearest.root.position.z-hero.root.position.z);const facing=new THREE.Vector3(-Math.sin(hero.root.rotation.y),0,-Math.cos(hero.root.rotation.y));for(const e of enemies){if(!e.alive)continue;const to=new THREE.Vector3().subVectors(e.root.position,hero.root.position);to.y=0;const dist=to.length();if(dist<2.35&&to.normalize().dot(facing)>.05)damageEnemy(e,24+Math.random()*9,facing);}const slash=mesh(new THREE.TorusGeometry(1.05,.035,6,30,Math.PI*1.1),slashMat,world,[hero.root.position.x+facing.x*.8,.92,hero.root.position.z+facing.z*.8]);slash.rotation.set(Math.PI/2,0,Math.atan2(facing.x,-facing.z)-.65);slash.userData.life=.19;effects.push(slash);}
function dodge(){if(!active||over||paused||dodgeCooldown>0)return;dodgeCooldown=.95;dodgeTime=.23;invulnerable=.35;playTone(260,.07,'triangle');}
function playerHurt(dmg,source){if(invulnerable>0||over)return;hero.hp-=dmg;invulnerable=.5;hero.flash=.22;hero.root.position.x+=(hero.root.position.x-source.root.position.x)*.14;hero.root.position.z+=(hero.root.position.z-source.root.position.z)*.14;playTone(82,.14,'sawtooth');updateHud();if(hero.hp<=0){hero.hp=0;updateHud();endGame();}}
function faceTo(obj,dx,dz){obj.root.rotation.y=Math.atan2(-dx,-dz);}

const clock=new THREE.Clock();
function moveAxis(){let x=0,z=0;if(keys.has('KeyA')||keys.has('ArrowLeft')||keys.has('left'))x-=1;if(keys.has('KeyD')||keys.has('ArrowRight')||keys.has('right'))x+=1;if(keys.has('KeyW')||keys.has('ArrowUp')||keys.has('up'))z-=1;if(keys.has('KeyS')||keys.has('ArrowDown')||keys.has('down'))z+=1;const len=Math.hypot(x,z)||1;return{x:x/len,z:z/len};}
function clampActor(actor){actor.root.position.x=THREE.MathUtils.clamp(actor.root.position.x,-9.6,9.6);actor.root.position.z=THREE.MathUtils.clamp(actor.root.position.z,-10.1,8.4);}
function updateHero(dt){
 attackCooldown=Math.max(0,attackCooldown-dt);dodgeCooldown=Math.max(0,dodgeCooldown-dt);dodgeTime=Math.max(0,dodgeTime-dt);invulnerable=Math.max(0,invulnerable-dt);hero.attack=Math.max(0,hero.attack-dt);hero.flash=Math.max(0,hero.flash-dt);
 const move=moveAxis(),moving=Math.hypot(move.x,move.z)>.1;
 if(dodgeTime>0){const d=moving?move:{x:-Math.sin(hero.root.rotation.y),z:-Math.cos(hero.root.rotation.y)};hero.root.position.x+=d.x*10*dt;hero.root.position.z+=d.z*10*dt;}
 else if(moving){hero.root.position.x+=move.x*4.15*dt;hero.root.position.z+=move.z*4.15*dt;faceTo(hero,move.x,move.z);}
 clampActor(hero);
 const phase=worldTime*(moving?11:3);hero.visual.position.y=moving?Math.abs(Math.sin(phase))*.075:Math.sin(phase)*.018;
 hero.legs[0].rotation.x=moving?Math.sin(phase)*.48:0;hero.legs[1].rotation.x=moving?-Math.sin(phase)*.48:0;
 hero.arms[0].rotation.x=moving?-Math.sin(phase)*.2:0;hero.arms[1].rotation.x=hero.attack>0?-1.35*Math.sin((hero.attack/.34)*Math.PI):moving?Math.sin(phase)*.12:0;
 hero.sword.rotation.z=hero.attack>0?-1.7*Math.sin((hero.attack/.34)*Math.PI):0;
 hero.shield.rotation.z=moving?Math.sin(phase)*.08:0;
 hero.root.visible=!(invulnerable>0&&Math.floor(worldTime*22)%2===0);
 hero.shadow.position.set(hero.root.position.x,.014,hero.root.position.z);
}
function updateEnemies(dt){
 let living=0;
 for(const e of enemies){
  e.cool=Math.max(0,e.cool-dt);e.attack=Math.max(0,e.attack-dt);e.flash=Math.max(0,e.flash-dt);
  if(!e.alive){e.deathTimer-=dt;e.visual.rotation.z=THREE.MathUtils.lerp(e.visual.rotation.z,-1.25,dt*4);e.visual.position.y=Math.max(-.35,e.visual.position.y-dt*.3);if(e.deathTimer<=0){world.remove(e.root);world.remove(e.shadow);}continue;}
  living++;const dx=hero.root.position.x-e.root.position.x,dz=hero.root.position.z-e.root.position.z,dist=Math.hypot(dx,dz)||.001;
  faceTo(e,dx,dz);const dir={x:dx/dist,z:dz/dist};
  if(dist>1.55){e.root.position.x+=dir.x*e.speed*dt;e.root.position.z+=dir.z*e.speed*dt;}
  else if(e.cool<=0){e.cool=1.15+Math.random()*.55;e.attack=.48;e.attackTarget={x:hero.root.position.x,z:hero.root.position.z};}
  if(e.attack>0&&e.attack<.22&&e.attackTarget){const tx=e.attackTarget.x-e.root.position.x,tz=e.attackTarget.z-e.root.position.z;if(Math.hypot(tx,tz)<1.9)playerHurt(e.variant===2?13:9,e);e.attackTarget=null;}
  for(const other of enemies){if(other===e||!other.alive)continue;const ox=e.root.position.x-other.root.position.x,oz=e.root.position.z-other.root.position.z,od=Math.hypot(ox,oz);if(od>0&&od<.83){e.root.position.x+=ox/od*dt*.8;e.root.position.z+=oz/od*dt*.8;}}
  clampActor(e);e.shadow.position.set(e.root.position.x,.015,e.root.position.z);e.visual.position.y=Math.sin(worldTime*5+e.movePhase)*.024;
  e.legs[0].rotation.x=e.attack>0?0:Math.sin(worldTime*7+e.movePhase)*.16;e.legs[1].rotation.x=-e.legs[0].rotation.x;
  e.arms[1].rotation.x=e.attack>0?-1.25*Math.sin((e.attack/.48)*Math.PI):Math.sin(worldTime*5+e.movePhase)*.08;
  e.sword.rotation.z=e.attack>0?-.8*Math.sin((e.attack/.48)*Math.PI):0;
  if(e.healthBar)e.healthBar.position.x=-(1-e.hp/e.maxHp)*.34;
  e.root.visible=e.flash<=0||Math.floor(worldTime*30)%2===0;
 }
 return living;
}
function updateEffects(dt){
 for(let i=effects.length-1;i>=0;i--){const fx=effects[i];fx.userData.life-=dt;fx.material.opacity=Math.max(0,fx.userData.life/.19)*.8;fx.scale.multiplyScalar(1+dt*1.5);if(fx.userData.life<=0){world.remove(fx);fx.geometry.dispose();effects.splice(i,1);}}
 for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];p.life-=dt;p.group.rotation.y+=dt*1.8;p.group.position.y=.12+Math.sin(worldTime*4+i)*.08;const dist=p.group.position.distanceTo(hero.root.position);if(dist<1.15){hero.hp=Math.min(100,hero.hp+25);updateHud();world.remove(p.group);pickups.splice(i,1);playTone(540,.15,'sine');showToast('VITALITY RESTORED');}else if(p.life<=0){world.remove(p.group);pickups.splice(i,1);}}
}
function updateWaves(dt,living){
 if(!active)return;
 if(streakTimer>0){streakTimer-=dt;if(streakTimer<=0){streak=0;updateHud();}}
 if(living===0){spawnTimer-=dt;if(spawnTimer<=0){wave++;spawnTimer=2.2;const count=Math.min(2+wave,5);for(let i=0;i<count;i++){const side=i%2===0?-1:1;spawnEnemy(side*(2.5+Math.random()*5),-7+Math.random()*3,(wave+i)%3);}ui.objective.textContent=`Defeat the patrol · ${count} enemies`;showToast(`WAVE ${String(wave).padStart(2,'0')} — THE ORDER ADVANCES`);updateHud();}}
}
function updateScene(dt){
 worldTime+=dt;for(const f of fireLights)f.light.intensity=f.base+Math.sin(worldTime*8+f.seed)*2+Math.sin(worldTime*17+f.seed)*1.3;
 if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui.toast.classList.remove('show');}
 if(active&&!paused&&!over){updateHero(dt);const living=updateEnemies(dt);updateWaves(dt,living);updateEffects(dt);}
 else {updateEffects(dt);hero.visual.position.y=Math.sin(worldTime*2)*.018;}
 const targetX=hero.root.position.x*.24,targetZ=hero.root.position.z+15.2;camera.position.x=THREE.MathUtils.lerp(camera.position.x,targetX,dt*2);camera.position.z=THREE.MathUtils.lerp(camera.position.z,targetZ,dt*2);camera.position.y=10.5;camera.lookAt(hero.root.position.x*.16,1.05,hero.root.position.z-4.8);
}
function render(){requestAnimationFrame(render);const dt=Math.min(clock.getDelta(),.05);updateScene(dt);renderer.render(scene,camera);ui.loading.classList.add('hidden');}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);}
window.addEventListener('resize',resize);
window.addEventListener('keydown',event=>{
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code))event.preventDefault();
 if(event.code==='Enter'&&!active){if(over)resetGame();else beginGame();return;}
 if(['KeyJ','Space'].includes(event.code)&&!event.repeat)doAttack();
 if(['KeyK','ShiftLeft','ShiftRight'].includes(event.code)&&!event.repeat)dodge();
 if(event.code==='Escape'&&active){paused=!paused;showToast(paused?'PAUSED':'RETURN TO THE FRAY');}
 keys.add(event.code);
});
window.addEventListener('keyup',event=>keys.delete(event.code));
window.addEventListener('blur',()=>keys.clear());
document.querySelector('#playButton').addEventListener('click',beginGame);
document.querySelector('#restartButton').addEventListener('click',resetGame);
document.querySelector('#soundButton').addEventListener('click',event=>{soundOn=!soundOn;event.currentTarget.classList.toggle('enabled',soundOn);event.currentTarget.querySelector('span').textContent=soundOn?'SOUND ON':'SOUND';if(soundOn)playTone(440,.08);});
document.querySelector('#touchAttack').addEventListener('pointerdown',event=>{event.preventDefault();doAttack();});
document.querySelector('#touchDodge').addEventListener('pointerdown',event=>{event.preventDefault();dodge();});
for(const button of document.querySelectorAll('[data-move]')){
 const code=button.dataset.move;button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);keys.add(code);});
 const release=event=>{event.preventDefault();keys.delete(code);};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',()=>keys.delete(code));
}
canvas.addEventListener('contextmenu',event=>event.preventDefault());
updateHud();render();
