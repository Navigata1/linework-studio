"use client";
import { useEffect, useRef } from "react";

/**
 * The whole-page story, in one fixed WebGL surface.
 *
 * TOP (scroll 0): deep-blue liquid. The pointer is a vessel — it PARTS the
 *   fluid along its path: a carved furrow with raised banks and two diverging
 *   trailing wake arms that heal when the pointer rests. No rings, no splash.
 * DESCENT (scroll → 1): the water lifts into a rooftop cloudscape at golden
 *   hour — billowing cloud, a warm sun rim, a soft city glow settling at the
 *   base for the closing call-to-action.
 *
 * Reads global scroll progress (window.__scroll, 0..1) published by
 * <SmoothScroll>. Hard fallbacks: no WebGL, no derivatives, shader compile
 * failure, or context loss → the canvas hides and the CSS gradient beneath
 * shows. prefers-reduced-motion → never starts. Pauses when hidden.
 */

const N = 16; // pointer trail samples

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform float uAspect;
uniform vec4 uTrail[${N}]; // xy = aspect-space pos, z = age(s), w = amplitude
uniform vec2 uDir[${N}];   // unit travel direction (aspect space)

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.,0.)), u.x),
             mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i=0;i<5;i++){ v += a*noise(p); p = p*2.02 + 7.1; a *= 0.55; }
  return v;
}

// Boat-wake height field at aspect-space point q.
// Furrow: trough under the path with raised banks either side.
// Wake arms: TWO diverging ridges (sum, not product) trailing each sample.
float wakeField(vec2 q, float sky){
  float h = 0.0;
  for(int i=0;i<${N};i++){
    float amp = uTrail[i].w;
    if(amp <= 0.0) continue;
    vec2 d = q - uTrail[i].xy;
    if(dot(d, d) > 0.16) continue; // spatial cull: > ~0.4 aspect units away
    vec2 dir = uDir[i];
    vec2 nrm = vec2(-dir.y, dir.x);
    float along = dot(d, dir);
    float perp  = dot(d, nrm);
    float age   = uTrail[i].z;
    float life  = exp(-age * 1.4);

    // carved furrow: elongated along travel, thin across
    float across = mix(300.0, 190.0, sky);
    float footA  = exp(-along*along * 26.0);
    float footP  = exp(-perp*perp * across);
    float profile = (across * 2.0 * perp*perp - 1.0); // trough center, banks out
    h += profile * footP * footA * amp * life;

    // diverging V arms behind the vessel (sum of two ridges)
    float behind = step(along, 0.0);
    float arm1 = exp(-pow(perp - 0.34*along, 2.0) * 240.0);
    float arm2 = exp(-pow(perp + 0.34*along, 2.0) * 240.0);
    float trail = exp(-along*along * 5.0);
    h += (arm1 + arm2) * behind * trail * amp * life * 0.35;
  }
  return h * 0.02;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 q = vec2(uv.x * uAspect, uv.y);
  float sky = smoothstep(0.30, 0.82, uScroll);
  float h = wakeField(q, sky) * mix(1.0, 0.7, sky);
  float t = uTime * 0.05;

  // fields — compute only the visible medium (sky is uniform-constant per draw)
  float water = 0.0;
  float clouds = 0.0;
  if (sky < 0.999) {
    vec2 wf = q * 2.6 + vec2(t*0.5, -t*0.3);
    water = fbm(wf + fbm(wf*1.6 - t*0.4)*0.7);
  }
  if (sky > 0.001) {
    vec2 cf = q * vec2(2.2, 1.4) + vec2(t*0.8, -uScroll*0.9 - t*0.15);
    clouds = fbm(cf + fbm(cf*2.1 + t*0.2)*1.1);
    clouds = smoothstep(0.25, 0.9, clouds);
  }

  // palettes
  vec3 deep = vec3(0.010, 0.035, 0.082);
  vec3 mid  = vec3(0.040, 0.130, 0.290);
  vec3 wCol = mix(deep, mid, smoothstep(0.12, 0.85, water));

  vec3 skyTop = vec3(0.035, 0.075, 0.180);
  vec3 skyLow = vec3(0.120, 0.150, 0.260);
  vec3 sun    = vec3(1.000, 0.680, 0.360);
  vec3 sky2   = mix(skyTop, skyLow, uv.y);
  float sunGlow = exp(-distance(uv, vec2(0.82, 0.30)) * 3.4);
  vec3 cCol = mix(sky2, vec3(0.82, 0.86, 0.95), clouds * 0.62);
  cCol += sun * sunGlow * 0.55;
  cCol = mix(cCol, sun, clouds * sunGlow * 0.45);
  // soft irregular city glow near the base (noise, not stripes)
  float city = smoothstep(0.18, 0.0, uv.y) * noise(vec2(uv.x * 42.0, 3.7));
  cCol += sun * city * 0.08 * sky;

  vec3 col = mix(wCol, cCol, sky);

  // wake shading — scaled by local wake magnitude so still water adds nothing
  float wm = clamp(abs(h) * 60.0, 0.0, 1.0);
  vec3 nrmv = normalize(vec3(-dFdx(h)*90.0, -dFdy(h)*90.0, 1.0));
  float diff = clamp(dot(nrmv, normalize(vec3(0.4, 0.5, 0.8))), 0.0, 1.0);
  float rim  = pow(1.0 - nrmv.z, 2.0);
  vec3 wakeTint = mix(vec3(0.20, 0.62, 1.0), vec3(1.0, 0.74, 0.42), sky);
  col += wakeTint * (diff - 0.5) * 0.18 * wm;
  col += wakeTint * rim * 0.12 * wm;

  // caustic shimmer, fading with ascent
  float ca = pow(abs(sin(water*6.2831 + t*2.0)), 8.0) * (0.4 - sky*0.35);
  col += vec3(0.18, 0.6, 1.0) * ca * 0.5;

  // vertical light + vignette (lift tamed at high sky so text keeps contrast)
  col *= 0.66 + (0.42 - sky*0.16) * (1.0 - uv.y);
  float vig = smoothstep(1.3, 0.35, distance(uv, vec2(0.5, 0.42)));
  col *= 0.6 + 0.4 * vig;
  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

type Sample = { x: number; y: number; dx: number; dy: number; amp: number; t: number };

export function LiquidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      canvas.style.display = "none"; // static CSS gradient carries the scene
      return;
    }

    // Any init failure must reveal the CSS fallback under the opaque canvas.
    const bail = () => { canvas.style.display = "none"; };

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) return bail();
    if (!gl.getExtension("OES_standard_derivatives")) return bail();
    // uTrail(16 vec4) + uDir(16→8 packed by GL) + scalars: need headroom
    if ((gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) as number) < 40) return bail();

    const src = "#extension GL_OES_standard_derivatives : enable\n" + FRAG;
    let prog: WebGLProgram | null = null;
    let raf = 0;
    let uRes: WebGLUniformLocation | null = null,
      uTime: WebGLUniformLocation | null = null,
      uScroll: WebGLUniformLocation | null = null,
      uAspect: WebGLUniformLocation | null = null,
      uTrail: WebGLUniformLocation | null = null,
      uDir: WebGLUniformLocation | null = null;

    const compile = (type: number, s: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, s);
      gl.compileShader(sh);
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    };

    // ── GPU state init (also used on context-restore) ─────────────
    const SCALE = 0.72;
    let aspect = 1;
    const dprCap = Math.min(window.devicePixelRatio || 1, 1.25);

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      aspect = w / h;
      canvas.width = Math.max(1, Math.round(w * dprCap * SCALE));
      canvas.height = Math.max(1, Math.round(h * dprCap * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (prog && uRes && uAspect) {
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uAspect, aspect);
      }
    };

    const init = (): boolean => {
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, src);
      if (!vs || !fs) return false;
      prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      uRes = gl.getUniformLocation(prog, "uRes");
      uTime = gl.getUniformLocation(prog, "uTime");
      uScroll = gl.getUniformLocation(prog, "uScroll");
      uAspect = gl.getUniformLocation(prog, "uAspect");
      uTrail = gl.getUniformLocation(prog, "uTrail");
      uDir = gl.getUniformLocation(prog, "uDir");
      resize();
      return true;
    };
    if (!init()) return bail();

    // ── pointer trail ──────────────────────────────────────────────
    const samples: Sample[] = [];
    const LIFETIME = 2.2;
    const start = performance.now();
    const now = () => (performance.now() - start) / 1000;
    let last: { x: number; y: number } | null = null;

    const onMove = (e: PointerEvent) => {
      const ax = (e.clientX / window.innerWidth) * aspect;
      const ay = 1 - e.clientY / window.innerHeight;
      if (last) {
        const dx = ax - last.x, dy = ay - last.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.004) {
          const inv = 1 / dist;
          samples.push({ x: ax, y: ay, dx: dx * inv, dy: dy * inv, amp: Math.min(1, dist * 26), t: now() });
          if (samples.length > N) samples.shift();
          last = { x: ax, y: ay };
        }
      } else {
        last = { x: ax, y: ay };
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // resize: coalesce bursts to one backbuffer realloc per frame
    let resizeQueued = false;
    const onResize = () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => { resizeQueued = false; resize(); });
    };
    window.addEventListener("resize", onResize);

    let hidden = false;
    const onVis = () => { hidden = document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    // context loss / restore
    const onLost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; };
    const onRestored = () => {
      if (init()) raf = requestAnimationFrame(tick);
      else bail();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    const trailBuf = new Float32Array(N * 4);
    const dirBuf = new Float32Array(N * 2);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (hidden || gl.isContextLost()) return;
      const t = now();
      for (let i = 0; i < N; i++) {
        const s = samples[samples.length - N + i];
        if (s) {
          const age = t - s.t;
          trailBuf[i * 4] = s.x; trailBuf[i * 4 + 1] = s.y;
          trailBuf[i * 4 + 2] = age; trailBuf[i * 4 + 3] = age < LIFETIME ? s.amp : 0;
          dirBuf[i * 2] = s.dx; dirBuf[i * 2 + 1] = s.dy;
        } else {
          trailBuf[i * 4 + 3] = 0;
        }
      }
      gl.uniform1f(uTime, t);
      gl.uniform1f(uScroll, typeof window.__scroll === "number" ? window.__scroll : 0);
      gl.uniform4fv(uTrail, trailBuf);
      gl.uniform2fv(uDir, dirBuf);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      {/* CSS fallback beneath the canvas — shown whenever the canvas bails */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 90% at 72% 8%, color-mix(in oklab, var(--color-blue) 24%, var(--color-void)) 0%, transparent 55%)," +
            "linear-gradient(180deg, #06152c 0%, #051020 46%, #030b18 100%)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
