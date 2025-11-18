# TODO: Future Development Tasks

## Traffic Light Scene - Car Simulation

### Overview
The Traffic Light Scene (`TrafficLightScene.tsx`) currently has placeholder spaces reserved for future car animations. This document outlines the work needed to implement a complete car simulation system that interacts with the traffic light states.

### Current Implementation Status
- ✅ Two independent traffic lights (North-South and East-West)
- ✅ Synchronized safe crossroad logic (example 14)
- ✅ SVG crossroad visualization with roads and crosswalks
- ✅ Reserved placeholder spaces for cars (dashed rectangles in SVG)
  - North-bound car placeholder: `x="245" y="100" width="45" height="80"`
  - West-bound car placeholder: `x="450" y="265" width="80" height="45"`

### Tasks to Implement

#### 1. Car Component Design
- [ ] Design SVG car graphics (simple top-down view)
- [ ] Create different car types/colors for visual variety
- [ ] Implement car rotation for different directions (N, S, E, W)
- [ ] Add turn signals/brake lights if needed

#### 2. Car Movement System
- [ ] Implement smooth animation along road paths
- [ ] Define entry/exit points for each direction:
  - North → South
  - South → North
  - East → West
  - West → East
- [ ] Calculate proper speeds and acceleration
- [ ] Handle car positioning relative to traffic lights

#### 3. Traffic Light Integration
- [ ] Cars must stop at red lights
- [ ] Cars must proceed on green lights
- [ ] Cars must prepare to stop on yellow lights
- [ ] Define stopping positions before the intersection
- [ ] Implement queue system for multiple cars waiting

#### 4. Collision Detection & Prevention
- [ ] Prevent cars from entering intersection when light is red
- [ ] Ensure only one direction flows through intersection at a time
- [ ] Implement safety spacing between cars
- [ ] Handle edge cases:
  - Car already in intersection when light changes
  - Multiple cars queued at same light
  - Cars turning at intersection

#### 5. Crossroad Logic Validation
- [ ] Test with example 13 (independent lights)
- [ ] Test with example 14 (safe synchronized lights - **recommended**)
- [ ] Verify no collision scenarios are possible
- [ ] Validate that safety periods (both red) work correctly

#### 6. Advanced Features (Optional)
- [ ] Add pedestrian crossing simulation
- [ ] Implement turn lanes (left/right turns)
- [ ] Add car spawn/despawn logic
- [ ] Create randomized traffic flow
- [ ] Add traffic density controls
- [ ] Implement emergency vehicle priority

### Technical Considerations

#### Performance
- Use CSS transforms for smooth 60fps animations
- Consider using `requestAnimationFrame` for movement updates
- Optimize SVG rendering for multiple cars
- Implement object pooling if many cars are spawned

#### State Management
- Track car positions, velocities, and states
- Integrate with existing PLC state context
- Consider separate car state reducer if complexity grows
- Maintain synchronization with PLC scan cycle

#### File Structure
```
webConversion/src/components/TrafficLightScene/
├── TrafficLightScene.tsx          (existing - main component)
├── TrafficLightScene.css          (existing - styling)
├── Car.tsx                        (new - car component)
├── CarAnimator.ts                 (new - movement logic)
└── carPaths.ts                    (new - path definitions)
```

### References
- Example 14: `webConversion/public/examples/14_traffic_light_safe_crossroad.txt`
  - Uses synchronized timing with safety periods
  - Prevents collision scenarios
  - **Best example to use for car simulation testing**
- Traffic Light Scene: `webConversion/src/components/TrafficLightScene/TrafficLightScene.tsx`
- PLC State Context: `webConversion/src/context/PLCStateContext.tsx`

### Priority
**Medium** - This is an enhancement for visual demonstration and educational purposes. Core traffic light logic is already functional.

### Notes
- The safe crossroad example (14) was specifically designed with collision prevention in mind
- Both lights show red during transitions to ensure safety
- Car simulation should validate that the PLC logic prevents accidents
- Consider this as a visual proof-of-concept for PLC safety programming

---

**Last Updated**: 2025-11-13
**Status**: Planning phase - awaiting implementation
