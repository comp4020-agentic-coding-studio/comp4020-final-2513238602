import { useLayoutEffect, useRef } from 'react';
import { Color, Object3D } from 'three';
import type { InstancedMesh } from 'three';
import type { Place } from '../shared/after-hours.ts';

function Block({
  p,
  s,
  c,
}: {
  p: [number, number, number];
  s: [number, number, number];
  c: string;
}) {
  return (
    <mesh position={p} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={0.9} />
    </mesh>
  );
}
function Frame({
  x,
  z,
  color,
  side = false,
}: {
  x: number;
  z: number;
  color: string;
  side?: boolean;
}) {
  return (
    <group position={[x, 1.25, z]} rotation={[0, side ? Math.PI / 2 : 0, 0]}>
      <Block p={[0, 0, 0]} s={[1, 0.85, 0.1]} c="#8e6b49" />
      <Block p={[0, 0, 0.06]} s={[0.86, 0.71, 0.03]} c={color} />
      <mesh position={[0, 0, 0.083]}>
        <ringGeometry args={[0.17, 0.22, 32]} />
        <meshStandardMaterial color="#daca9d" />
      </mesh>
    </group>
  );
}
function Rack({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {[-0.8, 0.8].flatMap((dx) =>
        [-0.25, 0.25].map((dz) => (
          <Block key={`${dx}${dz}`} p={[dx, 1, dz]} s={[0.07, 2, 0.07]} c="#68776c" />
        )),
      )}
      {[0.25, 1, 1.75].map((y) => (
        <Block key={y} p={[0, y, 0]} s={[1.7, 0.06, 0.65]} c="#a78358" />
      ))}
    </group>
  );
}
function StoredBoxes({ seed }: { seed: number }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new Object3D();
    let n = seed;
    for (let i = 0; i < 18; i++) {
      n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
      o.position.set(
        ((i % 3) - 1) * 2.4 + (Math.floor(i / 3) % 2 ? -0.38 : 0.38),
        0.5 + Math.floor(i / 6) * 0.75,
        -2.65,
      );
      o.scale.set(0.5, 0.4 + (n % 3) * 0.04, 0.45);
      o.rotation.y = ((n % 9) - 4) * 0.025;
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
      ref.current!.setColorAt(i, new Color(['#b79870', '#cad0b8', '#8b9c96'][n % 3]));
    }
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, [seed]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 18]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={1} />
    </instancedMesh>
  );
}
export function Lantern() {
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.43, 24, 20]} />
        <meshStandardMaterial color="#e8cf8e" roughness={0.8} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2, (Math.PI * i) / 6, 0]}>
          <torusGeometry args={[0.435, 0.009, 6, 48]} />
          <meshStandardMaterial color="#947b48" />
        </mesh>
      ))}
      <Block p={[0, -0.4, 0]} s={[0.48, 0.1, 0.48]} c="#6d6651" />
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.1, 0.016, 8, 24]} />
        <meshStandardMaterial color="#947b48" />
      </mesh>
    </group>
  );
}
export default function RoomFurniture({ place, seed }: { place: Place; seed: number }) {
  if (place === 'gallery')
    return (
      <group>
        <Frame x={-2.5} z={-3.13} color="#5f7f86" />
        <Frame x={0.15} z={-3.13} color="#9e714f" />
        <Frame x={-3.96} z={1} color="#698b80" side />
        <Block p={[-3.5, 0.45, -0.5]} s={[0.6, 0.13, 2]} c="#9c7954" />
        {[-1.2, 0.2].map((z) => (
          <Block key={z} p={[-3.5, 0.2, z]} s={[0.45, 0.45, 0.12]} c="#78694b" />
        ))}
        {[-2.4, -0.6].map((x) => (
          <group key={x} position={[x, 0, 0.5]}>
            <mesh position={[0, 0.38, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.04, 0.76, 10]} />
              <meshStandardMaterial color="#847756" />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.16, 0.2, 0.08, 16]} />
              <meshStandardMaterial color="#847756" />
            </mesh>
          </group>
        ))}
        <Block p={[-1.5, 0.7, 0.5]} s={[1.8, 0.035, 0.035]} c="#994d3b" />
        <Block p={[3.2, 0.07, -1.2]} s={[0.55, 0.14, 1.3]} c="#aeb8a3" />
      </group>
    );
  if (place === 'workshop')
    return (
      <group>
        <Block p={[0, 1.25, -3.11]} s={[3.9, 1.1, 0.12]} c="#ac956e" />
        {Array.from({ length: 12 }, (_, i) => (
          <Block
            key={i}
            p={[-1.6 + (i % 6) * 0.65, 0.95 + Math.floor(i / 6) * 0.55, -3.02]}
            s={[0.04, 0.26 + (i % 3) * 0.06, 0.06]}
            c={i % 2 ? '#526963' : '#e6d9b6'}
          />
        ))}
        <Block p={[-3.4, 0.8, -1.7]} s={[0.8, 0.12, 2]} c="#aa8157" />
        {[-2.4, -1].map((z) => (
          <Block key={z} p={[-3.4, 0.4, z]} s={[0.12, 0.8, 0.15]} c="#6b7160" />
        ))}
        {[0, 1, 2].map((i) => (
          <Block
            key={i}
            p={[3.2, 0.22 + i * 0.32, -2.45]}
            s={[0.7, 0.3, 0.7]}
            c={i % 2 ? '#a8b4a3' : '#b39a73'}
          />
        ))}
        <Block p={[2.95, 0.04, 2.5]} s={[0.9, 0.07, 0.4]} c="#626f62" />
      </group>
    );
  if (place === 'monitor')
    return (
      <group>
        <Block p={[-0.2, 1.18, -3.1]} s={[4.9, 1.25, 0.15]} c="#52655e" />
        {[-1.75, -0.2, 1.35].map((x, i) => (
          <group key={x}>
            <Block p={[x, 1.3, -2.99]} s={[1.23, 0.7, 0.1]} c="#344440" />
            <Block p={[x, 1.3, -2.93]} s={[1.1, 0.57, 0.025]} c={i === 1 ? '#8baca1' : '#718e8c'} />
            {[0, 1, 2].map((j) => (
              <Block
                key={j}
                p={[x - 0.3 + j * 0.25, 1.3, -2.91]}
                s={[0.025, 0.35, 0.01]}
                c="#acc3b1"
              />
            ))}
          </group>
        ))}
        <Block p={[3.2, 0.7, -1.7]} s={[0.7, 1.4, 0.65]} c="#7b8a7b" />
        {[0.3, 0.6, 0.9, 1.2].map((y) => (
          <Block key={y} p={[3.2, y, -1.365]} s={[0.5, 0.08, 0.015]} c="#43574e" />
        ))}
        <Block p={[-3.4, 0.38, 1]} s={[0.65, 0.12, 0.65]} c="#8b7853" />
        <Block p={[-3.6, 0.85, 1]} s={[0.12, 0.9, 0.65]} c="#8b7853" />
      </group>
    );
  return (
    <group>
      {[-2.4, 0, 2.4].map((x) => (
        <Rack key={x} x={x} z={-2.65} />
      ))}
      <StoredBoxes seed={seed} />
      <Block p={[-3.75, 0.04, 0.6]} s={[0.35, 0.06, 3.2]} c="#aaa98d" />
      {[0, 1, 2, 3].map((i) => (
        <Block
          key={i}
          p={[3.35, 0.22 + i * 0.4, -0.2]}
          s={[0.7, 0.38, 0.8]}
          c={i % 2 ? '#a4ad98' : '#a28460'}
        />
      ))}
      <Block p={[0, 0.02, 2.5]} s={[3, 0.02, 0.035]} c="#8a805b" />
    </group>
  );
}
