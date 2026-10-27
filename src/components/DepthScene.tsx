import type { WebGLRenderer } from "three";
import { useEffect, useRef } from "react";
export default function DepthScene() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let dispose: undefined | (() => void);
    let cancelled = false;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    if (!context) return;
    import("three")
      .then((T) => {
        if (cancelled) return;
        let renderer: WebGLRenderer;
        try {
          renderer = new T.WebGLRenderer({
            canvas,
            context,
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
        } catch {
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        host.appendChild(renderer.domElement);
        const scene = new T.Scene(),
          camera = new T.PerspectiveCamera(32, 1, 0.1, 30);
        camera.position.z = 7;
        // An arch between two endpoints echoes the bridge in the T2T mark.
        const curve = new T.CubicBezierCurve3(
          new T.Vector3(-2, -1.1, 0),
          new T.Vector3(-1.1, 1.6, 0.15),
          new T.Vector3(1.1, 1.6, 0.15),
          new T.Vector3(2, -1.1, 0),
        );
        const geometry = new T.TubeGeometry(curve, 64, 0.035, 8, false);
        const material = new T.MeshStandardMaterial({
          color: 0x4979ed,
          metalness: 0.4,
          roughness: 0.28,
        });
        const bridge = new T.Mesh(geometry, material);
        bridge.rotation.set(0.1, 0.15, 0.05);
        scene.add(bridge);
        scene.add(new T.HemisphereLight(0xffffff, 0x6688cc, 3));
        const light = new T.DirectionalLight(0xffffff, 4);
        light.position.set(2, 4, 4);
        scene.add(light);
        let x = 0,
          y = 0,
          frame = 0,
          visible = true;
        const motion = matchMedia("(prefers-reduced-motion: reduce)");
        const draw = () => {
          frame = 0;
          if (!visible || document.hidden) return;
          bridge.rotation.y += (x - bridge.rotation.y) * 0.035;
          bridge.rotation.x += (y + 0.1 - bridge.rotation.x) * 0.035;
          renderer.render(scene, camera);
          if (
            !motion.matches &&
            (Math.abs(x - bridge.rotation.y) > 0.0001 ||
              Math.abs(y + 0.1 - bridge.rotation.x) > 0.0001)
          )
            frame = requestAnimationFrame(draw);
        };
        const start = () => {
          if (!frame) draw();
        };
        const resize = new ResizeObserver(() => {
          const w = host.clientWidth,
            h = host.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          start();
        });
        resize.observe(host);
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible) start();
          else (cancelAnimationFrame(frame), (frame = 0));
        });
        observer.observe(host);
        const move = (e: PointerEvent) => {
          x = (e.clientX / window.innerWidth - 0.5) * 0.25;
          y = (e.clientY / window.innerHeight - 0.5) * 0.18;
          start();
        };
        window.addEventListener("pointermove", move, { passive: true });
        document.addEventListener("visibilitychange", start);
        motion.addEventListener("change", start);
        dispose = () => {
          cancelAnimationFrame(frame);
          resize.disconnect();
          observer.disconnect();
          window.removeEventListener("pointermove", move);
          document.removeEventListener("visibilitychange", start);
          motion.removeEventListener("change", start);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);
  return <div ref={ref} className="depth-canvas" aria-hidden="true" />;
}
