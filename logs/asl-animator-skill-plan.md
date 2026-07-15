# ASL Animator Skill Design

Create a new agent skill (`asl-animator`) that provides a comprehensive workflow and template guidelines for generating high-quality 3D animations of American Sign Language (ASL) gestures from a text specification.

## User Review Required

> [!IMPORTANT]
> The skill will define the standard architecture for all ASL 3D animations generated in this textbook. The resulting simulations will use a highly-refined humanoid character rig (including hands, fingers, head, and facial expressions) constructed dynamically via Three.js. This ensures all generated animations are completely self-contained, responsive, and run locally without requiring external heavy GLTF models or server-side API dependencies.

> [!TIP]
> The generated simulations will feature **path tracing** (visualizing the motion trail of the hands in 3D space) and **camera perspective presets** (Front, 45-degree angle, close-ups on hands or face) to improve the educational quality for students learning sign parameters (handshape, orientation, location, movement, and non-manual expressions).

## Open Questions

1. **Pose Dictionary Source**: Should the generated simulations contain a core built-in dictionary for conversational phrases and fingerspelling, or should they be generated as standalone widgets that only animate a single specific sign? 
   - *Proposal*: The skill will instruct the agent to build a general, modular engine that contains a fingerspelling parser (letters A-Z) and supports loading a vocabulary dictionary via JSON, enabling either standalone sign animations or multi-sign conversational viewers.
2. **Text-to-Sign Input**: Do we want students to be able to type custom text in a search input and see the avatar translate/fingerspell it in real-time?
   - *Proposal*: Yes, adding a text-to-sign input in the UI enhances interactivity. The engine will parse the text, play matching signs from the vocabulary dictionary, and fall back to fingerspelling any unrecognized words letter-by-letter.

## Proposed Changes

### Customization Skills

#### [NEW] [SKILL.md](file:///Users/dan/Documents/ws/asl-book/.agents/skills/asl-animator/SKILL.md)
This file will contain the frontmatter and the detailed markdown instructions instructing the agent on:
- How to structure the 3D character rig (head, neck, body, arms, hands, fingers).
- How to represent pose frames, transitions, and expressions using JSON.
- The standard user interface components (playback timeline, speed controls, camera presets, path tracing, mirror mode, vocabulary list, and search input).
- Step-by-step instructions on implementing, styling, and validating the output simulation.

#### [NEW] [avatar-rig-template.js](file:///Users/dan/Documents/ws/asl-book/.agents/skills/asl-animator/examples/avatar-rig-template.js)
A reference implementation file containing the core Three.js rigging code, animation loop, slerp/lerp transition logic, and path-tracing system. This code acts as a reusable blueprint that the agent can read when generating new ASL animations.

## Verification Plan

### Manual Verification
- We will verify that the new skill is discovered by the Antigravity agent system.
- We will perform a dry-run test by asking the agent (or a subagent) to generate an interactive ASL simulation based on the instructions in the new skill, and verify that the output conforms to all design guidelines (visual appeal, controls layout, smooth animation transitions).
