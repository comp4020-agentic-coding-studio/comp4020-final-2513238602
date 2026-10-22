import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Color, Object3D } from 'three';
import type { InstancedMesh, OrthographicCamera } from 'three';
import { objects, places } from '../shared/after-hours.ts';
import type { Place, SceneObject } from '../shared/after-hours.ts';

const wood='#9b7353',paper='#ede5d2',ink='#283b3a',blue='#557e91',red='#a53224';
function Box({at=[0,0,0],size=[1,1,1],color=paper}:{at?:[number,number,number];size?:[number,number,number];color?:string}){
  return <mesh position={at} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.88}/></mesh>;
}
function Table(){return <><Box at={[0,.85,0]} size={[1.3,.12,.95]} color={wood}/>{[-.48,.48].flatMap(x=>[-.32,.32].map(z=><Box key={`${x}${z}`} at={[x,.4,z]} size={[.09,.8,.09]} color={wood}/>))}</>}
function Record(){return <><Table/><group position={[0,.93,0]} rotation={[0,.13,0]}><Box size={[.75,.025,.65]}/>{[0,1,2,3].map(i=><Box key={i} at={[-.04,.018,-.2+i*.1]} size={[.5,.004,.015]} color={i===0?red:'#aaa493'}/>)}</group></>}
function Crate({inspected}:{inspected:boolean}){return <group position={[0,.46,0]} rotation={inspected?[0,0,Math.PI]:[0,0,0]}><Box size={[.8,.65,.64]} color={blue}/><Box size={[.84,.08,.68]} at={[0,.18,0]} color={ink}/><Box at={[0,-.331,0]} size={[.35,.01,.25]} color={paper}/><Box at={[.15,.336,0]} size={[.08,.01,.65]} color={wood}/></group>}
function Cart(){return <><Box at={[0,.4,0]} size={[1.4,.16,1]} color={wood}/><Box at={[0,.6,0]} size={[1.1,.24,.8]} color={'#c0b89f'}/><Box at={[.57,1,0]} size={[.08,1.2,.08]} color={ink}/>{[-.48,.48].flatMap(x=>[-.35,.35].map(z=><mesh key={`${x}${z}`} position={[x,.17,z]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.16,.16,.12,12]}/><meshStandardMaterial color={ink}/></mesh>))}</>}
function MapObject(){return <><Table/><Box at={[0,.93,0]} size={[1.1,.03,.75]} color={'#c7d2bf'}/>{[-.3,0,.3].map(x=><Box key={x} at={[x,.95,0]} size={[.025,.01,.65]} color={'#718676'}/>)}<Box at={[0,.95,.12]} size={[1,.01,.035]} color={red}/></>}
function Prop({object,selected,inspected,onSelect}:{object:SceneObject;selected:boolean;inspected:boolean;onSelect:()=>void}){
  const [hover,setHover]=useState(false);
  return <group position={[object.x,0,object.z]} onClick={e=>{e.stopPropagation();onSelect()}} onPointerOver={e=>{e.stopPropagation();setHover(true)}} onPointerOut={()=>setHover(false)}>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,.018,0]}><ringGeometry args={[.82,.86,48]}/><meshBasicMaterial color={selected?red:hover?'#816b43':'#c9c3b5'}/></mesh>
    {object.shape==='plinth'&&<><Box at={[0,.55,0]} size={[1.2,1.1,1.2]}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,1.11,0]}><ringGeometry args={[.3,.32,32]}/><meshBasicMaterial color={'#8f927d'}/></mesh><Box at={[0,.8,.607]} size={[.38,.15,.01]} color={'#d7cdb7'}/></>}
    {object.shape==='record'&&<Record/>}
    {object.shape==='crate'&&<Crate inspected={inspected}/>}
    {object.shape==='map'&&<MapObject/>}
    {object.shape==='cart'&&<Cart/>}
    {object.shape==='camera'&&<><Table/><Box at={[0,1.25,0]} size={[1,.6,.15]} color={ink}/><Box at={[0,1.25,.083]} size={[.84,.43,.015]} color={blue}/><Box at={[0,1.25,.1]} size={[.28,.32,.01]} color={'#9dbcb7'}/></>}
    {object.shape==='clock'&&<><Table/><mesh position={[0,1.3,0]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.4,.4,.13,32]}/><meshStandardMaterial color={paper}/></mesh><Box at={[0,1.43,.08]} size={[.035,.24,.025]} color={ink}/><Box at={[.1,1.3,.08]} size={[.22,.03,.025]} color={red}/></>}
    {object.shape==='sensor'&&<><Table/><Box at={[0,1.1,0]} size={[.6,.3,.45]} color={ink}/><Box at={[0,1.27,0]} size={[.45,.015,.3]} color={'#c0b89f'}/><Box at={[.1,1.28,0]} size={[.04,.01,.3]} color={red}/></>}
    {object.shape==='shelf'&&<><Box at={[0,.2,0]} size={[1.5,.12,1.2]} color={wood}/><Box at={[0,1.7,0]} size={[1.5,.1,1.2]} color={wood}/>{[-.67,.67].map(x=><Box key={x} at={[x,.85,-.5]} size={[.1,1.7,.1]} color={wood}/>)}<mesh position={[0,.8,0]} castShadow><sphereGeometry args={[.48,20,16]}/><meshStandardMaterial color={inspected?'#d9bc70':'#abb6ad'} roughness={.8}/></mesh><Box at={[0,.35,0]} size={[.65,.12,.65]} color={ink}/></>}
  </group>;
}
function Floor({seed}:{seed:number}){
  const ref=useRef<InstancedMesh>(null);
  useLayoutEffect(()=>{const transform=new Object3D();let n=seed;for(let i=0;i<64;i++){n=(Math.imul(n,1664525)+1013904223)>>>0;transform.position.set((i%8)-3.5,-.1,Math.floor(i/8)*.8-2.8);transform.updateMatrix();ref.current!.setMatrixAt(i,transform.matrix);ref.current!.setColorAt(i,new Color().setHSL(.11,.17,.60+(n%10)*.009));}ref.current!.instanceMatrix.needsUpdate=true;if(ref.current!.instanceColor)ref.current!.instanceColor.needsUpdate=true;},[seed]);
  return <instancedMesh ref={ref} args={[undefined,undefined,64]} receiveShadow><boxGeometry args={[.97,.16,.77]}/><meshStandardMaterial roughness={1}/></instancedMesh>;
}
function Rig({angle}:{angle:number}){
  const {camera,gl,invalidate,size}=useThree();
  useEffect(()=>{const control=new OrbitControls(camera,gl.domElement);control.target.set(0,.5,0);control.enablePan=false;control.enableZoom=false;control.minPolarAngle=.55;control.maxPolarAngle=1.25;control.addEventListener('change',()=>invalidate());control.update();return()=>control.dispose()},[camera,gl,invalidate]);
  useLayoutEffect(()=>{const c=camera as OrthographicCamera;c.position.set(Math.sin(angle)*10,10,Math.cos(angle)*10);c.lookAt(0,.5,0);c.zoom=Math.min(size.width/11.6,size.height/9);c.updateProjectionMatrix();invalidate()},[camera,angle,size.width,size.height,invalidate]);
  return null;
}
function Room({place,seed,selected,discovered,onSelect}:{place:Place;seed:number;selected:string;discovered:string[];onSelect:(id:string)=>void}){
  const props=useMemo(()=>objects.filter(o=>o.place===place),[place]);
  return <><ambientLight intensity={1.7}/><directionalLight position={[3,9,4]} intensity={3} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-bias={-.001}/><Floor seed={seed}/><Box at={[0,1,-3.25]} size={[8.15,2,.15]} color={place==='monitor'?'#b7c4bd':'#e4ddcc'}/><Box at={[-4.08,1,0]} size={[.15,2,6.5]} color={'#d5cdbb'}/><Box at={[0,.08,-3.12]} size={[8,.14,.08]} color={wood}/><Box at={[-3.98,.08,0]} size={[.08,.14,6.4]} color={wood}/>
    <Box at={[0,1.25,-3.13]} size={[1.5,.8,.09]} color={wood}/><Box at={[0,1.25,-3.07]} size={[1.3,.62,.05]} color={place==='gallery'?blue:'#a6b29a'}/>
    {props.map(o=><Prop key={o.id} object={o} selected={selected===o.id} inspected={discovered.includes(o.id)} onSelect={()=>onSelect(o.id)}/>)}
  </>;
}
class SceneBoundary extends React.Component<{children:React.ReactNode;onFailure:()=>void},{failed:boolean}>{
  state={failed:false};static getDerivedStateFromError(){return {failed:true}}componentDidCatch(){this.props.onFailure()}
  render(){return this.state.failed?null:this.props.children}
}
export default function InvestigationScene(props:{place:Place;seed:number;selected:string;discovered:string[];onSelect:(id:string)=>void}){
  const [angle,setAngle]=useState(Math.PI/4),[failed,setFailed]=useState(false),[enabled,setEnabled]=useState(true),[ready,setReady]=useState(false);
  const title=places.find(p=>p.id===props.place)!.title;
  useEffect(()=>{setAngle(Math.PI/4)},[props.place]);
  return <div className="ah-scene-wrap"><div className="ah-scene" aria-label={`Interactive model: ${title}`} data-scene-ready={ready&&!failed&&enabled}>
    {enabled&&!failed?<SceneBoundary onFailure={()=>setFailed(true)}><Canvas orthographic shadows frameloop="demand" dpr={[1,1.5]} camera={{position:[10,10,10],near:.1,far:100}} gl={{antialias:true,alpha:true}} onCreated={({gl})=>{setReady(true);gl.domElement.setAttribute('aria-hidden','true');gl.domElement.addEventListener('webglcontextlost',()=>setFailed(true),{once:true})}}><Rig angle={angle}/><Room {...props}/></Canvas></SceneBoundary>:<div className="ah-scene-fallback"><span className="label">OBJECT VIEW</span><h3>{title}</h3><p>{failed?'The 3D view is unavailable on this device.':'The 3D view is paused.'} Every investigation action is available in the object list below.</p></div>}
    <span className="ah-scene-caption">{enabled&&!failed?'DRAG TO LOOK AROUND · SELECT AN OBJECT':'THE SAME EVIDENCE, IN TEXT'}</span>
  </div><div className="ah-camera-tools"><button className="text-button" aria-label="Rotate room left" disabled={failed||!enabled} onClick={()=>setAngle(a=>a-.4)}>↶ Rotate</button><button className="text-button" aria-label="Reset room view" disabled={failed||!enabled} onClick={()=>setAngle(Math.PI/4)}>Reset view</button><button className="text-button" aria-label="Rotate room right" disabled={failed||!enabled} onClick={()=>setAngle(a=>a+.4)}>Rotate ↷</button><button className="text-button" onClick={()=>setEnabled(x=>!x)} disabled={failed}>{enabled?'Use object list only':'Show 3D room'}</button></div></div>;
}
