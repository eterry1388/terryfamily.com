export class InputController {
  constructor() {
    this.throttle = 0;
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.calibrated = false;
  }

  update() {
    let gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = gamepads[0];

    if (gp) {
      if (!this.calibrated) {
        this.yawOffset = gp.axes[3];
        this.pitchOffset = gp.axes[1];
        this.rollOffset = gp.axes[0];
        this.calibrated = true;
      }

      this.throttle = (gp.axes[2] + 1) / 2;
      this.yaw = -(gp.axes[3] - this.yawOffset);
      this.pitch = -(gp.axes[1] - this.pitchOffset);
      this.roll = -(gp.axes[0] - this.rollOffset);
    }

    return {
      throttle: this.throttle,
      yaw: this.yaw,
      pitch: this.pitch,
      roll: this.roll
    };
  }
}
