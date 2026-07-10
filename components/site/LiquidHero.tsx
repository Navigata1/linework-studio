"use client";
import { useEffect, useRef } from "react";

// Full-bleed WebGL water: deep blue liquid with drifting caustics, pointer
// ripples that displace the surface, and a scroll uniform that morphs the
// water as the story descends. Hand-rolled — no three.js, ~0kB deps.
// Falls back to the static gradient (and renders nothing extra) when WebGL
// is unavailable or the visitor prefers reduced motion.

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform vec4 uRipples[8]; // xy = center (uv), z = birth time, w = strength

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.03; a *= 0.55; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv; p.x *= uRes.x / uRes.y;
  float t = uTime * 0.14;

  // pointer ripples: height field + gradient for refraction
  float h = 0.0;
  for(int i = 0; i < 8; i++){
    vec2 c = uRipples[i].xy; c.x *= uRes.x / uRes.y;
    float age = uTime - uRipples[i].z;
    float str = uRipples[i].w;
    if(str > 0.0 && age > 0.0 && age < 3.0){
      float d = distance(p, c);
      float wave = sin(d * 42.0 - age * 7.0);
      h += wave * exp(-d * 7.0) * exp(-age * 1.6) * str;
    }
  }
  vec2 grad = vec2(dFdx(h), dFdy(h)) * 18.0;

  // flowing water body, deeper + slower as you scroll
  vec2 flow = p * (2.4 + uScroll * 1.2) + vec2(t * 0.6, -t * 0.35) + grad;
  float body = fbm(flow + fbm(flow * 1.7 - t * 0.4) * 0.9);

  // caustic shimmer near the surface, fading with depth (scroll)
  float ca = pow(abs(sin(body * 6.2831 + t * 2.0)), 8.0) * (0.5 - uScroll * 0.3);

  // palette: near-black navy -> studio blue -> cyan glints
  vec3 deep = vec3(0.012, 0.035, 0.086);
  vec3 mid  = vec3(0.043, 0.13, 0.29);
  vec3 glow = vec3(0.18, 0.61, 1.0);
  vec3 cyan = vec3(0.26, 0.88, 0.82);

  vec3 col = mix(deep, mid, smoothstep(0.15, 0.85, body));
  col += glow * ca * 0.55;
  col += cyan * pow(max(h, 0.0), 1.4) * 2.4;              // ripple crests
  col += glow * max(-h, 0.0) * 0.8;                        // ripple troughs
  col = mix(col, deep * 0.72, uScroll * 0.45);             // descend into the abyss

  // vertical light falloff + vignette
  col *= 0.62 + 0.5 * (1.0 - uv.y);
  float vig = smoothstep(1.25, 0.35, distance(uv, vec2(0.5, 0.42)));
  col *= 0.55 + 0.45 * vig;

  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

export function LiquidHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;
    const ext = gl.getExtension("OES_standard_derivatives");
    const frag = ext ? "#extension GL_OES_standard_derivatives : enable\n" + FRAG : FRAG.replace(/vec2\(dFdx\(h\), dFdy\(h\)\) \* 18\.0/, "vec2(0.0)");

    const mk = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = mk(gl.VERTEX_SHADER, VERT);
    const fs = mk(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uScroll = gl.getUniformLocation(prog, "uScroll");
    const uRipples = gl.getUniformLocation(prog, "uRipples");

    const ripples = new Float32Array(8 * 4);
    let rIdx = 0;
    const start = performance.now();
    const now = () => (performance.now() - start) / 1000;

    const addRipple = (clientX: number, clientY: number, strength: number) => {
      const r = canvas.getBoundingClientRect();
      if (clientY < r.top || clientY > r.bottom) return;
      const x = (clientX - r.left) / r.width;
      const y = 1 - (clientY - r.top) / r.height;
      const o = rIdx * 4;
      ripples[o] = x; ripples[o + 1] = y; ripples[o + 2] = now(); ripples[o + 3] = strength;
      rIdx = (rIdx + 1) % 8;
    };

    let lastMove = 0;
    const onMove = (e: PointerEvent) => {
      const t = performance.now();
      if (t - lastMove > 160) { lastMove = t; addRipple(e.clientX, e.clientY, 0.55); }
    };
    const onDown = (e: PointerEvent) => addRipple(e.clientX, e.clientY, 1.25);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const sc = Math.min(1, window.scrollY / (window.innerHeight * 1.2));
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, now());
      gl.uniform1f(uScroll, sc);
      gl.uniform4fv(uRipples, ripples);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
