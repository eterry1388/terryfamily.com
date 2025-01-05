import * as THREE from 'three';

export class Drone {
  constructor() {
    // Create drone 3D object
    this.mesh = this.createDroneMesh();

    // Physical properties
    this.mass = 1.2;                   // kg
    this.dragCoefficient = 0.02;       // Linear drag
    this.quadraticDragCoefficient = 0.005; // v^2 drag (optional)
    this.angularDrag = 0.04;           // Angular drag
    this.gravity = new THREE.Vector3(0, -59.62, 0); // Gravity (m/s^2)

    // Movement properties
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.angularVelocity = new THREE.Vector3(0, 0, 0);

    // Rate mode / Acro mode rotation speeds (radians per second at full stick)
    this.rotationRate = 4.0; // Higher = more aggressive flips/rolls

    // Thrust
    // This is the maximum upward force at full throttle (in Newtons).
    // For a 1.2 kg drone, ~20-25 N can be a decent range for a freestyle quad. Adjust to taste.
    this.maxThrust = 600.0;

    // Minimum throttle fraction at which motors idle
    // Helps keep the drone from free-falling if the throttle is near zero
    this.minThrottle = 0.0;
  }

  createDroneMesh() {
    // Basic box representing the drone body
    const geometry = new THREE.BoxGeometry(0.3, 0.1, 0.3);
    const material = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const body = new THREE.Mesh(geometry, material);

    body.castShadow = true;
    body.receiveShadow = true;

    return body;
  }

  updatePhysics(deltaTime, { throttle, yaw, pitch, roll }) {
    //--------------------------------------------------------------------------
    // 1) Process input for angular velocity (Rate/Acro Mode)
    //    Full-stick = ±this.rotationRate radians/sec
    //--------------------------------------------------------------------------
    const desiredAngularVelocity = new THREE.Vector3(
      pitch * this.rotationRate, // pitch  -> rotation around X
      yaw   * this.rotationRate, // yaw    -> rotation around Y
      roll  * this.rotationRate  // roll   -> rotation around Z
    );

    // Smoothly move angularVelocity toward desired input (simple approach)
    // For more realism, you could integrate torque & inertia, but this can suffice.
    this.angularVelocity.lerp(desiredAngularVelocity, 0.1);

    //--------------------------------------------------------------------------
    // 2) Apply angular drag - this helps the drone not spin forever
    //--------------------------------------------------------------------------
    this.angularVelocity.multiplyScalar(1 - this.angularDrag * deltaTime);

    //--------------------------------------------------------------------------
    // 3) Update drone’s orientation (rotation) from angular velocity
    //--------------------------------------------------------------------------
    // We rotate the mesh around its local axes:
    this.mesh.rotateX(this.angularVelocity.x * deltaTime);
    this.mesh.rotateY(this.angularVelocity.y * deltaTime);
    this.mesh.rotateZ(this.angularVelocity.z * deltaTime);

    //--------------------------------------------------------------------------
    // 4) Calculate net force on the drone
    //    * Thrust in drone’s local +Y direction
    //    * Gravity
    //    * Aerodynamic drag
    //--------------------------------------------------------------------------
    // 4a) Thrust
    // Ensure a minimum throttle so that props keep spinning (like real quads)
    const effectiveThrottle = Math.max(throttle, this.minThrottle);
    const thrustMagnitude = effectiveThrottle * this.maxThrust;
    const thrustDirection = new THREE.Vector3(0, 1, 0).applyQuaternion(this.mesh.quaternion);
    const thrust = thrustDirection.multiplyScalar(thrustMagnitude);

    // 4b) Gravity
    const gravityForce = this.gravity.clone().multiplyScalar(this.mass);

    // 4c) Basic linear drag (proportional to velocity)
    const linearDrag = this.velocity.clone().multiplyScalar(-this.dragCoefficient);

    // 4d) Optionally, a small quadratic drag (proportional to velocity^2)
    const velocitySquared = this.velocity.lengthSq();
    // We'll apply it in the opposite direction of velocity
    const quadraticDrag = this.velocity
      .clone()
      .normalize()
      .multiplyScalar(-this.quadraticDragCoefficient * velocitySquared);

    //--------------------------------------------------------------------------
    // 5) Sum up all forces
    //--------------------------------------------------------------------------
    const totalForce = new THREE.Vector3(0, 0, 0);
    totalForce.add(thrust);
    totalForce.add(gravityForce);
    totalForce.add(linearDrag);
    totalForce.add(quadraticDrag);

    //--------------------------------------------------------------------------
    // 6) Update velocity from net force (F = m*a, a = F/m)
    //--------------------------------------------------------------------------
    const acceleration = totalForce.clone().divideScalar(this.mass);
    this.velocity.add(acceleration.multiplyScalar(deltaTime));

    //--------------------------------------------------------------------------
    // 7) Update the drone’s position from velocity
    //--------------------------------------------------------------------------
    this.mesh.position.addScaledVector(this.velocity, deltaTime);

    //--------------------------------------------------------------------------
    // 8) Optional: Keep the drone above ground to avoid infinite fall
    //    Real sims might implement collisions, raycasting, etc.
    //--------------------------------------------------------------------------
    if (this.mesh.position.y < 0.1) {
      this.mesh.position.y = 0.1;
      // Zero out velocity to avoid sinking below ground
      if (this.velocity.y < 0) {
        this.velocity.y = 0;
      }
    }
  }
}
