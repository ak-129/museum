import * as THREE from 'three';
import './style.css';

const canvas = document.querySelector('#world');
const loading = document.querySelector('#loading');
const intro = document.querySelector('#intro');
const hud = document.querySelector('#hud');
const hint = document.querySelector('#hint');
const caption = document.querySelector('#caption');
const captionTitle = document.querySelector('#caption-title');
const captionBody = document.querySelector('#caption-body');
const letter = document.querySelector('#letter');
const isMobile = matchMedia('(max-width: 700px)').matches;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x171511);
scene.fog = new THREE.Fog(0x171511, 17, 39);
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .1, 100);
const renderer = new THREE.WebGLRenderer({canvas, antialias: !isMobile, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.35 : 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const mat = (color, roughness=.8, metalness=0) => new THREE.MeshStandardMaterial({color, roughness, metalness});
const plaster = mat(0xaaa08e), darkPlaster = mat(0x27221c), floorMat = mat(0x6e6252,.55), wood = mat(0x4b3020,.48), gold = mat(0xb18b50,.3,.72), goldLight = mat(0xd2b47b,.28,.65), cream = mat(0xd9cdb7,.7), velvet = mat(0x282019,.9), leafMat = mat(0x344532,.8), flowerMat = mat(0xddd0d8,.55);
const room = new THREE.Group(); scene.add(room);
const colliders = [];
const interactive = [];

function box(parent, name, x,y,z, sx,sy,sz, material, cast=true, receive=true){
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);
  m.name=name; m.position.set(x,y,z); m.castShadow=cast; m.receiveShadow=receive; parent.add(m); return m;
}
function addWall(x,y,z,sx,sy,sz, material=plaster){
  const w=box(room,'wall',x,y,z,sx,sy,sz,material,false,true);
  colliders.push({minX:x-sx/2,maxX:x+sx/2,minZ:z-sz/2,maxZ:z+sz/2});
  return w;
}

// Grand Victorian gallery: long central hall, side alcoves and a dedicated portrait wall.
box(room,'marble floor',0,-.18,0,22,.35,28,floorMat,false,true);
box(room,'ceiling',0,5.7,0,22,.35,28,mat(0x25211c),false,false);
addWall(-11,2.7,0,.35,5.7,28);
addWall(11,2.7,0,.35,5.7,28);
addWall(0,2.7,-14,22,5.7,.35);
addWall(0,2.7,14,22,5.7,.35);
addWall(-5.8,2.7,4,.25,5.7,13,plaster);
addWall(5.8,2.7,4,.25,5.7,13,plaster);

// Wainscoting, cornices and ceiling beams.
for(let z=-12;z<=12;z+=2){
  box(room,'wall moulding',-10.78,1.05,z,.08,.12,1.85,gold,false);
  box(room,'wall moulding',10.78,1.05,z,.08,.12,1.85,gold,false);
}
for(const x of [-10.7,10.7]) {
  box(room,'lower dado',x,.45,0,.12,.12,27.5,wood,false);
  box(room,'upper dado',x,2.1,0,.12,.1,27.5,gold,false);
  box(room,'cornice',x,5.42,0,.22,.22,27.5,gold,false);
}
for(let z=-12;z<=12;z+=4) box(room,'ceiling beam',0,5.48,z,21.5,.14,.13,wood,false);

// Decorative wall pilasters.
for(const side of [-1,1]){
 for(let z=-11;z<=11;z+=5.5){
  const x=side*10.72;
  box(room,'pilaster',x,2.7,z,.2,4.9,.22,cream,false);
  box(room,'capital',x,5.05,z,.36,.22,.42,gold,false);
  box(room,'base',x,.35,z,.36,.22,.42,gold,false);
 }
}

// Central feature wall, deep burgundy-black.
addWall(0,2.75,-8.9,11.5,5.9,.45,darkPlaster);
box(room,'portrait alcove',0,2.9,-8.62,6.4,4.6,.13,mat(0x17130f),false);
box(room,'portrait plinth',0,.42,-7.8,3.5,.75,.95,wood);
box(room,'plinth trim',0,.82,-7.8,3.58,.08, gold);
box(room,'plaque base',0,1.05,-7.27,2.45,.34,.12,wood);
box(room,'plaque face',0,1.06,-7.19,2.3,.22,.035,gold);

// Image textures and portrait frames.
const loader = new THREE.TextureLoader();
const imageObjects = [];
function makeFrame({file,title,body,x,y,z,rotationY=0,width=1.7,height=2.1,central=false,kind='photo'}){
 const group=new THREE.Group(); group.position.set(x,y,z); group.rotation.y=rotationY; room.add(group);
 const outer= new THREE.Mesh(new THREE.BoxGeometry(width+.22,height+.22,.17),wood); outer.castShadow=true; group.add(outer);
 const inner=new THREE.Mesh(new THREE.BoxGeometry(width+.12,height+.12,.07),gold); inner.position.z=.095; group.add(inner);
 const liner=new THREE.Mesh(new THREE.BoxGeometry(width+.035,height+.035,.045),goldLight); liner.position.z=.14; group.add(liner);
 const imageMat=new THREE.MeshBasicMaterial({color:0x55483a});
 const image=new THREE.Mesh(new THREE.PlaneGeometry(width,height),imageMat); image.position.z=.17; group.add(image);
 loader.load('/images/'+file, tex=>{tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();image.material.map=tex;image.material.color.set(0xffffff);image.material.needsUpdate=true;});
 // Tiny corner rosettes for an antique framed finish.
 for(const sx of [-1,1]) for(const sy of [-1,1]){
   const ornament=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),goldLight);
   ornament.position.set(sx*(width/2+.07),sy*(height/2+.07),.19);group.add(ornament);
 }
 const target=new THREE.Object3D();target.position.set(x,y,z);scene.add(target);
 const item={group,target,title,body,kind,position:new THREE.Vector3(x,y,z),image,central};
 interactive.push(item); imageObjects.push(item);
 return group;
}
makeFrame({file:'khadija-cake-portrait.jpg',title:'The portrait',body:'The centre of this little world. A moment that deserves its own place.',x:0,y:3.35,z:-8.42,width:2.65,height:3.05,central:true});
makeFrame({file:'mirror-together.jpg',title:'A reflection',body:'A memory of the two of us, held inside one frame.',x:-8.8,y:2.65,z:-5.8,rotationY:Math.PI/2,width:1.45,height:1.8});
makeFrame({file:'selfie-together.jpg',title:'Side by side',body:'Some moments feel like they belong exactly where they happened.',x:-8.8,y:2.65,z:-1.2,rotationY:Math.PI/2,width:1.55,height:1.8});
makeFrame({file:'mirror-full.jpg',title:'A little outing',body:'Another page in a story still being written.',x:-8.8,y:2.65,z:3.7,rotationY:Math.PI/2,width:1.45,height:1.8});
makeFrame({file:'mirror-wide.jpg',title:'Together, in the mirror',body:'A familiar reflection, now part of this collection.',x:8.8,y:2.65,z:-5.8,rotationY:-Math.PI/2,width:1.55,height:1.8});
makeFrame({file:'warm-mirror.jpg',title:'A warm memory',body:'A small moment, kept somewhere safe.',x:8.8,y:2.65,z:-1.2,rotationY:-Math.PI/2,width:1.45,height:1.8});
makeFrame({file:'rings-hands.jpg',title:'A promise in silver',body:'Two hands, two rings, and a story with the number 129.',x:8.8,y:2.65,z:3.7,rotationY:-Math.PI/2,width:1.55,height:1.8});

// Central inscription and a small silver dedication plaque.
function textTexture(lines, width=512, height=128, font='italic 42px Georgia', color='#ead9b6'){
 const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');
 ctx.clearRect(0,0,width,height);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=font;
 lines.forEach((line,i)=>ctx.fillText(line,width/2,height*(i+1)/(lines.length+1)));
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const plaqueTex=textTexture(['A SMALL DEDICATION'],512,100,'20px Georgia','#3b2a1b');
const plaqueText=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.18),new THREE.MeshBasicMaterial({map:plaqueTex,transparent:true}));
plaqueText.position.set(0,1.08,-7.16);room.add(plaqueText);
const letterObj={kind:'letter',title:'A small dedication',body:'A few words, kept here for you.',position:new THREE.Vector3(0,1.15,-7.05)};
interactive.push(letterObj);

// Small antique tables, flower arrangements and benches.
function flowerPot(x,z,scale=1){
 const g=new THREE.Group();g.position.set(x,0,z);room.add(g);
 const pot=new THREE.Mesh(new THREE.CylinderGeometry(.28*scale,.2*scale,.42*scale,20),mat(0x6d4935,.45));pot.position.y=.21*scale;pot.castShadow=true;g.add(pot);
 const soil=new THREE.Mesh(new THREE.CylinderGeometry(.25*scale,.25*scale,.035,18),mat(0x282018));soil.position.y=.43*scale;g.add(soil);
 for(let i=0;i<7;i++){
  const a=i*Math.PI*2/7, h=(.8+(i%3)*.18)*scale;
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.012*scale,.018*scale,h,7),leafMat);
  stem.position.set(Math.cos(a)*.12*scale,.45*scale+h/2,Math.sin(a)*.12*scale);stem.rotation.z=(Math.cos(a)*-.25);stem.castShadow=true;g.add(stem);
  const leaf=new THREE.Mesh(new THREE.SphereGeometry(.12*scale,9,7),leafMat);
  leaf.scale.set(1.8,.55,.65);leaf.position.set(Math.cos(a)*.23*scale,.55*scale+h*.52,Math.sin(a)*.23*scale);leaf.rotation.y=a;g.add(leaf);
  const bloom=new THREE.Mesh(new THREE.SphereGeometry(.13*scale,12,9),flowerMat);
  bloom.position.set(Math.cos(a)*.12*scale,.45*scale+h,Math.sin(a)*.12*scale);g.add(bloom);
  for(let j=0;j<5;j++){const petal=new THREE.Mesh(new THREE.SphereGeometry(.055*scale,8,7),mat(j%2?0x9a789e:0xe7d9d7));petal.scale.set(1.2,.7,.8);const aa=j*Math.PI*2/5;petal.position.set(bloom.position.x+Math.cos(aa)*.1*scale,bloom.position.y+Math.sin(aa)*.1*scale,bloom.position.z);g.add(petal);}
 }
}
flowerPot(-4.8,-6.8,1.1);flowerPot(4.8,-6.8,1.1);flowerPot(-9.5,7.5,.9);flowerPot(9.5,7.5,.9);
flowerPot(-4.8,8.8,.9);flowerPot(4.8,8.8,.9);
function bench(x,z,rot=0){
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;room.add(g);
 box(g,'bench seat',0,.55,0,2.1,.18,.55,wood);
 box(g,'bench back',0,1.05,-.22,2.1,.85,.15,wood);
 for(const sx of [-.8,.8]){box(g,'bench leg',sx,.27,0,.13,.55,.13,gold);box(g,'bench back post',sx,1.02,-.2,.12,1.05,.12,gold);}
}
bench(-3.6,7.5,0);bench(3.6,7.5,0);

// Decorative pedestal and bust-like sculpture in the back corners.
function pedestal(x,z){
 box(room,'pedestal foot',x,.15,z,.9,.3,.9,cream);
 box(room,'pedestal stem',x,.75,z,.48,.95,.48,cream);
 box(room,'pedestal top',x,1.28,z,1.05,.18,1.05,gold);
 const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.32,1),goldLight);orb.position.set(x,1.72,z);orb.castShadow=true;room.add(orb);
}
pedestal(-3.5,10.5);pedestal(3.5,10.5);

// Warm lights, ceiling spots and portrait highlight.
scene.add(new THREE.HemisphereLight(0xe9d9bd,0x34291f,1.25));
const ambient=new THREE.AmbientLight(0x9a8261,.28);scene.add(ambient);
const mainLight=new THREE.PointLight(0xffd9a0,95,22,2);mainLight.position.set(0,5,-5.7);mainLight.castShadow=true;scene.add(mainLight);
for(const x of [-8,0,8]) for(const z of [-7,0,7]){
 const l=new THREE.PointLight(0xffd7a1,38,9,2);l.position.set(x,5.15,z);scene.add(l);
}
const spot=new THREE.SpotLight(0xffe1b4,75,14,Math.PI/7,.5,1.5);spot.position.set(0,5.3,-5.5);spot.target.position.set(0,2.8,-8.3);spot.castShadow=true;scene.add(spot,spot.target);

// Character: custom-built female avatar with black hijab and dark outfit, lavender sleeves,
// inspired by the cake photograph. This is a procedural placeholder model, not a scan.
const avatar=new THREE.Group();scene.add(avatar);
const avatarMat=mat(0x151416,.9), skin=mat(0xd9ad91,.85), scarf=mat(0x090a0d,.92), lavender=mat(0xb59ab9,.8), shoeMat=mat(0x111114,.7);
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.62,5,10),avatarMat);torso.position.y=1.22;torso.castShadow=true;avatar.add(torso);
const chest=new THREE.Mesh(new THREE.SphereGeometry(.29,16,12),avatarMat);chest.scale.set(1,.85,.62);chest.position.set(0,1.45,0);avatar.add(chest);
const head=new THREE.Mesh(new THREE.SphereGeometry(.235,20,16),skin);head.position.set(0,2.03,0);head.scale.set(.82,1.08,.85);head.castShadow=true;avatar.add(head);
const hijabCap=new THREE.Mesh(new THREE.SphereGeometry(.265,20,16),scarf);hijabCap.position.set(0,2.12,-.035);hijabCap.scale.set(1.02,1.1,1);avatar.add(hijabCap);
const hijabBack=new THREE.Mesh(new THREE.CapsuleGeometry(.25,.48,5,10),scarf);hijabBack.position.set(0,1.75,-.12);hijabBack.scale.set(1.15,1,.72);avatar.add(hijabBack);
const hijabFront=new THREE.Mesh(new THREE.TorusGeometry(.19,.065,8,24,Math.PI),scarf);hijabFront.rotation.z=Math.PI;hijabFront.position.set(0,2.08,.12);avatar.add(hijabFront);
for(const x of [-.09,.09]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.018,8,8),mat(0x241b18));eye.position.set(x,2.04,.194);avatar.add(eye);}
for(const x of [-.39,.39]){
 const sleeve=new THREE.Mesh(new THREE.CapsuleGeometry(.105,.55,4,8),lavender);sleeve.position.set(x,1.34,0);sleeve.rotation.z=x<0?-.16:.16;sleeve.castShadow=true;avatar.add(sleeve);
 const hand=new THREE.Mesh(new THREE.SphereGeometry(.09,12,10),skin);hand.position.set(x*1.2,.99,.02);avatar.add(hand);
}
for(const x of [-.13,.13]){
 const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.105,.58,4,8),avatarMat);leg.position.set(x,.49,0);leg.castShadow=true;avatar.add(leg);
 const shoe=new THREE.Mesh(new THREE.BoxGeometry(.19,.12,.32),shoeMat);shoe.position.set(x,.09,.08);shoe.castShadow=true;avatar.add(shoe);
}
avatar.position.set(0,0,9.5);avatar.rotation.y=Math.PI;

// Movement / camera.
const keys={};let started=false,firstPerson=false,nearby=null,activeModal=false;
let yaw=0,pitch=-.12,walkTime=0;
const player={x:0,z:9.5,speed:3.15};
const cameraTarget=new THREE.Vector3();
const clock=new THREE.Clock();
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function collides(x,z){
 if(Math.abs(x)>10.15||z<-13.2||z>13.2)return true;
 // Inner partition ends at z=10.5; leave an opening near rear corners.
 if(Math.abs(x)>5.55 && Math.abs(x)<6.15 && z<10.2 && z>-2.6)return true;
 return false;
}
function movePlayer(dt){
 let forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
 let side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
 forward += joyY; side += joyX;
 const len=Math.hypot(forward,side);
 if(len>.01){forward/=Math.max(1,len);side/=Math.max(1,len);}
 const dirX=Math.sin(yaw),dirZ=-Math.cos(yaw);
 const dx=(dirX*forward+Math.cos(yaw)*side)*player.speed*dt;
 const dz=(dirZ*forward-Math.sin(yaw)*side)*player.speed*dt;
 if(!collides(player.x+dx,player.z))player.x+=dx;
 if(!collides(player.x,player.z+dz))player.z+=dz;
 const moving=len>.08;
 if(moving){walkTime+=dt*9;avatar.position.y=Math.abs(Math.sin(walkTime))*.035;avatar.rotation.y=Math.atan2(dx,dz)+Math.PI;}
 else {avatar.position.y=0;avatar.rotation.y+=(Math.PI-avatar.rotation.y)*.08;}
 avatar.position.x=player.x;avatar.position.z=player.z;
 // Gentle opposing arm/leg swing.
 avatar.children.forEach((o,i)=>{if(o.geometry?.type==='CapsuleGeometry'&&i>5)o.rotation.x=moving?Math.sin(walkTime+(i%2)*Math.PI)*.13:0;});
}
let joyX=0,joyY=0;
function updateNearby(){
 nearby=null;let best=2.7;
 for(const item of interactive){
  const d=Math.hypot(player.x-item.position.x,player.z-item.position.z);
  if(d<best){best=d;nearby=item;}
 }
 hint.classList.toggle('hidden',!nearby||activeModal||firstPerson);
 document.querySelector('#mobile-action').classList.toggle('hidden',!nearby||activeModal||firstPerson);
 document.querySelector('#view').classList.toggle('hidden',!nearby||activeModal);
 document.querySelector('#mobile-view').classList.toggle('hidden',!nearby||activeModal);
}
function examine(){
 if(!nearby||activeModal)return;
 if(nearby.kind==='letter'){letter.classList.remove('hidden');activeModal=true;return;}
 captionTitle.textContent=nearby.title;captionBody.textContent=nearby.body;
 caption.classList.remove('hidden');activeModal=true;
}
function toggleView(){
 if(!nearby||activeModal)return;
 firstPerson=!firstPerson;
 document.querySelector('#view').innerHTML=firstPerson?'THIRD PERSON <span>V</span>':'FIRST PERSON <span>V</span>';
 document.querySelector('#mobile-view').textContent=firstPerson?'3RD PERSON':'1ST PERSON';
 if(firstPerson){yaw=Math.atan2(nearby.position.x-player.x, -(nearby.position.z-player.z));pitch=-.02;}
}
function closeModal(){caption.classList.add('hidden');letter.classList.add('hidden');activeModal=false;}

// Pointer drag rotates the third-person camera; in first person it looks around the gallery.
let dragging=false,lastX=0,lastY=0;
canvas.addEventListener('pointerdown',e=>{if(!started)return;dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!dragging||activeModal)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw-=dx*.004;pitch=clamp(pitch-dy*.003,-.55,.38);});
canvas.addEventListener('pointerup',()=>dragging=false);
canvas.addEventListener('pointercancel',()=>dragging=false);
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyE')examine();if(e.code==='KeyV')toggleView();if(e.code==='Escape')closeModal();});
addEventListener('keyup',e=>keys[e.code]=false);
document.querySelector('#view').addEventListener('click',toggleView);
document.querySelector('#mobile-view').addEventListener('click',toggleView);
document.querySelector('#mobile-action').addEventListener('click',examine);
document.querySelector('#close-caption').addEventListener('click',closeModal);
document.querySelector('#close-letter').addEventListener('click',closeModal);

// Touch joystick.
const joystick=document.querySelector('#joystick'),stick=document.querySelector('#stick');
let joyPointer=null;
joystick.addEventListener('pointerdown',e=>{joyPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);setJoy(e);});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)setJoy(e);});
function setJoy(e){const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const max=32,l=Math.hypot(dx,dy);if(l>max){dx=dx/l*max;dy=dy/l*max;}joyX=dx/max;joyY=-dy/max;stick.style.transform=`translate(${dx}px,${dy}px)`;}
function resetJoy(){joyPointer=null;joyX=joyY=0;stick.style.transform='translate(0,0)';}
joystick.addEventListener('pointerup',resetJoy);joystick.addEventListener('pointercancel',resetJoy);

// Soft original ambient tone using Web Audio; no external copyrighted track.
let audioCtx=null,master=null,playing=false;
function startMusic(){
 if(audioCtx){if(audioCtx.state==='suspended')audioCtx.resume();return;}
 audioCtx=new (window.AudioContext||window.webkitAudioContext)();
 master=audioCtx.createGain();master.gain.value=.055;master.connect(audioCtx.destination);
 const notes=[110,164.81,220,261.63];
 notes.forEach((freq,i)=>{
  const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();
  osc.type=i===0?'sine':'triangle';osc.frequency.value=freq;filter.type='lowpass';filter.frequency.value=650;
  gain.gain.value=i===0?.25:.075;osc.connect(filter);filter.connect(gain);gain.connect(master);osc.start();
 });
 const lfo=audioCtx.createOscillator(),lfoGain=audioCtx.createGain();lfo.frequency.value=.09;lfoGain.gain.value=.012;lfo.connect(lfoGain);lfoGain.connect(master.gain);lfo.start();
 playing=true;
}
function toggleSound(){if(!audioCtx){startMusic();return;}playing=!playing;master.gain.setTargetAtTime(playing?.055:0,audioCtx.currentTime,.25);document.querySelector('#sound').textContent=playing?'♫':'♪';}
document.querySelector('#sound').addEventListener('click',toggleSound);

// Main camera update.
function render(){
 requestAnimationFrame(render);
 const dt=Math.min(clock.getDelta(),.04);
 if(started&&!activeModal){
  if(!firstPerson)movePlayer(dt);
  updateNearby();
 }
 if(firstPerson&&nearby){
  const eye=new THREE.Vector3(player.x,1.72,player.z);
  const look=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
  camera.position.copy(eye);camera.lookAt(eye.clone().add(look.multiplyScalar(8)));
 }else{
  const distance=5.4, target=new THREE.Vector3(player.x,1.35,player.z);
  const offset=new THREE.Vector3(Math.sin(yaw)*distance,2.55+pitch*2,Math.cos(yaw)*distance);
  camera.position.lerp(target.clone().add(offset),.12);camera.lookAt(target);
 }
 renderer.render(scene,camera);
}
camera.position.set(0,3,15);camera.lookAt(0,1,0);
render();

document.querySelector('#enter').addEventListener('click',()=>{
 started=true;intro.classList.add('hidden');hud.classList.remove('hidden');loading.style.opacity='0';setTimeout(()=>loading.remove(),900);
 if(isMobile)document.querySelector('#mobile-controls').classList.remove('hidden');
 startMusic();
});
setTimeout(()=>{loading.style.opacity='0';setTimeout(()=>loading.remove(),850);},850);

addEventListener('resize',()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,isMobile?1.35:1.8));
});
