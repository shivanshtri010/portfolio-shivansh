/* ============================================================
   Hero background — custom WebGL silk field
   Depends on three.js (global THREE). Exposes window.initHeroShader.
   ============================================================ */

(function () {
  "use strict";

  var VERTEX = [
    "varying vec2 vUv;",
    "void main() {",
    "  vUv = uv;",
    "  gl_Position = vec4(position.xy, 0.0, 1.0);",
    "}"
  ].join("\n");

  var FRAGMENT = [
    "precision highp float;",
    "uniform vec2 uResolution;",
    "uniform float uTime;",
    "uniform vec2 uMouse;",
    "varying vec2 vUv;",
    "",
    "float hash(vec2 p) {",
    "  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);",
    "}",
    "",
    "float noise(vec2 p) {",
    "  vec2 i = floor(p);",
    "  vec2 f = fract(p);",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(",
    "    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),",
    "    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),",
    "    u.y",
    "  );",
    "}",
    "",
    "float fbm(vec2 p) {",
    "  float value = 0.0;",
    "  float amplitude = 0.5;",
    "  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);",
    "  for (int i = 0; i < 5; i++) {",
    "    value += amplitude * noise(p);",
    "    p = rot * p * 2.02;",
    "    amplitude *= 0.5;",
    "  }",
    "  return value;",
    "}",
    "",
    "void main() {",
    "  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);",
    "  p *= 1.35;",
    "",
    "  float t = uTime * 0.032;",
    "  vec2 mouse = (uMouse - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);",
    "",
    "  vec2 q = vec2(",
    "    fbm(p * 1.18 + vec2(0.0, t * 1.35)),",
    "    fbm(p * 1.18 + vec2(5.2, -t * 1.05))",
    "  );",
    "  vec2 r = vec2(",
    "    fbm(p * 1.22 + 2.7 * q + vec2(1.7, 9.2) + t),",
    "    fbm(p * 1.22 + 2.7 * q + vec2(8.3, 2.8) - t * 0.8)",
    "  );",
    "  float f = fbm(p * 1.02 + 3.2 * r);",
    "",
    "  vec3 base = vec3(0.017, 0.021, 0.033);",
    "  vec3 violet = vec3(0.30, 0.19, 0.66);",
    "  vec3 teal = vec3(0.05, 0.32, 0.29);",
    "  vec3 lime = vec3(0.65, 0.86, 0.18);",
    "",
    "  vec3 col = base;",
    "  col = mix(col, violet, smoothstep(0.30, 0.88, f) * 0.52);",
    "  col = mix(col, teal, smoothstep(0.42, 0.94, r.y) * 0.34);",
    "  col += violet * pow(smoothstep(0.38, 0.92, r.x), 4.0) * 0.20;",
    "  col += lime * pow(smoothstep(0.52, 0.96, f), 5.0) * 0.14;",
    "",
    "  float mouseGlow = exp(-length(p - mouse) * 2.35);",
    "  col += vec3(0.28, 0.19, 0.62) * mouseGlow * 0.20;",
    "",
    "  float ridge = smoothstep(0.44, 0.48, f) * (1.0 - smoothstep(0.48, 0.54, f));",
    "  col += vec3(0.30, 0.36, 0.18) * ridge * 0.10;",
    "",
    "  float vignette = smoothstep(1.42, 0.22, length(p));",
    "  col *= 0.48 + 0.52 * vignette;",
    "",
    "  float grain = hash(gl_FragCoord.xy + fract(uTime) * 90.0);",
    "  col += (grain - 0.5) * 0.015;",
    "",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  window.initHeroShader = function (canvas) {
    if (!window.THREE || !canvas) return false;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false,
        alpha: false,
        powerPreference: "high-performance"
      });
    } catch (err) {
      return false;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
    renderer.setClearColor(0x06070b, 1);

    var scene = new THREE.Scene();
    var camera = new THREE.Camera();
    var resolution = new THREE.Vector2(1, 1);

    var uniforms = {
      uResolution: { value: resolution },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.72, 0.62) }
    };

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      depthTest: false,
      depthWrite: false
    });

    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    var mouseTarget = new THREE.Vector2(0.72, 0.62);
    var mouseCurrent = mouseTarget.clone();
    var heroVisible = true;
    var running = false;
    var raf = null;
    var last = performance.now();
    var startTime = performance.now();

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round(rect.width));
      var h = Math.max(1, Math.round(rect.height));
      renderer.setSize(w, h, false);
      var size = new THREE.Vector2();
      renderer.getDrawingBufferSize(size);
      resolution.set(size.x, size.y);
      renderer.render(scene, camera);
    }

    function loop(now) {
      if (!running) return;
      var delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      var elapsed = (now - startTime) / 1000;
      uniforms.uTime.value = elapsed;
      mouseCurrent.lerp(mouseTarget, Math.min(1, delta * 4.2));
      uniforms.uMouse.value.copy(mouseCurrent);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    window.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouseTarget.set(
        Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
        Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / rect.height))
      );
    }, { passive: true });

    if ("ResizeObserver" in window) {
      var ro = new ResizeObserver(function () {
        resize();
      });
      ro.observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else if (heroVisible) {
        start();
      }
    });

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible && !document.hidden) start();
        else stop();
      }, { threshold: 0 });
      io.observe(canvas);
    }

    resize();
    uniforms.uTime.value = reduceMotion ? 12 : 0;
    renderer.render(scene, camera);

    // Fonts settle after load; keep the canvas crisp.
    window.addEventListener("load", resize);
    setTimeout(resize, 400);

    if (!reduceMotion) start();
    return true;
  };
})();
