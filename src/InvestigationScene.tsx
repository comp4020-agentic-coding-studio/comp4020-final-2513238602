import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CanvasTexture, Color, Object3D, SRGBColorSpace } from 'three';
import type { Group, InstancedMesh, OrthographicCamera } from 'three';
import { objects, places } from '../shared/after-hours.ts';
import type { Place, SceneObject } from '../shared/after-hours.ts';
import RoomFurniture, { Lantern } from './RoomFurniture.tsx';

const wood = '#9b7353',
  paper = '#ede5d2',
  ink = '#283b3a',
  blue = '#557e91',
  red = '#a53224';
function Box({
  at = [0, 0, 0],
  size = [1, 1, 1],
  color = paper,
}: {
  at?: [number, number, number];
  size?: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.88} />
    </mesh>
  );
}
function Table() {
  return (
    <>
      <Box at={[0, 0.85, 0]} size={[1.3, 0.12, 0.95]} color={wood} />
      {[-0.48, 0.48].flatMap((x) =>
        [-0.32, 0.32].map((z) => (
          <Box key={`${x}${z}`} at={[x, 0.4, z]} size={[0.09, 0.8, 0.09]} color={wood} />
        )),
      )}
    </>
  );
}
function Record() {
  return (
    <>
      <Table />
      <group position={[0, 0.93, 0]} rotation={[0, 0.13, 0]}>
        <Box size={[0.75, 0.025, 0.65]} />
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            at={[-0.04, 0.018, -0.2 + i * 0.1]}
            size={[0.5, 0.004, 0.015]}
            color={i === 0 ? red : '#aaa493'}
          />
        ))}
      </group>
    </>
  );
}
function Crate({ inspected }: { inspected: boolean }) {
  const ref = useRef<Group>(null),
    current = useRef(inspected ? Math.PI : 0);
  const { invalidate } = useThree();
  useEffect(() => {
    const stop = () => {
      if (document.hidden) {
        current.current = inspected ? Math.PI : 0;
        if (ref.current) ref.current.rotation.z = current.current;
      }
    };
    document.addEventListener('visibilitychange', stop);
    invalidate();
    return () => document.removeEventListener('visibilitychange', stop);
  }, [inspected, invalidate]);
  useFrame((_, delta) => {
    const target = inspected ? Math.PI : 0;
    current.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? target
      : current.current + (target - current.current) * Math.min(1, delta * 12);
    if (Math.abs(target - current.current) < 0.006) current.current = target;
    else invalidate();
    if (ref.current) ref.current.rotation.z = current.current;
  });
  return (
    <group ref={ref} position={[0, 0.46, 0]}>
      <Box size={[0.8, 0.65, 0.64]} color={blue} />
      <Box size={[0.84, 0.08, 0.68]} at={[0, 0.18, 0]} color={ink} />
      <Box at={[0, -0.331, 0]} size={[0.35, 0.01, 0.25]} color={paper} />
      <Box at={[0.15, 0.336, 0]} size={[0.08, 0.01, 0.65]} color={wood} />
    </group>
  );
}
function ObjectBadge({ id, selected }: { id: string; selected: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = selected ? '#a53224' : '#f5f3ed';
    ctx.fillRect(0, 0, 128, 80);
    ctx.strokeStyle = '#827d68';
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, 126, 78);
    ctx.fillStyle = selected ? '#ffffff' : '#283b3a';
    ctx.font = '42px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(id, 64, 42);
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [id, selected]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={[0, 1.95, 0]} scale={[0.5, 0.31, 1]}>
      <spriteMaterial map={texture} depthTest={false} toneMapped={false} />
    </sprite>
  );
}
function Cart() {
  return (
    <>
      <Box at={[0, 0.4, 0]} size={[1.4, 0.16, 1]} color={wood} />
      <Box at={[0, 0.6, 0]} size={[1.1, 0.24, 0.8]} color={'#c0b89f'} />
      <Box at={[0.57, 1, 0]} size={[0.08, 1.2, 0.08]} color={ink} />
      {[-0.48, 0.48].flatMap((x) =>
        [-0.35, 0.35].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.17, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.12, 12]} />
            <meshStandardMaterial color={ink} />
          </mesh>
        )),
      )}
    </>
  );
}
function MapObject() {
  return (
    <>
      <Table />
      <Box at={[0, 0.93, 0]} size={[1.1, 0.03, 0.75]} color={'#c7d2bf'} />
      {[-0.3, 0, 0.3].map((x) => (
        <Box key={x} at={[x, 0.95, 0]} size={[0.025, 0.01, 0.65]} color={'#718676'} />
      ))}
      <Box at={[0, 0.95, 0.12]} size={[1, 0.01, 0.035]} color={red} />
    </>
  );
}
function Prop({
  object,
  selected,
  inspected,
  onSelect,
}: {
  object: SceneObject;
  selected: boolean;
  inspected: boolean;
  onSelect: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <group
      position={[object.x, 0, object.z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <ringGeometry args={[0.82, 0.86, 48]} />
        <meshBasicMaterial color={selected ? red : hover ? '#816b43' : '#c9c3b5'} />
      </mesh>
      {object.shape === 'plinth' && (
        <>
          <Box at={[0, 0.55, 0]} size={[1.2, 1.1, 1.2]} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.11, 0]}>
            <ringGeometry args={[0.3, 0.32, 32]} />
            <meshBasicMaterial color={'#8f927d'} />
          </mesh>
          <Box at={[0, 0.8, 0.607]} size={[0.38, 0.15, 0.01]} color={'#d7cdb7'} />
        </>
      )}
      {object.shape === 'record' && <Record />}
      {object.shape === 'crate' && <Crate inspected={inspected} />}
      {object.shape === 'map' && <MapObject />}
      {object.shape === 'track' && (
        <group>
          {[-0.37, 0.37].map((x) => (
            <Box key={x} at={[x, 0.015, 0]} size={[0.04, 0.01, 1.3]} color={'#8f947c'} />
          ))}
          {[-0.16, 0.16].map((x) => (
            <group key={x} rotation={[0, -0.7, 0]}>
              <Box at={[x, 0.02, 0]} size={[0.02, 0.01, 1.3]} color={'#9a9e8c'} />
            </group>
          ))}
        </group>
      )}
      {object.shape === 'cart' && <Cart />}
      {object.shape === 'camera' && (
        <>
          <Table />
          <Box at={[0, 1.25, 0]} size={[1, 0.6, 0.15]} color={ink} />
          <Box at={[0, 1.25, 0.083]} size={[0.84, 0.43, 0.015]} color={blue} />
          <Box at={[0, 1.25, 0.1]} size={[0.28, 0.32, 0.01]} color={'#9dbcb7'} />
        </>
      )}
      {object.shape === 'clock' && (
        <>
          <Table />
          <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.13, 32]} />
            <meshStandardMaterial color={paper} />
          </mesh>
          <Box at={[0, 1.43, 0.08]} size={[0.035, 0.24, 0.025]} color={ink} />
          <Box at={[0.1, 1.3, 0.08]} size={[0.22, 0.03, 0.025]} color={red} />
        </>
      )}
      {object.shape === 'sensor' && (
        <>
          <Table />
          <Box at={[0, 1.1, 0]} size={[0.6, 0.3, 0.45]} color={ink} />
          <Box at={[0, 1.27, 0]} size={[0.45, 0.015, 0.3]} color={'#c0b89f'} />
          <Box at={[0.1, 1.28, 0]} size={[0.04, 0.01, 0.3]} color={red} />
        </>
      )}
      {object.shape === 'shelf' && (
        <>
          <Box at={[0, 0.2, 0]} size={[1.5, 0.12, 1.2]} color={wood} />
          <Box at={[0, 1.7, 0]} size={[1.5, 0.1, 1.2]} color={wood} />
          {[-0.67, 0.67].map((x) => (
            <Box key={x} at={[x, 0.85, -0.5]} size={[0.1, 1.7, 0.1]} color={wood} />
          ))}
          <group position={[0, 0.85, 0]}>
            {inspected ? (
              <Lantern />
            ) : (
              <mesh castShadow>
                <sphereGeometry args={[0.5, 16, 12]} />
                <meshStandardMaterial color={'#abb6ad'} roughness={1} />
              </mesh>
            )}
          </group>
          <Box at={[0, 0.35, 0]} size={[0.65, 0.12, 0.65]} color={ink} />
        </>
      )}
      <ObjectBadge id={object.id} selected={selected} />
    </group>
  );
}
function Floor({ seed }: { seed: number }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const transform = new Object3D();
    let n = seed;
    for (let i = 0; i < 64; i++) {
      n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
      transform.position.set((i % 8) - 3.5, -0.1, Math.floor(i / 8) * 0.8 - 2.8);
      transform.updateMatrix();
      ref.current!.setMatrixAt(i, transform.matrix);
      ref.current!.setColorAt(i, new Color().setHSL(0.11, 0.17, 0.6 + (n % 10) * 0.009));
    }
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, [seed]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 64]} receiveShadow>
      <boxGeometry args={[0.97, 0.16, 0.77]} />
      <meshStandardMaterial roughness={1} />
    </instancedMesh>
  );
}
function Rig({ angle }: { angle: number }) {
  const { camera, gl, invalidate, size } = useThree();
  useEffect(() => {
    const control = new OrbitControls(camera, gl.domElement);
    control.target.set(0, 0.5, 0);
    control.enablePan = false;
    control.enableZoom = false;
    control.enabled = window.matchMedia('(pointer: fine)').matches;
    gl.domElement.style.touchAction = control.enabled ? 'none' : 'pan-y';
    control.minPolarAngle = 0.55;
    control.maxPolarAngle = 1.25;
    control.addEventListener('change', () => invalidate());
    control.update();
    return () => control.dispose();
  }, [camera, gl, invalidate]);
  useLayoutEffect(() => {
    const c = camera as OrthographicCamera;
    c.position.set(Math.sin(angle) * 10, 10, Math.cos(angle) * 10);
    c.lookAt(0, 0.5, 0);
    c.zoom = Math.min(size.width / 11.6, size.height / 9);
    c.updateProjectionMatrix();
    invalidate();
  }, [camera, angle, size.width, size.height, invalidate]);
  return null;
}
function Room({
  place,
  seed,
  selected,
  discovered,
  onSelect,
}: {
  place: Place;
  seed: number;
  selected: string;
  discovered: string[];
  onSelect: (id: string) => void;
}) {
  const props = useMemo(() => objects.filter((o) => o.place === place), [place]);
  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight
        position={[3, 9, 4]}
        intensity={2.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.001}
      />
      <Floor seed={seed} />
      <Box
        at={[0, 1, -3.25]}
        size={[8.15, 2, 0.15]}
        color={place === 'monitor' ? '#b7c4bd' : '#e4ddcc'}
      />
      <Box at={[-4.08, 1, 0]} size={[0.15, 2, 6.5]} color={'#d5cdbb'} />
      <Box at={[0, 0.08, -3.12]} size={[8, 0.14, 0.08]} color={wood} />
      <Box at={[-3.98, 0.08, 0]} size={[0.08, 0.14, 6.4]} color={wood} />
      <RoomFurniture place={place} seed={seed} />
      {props.map((o) => (
        <Prop
          key={o.id}
          object={o}
          selected={selected === o.id}
          inspected={discovered.includes(o.id)}
          onSelect={() => onSelect(o.id)}
        />
      ))}
    </>
  );
}
class SceneBoundary extends React.Component<
  { children: React.ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function InvestigationScene(props: {
  place: Place;
  seed: number;
  selected: string;
  discovered: string[];
  onSelect: (id: string) => void;
}) {
  const [angle, setAngle] = useState(Math.PI / 4),
    [failed, setFailed] = useState(false),
    [enabled, setEnabled] = useState(true),
    [ready, setReady] = useState(false);
  const title = places.find((p) => p.id === props.place)!.title;
  useEffect(() => {
    setAngle(Math.PI / 4);
  }, [props.place]);
  return (
    <div className="ah-scene-wrap">
      <div
        className="ah-scene"
        aria-label={`Interactive model: ${title}`}
        data-scene-ready={ready && !failed && enabled}
      >
        {enabled && !failed ? (
          <SceneBoundary onFailure={() => setFailed(true)}>
            <Canvas
              orthographic
              shadows
              frameloop="demand"
              dpr={[1, 1.5]}
              camera={{ position: [10, 10, 10], near: 0.1, far: 100 }}
              gl={{ antialias: true, alpha: true }}
              onCreated={({ gl }) => {
                setReady(true);
                gl.domElement.setAttribute('aria-hidden', 'true');
                gl.domElement.addEventListener('webglcontextlost', () => setFailed(true), {
                  once: true,
                });
              }}
            >
              <Rig angle={angle} />
              <Room {...props} />
            </Canvas>
          </SceneBoundary>
        ) : (
          <div className="ah-scene-fallback">
            <span className="label">OBJECT VIEW</span>
            <h3>{title}</h3>
            <p>
              {failed ? 'The 3D view is unavailable on this device.' : 'The 3D view is paused.'}{' '}
              Every investigation action is available in the object list below.
            </p>
          </div>
        )}
        <span className="ah-scene-caption">
          {enabled && !failed
            ? 'SELECT AN OBJECT · ROTATE THE VIEW BELOW'
            : 'THE SAME EVIDENCE, IN TEXT'}
        </span>
      </div>
      <div className="ah-camera-tools">
        <button
          className="text-button"
          aria-label="Rotate room left"
          disabled={failed || !enabled}
          onClick={() => setAngle((a) => a - 0.4)}
        >
          ↶ Rotate
        </button>
        <button
          className="text-button"
          aria-label="Reset room view"
          disabled={failed || !enabled}
          onClick={() => setAngle(Math.PI / 4)}
        >
          Reset view
        </button>
        <button
          className="text-button"
          aria-label="Rotate room right"
          disabled={failed || !enabled}
          onClick={() => setAngle((a) => a + 0.4)}
        >
          Rotate ↷
        </button>
        <button className="text-button" onClick={() => setEnabled((x) => !x)} disabled={failed}>
          {enabled ? 'Use object list only' : 'Show 3D room'}
        </button>
      </div>
    </div>
  );
}
