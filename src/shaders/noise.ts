export const SIMPLEX_NOISE = `vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
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
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}`

export const FBM = `
float fBm(vec2 p, float seed, int octaves, float lacunarity, float gain) {
    float total = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    float maxAmplitude = 0.0;
    for (int i = 0; i < 8; i++) {
        if (i >= octaves) break;
        total += snoise(p * frequency + seed) * amplitude;
        maxAmplitude += amplitude;
        amplitude *= gain;
        frequency *= lacunarity;
    }
    return total / maxAmplitude;
}`

export const SEAMLESS = `
vec2 seamlessUV(vec2 uv, float scale) {
    vec2 p = uv * scale;
    return vec2(fract(p.x), fract(p.y));
}`

export const NOISE_FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform float u_seed;
uniform float u_scale;
uniform float u_density;
uniform float u_octaves;
uniform float u_lacunarity;
uniform float u_gain;
uniform float u_tileMode;
out vec4 fragColor;

${SIMPLEX_NOISE}
${FBM}

void main() {
    vec2 uv = v_uv;
    if (u_tileMode > 0.5) {
        uv = uv * 2.0;
    }
    vec2 p = uv * u_scale;
    float noise = fBm(p, u_seed, int(u_octaves), u_lacunarity, u_gain);
    float alpha = smoothstep(u_density - 0.1, u_density + 0.1, noise * 0.5 + 0.5);
    fragColor = vec4(vec3(1.0), alpha);
}`

export const GRUNGE_FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform float u_seed;
uniform float u_scale;
uniform float u_density;
uniform float u_roughness;
uniform vec2 u_resolution;
uniform float u_tileMode;
out vec4 fragColor;

${SIMPLEX_NOISE}

float valueNoise(vec2 p) {
    return snoise(p) * 0.5 + 0.5;
}

void main() {
    vec2 uv = v_uv;
    if (u_tileMode > 0.5) {
        uv = uv * 2.0;
    }
    vec2 pos = uv * u_scale;
    vec2 warpedPos = pos + vec2(
        snoise(pos * 2.0 + u_seed),
        snoise(pos * 2.0 + u_seed + 100.0)
    ) * u_roughness;
    float noise = valueNoise(warpedPos + u_seed);
    float alpha = smoothstep(u_density - 0.1, u_density + 0.1, noise);
    fragColor = vec4(vec3(1.0), alpha);
}`

export const BRISTLES_FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform float u_seed;
uniform float u_count;
uniform float u_length;
uniform float u_angle;
uniform float u_angleVariance;
uniform float u_thickness;
uniform float u_tileMode;
out vec4 fragColor;

float hash(float x, float y) {
    float n = mod(x * 127.1 + y * 311.7, 1000.0);
    return fract(sin(n) * 43758.5453123);
}

float bristleDist(vec2 uv, vec2 start, vec2 dir, float len) {
    vec2 end = start + dir * len;
    vec2 seg = end - start;
    vec2 rel = uv - start;
    float t = clamp(dot(rel, seg) / dot(seg, seg), 0.0, 1.0);
    vec2 closest = start + seg * t;
    return distance(uv, closest);
}

void main() {
    vec2 uv = v_uv;
    float total = 0.0;
    int n = int(u_count);
    float w = u_thickness / 512.0;
    float len = u_length / 512.0;
    for (int i = 0; i < 500; i++) {
        if (i >= n) break;
        float fi = float(i);
        vec2 rp = vec2(
            hash(fi, u_seed),
            hash(fi + 100.0, u_seed)
        );
        float a = radians(u_angle) + (hash(fi + 200.0, u_seed) - 0.5) * radians(u_angleVariance) * 2.0;
        vec2 dir = vec2(cos(a), sin(a));

        if (u_tileMode > 0.5) {
            for (int dx = 0; dx <= 1; dx++) {
                for (int dy = 0; dy <= 1; dy++) {
                    vec2 offset = vec2(float(dx), float(dy));
                    vec2 start = rp + offset;
                    float d = bristleDist(uv * 2.0, start, dir, len);
                    total += smoothstep(w, 0.0, d);
                }
            }
        } else {
            float d = bristleDist(uv, rp, dir, len);
            total += smoothstep(w, 0.0, d);
        }
    }
    float alpha = clamp(total, 0.0, 1.0);
    fragColor = vec4(vec3(1.0), alpha);
}`

export const SCALES_FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform float u_seed;
uniform float u_scale;
uniform float u_density;
uniform float u_edge;
uniform float u_tileMode;
out vec4 fragColor;

${SIMPLEX_NOISE}

vec2 random2(vec2 p, float seed) {
    float sx = mod(p.x + seed, 1000.0);
    float sy = mod(p.y + seed, 1000.0);
    return fract(sin(vec2(
        sx * 127.1 + sy * 311.7,
        sx * 269.5 + sy * 183.3
    )) * 43758.5453123);
}

void main() {
    vec2 uv = v_uv;
    if (u_tileMode > 0.5) {
        uv = uv * 2.0;
    }
    vec2 pos = uv * u_scale;
    vec2 i = floor(pos);
    vec2 f = fract(pos);
    float minDist = 1.0;
    float minDist2 = 1.0;
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = random2(i + neighbor, u_seed);
            vec2 diff = neighbor + point - f;
            float d = length(diff);
            if (d < minDist) {
                minDist2 = minDist;
                minDist = d;
            } else if (d < minDist2) {
                minDist2 = d;
            }
        }
    }
    float cell = smoothstep(u_density - 0.05, u_density + 0.05, minDist);
    float edge = smoothstep(0.0, u_edge * 0.1, abs(minDist - minDist2));
    float alpha = min(1.0, cell + (1.0 - edge));
    fragColor = vec4(vec3(1.0), 1.0 - alpha);
}`

export const CRACKS_FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform float u_seed;
uniform float u_scale;
uniform float u_density;
uniform float u_width;
uniform float u_branching;
uniform float u_tileMode;
out vec4 fragColor;

${SIMPLEX_NOISE}

void main() {
    vec2 uv = v_uv;
    if (u_tileMode > 0.5) {
        uv = uv * 2.0;
    }
    vec2 pos = uv * u_scale;
    vec2 gridPos = floor(pos);
    vec2 localPos = fract(pos) - 0.5;
    float noise = snoise(gridPos + u_seed);
    float angle = noise * 3.14159 * u_branching;
    float c = cos(angle);
    float s = sin(angle);
    vec2 rotated = vec2(
        localPos.x * c - localPos.y * s,
        localPos.x * s + localPos.y * c
    );
    float dist = abs(rotated.x);

    // Sample periodic neighbors for seamless tiling across tile boundaries
    if (u_tileMode > 0.5) {
        vec2 neighOffsets[4] = vec2[](
            vec2(0.0, 0.0), vec2(1.0, 0.0),
            vec2(0.0, 1.0), vec2(1.0, 1.0)
        );
        for (int j = 0; j < 4; j++) {
            vec2 np = (uv + neighOffsets[j]) * u_scale;
            vec2 ng = floor(np);
            float no = snoise(ng + u_seed);
            float na = no * 3.14159 * u_branching;
            float nc = cos(na);
            float ns = sin(na);
            vec2 nrot = vec2(
                (fract(np.x) - 0.5) * nc - (fract(np.y) - 0.5) * ns,
                (fract(np.x) - 0.5) * ns + (fract(np.y) - 0.5) * nc
            );
            dist = min(dist, abs(nrot.x));
        }
    }

    float crack = 1.0 - smoothstep(0.0, u_width / 512.0, dist);
    float alpha = clamp(crack, 0.0, 1.0);
    fragColor = vec4(vec3(1.0), alpha);
}`

export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`
