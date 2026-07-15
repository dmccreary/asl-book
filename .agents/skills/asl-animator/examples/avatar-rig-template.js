// ASL Animator - Reference Humanoid Avatar Rig Template
// CANVAS_HEIGHT: 650

let scene, camera, renderer, controls;
let avatarRig = {};
let pathTracing = {
    enabled: true,
    leftPath: null,
    rightPath: null,
    leftPoints: [],
    rightPoints: [],
    maxPoints: 60
};

// Playback state
let isPlaying = false;
let animationQueue = [];
let currentSequenceIndex = -1;
let currentPoseStart = null;
let currentPoseTarget = null;
let poseProgress = 0; // 0 to 1
let transitionDuration = 400; // ms
let startTime = null;
let playbackSpeed = 1.0;
let isMirrored = false;
let showSkeleton = false;

// Joint helper arrows
let boneHelpers = [];

// Skin and clothing materials
const MATERIALS = {
    skin: new THREE.MeshPhongMaterial({ color: 0xffdbac, shininess: 20 }),
    shirt: new THREE.MeshPhongMaterial({ color: 0x16213e, shininess: 10 }), // Dark contrasting color
    joints: new THREE.MeshPhongMaterial({ color: 0xff6b6b, shininess: 40 }),
    eyes: new THREE.MeshBasicMaterial({ color: 0x111111 }),
    mouth: new THREE.MeshBasicMaterial({ color: 0x331111 })
};

// Joint keys for rotations
const JOINT_NAMES = [
    'shoulder', 'elbow', 'wrist',
    'thumb_mcp', 'thumb_pip', 'thumb_dip',
    'index_mcp', 'index_pip', 'index_dip',
    'middle_mcp', 'middle_pip', 'middle_dip',
    'ring_mcp', 'ring_pip', 'ring_dip',
    'pinky_mcp', 'pinky_pip', 'pinky_dip'
];

// Predefined handshape curl states (0-100 values mapping to angles)
const HANDSHAPES = {
    'open': {
        thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0
    },
    'fist': {
        thumb: 80, index: 100, middle: 100, ring: 100, pinky: 100
    },
    'point': {
        thumb: 85, index: 0, middle: 100, ring: 100, pinky: 100
    },
    'asl-a': {
        thumb: 20, index: 100, middle: 100, ring: 100, pinky: 100
    },
    'asl-b': {
        thumb: 95, index: 0, middle: 0, ring: 0, pinky: 0
    },
    'asl-c': {
        thumb: 40, index: 45, middle: 45, ring: 45, pinky: 45
    },
    'asl-d': {
        thumb: 60, index: 0, middle: 70, ring: 70, pinky: 70
    },
    'asl-i-love-you': {
        thumb: 0, index: 0, middle: 100, ring: 100, pinky: 0
    }
};

// Example gesture keyframes
const GESTURES = {
    'HELLO': [
        {
            duration: 400,
            rightArm: { shoulder: [-0.5, 0.2, 0.8], elbow: [1.6, -0.4, 0.0], wrist: [0.1, 0.0, 0.4] },
            rightHand: { pose: 'asl-b' },
            leftArm: { shoulder: [0.2, 0, -0.2], elbow: [0.2, 0, 0], wrist: [0, 0, 0] },
            leftHand: { pose: 'open' },
            expression: { eyebrows: 'raised', mouth: 'smile' }
        },
        {
            duration: 350,
            rightArm: { shoulder: [-0.6, 0.4, 0.9], elbow: [1.8, -0.2, 0.2], wrist: [0.0, 0.2, 0.5] },
            rightHand: { pose: 'asl-b' },
            leftArm: { shoulder: [0.2, 0, -0.2], elbow: [0.2, 0, 0], wrist: [0, 0, 0] },
            leftHand: { pose: 'open' },
            expression: { eyebrows: 'neutral', mouth: 'smile' }
        }
    ],
    'THANK-YOU': [
        {
            duration: 400,
            rightArm: { shoulder: [-0.3, 0.1, 0.5], elbow: [1.8, 0.0, 0.0], wrist: [-0.2, 0.1, 0.1] },
            rightHand: { pose: 'asl-b' },
            leftArm: { shoulder: [0.2, 0, -0.2], elbow: [0.2, 0, 0], wrist: [0, 0, 0] },
            leftHand: { pose: 'open' },
            expression: { eyebrows: 'raised', mouth: 'neutral' }
        },
        {
            duration: 450,
            rightArm: { shoulder: [-0.3, 0.0, 0.2], elbow: [0.8, 0.2, -0.2], wrist: [-0.1, 0.2, 0.2] },
            rightHand: { pose: 'asl-b' },
            leftArm: { shoulder: [0.2, 0, -0.2], elbow: [0.2, 0, 0], wrist: [0, 0, 0] },
            leftHand: { pose: 'open' },
            expression: { eyebrows: 'neutral', mouth: 'smile' }
        }
    ]
};

// Initial Setup
function init() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Premium dark background

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.8, 0);

    setupLighting();
    createAvatar();
    setupPathTracing();
    setupEventListeners();
    resetPose();

    animate();
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xa5f3fc, 0.4); // Subtle cyan fill light
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);
}

// Procedural Humanoid Construction
function createAvatar() {
    const root = new THREE.Group();
    root.position.y = 0;
    scene.add(root);

    // Torso (Clothing contrast)
    const torsoGeo = new THREE.CylinderGeometry(0.7, 0.5, 1.6, 16);
    const torso = new THREE.Mesh(torsoGeo, MATERIALS.shirt);
    torso.position.y = 0.8;
    torso.castShadow = true;
    torso.receiveShadow = true;
    root.add(torso);

    // Neck & Head
    const neckJoint = new THREE.Group();
    neckJoint.position.set(0, 0.9, 0);
    torso.add(neckJoint);

    const headGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const head = new THREE.Mesh(headGeo, MATERIALS.skin);
    head.position.y = 0.35;
    neckJoint.add(head);

    // Facial expressions: eyebrows
    const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), MATERIALS.eyes);
    leftBrow.position.set(-0.12, 0.12, 0.3);
    head.add(leftBrow);

    const rightBrow = leftBrow.clone();
    rightBrow.position.x = 0.12;
    head.add(rightBrow);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, MATERIALS.eyes);
    leftEye.position.set(-0.12, 0.05, 0.32);
    head.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.x = 0.12;
    head.add(rightEye);

    // Mouth
    const mouthGeo = new THREE.TorusGeometry(0.05, 0.015, 8, 16, Math.PI);
    const mouth = new THREE.Mesh(mouthGeo, MATERIALS.mouth);
    mouth.position.set(0, -0.1, 0.32);
    mouth.rotation.x = Math.PI / 2;
    head.add(mouth);

    // Build Left and Right Arms
    avatarRig.leftArm = buildArm(-1);
    avatarRig.rightArm = buildArm(1);

    torso.add(avatarRig.leftArm.shoulder);
    torso.add(avatarRig.rightArm.shoulder);

    avatarRig.neck = neckJoint;
    avatarRig.head = head;
    avatarRig.leftBrow = leftBrow;
    avatarRig.rightBrow = rightBrow;
    avatarRig.mouth = mouth;
}

function buildArm(side) {
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.set(side * 0.75, 0.65, 0);

    // Shoulder marker
    const shoulderMarker = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), MATERIALS.shirt);
    shoulderGroup.add(shoulderMarker);

    // Upper Arm Bone
    const upperArmBone = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.8, 16), MATERIALS.shirt);
    upperArmBone.position.y = -0.4;
    upperArmBone.castShadow = true;
    shoulderGroup.add(upperArmBone);

    // Elbow
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, -0.8, 0);
    shoulderGroup.add(elbowGroup);

    const elbowMarker = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), MATERIALS.skin);
    elbowGroup.add(elbowMarker);

    // Forearm Bone
    const forearmBone = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.7, 16), MATERIALS.skin);
    forearmBone.position.y = -0.35;
    forearmBone.castShadow = true;
    elbowGroup.add(forearmBone);

    // Wrist
    const wristGroup = new THREE.Group();
    wristGroup.position.set(0, -0.7, 0);
    elbowGroup.add(wristGroup);

    const wristMarker = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), MATERIALS.skin);
    wristGroup.add(wristMarker);

    // Palm & Hand Group
    const handGroup = new THREE.Group();
    handGroup.position.set(0, -0.15, 0);
    wristGroup.add(handGroup);

    const palmGeo = new THREE.BoxGeometry(0.24, 0.3, 0.06);
    const palm = new THREE.Mesh(palmGeo, MATERIALS.skin);
    palm.position.y = -0.15;
    palm.castShadow = true;
    handGroup.add(palm);

    // Articulate 5 Fingers
    const fingers = {};
    const fingerPositions = [
        { name: 'thumb', x: side * 0.12, y: -0.1, z: 0.02, angle: side * -Math.PI/6 },
        { name: 'index', x: side * 0.09, y: -0.3, z: 0, angle: 0 },
        { name: 'middle', x: side * 0.03, y: -0.31, z: 0, angle: 0 },
        { name: 'ring', x: side * -0.03, y: -0.3, z: 0, angle: 0 },
        { name: 'pinky', x: side * -0.09, y: -0.28, z: 0, angle: 0 }
    ];

    fingerPositions.forEach(f => {
        fingers[f.name] = buildFinger(f.name, f.x, f.y, f.z, f.angle, side);
        handGroup.add(fingers[f.name].base);
    });

    return {
        shoulder: shoulderGroup,
        elbow: elbowGroup,
        wrist: wristGroup,
        hand: handGroup,
        fingers: fingers,
        wristMarker: wristMarker
    };
}

function buildFinger(name, x, y, z, baseAngle, side) {
    const baseGroup = new THREE.Group();
    baseGroup.position.set(x, y, z);
    baseGroup.rotation.z = baseAngle;

    const joints = [];
    let currentJoint = baseGroup;

    // Segment lengths based on finger
    const segmentCount = name === 'thumb' ? 2 : 3;
    const length = name === 'pinky' ? 0.07 : name === 'middle' ? 0.1 : 0.09;
    const width = 0.03;

    for (let i = 0; i < segmentCount; i++) {
        const jointGroup = new THREE.Group();
        if (i > 0) {
            jointGroup.position.y = -length;
        }
        currentJoint.add(jointGroup);

        const bone = new THREE.Mesh(new THREE.CylinderGeometry(width*0.9, width, length, 8), MATERIALS.skin);
        bone.position.y = -length/2;
        bone.castShadow = true;
        jointGroup.add(bone);

        // Add spherical tip on distal segment
        if (i === segmentCount - 1) {
            const tip = new THREE.Mesh(new THREE.SphereGeometry(width * 0.95, 8, 8), MATERIALS.skin);
            tip.position.y = -length;
            jointGroup.add(tip);
        }

        joints.push(jointGroup);
        currentJoint = jointGroup;
    }

    return {
        base: baseGroup,
        joints: joints
    };
}

// Path Tracing Setup
function setupPathTracing() {
    const leftMaterial = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2, transparent: true, opacity: 0.6 });
    const rightMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2, transparent: true, opacity: 0.6 });

    const dummyPoints = Array(pathTracing.maxPoints).fill(new THREE.Vector3(0, 0.8, 0));
    
    const leftGeo = new THREE.BufferGeometry().setFromPoints(dummyPoints);
    pathTracing.leftPath = new THREE.Line(leftGeo, leftMaterial);
    scene.add(pathTracing.leftPath);

    const rightGeo = new THREE.BufferGeometry().setFromPoints(dummyPoints);
    pathTracing.rightPath = new THREE.Line(rightGeo, rightMaterial);
    scene.add(pathTracing.rightPath);
}

function updatePathTrails() {
    if (!pathTracing.enabled) {
        pathTracing.leftPath.visible = false;
        pathTracing.rightPath.visible = false;
        return;
    }

    pathTracing.leftPath.visible = true;
    pathTracing.rightPath.visible = true;

    const leftWristPos = new THREE.Vector3();
    const rightWristPos = new THREE.Vector3();

    avatarRig.leftArm.wristMarker.getWorldPosition(leftWristPos);
    avatarRig.rightArm.wristMarker.getWorldPosition(rightWristPos);

    // Update left points list
    pathTracing.leftPoints.push(leftWristPos);
    if (pathTracing.leftPoints.length > pathTracing.maxPoints) {
        pathTracing.leftPoints.shift();
    }

    // Update right points list
    pathTracing.rightPoints.push(rightWristPos);
    if (pathTracing.rightPoints.length > pathTracing.maxPoints) {
        pathTracing.rightPoints.shift();
    }

    // Update geometry buffers
    if (pathTracing.leftPoints.length > 1) {
        pathTracing.leftPath.geometry.setFromPoints(pathTracing.leftPoints);
    }
    if (pathTracing.rightPoints.length > 1) {
        pathTracing.rightPath.geometry.setFromPoints(pathTracing.rightPoints);
    }
}

// Lerp/Slerp Animation Loop
function updateAvatarJoints(progress) {
    if (!currentPoseStart || !currentPoseTarget) return;

    // Easing: Quadratic In Out
    const easeT = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Interpolate arms (Shoulder, Elbow, Wrist Euler Rotations)
    const arms = ['leftArm', 'rightArm'];
    arms.forEach(armKey => {
        const startArm = currentPoseStart[armKey];
        const targetArm = currentPoseTarget[armKey];
        const rigArm = avatarRig[armKey];

        if (startArm && targetArm && rigArm) {
            ['shoulder', 'elbow', 'wrist'].forEach(joint => {
                const sRot = startArm[joint] || [0, 0, 0];
                const tRot = targetArm[joint] || [0, 0, 0];
                
                // Construct Quaternions for smooth Slerping
                const startQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(sRot[0], sRot[1], sRot[2]));
                const targetQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(tRot[0], tRot[1], tRot[2]));
                
                rigArm[joint].quaternion.slerpQuaternions(startQ, targetQ, easeT);
            });

            // Interpolate finger curls
            const handState = currentPoseTarget[armKey === 'leftArm' ? 'leftHand' : 'rightHand'] || { pose: 'open' };
            applyHandshape(rigArm, handState, easeT);
        }
    });

    // Interpolate expressions (Eyebrows, Mouth)
    const startExp = currentPoseStart.expression || { eyebrows: 'neutral', mouth: 'neutral' };
    const targetExp = currentPoseTarget.expression || { eyebrows: 'neutral', mouth: 'neutral' };

    animateExpression(startExp, targetExp, easeT);
}

function applyHandshape(rigArm, handState, t) {
    const handshapeName = handState.pose || 'open';
    const curls = HANDSHAPES[handshapeName] || HANDSHAPES.open;

    Object.keys(rigArm.fingers).forEach(fName => {
        const finger = rigArm.fingers[fName];
        const curlPercent = curls[fName] !== undefined ? curls[fName] : 0;
        
        // Calculate max target curl rotation (approx 90 deg / 1.57 rad max)
        const maxRot = -Math.PI / 2;
        const targetAngle = (curlPercent / 100) * maxRot;

        finger.joints.forEach((joint, jIndex) => {
            // Lerp joints. In real-rigging, metacarpal curls less.
            const jointT = jIndex === 0 ? 0.3 : 1.0;
            const targetRotationX = targetAngle * jointT;
            
            // Linear interpolate the local rotation
            joint.rotation.x = THREE.MathUtils.lerp(joint.rotation.x, targetRotationX, t);
        });
    });
}

function animateExpression(startExp, targetExp, t) {
    // Brow heights
    const bHeightStart = startExp.eyebrows === 'raised' ? 0.18 : (startExp.eyebrows === 'furrowed' ? 0.08 : 0.12);
    const bHeightTarget = targetExp.eyebrows === 'raised' ? 0.18 : (targetExp.eyebrows === 'furrowed' ? 0.08 : 0.12);
    
    const currentHeight = THREE.MathUtils.lerp(bHeightStart, bHeightTarget, t);
    avatarRig.leftBrow.position.y = currentHeight;
    avatarRig.rightBrow.position.y = currentHeight;

    // Brow tilts
    const bTiltStart = startExp.eyebrows === 'furrowed' ? 0.15 : (startExp.eyebrows === 'raised' ? -0.1 : 0);
    const bTiltTarget = targetExp.eyebrows === 'furrowed' ? 0.15 : (targetExp.eyebrows === 'raised' ? -0.1 : 0);
    
    avatarRig.leftBrow.rotation.z = THREE.MathUtils.lerp(bTiltStart, bTiltTarget, t);
    avatarRig.rightBrow.rotation.z = THREE.MathUtils.lerp(-bTiltStart, -bTiltTarget, t);

    // Mouth Shape (Scale)
    const mouthScaleXStart = startExp.mouth === 'o-shape' ? 0.5 : 1.0;
    const mouthScaleXTarget = targetExp.mouth === 'o-shape' ? 0.5 : 1.0;
    const mouthScaleYStart = startExp.mouth === 'smile' ? -1.0 : (startExp.mouth === 'o-shape' ? 1.5 : 1.0);
    const mouthScaleYTarget = targetExp.mouth === 'smile' ? -1.0 : (targetExp.mouth === 'o-shape' ? 1.5 : 1.0);

    avatarRig.mouth.scale.x = THREE.MathUtils.lerp(mouthScaleXStart, mouthScaleXTarget, t);
    avatarRig.mouth.scale.y = THREE.MathUtils.lerp(mouthScaleYStart, mouthScaleYTarget, t);
}

// Sequence Player & Scrubber updates
function playSequence(sequence) {
    if (!sequence || sequence.length === 0) return;
    
    animationQueue = sequence;
    currentSequenceIndex = 0;
    isPlaying = true;
    startTime = performance.now();
    
    // Set starting keyframe to current visual pose
    currentPoseStart = getRigCurrentPose();
    currentPoseTarget = animationQueue[0];
    transitionDuration = (currentPoseTarget.duration || 400) / playbackSpeed;
    
    document.getElementById('play-btn').textContent = 'Pause';
}

function getRigCurrentPose() {
    // Generate snapshot of current rotations to start from
    const snapshot = {
        leftArm: { shoulder: [], elbow: [], wrist: [] },
        rightArm: { shoulder: [], elbow: [], wrist: [] },
        expression: {
            eyebrows: avatarRig.leftBrow.position.y > 0.15 ? 'raised' : (avatarRig.leftBrow.position.y < 0.10 ? 'furrowed' : 'neutral'),
            mouth: avatarRig.mouth.scale.y < 0 ? 'smile' : (avatarRig.mouth.scale.x < 0.7 ? 'o-shape' : 'neutral')
        }
    };

    ['leftArm', 'rightArm'].forEach(arm => {
        ['shoulder', 'elbow', 'wrist'].forEach(joint => {
            const rot = avatarRig[arm][joint].rotation;
            snapshot[arm][joint] = [rot.x, rot.y, rot.z];
        });
    });

    return snapshot;
}

function resetPose() {
    currentPoseStart = getRigCurrentPose();
    currentPoseTarget = {
        leftArm: { shoulder: [0.1, 0, -0.2], elbow: [0.2, 0, 0], wrist: [0, 0, 0] },
        leftHand: { pose: 'open' },
        rightArm: { shoulder: [-0.1, 0, 0.2], elbow: [0.2, 0, 0], wrist: [0, 0, 0] },
        rightHand: { pose: 'open' },
        expression: { eyebrows: 'neutral', mouth: 'neutral' }
    };
    transitionDuration = 500;
    startTime = performance.now();
    poseProgress = 0;
    isPlaying = true;
}

// Text-to-Sign Parser Logic
function parseAndQueueText(text) {
    if (!text || text.trim() === '') return;

    const words = text.toUpperCase().trim().split(/\s+/);
    let fullQueue = [];

    words.forEach((word, wordIdx) => {
        if (GESTURES[word]) {
            // Known word, add it
            fullQueue.push(...GESTURES[word]);
        } else {
            // Unrecognized word, fingerspell it
            for (let i = 0; i < word.length; i++) {
                const char = word[i].toLowerCase();
                if (HANDSHAPES[`asl-${char}`] || HANDSHAPES[char]) {
                    fullQueue.push({
                        duration: 300,
                        rightArm: { shoulder: [-0.4, 0.1, 0.6], elbow: [1.4, 0, 0], wrist: [0, 0, 0] },
                        rightHand: { pose: `asl-${char}` },
                        leftArm: { shoulder: [0.2, 0, -0.2], elbow: [0.2, 0, 0], wrist: [0, 0, 0] },
                        leftHand: { pose: 'open' },
                        expression: { eyebrows: 'neutral', mouth: 'neutral' }
                    });
                }
            }
        }

        // Insert hand-drop pause between words
        if (wordIdx < words.length - 1) {
            fullQueue.push({
                duration: 400,
                leftArm: { shoulder: [0.1, 0, -0.2], elbow: [0.2, 0, 0], wrist: [0, 0, 0] },
                leftHand: { pose: 'open' },
                rightArm: { shoulder: [-0.1, 0, 0.2], elbow: [0.2, 0, 0], wrist: [0, 0, 0] },
                rightHand: { pose: 'open' },
                expression: { eyebrows: 'neutral', mouth: 'neutral' }
            });
        }
    });

    playSequence(fullQueue);
}

// Event Bindings & UI
function setupEventListeners() {
    // Play/Pause button
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (animationQueue.length === 0) return;
            isPlaying = !isPlaying;
            playBtn.textContent = isPlaying ? 'Pause' : 'Play';
            if (isPlaying) startTime = performance.now() - (poseProgress * transitionDuration);
        });
    }

    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            animationQueue = [];
            currentSequenceIndex = -1;
            isPlaying = false;
            if (playBtn) playBtn.textContent = 'Play';
            resetPose();
            pathTracing.leftPoints = [];
            pathTracing.rightPoints = [];
        });
    }

    // Speed controls
    const speedSelect = document.getElementById('speed-select');
    if (speedSelect) {
        speedSelect.addEventListener('change', (e) => {
            playbackSpeed = parseFloat(e.target.value);
            if (isPlaying && currentSequenceIndex >= 0) {
                // Adjust remaining duration of current keyframe
                const elapsed = performance.now() - startTime;
                const remaining = (transitionDuration - elapsed) * (1 / playbackSpeed);
                startTime = performance.now() - (poseProgress * (transitionDuration / playbackSpeed));
            }
        });
    }

    // Mirror mode
    const mirrorToggle = document.getElementById('mirror-toggle');
    if (mirrorToggle) {
        mirrorToggle.addEventListener('change', (e) => {
            isMirrored = e.target.checked;
            avatarRig.leftArm.shoulder.parent.scale.x = isMirrored ? -1 : 1;
        });
    }

    // Path tracing toggle
    const pathToggle = document.getElementById('path-toggle');
    if (pathToggle) {
        pathToggle.addEventListener('change', (e) => {
            pathTracing.enabled = e.target.checked;
            if (!pathTracing.enabled) {
                pathTracing.leftPoints = [];
                pathTracing.rightPoints = [];
            }
        });
    }

    // Text Input form
    const signInput = document.getElementById('sign-input');
    const signBtn = document.getElementById('sign-btn');
    if (signBtn && signInput) {
        signBtn.addEventListener('click', () => {
            parseAndQueueText(signInput.value);
        });
        signInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') parseAndQueueText(signInput.value);
        });
    }

    // Camera preset hotkeys
    const cameraPresets = document.querySelectorAll('.cam-preset');
    cameraPresets.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (view === 'face') {
                camera.position.set(0, 1.45, 1.2);
                controls.target.set(0, 1.35, 0);
            } else if (view === 'hands') {
                camera.position.set(0, 0.95, 1.4);
                controls.target.set(0, 0.7, 0);
            } else if (view === 'profile') {
                camera.position.set(2.5, 1.2, 0);
                controls.target.set(0, 0.8, 0);
            } else {
                camera.position.set(0, 1.2, 3.8);
                controls.target.set(0, 0.8, 0);
            }
            controls.update();
        });
    });

    // Glossary tags
    const glossTags = document.querySelectorAll('.gloss-tag');
    glossTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const gloss = tag.dataset.gloss;
            if (signInput) signInput.value = gloss;
            parseAndQueueText(gloss);
        });
    });

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Engine Animation Frame Loop
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying && currentPoseStart && currentPoseTarget) {
        const now = performance.now();
        const elapsed = now - startTime;
        poseProgress = Math.min(1.0, elapsed / transitionDuration);

        // Update rig matrices
        updateAvatarJoints(poseProgress);

        if (poseProgress >= 1.0) {
            // Proceed to next frame
            if (animationQueue.length > 0 && currentSequenceIndex < animationQueue.length - 1) {
                currentSequenceIndex++;
                currentPoseStart = getRigCurrentPose();
                currentPoseTarget = animationQueue[currentSequenceIndex];
                transitionDuration = (currentPoseTarget.duration || 400) / playbackSpeed;
                startTime = performance.now();
                poseProgress = 0;
            } else {
                // Done playing sequence
                isPlaying = false;
                animationQueue = [];
                currentSequenceIndex = -1;
                document.getElementById('play-btn').textContent = 'Play';
            }
        }
    }

    updatePathTrails();
    controls.update();
    renderer.render(scene, camera);
}

// Launch on Load
document.addEventListener('DOMContentLoaded', init);
