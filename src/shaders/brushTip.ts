export const BRUSH_TIP_FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;

uniform vec2 u_resolution;
uniform int u_shape;
uniform float u_hardness;
uniform float u_roundness;
uniform float u_angle;

uniform int u_noiseType;
uniform float u_noiseAmount;
uniform float u_noiseScale;
uniform float u_noiseSeed;
uniform float u_threshold;
uniform float u_smoothing;

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

vec2 rotate2D(vec2 p, float angle) {
    float c = cos(angle), s = sin(angle);
    return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = snoise(i);
    float b = snoise(i + vec2(1.0, 0.0));
    float c = snoise(i + vec2(0.0, 1.0));
    float d = snoise(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float proceduralShape(vec2 uv) {
    float base = -sdCircle(uv, 0.45);
    float n;
    if (u_noiseType == 0) {
        n = snoise(uv * u_noiseScale + u_noiseSeed);
    } else if (u_noiseType == 1) {
        n = valueNoise(uv * u_noiseScale + u_noiseSeed);
    } else {
        n = snoise(uv * u_noiseScale * 2.0 + u_noiseSeed);
    }
    float distorted = base + n * u_noiseAmount;
    return smoothstep(
        u_threshold - u_smoothing * 0.1,
        u_threshold + u_smoothing * 0.1,
        distorted
    );
}

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution) - 0.5;
    uv.x *= u_resolution.x / u_resolution.y;
    uv.y /= u_roundness;
    uv = rotate2D(uv, u_angle);

    float dist;
    if (u_shape == 0) {
        dist = -sdCircle(uv, 0.45);
    } else if (u_shape == 1) {
        dist = -sdBox(uv, vec2(0.45));
    } else if (u_shape == 2) {
        dist = -sdCircle(uv, 0.45);
    } else if (u_shape == 3) {
        dist = -sdBox(uv, vec2(0.45));
    } else {
        float shape = proceduralShape(uv);
        dist = shape - 0.5;
    }

    float edgeWidth = mix(0.35, 0.02, u_hardness);
    float alpha = smoothstep(-edgeWidth, edgeWidth, dist);
    alpha = pow(alpha, 0.8);

    outColor = vec4(1.0, 1.0, 1.0, alpha);
}`
