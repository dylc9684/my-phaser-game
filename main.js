import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const LAPS_PER_RACE = 10;
const FIELD_SIZE = 22;
const TRACK_WORLD_SCALE = 3.35;
const PLAYER_TOP_SPEED = 96;
const AI_TOP_SPEED = PLAYER_TOP_SPEED;
const PLAYER_OFFROAD_MARGIN = 9;
const DAMAGE_DNF_THRESHOLD = 100;
const AI_LAUNCH_GRACE_SECONDS = 7;
const GEAR_SPEEDS_KPH = [0, 72, 118, 164, 210, 252, 292, 328, 370];

const TEAMS = [
    { id: 'mclaren', name: 'McLaren', color: '#ff8000', accent: '#111111' },
    { id: 'ferrari', name: 'Ferrari', color: '#dc0000', accent: '#fff200' },
    { id: 'redbull', name: 'Red Bull Racing', color: '#0600ef', accent: '#fcd700' },
    { id: 'mercedes', name: 'Mercedes', color: '#00d2be', accent: '#c8ccd0' },
    { id: 'williams', name: 'Williams', color: '#005aff', accent: '#00a3e0' },
    { id: 'racingbulls', name: 'Racing Bulls', color: '#f4f7ff', accent: '#244cff' },
    { id: 'astonmartin', name: 'Aston Martin', color: '#006f62', accent: '#cedc00' },
    { id: 'haas', name: 'Haas F1 Team', color: '#f5f7fa', accent: '#e6002d' },
    { id: 'kicksauber', name: 'Kick Sauber', color: '#52e252', accent: '#050505' },
    { id: 'alpine', name: 'Alpine', color: '#0090ff', accent: '#ff87bc' },
    { id: 'cadillac', name: 'Cadillac', color: '#d4af37', accent: '#101820' }
];

const FRIEND_DRIVERS = [
    { name: 'Brilliance', color: '#00ffff', team: 'mclaren' },
    { name: 'Joey', color: '#ff8c00', team: 'mclaren' },
    { name: 'Amani', color: '#9d00ff', team: 'ferrari' },
    { name: 'Aaron', color: '#55ff55', team: 'ferrari' },
    { name: 'Larry', color: '#ff5555', team: 'redbull' },
    { name: 'Jace', color: '#ffffff', team: 'redbull' },
    { name: 'Wilson', color: '#ecf0f1', team: 'mercedes' },
    { name: 'Kevin', color: '#2ecc71', team: 'mercedes' },
    { name: 'Mudit', color: '#e67e22', team: 'williams' },
    { name: 'Samuel', color: '#8d6e63', team: 'williams' },
    { name: 'Draycen', color: '#e74c3c', team: 'racingbulls' },
    { name: 'Rain', color: '#3498db', team: 'racingbulls' },
    { name: 'Alvin', color: '#f39c12', team: 'astonmartin' },
    { name: 'Max', color: '#ff69b4', team: 'astonmartin' },
    { name: 'Jayden', color: '#ffa500', team: 'haas' },
    { name: 'Leo', color: '#34495e', team: 'haas' },
    { name: 'Arnav', color: '#dc143c', team: 'kicksauber' },
    { name: 'Sharma', color: '#8b4513', team: 'kicksauber' },
    { name: 'Rey', color: '#22aa44', team: 'alpine' },
    { name: 'Ani', color: '#ff00ff', team: 'alpine' },
    { name: 'Moses', color: '#c0a060', team: 'cadillac' },
    { name: 'Chris', color: '#c8a87a', team: 'cadillac' }
];

const TRACKS = [
    {
        id: 'monaco',
        name: 'Monaco',
        width: 14,
        wallColor: 0xd8d8d8,
        accent: 0xd11f2f,
        barrier: { type: 'street', offset: 3.2, height: 3.2, spacing: 13, color: 0xcfd2d6 },
        drsZones: [{ start: 0.04, end: 0.18 }],
        kerbs: [
            { start: 0.36, end: 0.40, side: 'right' },
            { start: 0.51, end: 0.57, side: 'both' },
            { start: 0.68, end: 0.77, side: 'both' },
            { start: 0.86, end: 0.93, side: 'left' }
        ],
        points: [
            [-112, 44], [-98, -10], [-56, -68], [-4, -92], [42, -82],
            [76, -42], [60, -10], [26, -2], [-12, 4], [-36, 26],
            [-16, 48], [42, 46], [104, 28], [134, 50], [94, 84],
            [38, 92], [-2, 118], [-50, 98], [-86, 72]
        ]
    },
    {
        id: 'monza',
        name: 'Monza',
        width: 18,
        wallColor: 0xededed,
        accent: 0x18a558,
        barrier: { type: 'guardrail', offset: 10, height: 1.35, spacing: 20, color: 0xdedede },
        drsZones: [{ start: 0.08, end: 0.31 }, { start: 0.64, end: 0.83 }],
        kerbs: [
            { start: 0.11, end: 0.18, side: 'both' },
            { start: 0.35, end: 0.43, side: 'both' },
            { start: 0.47, end: 0.55, side: 'right' },
            { start: 0.62, end: 0.73, side: 'both' },
            { start: 0.84, end: 0.95, side: 'left' }
        ],
        points: [
            [-152, 28], [-92, -54], [72, -78], [144, -42], [118, -12],
            [154, 22], [122, 70], [58, 92], [22, 54], [-22, 86],
            [-94, 68], [-142, 42]
        ]
    },
    {
        id: 'suzuka',
        name: 'Suzuka',
        width: 16,
        wallColor: 0xffffff,
        accent: 0xe53e3e,
        barrier: { type: 'guardrail', offset: 9, height: 1.5, spacing: 18, color: 0xf2f2f2 },
        drsZones: [{ start: 0.76, end: 0.96 }],
        kerbs: [
            { start: 0.04, end: 0.22, side: 'both' },
            { start: 0.26, end: 0.35, side: 'right' },
            { start: 0.48, end: 0.62, side: 'both' },
            { start: 0.78, end: 0.88, side: 'left' },
            { start: 0.91, end: 0.98, side: 'both' }
        ],
        points: [
            [-132, 22], [-96, -42], [-42, -54], [-10, -18], [26, -58],
            [78, -40], [122, 0], [76, 32], [116, 74], [44, 104],
            [-22, 70], [-72, 102], [-124, 62], [-88, 14], [-28, 28],
            [28, 12]
        ]
    },
    {
        id: 'miami',
        name: 'Miami',
        width: 17,
        wallColor: 0x7dd3fc,
        accent: 0xff5fb7,
        barrier: { type: 'street', offset: 4.8, height: 2.6, spacing: 15, color: 0x8fd5ef },
        drsZones: [{ start: 0.16, end: 0.34 }, { start: 0.56, end: 0.73 }],
        kerbs: [
            { start: 0.10, end: 0.18, side: 'right' },
            { start: 0.28, end: 0.39, side: 'both' },
            { start: 0.49, end: 0.58, side: 'left' },
            { start: 0.70, end: 0.82, side: 'both' },
            { start: 0.90, end: 0.98, side: 'right' }
        ],
        points: [
            [-142, -42], [-70, -92], [46, -88], [132, -40], [102, -2],
            [136, 34], [56, 60], [98, 102], [12, 114], [-62, 78],
            [-120, 92], [-150, 34]
        ]
    },
    {
        id: 'yasmarina',
        name: 'Yas Marina',
        width: 18,
        wallColor: 0xe8eef4,
        accent: 0x37d5ff,
        barrier: { type: 'guardrail', offset: 8, height: 1.6, spacing: 18, color: 0xe7ebef },
        drsZones: [{ start: 0.08, end: 0.30 }, { start: 0.46, end: 0.66 }],
        kerbs: [
            { start: 0.02, end: 0.09, side: 'both' },
            { start: 0.20, end: 0.30, side: 'right' },
            { start: 0.38, end: 0.48, side: 'both' },
            { start: 0.61, end: 0.72, side: 'left' },
            { start: 0.82, end: 0.96, side: 'both' }
        ],
        points: [
            [-150, 26], [-98, -72], [18, -92], [136, -72], [176, -20],
            [122, 18], [172, 54], [82, 92], [-8, 76], [-62, 118],
            [-126, 86], [-96, 42], [-136, 36]
        ]
    },
    {
        id: 'lasvegas',
        name: 'Las Vegas',
        width: 19,
        wallColor: 0x9ca3af,
        accent: 0xffd166,
        barrier: { type: 'street', offset: 5.4, height: 2.8, spacing: 16, color: 0x8f98a3 },
        drsZones: [{ start: 0.04, end: 0.27 }, { start: 0.52, end: 0.75 }],
        kerbs: [
            { start: 0.15, end: 0.23, side: 'both' },
            { start: 0.36, end: 0.46, side: 'right' },
            { start: 0.58, end: 0.66, side: 'both' },
            { start: 0.78, end: 0.88, side: 'left' },
            { start: 0.92, end: 0.98, side: 'both' }
        ],
        points: [
            [-178, -42], [-76, -92], [70, -88], [188, -34], [182, 22],
            [42, 40], [178, 78], [86, 116], [-72, 92], [-182, 44],
            [-154, 0]
        ]
    }
];

const CAMERA_MODES = {
    tvpod: 'TV Pod Offset',
    halo: 'Halo',
    firstperson: 'First Person',
    chase: 'Chase',
    broadcast: 'Broadcast',
    overhead: 'Overhead'
};

const keyState = new Set();
window.addEventListener('keydown', (event) => keyState.add(event.code));
window.addEventListener('keyup', (event) => keyState.delete(event.code));

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function wrapDistance(distance, length) {
    return ((distance % length) + length) % length;
}

function normalizeAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function getTeam(teamId) {
    return TEAMS.find((team) => team.id === teamId) || TEAMS[0];
}

function getGear(speed, throttleInput = 0) {
    const kph = speed * 3.6;

    if (kph < 4 && throttleInput === 0) {
        return 'N';
    }

    for (let index = 1; index < GEAR_SPEEDS_KPH.length; index++) {
        if (kph < GEAR_SPEEDS_KPH[index]) {
            return index;
        }
    }

    return 8;
}

function getRpmRatio(speed, gear) {
    if (gear === 'N') {
        return 0.18;
    }

    const kph = speed * 3.6;
    const gearIndex = clamp(gear, 1, 8);
    const min = GEAR_SPEEDS_KPH[gearIndex - 1];
    const max = GEAR_SPEEDS_KPH[gearIndex];

    return clamp(0.28 + ((kph - min) / Math.max(1, max - min)) * 0.72, 0.12, 1);
}

function shuffle(items) {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }

    return copy;
}

class TrackModel {
    constructor(config) {
        this.config = config;
        this.name = config.name;
        this.width = config.width;
        this.points = config.points.map(([x, z]) => new THREE.Vector3(x * TRACK_WORLD_SCALE, 0, z * TRACK_WORLD_SCALE));
        this.curve = new THREE.CatmullRomCurve3(this.points, true, 'catmullrom', 0.45);
        this.samples = [];
        this.length = 0;
        this.bounds = this.calculateBounds();
        this.buildSamples();
    }

    calculateBounds() {
        const min = new THREE.Vector3(Infinity, 0, Infinity);
        const max = new THREE.Vector3(-Infinity, 0, -Infinity);

        this.points.forEach((point) => {
            min.x = Math.min(min.x, point.x);
            min.z = Math.min(min.z, point.z);
            max.x = Math.max(max.x, point.x);
            max.z = Math.max(max.z, point.z);
        });

        return {
            min,
            max,
            center: new THREE.Vector3((min.x + max.x) / 2, 0, (min.z + max.z) / 2),
            width: max.x - min.x,
            depth: max.z - min.z
        };
    }

    buildSamples() {
        const steps = 1500;
        let previous = this.curve.getPointAt(0);
        this.samples.push({
            distance: 0,
            point: previous.clone(),
            tangent: this.curve.getTangentAt(0).normalize()
        });

        for (let index = 1; index <= steps; index++) {
            const t = index / steps;
            const point = this.curve.getPointAt(t);
            this.length += point.distanceTo(previous);
            this.samples.push({
                distance: this.length,
                point: point.clone(),
                tangent: this.curve.getTangentAt(t).normalize()
            });
            previous = point;
        }
    }

    sample(distance) {
        const d = wrapDistance(distance, this.length);
        let low = 0;
        let high = this.samples.length - 1;

        while (low < high) {
            const middle = Math.floor((low + high) / 2);
            if (this.samples[middle].distance < d) {
                low = middle + 1;
            } else {
                high = middle;
            }
        }

        const next = this.samples[low];
        const prev = this.samples[Math.max(0, low - 1)];
        const span = Math.max(0.001, next.distance - prev.distance);
        const t = clamp((d - prev.distance) / span, 0, 1);
        const point = prev.point.clone().lerp(next.point, t);
        const tangent = prev.tangent.clone().lerp(next.tangent, t).normalize();
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        return {
            point,
            tangent,
            normal,
            yaw: Math.atan2(tangent.x, tangent.z)
        };
    }

    curvature(distance) {
        const a = this.sample(distance).tangent;
        const b = this.sample(distance + 95).tangent;
        return a.angleTo(b);
    }

    signedCurvature(distance) {
        const a = this.sample(distance).tangent;
        const b = this.sample(distance + 95).tangent;
        const turn = a.x * b.z - a.z * b.x;
        return a.angleTo(b) * Math.sign(turn || 1);
    }

    isDrsZone(distance) {
        const ratio = wrapDistance(distance, this.length) / this.length;
        return this.config.drsZones.some((zone) => ratio >= zone.start && ratio <= zone.end);
    }

    createSceneObjects(scene) {
        const roadGeometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const steps = this.samples.length - 1;

        for (let index = 0; index <= steps; index++) {
            const sample = this.sample((index / steps) * this.length);
            const half = this.width / 2;
            const left = sample.point.clone().add(sample.normal.clone().multiplyScalar(-half));
            const right = sample.point.clone().add(sample.normal.clone().multiplyScalar(half));
            vertices.push(left.x, 0.04, left.z, right.x, 0.04, right.z);
        }

        for (let index = 0; index < steps; index++) {
            const a = index * 2;
            indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }

        roadGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        roadGeometry.setIndex(indices);
        roadGeometry.computeVertexNormals();
        const road = new THREE.Mesh(roadGeometry, new THREE.MeshStandardMaterial({
            color: 0x30343b,
            roughness: 0.88,
            metalness: 0.05
        }));
        road.receiveShadow = true;
        scene.add(road);

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf7f7f7 });
        [-1, 1].forEach((side) => {
            const points = [];
            for (let index = 0; index < steps; index += 2) {
                const sample = this.sample((index / steps) * this.length);
                const edge = sample.point.clone().add(sample.normal.clone().multiplyScalar(side * this.width / 2));
                points.push(new THREE.Vector3(edge.x, 0.11, edge.z));
            }
            scene.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), lineMaterial));
        });

        const racingLinePoints = [];
        for (let index = 0; index < steps; index += 5) {
            const sample = this.sample((index / steps) * this.length);
            racingLinePoints.push(new THREE.Vector3(sample.point.x, 0.14, sample.point.z));
        }
        scene.add(new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(racingLinePoints),
            new THREE.LineBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.35 })
        ));

        this.addKerbs(scene);
        this.addBarriers(scene);
        this.addScenery(scene);
    }

    addKerbs(scene) {
        const kerbZones = this.config.kerbs || [];
        const red = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.72 });
        const white = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.68 });

        kerbZones.forEach((zone) => {
            const sides = zone.side === 'both' ? [-1, 1] : [zone.side === 'left' ? -1 : 1];
            const start = zone.start * this.length;
            const end = zone.end * this.length;
            const span = Math.max(1, end - start);
            const count = Math.max(4, Math.floor(span / 7));

            sides.forEach((side) => {
                for (let index = 0; index <= count; index++) {
                    const distance = start + (index / count) * span;
                    const sample = this.sample(distance);
                    const kerb = new THREE.Mesh(
                        new THREE.BoxGeometry(2.25, 0.14, 5.8),
                        index % 2 === 0 ? red : white
                    );
                    const position = sample.point.clone().add(sample.normal.clone().multiplyScalar(side * (this.width / 2 + 0.95)));
                    kerb.position.set(position.x, 0.13, position.z);
                    kerb.rotation.y = sample.yaw;
                    scene.add(kerb);
                }
            });
        });
    }

    addBarriers(scene) {
        const barrier = this.config.barrier || {};
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: barrier.color ?? this.config.wallColor,
            roughness: 0.62,
            metalness: barrier.type === 'guardrail' ? 0.28 : 0.04
        });
        const shadowMaterial = new THREE.MeshStandardMaterial({
            color: 0x24272d,
            roughness: 0.78
        });
        const spacing = barrier.spacing || 18;
        const count = Math.floor(this.length / spacing);
        const wallHeight = barrier.height || 2.2;
        const wallDepth = barrier.type === 'guardrail' ? 0.75 : 1.35;
        const offset = barrier.offset || 5;

        [-1, 1].forEach((side) => {
            for (let index = 0; index < count; index++) {
                const sample = this.sample((index / count) * this.length);
                const wall = new THREE.Mesh(
                    new THREE.BoxGeometry(wallDepth, wallHeight, spacing * 0.72),
                    wallMaterial
                );
                const position = sample.point.clone().add(sample.normal.clone().multiplyScalar(side * (this.width / 2 + offset)));
                wall.position.set(position.x, wallHeight / 2, position.z);
                wall.rotation.y = sample.yaw;
                scene.add(wall);

                if (barrier.type === 'street' && index % 3 === 0) {
                    const catchFence = new THREE.Mesh(
                        new THREE.BoxGeometry(0.35, 3.1, spacing * 0.58),
                        shadowMaterial
                    );
                    catchFence.position.set(position.x, wallHeight + 1.35, position.z);
                    catchFence.rotation.y = sample.yaw;
                    scene.add(catchFence);
                }
            }
        });
    }

    addScenery(scene) {
        const groundSize = Math.max(this.bounds.width, this.bounds.depth) + 260;
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(groundSize, groundSize),
            new THREE.MeshStandardMaterial({ color: 0x205c35, roughness: 1 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(this.bounds.center.x, -0.02, this.bounds.center.z);
        ground.receiveShadow = true;
        scene.add(ground);

        const radius = groundSize / 2 - 24;
        for (let index = 0; index < 36; index++) {
            const angle = (index / 36) * Math.PI * 2;
            const prop = new THREE.Mesh(
                new THREE.BoxGeometry(4, 8 + (index % 5) * 3, 4),
                new THREE.MeshStandardMaterial({ color: this.config.accent })
            );
            prop.position.set(
                this.bounds.center.x + Math.cos(angle) * (radius + (index % 3) * 18),
                prop.geometry.parameters.height / 2,
                this.bounds.center.z + Math.sin(angle) * (radius + (index % 3) * 18)
            );
            scene.add(prop);
        }
    }
}

function makeCarMesh(driver) {
    const group = new THREE.Group();
    const team = getTeam(driver.team);
    const baseColor = new THREE.Color(team.color);
    const accentColor = new THREE.Color(team.accent);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.34, metalness: 0.38 });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.28, metalness: 0.48 });
    const carbonMaterial = new THREE.MeshStandardMaterial({ color: 0x090a0c, roughness: 0.52, metalness: 0.35 });
    const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.82 });
    const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xb9c0c7, roughness: 0.28, metalness: 0.8 });
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.25, metalness: 0.35 });
    const visorMaterial = new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: 0.18, metalness: 0.65 });
    const helmetMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(driver.color), roughness: 0.36, metalness: 0.18 });

    const addBox = (size, position, material) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
        mesh.position.set(...position);
        group.add(mesh);
        return mesh;
    };

    const addRod = (from, to, radius = 0.035) => {
        const start = new THREE.Vector3(...from);
        const end = new THREE.Vector3(...to);
        const middle = start.clone().lerp(end, 0.5);
        const direction = end.clone().sub(start);
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 8), carbonMaterial);
        rod.position.copy(middle);
        rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        group.add(rod);
    };

    addBox([1.5, 0.48, 3.55], [0, 0.48, -0.22], bodyMaterial);
    addBox([0.74, 0.22, 2.9], [0, 0.42, 2.25], bodyMaterial);
    addBox([2.42, 0.44, 1.32], [0, 0.38, -0.58], accentMaterial);
    addBox([0.78, 0.72, 1.35], [0, 0.84, -1.02], bodyMaterial);
    addBox([1.04, 0.12, 4.8], [0, 0.18, 0.04], carbonMaterial);
    addBox([0.24, 0.54, 2.1], [0, 0.82, -1.68], carbonMaterial);
    addBox([0.08, 0.08, 3.5], [-0.52, 0.78, 0.48], accentMaterial);
    addBox([0.08, 0.08, 3.5], [0.52, 0.78, 0.48], accentMaterial);

    const noseTip = new THREE.Mesh(new THREE.ConeGeometry(0.36, 1.45, 5), bodyMaterial);
    noseTip.rotation.x = Math.PI / 2;
    noseTip.position.set(0, 0.42, 3.9);
    group.add(noseTip);

    const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 12), visorMaterial);
    cockpit.scale.set(1.0, 0.62, 1.15);
    cockpit.position.set(0, 1.06, -0.44);
    group.add(cockpit);

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 10), helmetMaterial);
    helmet.scale.set(1, 0.85, 1);
    helmet.position.set(0, 1.16, -0.2);
    group.add(helmet);

    addRod([-0.52, 0.98, 0.02], [-0.86, 1.18, -0.58], 0.035);
    addRod([0.52, 0.98, 0.02], [0.86, 1.18, -0.58], 0.035);
    addRod([-0.86, 1.18, -0.58], [0.86, 1.18, -0.58], 0.035);

    addBox([3.82, 0.12, 0.52], [0, 0.22, 4.38], wingMaterial);
    addBox([3.48, 0.08, 0.4], [0, 0.42, 4.02], carbonMaterial);
    addBox([0.14, 0.42, 0.68], [-2.02, 0.34, 4.28], carbonMaterial);
    addBox([0.14, 0.42, 0.68], [2.02, 0.34, 4.28], carbonMaterial);
    addBox([3.3, 0.14, 0.5], [0, 1.12, -2.54], wingMaterial);
    addBox([2.86, 0.08, 0.42], [0, 0.9, -2.34], carbonMaterial);
    addBox([0.18, 0.82, 0.72], [-1.76, 0.92, -2.5], carbonMaterial);
    addBox([0.18, 0.82, 0.72], [1.76, 0.92, -2.5], carbonMaterial);
    addBox([2.55, 0.09, 0.22], [0, 1.23, -2.78], accentMaterial);

    const steering = new THREE.Group();
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 22), carbonMaterial);
    wheel.scale.set(1.15, 0.74, 1);
    steering.add(wheel);
    const wheelDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.15, 0.035), visorMaterial);
    wheelDisplay.position.set(0, -0.02, 0.02);
    steering.add(wheelDisplay);
    steering.position.set(0, 1.0, 0.68);
    group.add(steering);
    addRod([0, 0.78, 0.2], [0, 0.98, 0.58], 0.03);

    const wheelGeometry = new THREE.CylinderGeometry(0.52, 0.52, 0.44, 28);
    const rimGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.48, 18);
    const wheelPositions = [
        [-1.48, 0.34, 1.42], [1.48, 0.34, 1.42], [-1.48, 0.34, -1.48], [1.48, 0.34, -1.48]
    ];

    wheelPositions.forEach((position) => {
        const wheel = new THREE.Mesh(wheelGeometry, tireMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...position);
        group.add(wheel);

        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.z = Math.PI / 2;
        rim.position.set(...position);
        group.add(rim);
    });

    addRod([-0.52, 0.44, 1.32], [-1.48, 0.34, 1.42]);
    addRod([0.52, 0.44, 1.32], [1.48, 0.34, 1.42]);
    addRod([-0.48, 0.44, -1.28], [-1.48, 0.34, -1.48]);
    addRod([0.48, 0.44, -1.28], [1.48, 0.34, -1.48]);
    addRod([-0.24, 0.28, 1.68], [0.24, 0.28, 1.68], 0.025);

    group.userData.bodyMaterial = bodyMaterial;
    group.userData.accentMaterial = accentMaterial;
    group.userData.steeringWheel = steering;
    group.userData.team = team;
    group.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    return group;
}

class RaceCar {
    constructor(driver, index, controlledBy = null) {
        this.driver = driver;
        this.index = index;
        this.controlledBy = controlledBy;
        this.mesh = makeCarMesh(driver);
        this.progress = 0;
        this.lateral = 0;
        this.speed = 0;
        this.throttleInput = 0;
        this.brakeInput = 0;
        this.steerInput = 0;
        this.gear = 'N';
        this.rpmRatio = 0;
        this.lap = 0;
        this.finished = false;
        this.dnf = false;
        this.dnfReason = '';
        this.finishTime = null;
        this.lastLapStart = 0;
        this.bestLap = Infinity;
        this.penaltySeconds = 0;
        this.penaltyCooldown = 0;
        this.contactCooldown = 0;
        this.trackLimitCooldown = 0;
        this.damage = 0;
        this.damageCooldown = 0;
        this.slipstream = false;
        this.drsActive = false;
        this.drsAvailable = false;
        this.heading = 0;
        this.advanceSpeed = 0;
        this.offTrack = false;
        this.aiSeed = Math.random() * Math.PI * 2;
        this.aiLanePreference = 0;
        this.skill = 1.11 + Math.random() * 0.13;
        this.rank = index + 1;
    }
}

class FormulaFriendsGame {
    constructor() {
        this.container = document.getElementById('game');
        this.menu = document.getElementById('menu');
        this.hud = document.getElementById('hud');
        this.lights = document.getElementById('lights');
        this.standings = document.getElementById('standings');
        this.fastestLapEl = document.getElementById('fastest-lap');
        this.sessionInfo = document.getElementById('session-info');
        this.playerHud = document.getElementById('player-hud');
        this.telemetry = document.getElementById('telemetry');
        this.clock = new THREE.Clock();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setScissorTest(true);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.08;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        this.scene = null;
        this.track = null;
        this.cars = [];
        this.playerCars = [];
        this.cameras = [];
        this.playerCount = 1;
        this.cameraMode = 'tvpod';
        this.raceState = 'menu';
        this.raceTime = 0;
        this.fastestLap = { driver: null, time: Infinity };
        this.trackIndex = 0;
        this.playerNames = ['Brilliance', 'Jace'];
        this.aiThrottle = true;

        window.addEventListener('resize', () => this.resize());
        this.buildMenu();
        this.resize();
        this.animate();
    }

    buildMenu() {
        const driverOptions = FRIEND_DRIVERS
            .map((driver) => `<option value="${driver.name}">${driver.name} · ${getTeam(driver.team).name}</option>`)
            .join('');
        this.menu.innerHTML = `
            <div class="panel">
                <h1>Formula Friends 25</h1>
                <p>10-lap friend-grid grands prix with team liveries, slipstreams, DRS, collisions, penalties, fastest laps, and randomized lights-out starts.</p>
                <div class="menu-grid">
                    <label>Mode
                        <select id="mode-select">
                            <option value="1">Singleplayer</option>
                            <option value="2">2 Player Splitscreen</option>
                        </select>
                    </label>
                    <label>Track
                        <select id="track-select">
                            ${TRACKS.map((track, index) => `<option value="${index}">${track.name}</option>`).join('')}
                        </select>
                    </label>
                    <label>P1 Driver
                        <select id="p1-select">${driverOptions}</select>
                    </label>
                    <label>P2 Driver
                        <select id="p2-select">${driverOptions}</select>
                    </label>
                    <label>Camera
                        <select id="camera-select">
                            ${Object.entries(CAMERA_MODES).map(([key, label]) => `<option value="${key}" ${key === 'tvpod' ? 'selected' : ''}>${label}</option>`).join('')}
                        </select>
                    </label>
                </div>
                <div class="controls">
                    <span>P1: WASD, F for DRS</span>
                    <span>P2: Arrow keys, L for DRS</span>
                </div>
                <button id="start-race">Lights Out</button>
            </div>
        `;
        this.menu.querySelector('#p1-select').value = this.playerNames[0];
        this.menu.querySelector('#p2-select').value = this.playerNames[1];
        this.menu.querySelector('#start-race').addEventListener('click', () => this.startRaceFromMenu());
    }

    startRaceFromMenu() {
        this.playerCount = Number(this.menu.querySelector('#mode-select').value);
        document.body.classList.toggle('split-screen', this.playerCount === 2);
        this.trackIndex = Number(this.menu.querySelector('#track-select').value);
        this.cameraMode = this.menu.querySelector('#camera-select').value;
        this.playerNames = [
            this.menu.querySelector('#p1-select').value,
            this.menu.querySelector('#p2-select').value
        ];

        if (this.playerNames[0] === this.playerNames[1]) {
            const fallback = FRIEND_DRIVERS.find((driver) => driver.name !== this.playerNames[0]);
            this.playerNames[1] = fallback.name;
        }

        this.startRace();
    }

    startRace() {
        this.menu.classList.add('hidden');
        this.hud.classList.remove('hidden');
        this.raceState = 'lights';
        this.raceTime = 0;
        this.fastestLap = { driver: null, time: Infinity };
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x86c7e7);
        this.scene.fog = new THREE.Fog(0x86c7e7, 120, 420);

        const ambient = new THREE.HemisphereLight(0xffffff, 0x2c5f34, 1.8);
        this.scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xffffff, 2.2);
        sun.position.set(40, 80, 30);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1536, 1536);
        sun.shadow.camera.near = 10;
        sun.shadow.camera.far = 900;
        sun.shadow.camera.left = -520;
        sun.shadow.camera.right = 520;
        sun.shadow.camera.top = 520;
        sun.shadow.camera.bottom = -520;
        this.scene.add(sun);

        this.track = new TrackModel(TRACKS[this.trackIndex]);
        this.track.createSceneObjects(this.scene);
        this.buildCars();
        this.cameras = [
            new THREE.PerspectiveCamera(68, 1, 0.03, 1000),
            new THREE.PerspectiveCamera(68, 1, 0.03, 1000)
        ];
        this.showLightsSequence();
    }

    buildCars() {
        const controlledNames = (this.playerCount === 2 ? this.playerNames : [this.playerNames[0]]).slice(0, this.playerCount);
        const controlledDrivers = controlledNames.map((name, playerIndex) => ({
            ...FRIEND_DRIVERS.find((driver) => driver.name === name),
            controlledBy: playerIndex
        }));
        const cpuDrivers = shuffle(FRIEND_DRIVERS
            .filter((driver) => !controlledNames.includes(driver.name))
            .map((driver) => ({ ...driver, controlledBy: -1 })))
            .slice(0, FIELD_SIZE - controlledDrivers.length);
        const randomizedGrid = shuffle([...controlledDrivers, ...cpuDrivers]);

        this.cars = randomizedGrid.map((driver, gridIndex) => {
            const car = new RaceCar(driver, gridIndex, driver.controlledBy >= 0 ? driver.controlledBy : null);
            const gridRow = Math.floor(gridIndex / 2);
            const laneSign = gridIndex % 2 === 0 ? -1 : 1;
            const gridLane = Math.min(this.track.width / 2 - 2.1, 4.6);
            car.progress = -14 - gridRow * 14;
            car.lateral = laneSign * gridLane;
            car.aiLanePreference = laneSign * (1.15 + (gridRow % 3) * 0.35);
            car.heading = this.track.sample(car.progress).yaw;
            car.lastLapStart = 0;
            this.scene.add(car.mesh);
            this.placeCar(car);
            return car;
        });
        this.playerCars = this.cars
            .filter((car) => car.controlledBy !== null)
            .sort((a, b) => a.controlledBy - b.controlledBy);
    }

    showLightsSequence() {
        this.lights.classList.remove('hidden');
        this.lights.innerHTML = '<div class="light-row"></div><div class="light-caption">Hold revs...</div>';
        const row = this.lights.querySelector('.light-row');
        const bulbs = [];

        for (let index = 0; index < 5; index++) {
            const bulb = document.createElement('div');
            bulb.className = 'start-light';
            row.appendChild(bulb);
            bulbs.push(bulb);
            window.setTimeout(() => bulb.classList.add('on'), 600 + index * 500);
        }

        window.setTimeout(() => {
            bulbs.forEach((bulb) => bulb.classList.remove('on'));
            this.lights.querySelector('.light-caption').textContent = 'LIGHTS OUT';
            this.cars.forEach((car) => {
                car.lastLapStart = 0;
                car.speed = 12 + Math.random() * 3;
            });
            this.raceState = 'racing';
        }, 3600);

        window.setTimeout(() => this.lights.classList.add('hidden'), 4500);
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = Math.min(this.clock.getDelta(), 0.04);

        if (this.raceState === 'lights' || this.raceState === 'racing' || this.raceState === 'finished') {
            this.update(dt);
            this.renderRace();
        }
    }

    update(dt) {
        if (this.raceState === 'racing') {
            this.raceTime += dt;
            this.updateSlipstreams();
            this.cars.forEach((car) => this.updateCar(car, dt));
            this.resolveCollisions(dt);
            this.updateRanks();
            this.checkFinish();
        }

        this.cars.forEach((car) => this.placeCar(car));
        this.updateCameras();
        this.updateHud();
    }

    updateCar(car, dt) {
        if (car.finished || car.dnf) {
            car.speed = 0;
            car.advanceSpeed = 0;
            car.throttleInput = 0;
            car.brakeInput = 0;
            car.steerInput = 0;
            car.gear = 'N';
            car.rpmRatio = 0;
            return;
        }

        car.penaltyCooldown = Math.max(0, car.penaltyCooldown - dt);
        car.contactCooldown = Math.max(0, car.contactCooldown - dt);
        car.trackLimitCooldown = Math.max(0, car.trackLimitCooldown - dt);
        car.damageCooldown = Math.max(0, car.damageCooldown - dt);

        const curvature = this.track.curvature(car.progress + 42);
        const cornerLimit = clamp(76 - curvature * 230, 34, 84);
        const drsAvailable = this.track.isDrsZone(car.progress) && this.isWithinDrsRange(car);
        car.drsActive = false;
        car.drsAvailable = drsAvailable;

        if (car.controlledBy !== null) {
            this.updatePlayerCar(car, dt, cornerLimit, drsAvailable);
        } else {
            this.updateAiCar(car, dt, cornerLimit, drsAvailable);
        }

        if (car.slipstream) {
            car.speed += 10 * dt;
        }

        if (car.drsActive) {
            car.speed += 12 * dt;
        }

        const maxSpeed = car.controlledBy !== null
            ? PLAYER_TOP_SPEED + (car.drsActive ? 8 : 0) + (car.slipstream ? 4 : 0)
            : AI_TOP_SPEED + (car.drsActive ? 8 : 0) + (car.slipstream ? 4 : 0);
        car.speed = clamp(car.speed, 0, maxSpeed);

        if (car.controlledBy !== null) {
            this.integratePlayerCar(car, dt, cornerLimit);
        } else {
            car.advanceSpeed = car.speed;
        }

        const previousLap = car.lap;
        car.progress += car.advanceSpeed * dt;
        const newLap = Math.floor(car.progress / this.track.length);
        car.gear = getGear(car.speed, car.throttleInput);
        car.rpmRatio = getRpmRatio(car.speed, car.gear);

        if (newLap > previousLap) {
            this.recordLap(car, newLap);
        }
    }

    updatePlayerCar(car, dt, cornerLimit, drsAvailable) {
        const controls = car.controlledBy === 0
            ? { throttle: 'KeyW', brake: 'KeyS', left: 'KeyA', right: 'KeyD', drs: 'KeyF' }
            : { throttle: 'ArrowUp', brake: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', drs: 'KeyL' };
        const throttle = keyState.has(controls.throttle) ? 1 : 0;
        const brake = keyState.has(controls.brake) ? 1 : 0;
        const steer = (keyState.has(controls.left) ? 1 : 0) - (keyState.has(controls.right) ? 1 : 0);
        const speedRatio = clamp(car.speed / PLAYER_TOP_SPEED, 0, 1);
        const grip = clamp(cornerLimit / Math.max(32, car.speed), 0.3, 1);
        const surfaceGrip = car.offTrack ? 0.64 : 1;
        const turnRate = (0.5 + speedRatio * 1.08) * grip * surfaceGrip;
        const aeroDrag = (car.drsActive ? 0.0018 : 0.0026) * car.speed * car.speed;
        const rollingDrag = car.speed * (throttle ? 0.018 : 0.05);

        car.throttleInput = throttle;
        car.brakeInput = brake;
        car.steerInput = steer;
        car.heading = normalizeAngle(car.heading + steer * turnRate * dt);
        car.speed += (throttle * 31 - brake * 76 - aeroDrag - rollingDrag) * dt;

        if (keyState.has(controls.drs) && drsAvailable) {
            car.drsActive = true;
        }
    }

    integratePlayerCar(car, dt, cornerLimit) {
        const sample = this.track.sample(car.progress);
        const angleToTrack = normalizeAngle(car.heading - sample.yaw);
        const forwardFactor = Math.max(0, Math.cos(angleToTrack));
        const lateralVelocity = -Math.sin(angleToTrack) * car.speed;
        const overspeed = Math.max(0, car.speed - cornerLimit);
        const signedCorner = this.track.signedCurvature(car.progress + 28);
        const halfWidth = this.track.width / 2;
        const recoverLimit = halfWidth + PLAYER_OFFROAD_MARGIN;
        const barrierOffset = this.track.config.barrier?.offset ?? PLAYER_OFFROAD_MARGIN;
        const wallLimit = halfWidth + Math.max(1.4, Math.min(PLAYER_OFFROAD_MARGIN - 0.4, barrierOffset));

        car.advanceSpeed = car.speed * forwardFactor;
        car.lateral += lateralVelocity * dt;

        if (overspeed > 0) {
            const outside = Math.sign(car.lateral || -Math.sin(angleToTrack) || 1);
            car.lateral += outside * overspeed * 0.045 * dt;
            car.speed -= overspeed * 0.34 * dt;
        }

        car.offTrack = Math.abs(car.lateral) > halfWidth;

        if (car.offTrack) {
            const gravelDepth = Math.min(1, (Math.abs(car.lateral) - halfWidth) / PLAYER_OFFROAD_MARGIN);
            car.lateral += Math.sign(car.lateral || 1) * gravelDepth * car.speed * 0.05 * dt;

            if (this.isCornerCut(car, signedCorner, halfWidth) && car.trackLimitCooldown === 0) {
                car.penaltySeconds += 2;
                car.trackLimitCooldown = 5;
            }
        }

        if (Math.abs(car.lateral) > wallLimit) {
            const impactSeverity = Math.abs(lateralVelocity) * 0.85 + Math.max(0, car.speed - 28) * 0.48 + overspeed * 0.6;
            this.applyCrashDamage(car, impactSeverity, 'barrier impact');
            car.speed *= impactSeverity > 42 ? 0.14 : 0.42;
            car.advanceSpeed *= 0.22;
            car.lateral = clamp(car.lateral, -wallLimit, wallLimit);
        }

        car.lateral = clamp(car.lateral, -recoverLimit, recoverLimit);
    }

    isCornerCut(car, signedCorner, halfWidth) {
        const isCorner = Math.abs(signedCorner) > 0.12;
        const insideSide = Math.sign(signedCorner);
        const carSide = Math.sign(car.lateral);

        return isCorner && carSide === insideSide && Math.abs(car.lateral) > halfWidth + 0.15 && car.advanceSpeed > 18;
    }

    updateAiCar(car, dt, cornerLimit, drsAvailable) {
        const halfWidth = this.track.width / 2;
        const traffic = this.getAiTraffic(car);
        const laneWave = Math.sin((car.progress / this.track.length) * Math.PI * 8 + car.aiSeed) * 1.25;
        const laneBias = clamp(car.aiLanePreference * 0.45 + laneWave + traffic.lateralShift, -halfWidth + 2.1, halfWidth - 2.1);
        const aiTopSpeed = AI_TOP_SPEED + (drsAvailable ? 8 : 0) + (car.slipstream ? 4 : 0);
        const rawTargetSpeed = cornerLimit * car.skill + 15 + (drsAvailable ? 5 : 0) + (car.slipstream ? 8 : 0);
        const targetSpeed = Math.min(aiTopSpeed, rawTargetSpeed, traffic.speedLimit);
        const acceleration = car.speed < targetSpeed ? 44 : -62;

        car.throttleInput = acceleration > 0 ? 1 : 0;
        car.brakeInput = acceleration < 0 ? traffic.closeAhead ? 0.9 : 0.68 : 0;
        car.steerInput = clamp((laneBias - car.lateral) / 2.5, -1, 1);
        car.speed += acceleration * dt;
        car.lateral = lerp(car.lateral, laneBias, dt * (traffic.closeAhead ? 4.2 : 2.65));

        if (drsAvailable && car.speed > 35) {
            car.drsActive = true;
        }
    }

    getAiTraffic(car) {
        const traffic = {
            lateralShift: 0,
            speedLimit: Infinity,
            closeAhead: false
        };

        this.cars.forEach((other) => {
            if (other === car || other.finished || other.dnf) {
                return;
            }

            const delta = other.progress - car.progress;
            const lateralDelta = other.lateral - car.lateral;
            const sameLane = Math.abs(lateralDelta) < 5.2;

            if (delta > -8 && delta < 46 && sameLane) {
                const fallbackSide = Math.sign(car.aiLanePreference || (car.index % 2 === 0 ? -1 : 1));
                const side = Math.sign(car.lateral - other.lateral) || fallbackSide || 1;
                const urgency = clamp((46 - Math.abs(delta)) / 46, 0, 1);
                traffic.lateralShift += side * (2.15 + urgency * 2.8);
            }

            if (delta > 0 && delta < 56 && sameLane) {
                traffic.closeAhead = true;
                traffic.speedLimit = Math.min(
                    traffic.speedLimit,
                    Math.max(28, other.speed + delta * 0.22 - 5)
                );
            }
        });

        return traffic;
    }

    updateSlipstreams() {
        this.cars.forEach((car) => {
            if (car.finished || car.dnf) {
                car.slipstream = false;
                return;
            }

            car.slipstream = this.cars.some((other) => {
                if (other === car || other.finished) {
                    return false;
                }

                const delta = other.progress - car.progress;
                return delta > 12 && delta < 130 && Math.abs(other.lateral - car.lateral) < 4.4;
            });
        });
    }

    isWithinDrsRange(car) {
        return this.cars.some((other) => {
            const delta = other.progress - car.progress;
            return other !== car && delta > 5 && delta < Math.max(95, car.speed * 1.35) && Math.abs(other.lateral - car.lateral) < 5;
        });
    }

    resolveCollisions(dt) {
        for (let a = 0; a < this.cars.length; a++) {
            for (let b = a + 1; b < this.cars.length; b++) {
                const carA = this.cars[a];
                const carB = this.cars[b];

                if (carA.finished || carB.finished) {
                    continue;
                }

                const progressDelta = Math.abs(carA.progress - carB.progress);
                const lateralDelta = Math.abs(carA.lateral - carB.lateral);

                if (progressDelta < 4.4 && lateralDelta < 2.4) {
                    const closingSpeed = Math.abs(carA.advanceSpeed - carB.advanceSpeed);
                    const overlapForce = (4.4 - progressDelta) * 2.2 + (2.4 - lateralDelta) * 5.4;
                    const speedEnergy = Math.max(carA.speed, carB.speed) * 0.1;
                    const severity = closingSpeed * 1.45 + overlapForce + speedEnergy;
                    const aiOnlyContact = carA.controlledBy === null && carB.controlledBy === null;
                    const launchPackContact = aiOnlyContact && this.raceTime < AI_LAUNCH_GRACE_SECONDS;
                    const damageSeverity = severity * (launchPackContact ? 0.18 : aiOnlyContact ? 0.72 : 1);
                    const push = (2.4 - lateralDelta) * 0.5 + 0.12;
                    const direction = carA.lateral <= carB.lateral ? -1 : 1;
                    carA.lateral = clamp(carA.lateral + direction * push, -this.track.width / 2 + 0.8, this.track.width / 2 - 0.8);
                    carB.lateral = clamp(carB.lateral - direction * push, -this.track.width / 2 + 0.8, this.track.width / 2 - 0.8);
                    carA.speed *= launchPackContact ? 0.9 : 0.94;
                    carB.speed *= launchPackContact ? 0.9 : 0.94;

                    if (damageSeverity > 14) {
                        this.applyCrashDamage(carA, damageSeverity, 'collision');
                        this.applyCrashDamage(carB, damageSeverity * 0.92, 'collision');
                    }

                    [carA, carB].forEach((car) => {
                        if (car.controlledBy !== null && car.contactCooldown === 0 && car.speed > 20) {
                            car.penaltySeconds += 1;
                            car.contactCooldown = 3;
                        }
                    });
                }
            }
        }
    }

    applyCrashDamage(car, severity, reason) {
        if (car.finished || car.dnf || severity < 8 || car.damageCooldown > 0) {
            return;
        }

        const damage = clamp((severity - 7) * 1.65, 4, 48);
        car.damage = clamp(car.damage + damage, 0, DAMAGE_DNF_THRESHOLD);
        car.damageCooldown = 0.75;

        const dnfAllowed = car.controlledBy !== null || this.raceTime >= AI_LAUNCH_GRACE_SECONDS;

        if ((dnfAllowed && severity > 72) || car.damage >= DAMAGE_DNF_THRESHOLD) {
            this.retireCar(car, reason);
        }
    }

    retireCar(car, reason) {
        if (car.dnf) {
            return;
        }

        car.dnf = true;
        car.dnfReason = reason;
        car.finished = true;
        car.finishTime = Infinity;
        car.speed = 0;
        car.advanceSpeed = 0;
        car.throttleInput = 0;
        car.brakeInput = 0;
        car.steerInput = 0;
        car.gear = 'N';
        car.rpmRatio = 0;
        car.mesh.rotation.z = 0.22 * Math.sign(car.lateral || 1);
        car.mesh.userData.bodyMaterial.emissive = new THREE.Color(0x330000);

        if (car.controlledBy !== null) {
            this.lights.classList.remove('hidden');
            this.lights.innerHTML = `<div class="finish-card">DNF<br><span>${car.driver.name} retired: ${reason}</span></div>`;
            window.setTimeout(() => {
                if (this.raceState === 'racing') {
                    this.lights.classList.add('hidden');
                }
            }, 2600);
        }
    }

    recordLap(car, newLap) {
        if (newLap <= 0) {
            car.lap = newLap;
            return;
        }

        const lapTime = this.raceTime - car.lastLapStart;
        car.lastLapStart = this.raceTime;
        car.lap = newLap;

        if (newLap <= LAPS_PER_RACE && lapTime < car.bestLap) {
            car.bestLap = lapTime;
        }

        if (newLap <= LAPS_PER_RACE && lapTime < this.fastestLap.time) {
            this.fastestLap = { driver: car.driver.name, time: lapTime };
        }

        if (newLap >= LAPS_PER_RACE) {
            car.finished = true;
            car.finishTime = this.raceTime + car.penaltySeconds;
        }
    }

    updateRanks() {
        const ordered = [...this.cars].sort((a, b) => {
            if (a.dnf && b.dnf) {
                return b.progress - a.progress;
            }
            if (a.dnf) {
                return 1;
            }
            if (b.dnf) {
                return -1;
            }
            if (a.finished && b.finished) {
                return a.finishTime - b.finishTime;
            }
            if (a.finished) {
                return -1;
            }
            if (b.finished) {
                return 1;
            }
            return b.progress - a.progress;
        });

        ordered.forEach((car, index) => {
            car.rank = index + 1;
        });
    }

    checkFinish() {
        const controlledCars = this.cars.filter((car) => car.controlledBy !== null);

        if (controlledCars.every((car) => car.finished)) {
            this.raceState = 'finished';
            this.lights.classList.remove('hidden');
            this.lights.innerHTML = `<div class="finish-card">Race finished<br><span>${this.getClassification().slice(0, 3).join(' · ')}</span></div>`;
        }
    }

    getClassification() {
        return [...this.cars]
            .sort((a, b) => a.rank - b.rank)
            .map((car, index) => `${index + 1}. ${car.driver.name}${car.dnf ? ' DNF' : ''}`);
    }

    placeCar(car) {
        const sample = this.track.sample(car.progress);
        const position = sample.point.clone().add(sample.normal.clone().multiplyScalar(car.lateral));
        car.mesh.position.set(position.x, 0.35, position.z);
        car.mesh.rotation.y = car.controlledBy !== null ? car.heading : sample.yaw;
        car.mesh.rotation.z = car.dnf ? 0.22 * Math.sign(car.lateral || 1) : car.offTrack ? 0.04 * Math.sign(car.lateral) : -car.lateral * 0.015;

        if (car.mesh.userData.steeringWheel) {
            car.mesh.userData.steeringWheel.rotation.z = car.steerInput * 0.62;
        }

        if (car.dnf) {
            car.mesh.userData.bodyMaterial.emissive = new THREE.Color(0x330000);
        } else if (car.damage > 70) {
            car.mesh.userData.bodyMaterial.emissive = new THREE.Color(0x2c0700);
        } else if (car.drsActive) {
            car.mesh.userData.bodyMaterial.emissive = new THREE.Color(0x222200);
        } else if (car.slipstream) {
            car.mesh.userData.bodyMaterial.emissive = new THREE.Color(0x001822);
        } else if (car.offTrack) {
            car.mesh.userData.bodyMaterial.emissive = new THREE.Color(0x2a1200);
        } else {
            car.mesh.userData.bodyMaterial.emissive = new THREE.Color(0x000000);
        }
    }

    updateCameras() {
        const players = this.getPlayerCars();
        const leader = [...this.cars].sort((a, b) => a.rank - b.rank)[0];

        players.forEach((car, index) => {
            const camera = this.cameras[index];
            this.positionCamera(camera, car, leader);
        });
    }

    getPlayerCars() {
        return this.playerCars.slice(0, this.playerCount);
    }

    positionCamera(camera, car, leader) {
        const focusCar = this.cameraMode === 'broadcast' ? leader : car;
        const sample = this.track.sample(focusCar.progress);
        const carPosition = focusCar.mesh.position.clone();
        const forward = focusCar.controlledBy !== null
            ? new THREE.Vector3(Math.sin(focusCar.heading), 0, Math.cos(focusCar.heading)).normalize()
            : sample.tangent.clone();
        const side = new THREE.Vector3(-forward.z, 0, forward.x).normalize();
        camera.fov = this.cameraMode === 'firstperson' ? 76 : this.cameraMode === 'halo' ? 72 : 68;
        let position;
        let target;

        if (this.cameraMode === 'chase') {
            position = carPosition.clone().add(forward.clone().multiplyScalar(-18)).add(new THREE.Vector3(0, 8, 0));
            target = carPosition.clone().add(forward.clone().multiplyScalar(18)).add(new THREE.Vector3(0, 2, 0));
        } else if (this.cameraMode === 'halo') {
            position = carPosition.clone()
                .add(forward.clone().multiplyScalar(-0.52))
                .add(new THREE.Vector3(0, 1.72, 0));
            target = carPosition.clone().add(forward.clone().multiplyScalar(32)).add(new THREE.Vector3(0, 1.22, 0));
        } else if (this.cameraMode === 'firstperson') {
            position = carPosition.clone()
                .add(forward.clone().multiplyScalar(-0.88))
                .add(new THREE.Vector3(0, 1.44, 0));
            target = carPosition.clone().add(forward.clone().multiplyScalar(34)).add(new THREE.Vector3(0, 1.02, 0));
        } else if (this.cameraMode === 'broadcast') {
            position = carPosition.clone().add(new THREE.Vector3(34, 44, 28));
            target = carPosition.clone().add(new THREE.Vector3(0, 1, 0));
        } else if (this.cameraMode === 'overhead') {
            position = carPosition.clone().add(new THREE.Vector3(0, 96, 0.1));
            target = carPosition;
        } else {
            position = carPosition.clone()
                .add(forward.clone().multiplyScalar(-7))
                .add(side.clone().multiplyScalar(1.15))
                .add(new THREE.Vector3(0, 3.4, 0));
            target = carPosition.clone().add(forward.clone().multiplyScalar(24)).add(new THREE.Vector3(0, 1.2, 0));
        }

        const followRate = this.cameraMode === 'firstperson' || this.cameraMode === 'halo' ? 0.78 : 0.2;
        camera.position.lerp(position, followRate);
        camera.lookAt(target);
    }

    renderRace() {
        const width = this.renderer.domElement.width;
        const height = this.renderer.domElement.height;
        const players = this.getPlayerCars();

        this.renderer.clear();

        if (this.playerCount === 2) {
            const half = Math.floor(width / 2);
            this.renderViewport(this.cameras[0], 0, 0, half, height);
            this.renderViewport(this.cameras[1], half, 0, width - half, height);
        } else {
            this.renderViewport(this.cameras[0], 0, 0, width, height);
        }
    }

    renderViewport(camera, x, y, width, height) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        this.renderer.setViewport(x, y, width, height);
        this.renderer.setScissor(x, y, width, height);
        this.renderer.render(this.scene, camera);
    }

    renderRpmLights(car) {
        const activeLights = Math.round(car.rpmRatio * 10);

        return Array.from({ length: 10 }, (_, index) => {
            const on = index < activeLights;
            const hot = on && index >= 7;
            return `<span class="rpm-light ${on ? 'on' : ''} ${hot ? 'hot' : ''}"></span>`;
        }).join('');
    }

    renderTelemetryCard(car) {
        const lap = car.finished && !car.dnf ? LAPS_PER_RACE : clamp(car.lap + 1, 1, LAPS_PER_RACE);
        const speed = Math.round(car.speed * 3.6);
        const damage = Math.round(car.damage);
        const team = getTeam(car.driver.team);
        const statusFlags = [
            car.dnf ? 'DNF' : null,
            car.drsActive ? 'DRS' : null,
            car.slipstream ? 'Slipstream' : null,
            car.offTrack ? 'Off track' : null,
            car.penaltySeconds ? `+${car.penaltySeconds.toFixed(0)}s penalty` : null
        ].filter(Boolean);

        return `<div class="telemetry-card ${car.dnf ? 'dnf' : ''}" style="border-color: ${team.color}">
            <div class="telemetry-top">
                <span class="driver-name">${car.driver.name} · ${team.name}</span>
                <span class="race-state">P${car.rank} · Lap ${lap}/${LAPS_PER_RACE}</span>
            </div>
            <div class="rpm-lights">${this.renderRpmLights(car)}</div>
            <div class="telemetry-core">
                <div class="speed-readout"><strong>${car.dnf ? 0 : speed}</strong><span>KM/H</span></div>
                <div class="gear-readout">${car.gear}</div>
            </div>
            <div class="telemetry-flags">
                <span class="status-pill ${car.drsActive ? 'active' : ''}">DRS ${car.drsActive ? 'ON' : car.drsAvailable ? 'READY' : 'OFF'}</span>
                <span class="status-pill ${car.slipstream ? 'active' : ''}">Tow</span>
                <span class="status-pill ${damage > 65 || car.dnf ? 'warn' : ''}">DMG ${damage}%</span>
            </div>
            <div class="telemetry-bottom">
                <div class="meter throttle">Throttle<div class="meter-track"><span style="--value: ${Math.round(car.throttleInput * 100)}%"></span></div></div>
                <div class="meter brake">Brake<div class="meter-track"><span style="--value: ${Math.round(car.brakeInput * 100)}%"></span></div></div>
                <div class="meter damage">Damage<div class="meter-track"><span style="--value: ${damage}%"></span></div></div>
            </div>
            <div class="telemetry-bottom">
                <span>${statusFlags.join(' · ') || 'Clean air'}</span>
                <span>${car.bestLap < Infinity ? `Best ${car.bestLap.toFixed(2)}` : '--'}</span>
            </div>
        </div>`;
    }

    updateHud() {
        if (!this.track) {
            return;
        }

        const playerCars = this.getPlayerCars();
        this.sessionInfo.textContent = `${this.track.name} · ${LAPS_PER_RACE} longer laps · ${this.playerCount === 2 ? '2P Splitscreen' : 'Singleplayer'} · Camera: ${CAMERA_MODES[this.cameraMode]}`;
        this.fastestLapEl.textContent = this.fastestLap.driver
            ? `Fastest lap: ${this.fastestLap.driver} ${this.fastestLap.time.toFixed(2)}`
            : 'Fastest lap: --';

        this.playerHud.innerHTML = playerCars.map((car) => {
            const lap = car.finished && !car.dnf ? LAPS_PER_RACE : clamp(car.lap + 1, 1, LAPS_PER_RACE);
            const team = getTeam(car.driver.team);
            const flags = [
                car.drsActive ? 'DRS' : null,
                car.slipstream ? 'SLIP' : null,
                car.offTrack ? 'OFF TRACK' : null,
                car.dnf ? `DNF ${car.dnfReason}` : null,
                car.penaltySeconds ? `+${car.penaltySeconds.toFixed(0)}s` : null
            ].filter(Boolean).join(' · ');
            return `<div class="driver-card" style="border-left-color: ${team.color}">
                <strong>P${car.controlledBy + 1} ${car.driver.name} · ${team.name}</strong>
                <span>P${car.rank} · Lap ${lap}/${LAPS_PER_RACE} · ${Math.round(car.speed * 3.6)} km/h</span>
                <em>${flags || 'Clean air'}</em>
            </div>`;
        }).join('');

        this.standings.innerHTML = [...this.cars]
            .sort((a, b) => a.rank - b.rank)
            .slice(0, 10)
            .map((car) => `<div><span>${car.rank}. ${car.driver.name}</span><b>${car.dnf ? 'DNF' : car.finished ? 'FIN' : `L${clamp(car.lap + 1, 1, LAPS_PER_RACE)}`}</b></div>`)
            .join('');

        this.telemetry.innerHTML = playerCars.map((car) => this.renderTelemetryCard(car)).join('');
    }
}

new FormulaFriendsGame();
