import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { GarmentType } from "../lib/products";
import { useApp } from "../lib/store";

interface Garment3DProps {
  type: GarmentType;
  color: string;
  className?: string;
}

export function Garment3D({ type, color, className = "" }: Garment3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useApp();
  const [isInteracting, setIsInteracting] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    reset: () => void;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    const initialZ = 4.2;
    camera.position.set(0, 0, initialZ);

    // 2. Renderer with soft shadow handling & filimic tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3, 4, 3.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xebe2d5, 1.3);
    fillLight.position.set(-3.5, 2, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfff4e0, 1.8);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // 4. Subtle Procedural Fabric Weave Texture
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = "#8c8c8c";
      for (let i = 0; i < 64; i += 4) {
        ctx.fillRect(i, 0, 2, 64);
        ctx.fillRect(0, i, 64, 2);
      }
    }
    const fabricBumpMap = new THREE.CanvasTexture(canvas);
    fabricBumpMap.wrapS = THREE.RepeatWrapping;
    fabricBumpMap.wrapT = THREE.RepeatWrapping;
    fabricBumpMap.repeat.set(12, 12);

    // 5. Materials
    const baseColor = new THREE.Color(color);
    const garmentMaterial = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: type === "jacket" ? 0.45 : type === "jeans" ? 0.75 : 0.65,
      metalness: type === "jacket" ? 0.15 : 0.05,
      bumpMap: fabricBumpMap,
      bumpScale: 0.02,
      side: THREE.DoubleSide,
    });

    const trimColor = new THREE.Color(color).offsetHSL(0, -0.05, -0.12);
    const trimMaterial = new THREE.MeshStandardMaterial({
      color: trimColor,
      roughness: 0.8,
      metalness: 0.05,
    });

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.8,
    });

    // 6. Procedural Garment Geometry Group
    const garmentGroup = new THREE.Group();

    if (type === "tee" || type === "shirt" || type === "hoodie" || type === "jacket" || type === "sweater") {
      // Torso
      const torsoGeo = new THREE.CylinderGeometry(0.72, 0.78, 1.6, 32);
      torsoGeo.scale(1, 1, 0.55);
      const torso = new THREE.Mesh(torsoGeo, garmentMaterial);
      torso.position.y = 0;
      garmentGroup.add(torso);

      // Sleeves
      const isShort = type === "tee";
      const sleeveLength = isShort ? 0.65 : 1.35;
      const sleeveGeo = new THREE.CylinderGeometry(0.24, 0.28, sleeveLength, 24);
      sleeveGeo.scale(1, 1, 0.7);

      const leftSleeve = new THREE.Mesh(sleeveGeo, garmentMaterial);
      leftSleeve.position.set(-0.95, isShort ? 0.45 : 0.1, 0);
      leftSleeve.rotation.z = Math.PI / 6;
      garmentGroup.add(leftSleeve);

      const rightSleeve = new THREE.Mesh(sleeveGeo, garmentMaterial);
      rightSleeve.position.set(0.95, isShort ? 0.45 : 0.1, 0);
      rightSleeve.rotation.z = -Math.PI / 6;
      garmentGroup.add(rightSleeve);

      // Neckline / Collar / Accents
      if (type === "hoodie") {
        const hoodGeo = new THREE.SphereGeometry(0.5, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.75);
        const hood = new THREE.Mesh(hoodGeo, trimMaterial);
        hood.position.set(0, 0.85, -0.15);
        hood.rotation.x = Math.PI * 0.2;
        garmentGroup.add(hood);

        // Kangaroo Pocket
        const pocketGeo = new THREE.BoxGeometry(0.65, 0.4, 0.12);
        const pocket = new THREE.Mesh(pocketGeo, trimMaterial);
        pocket.position.set(0, -0.3, 0.28);
        garmentGroup.add(pocket);
      } else if (type === "shirt") {
        // Oxford Shirt Folded Collar
        const collarGeo = new THREE.TorusGeometry(0.36, 0.08, 16, 32);
        collarGeo.scale(1, 0.75, 1);
        const collar = new THREE.Mesh(collarGeo, trimMaterial);
        collar.position.set(0, 0.82, 0);
        collar.rotation.x = Math.PI / 2;
        garmentGroup.add(collar);

        // Front Placket with Buttons
        const placketGeo = new THREE.BoxGeometry(0.12, 1.45, 0.04);
        const placket = new THREE.Mesh(placketGeo, trimMaterial);
        placket.position.set(0, 0.02, 0.3);
        garmentGroup.add(placket);

        for (let b = -0.5; b <= 0.6; b += 0.28) {
          const btnGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.015, 12);
          const btn = new THREE.Mesh(btnGeo, metalMaterial);
          btn.position.set(0, b, 0.32);
          btn.rotation.x = Math.PI / 2;
          garmentGroup.add(btn);
        }
      } else if (type === "jacket") {
        // Zip Line
        const zipGeo = new THREE.BoxGeometry(0.04, 1.5, 0.03);
        const zip = new THREE.Mesh(zipGeo, metalMaterial);
        zip.position.set(0, 0, 0.31);
        garmentGroup.add(zip);

        const collarGeo = new THREE.TorusGeometry(0.38, 0.08, 16, 32);
        collarGeo.scale(1, 0.7, 1);
        const collar = new THREE.Mesh(collarGeo, trimMaterial);
        collar.position.set(0, 0.8, 0);
        collar.rotation.x = Math.PI / 2;
        garmentGroup.add(collar);
      } else {
        // Crew Neck Collar
        const collarGeo = new THREE.TorusGeometry(0.36, 0.07, 16, 32);
        collarGeo.scale(1, 0.7, 1);
        const collar = new THREE.Mesh(collarGeo, trimMaterial);
        collar.position.set(0, 0.8, 0);
        collar.rotation.x = Math.PI / 2;
        garmentGroup.add(collar);
      }
    } else if (type === "dress") {
      // Bodice
      const bodiceGeo = new THREE.CylinderGeometry(0.62, 0.52, 0.95, 32);
      bodiceGeo.scale(1, 1, 0.6);
      const bodice = new THREE.Mesh(bodiceGeo, garmentMaterial);
      bodice.position.y = 0.55;
      garmentGroup.add(bodice);

      // Flared Midi Skirt
      const skirtGeo = new THREE.ConeGeometry(1.3, 1.7, 32, 1, true);
      skirtGeo.scale(1, 1, 0.65);
      const skirt = new THREE.Mesh(skirtGeo, garmentMaterial);
      skirt.position.y = -0.6;
      garmentGroup.add(skirt);

      // Tie Waist Belt
      const beltGeo = new THREE.TorusGeometry(0.55, 0.06, 16, 32);
      beltGeo.scale(1, 0.6, 1);
      const belt = new THREE.Mesh(beltGeo, trimMaterial);
      belt.position.set(0, 0.1, 0);
      belt.rotation.x = Math.PI / 2;
      garmentGroup.add(belt);
    } else if (type === "skirt") {
      // Flared A-line Skirt
      const waistGeo = new THREE.CylinderGeometry(0.58, 0.62, 0.25, 32);
      waistGeo.scale(1, 1, 0.6);
      const waist = new THREE.Mesh(waistGeo, trimMaterial);
      waist.position.y = 0.65;
      garmentGroup.add(waist);

      const skirtGeo = new THREE.ConeGeometry(1.2, 1.45, 32, 1, true);
      skirtGeo.scale(1, 1, 0.65);
      const skirt = new THREE.Mesh(skirtGeo, garmentMaterial);
      skirt.position.y = -0.15;
      garmentGroup.add(skirt);
    } else {
      // Trousers / Jeans / Shorts
      const waistGeo = new THREE.CylinderGeometry(0.74, 0.7, 0.45, 32);
      waistGeo.scale(1, 1, 0.6);
      const waist = new THREE.Mesh(waistGeo, garmentMaterial);
      waist.position.y = 0.6;
      garmentGroup.add(waist);

      // Metallic Waist Rivet / Button
      const rivetGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
      const rivet = new THREE.Mesh(rivetGeo, metalMaterial);
      rivet.position.set(0, 0.65, 0.28);
      rivet.rotation.x = Math.PI / 2;
      garmentGroup.add(rivet);

      const legHeight = type === "shorts" ? 0.75 : 1.75;
      const legGeo = new THREE.CylinderGeometry(0.32, 0.22, legHeight, 24);
      legGeo.scale(1, 1, 0.7);

      const leftLeg = new THREE.Mesh(legGeo, garmentMaterial);
      leftLeg.position.set(-0.35, 0.35 - legHeight / 2, 0);
      garmentGroup.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, garmentMaterial);
      rightLeg.position.set(0.35, 0.35 - legHeight / 2, 0);
      garmentGroup.add(rightLeg);
    }

    scene.add(garmentGroup);

    // 7. Interactive Drag & Rotation Handling
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      setIsInteracting(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      prevX = clientX;
      prevY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevX;
      const deltaY = clientY - prevY;

      targetRotationY += deltaX * 0.009;
      targetRotationX = Math.max(-0.35, Math.min(0.35, targetRotationX + deltaY * 0.005));

      prevX = clientX;
      prevY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
      setTimeout(() => setIsInteracting(false), 2000);
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    dom.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // Zoom & Reset helper bindings
    controlsRef.current = {
      zoomIn: () => {
        camera.position.z = Math.max(2.6, camera.position.z - 0.45);
      },
      zoomOut: () => {
        camera.position.z = Math.min(5.8, camera.position.z + 0.45);
      },
      reset: () => {
        targetRotationY = 0;
        targetRotationX = 0;
        camera.position.set(0, 0, initialZ);
      },
    };

    // 8. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging && autoRotate) {
        targetRotationY += 0.004;
      }

      garmentGroup.rotation.y += (targetRotationY - garmentGroup.rotation.y) * 0.08;
      garmentGroup.rotation.x += (targetRotationX - garmentGroup.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Observer
    const ro = new ResizeObserver(() => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw && nh) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      }
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      dom.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      dom.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      if (dom.parentElement) dom.parentElement.removeChild(dom);
      renderer.dispose();
      fabricBumpMap.dispose();
    };
  }, [type, color, autoRotate]);

  return (
    <div className={`relative h-full w-full select-none bg-gradient-to-b from-cream-2 to-cream-3/40 ${className}`}>
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Controls Bar */}
      <div className="absolute top-3 end-3 flex items-center gap-1.5 z-20">
        <button
          type="button"
          onClick={() => controlsRef.current?.zoomIn()}
          aria-label="Zoom In"
          title={lang === "ar" ? "تكبير" : "Zoom In"}
          className="grid h-7 w-7 place-items-center rounded-full bg-ink/75 hover:bg-ink text-cream text-xs shadow-xs transition-colors"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => controlsRef.current?.zoomOut()}
          aria-label="Zoom Out"
          title={lang === "ar" ? "تصغير" : "Zoom Out"}
          className="grid h-7 w-7 place-items-center rounded-full bg-ink/75 hover:bg-ink text-cream text-xs shadow-xs transition-colors"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setAutoRotate((r) => !r)}
          aria-label="Toggle Auto-Spin"
          title={lang === "ar" ? "تشغيل/إيقاف الدوران" : "Toggle Spin"}
          className="grid h-7 w-7 place-items-center rounded-full bg-ink/75 hover:bg-ink text-cream text-[0.65rem] shadow-xs transition-colors"
        >
          {autoRotate ? "⏸" : "⟳"}
        </button>
        <button
          type="button"
          onClick={() => controlsRef.current?.reset()}
          aria-label="Reset Camera"
          title={lang === "ar" ? "إعادة التوجيه" : "Reset View"}
          className="grid h-7 w-7 place-items-center rounded-full bg-ink/75 hover:bg-ink text-cream text-[0.62rem] shadow-xs transition-colors uppercase"
        >
          ↺
        </button>
      </div>

      {/* 3D Interactive Badge and Drag Hint */}
      <div className="pointer-events-none absolute bottom-4 inset-x-0 flex flex-col items-center gap-1">
        <span
          className={`rounded-full bg-ink/80 backdrop-blur-xs px-3.5 py-1 text-[0.66rem] tracking-wider text-cream transition-opacity duration-500 uppercase flex items-center gap-1.5 shadow-sm ${
            isInteracting ? "opacity-25" : "opacity-95"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          {t("p.rotateHint")}
        </span>
      </div>
    </div>
  );
}
