import * as RE from 'rogue-engine';
import * as THREE from 'three';
import RapierBody, { RapierCollisionInfo } from '@RE/RogueEngine/rogue-rapier/Components/RapierBody.re';
import RapierBall from '@RE/RogueEngine/rogue-rapier/Components/Colliders/RapierBall.re';

@RE.registerComponent
export default class Ball extends RE.Component {
  /* Since Rapier is loaded as a WASM module, we need to do a few things to ensure
     it is loaded before the ball component is initialized. */
  @RapierBody.require() private _rapierBody: RapierBody;
  @RapierBall.require() private _rapierCollider: RapierBall;

  // Whether the ball component has been initialized.
  initialized = false;

  get rapierBody() {
    if (!this._rapierBody) {
      this._rapierBody = RE.getComponent(RapierBody, this.object3d) as RapierBody;
    }
    return this._rapierBody;
  }

  get rapierCollider() {
    if (!this._rapierCollider) {
      this._rapierCollider = RE.getComponent(RapierBall, this.object3d) as RapierBall;
    }
    return this._rapierCollider;
  }

  /* Initialize the ball component.
     We use this instead of start because we need to ensure Rapier is loaded first. */
  init() {
    this.rapierBody.onCollisionStart = (info) => this.onCollisionStart(info);
    this.rapierBody.body.setLinvel(new THREE.Vector3(1,5,0), true);
    // Disable damping to prevent the ball from slowing down over time.
    this.rapierBody.body.setLinearDamping(0);
    this.rapierBody.body.setAngularDamping(0);
    // Set the restitution and friction of the ball to ensure it continues to move.
    this.rapierCollider.collider.setRestitution(1);
    this.rapierCollider.collider.setFriction(0);
    // Set the ball component as initialized.
    this.initialized = true;
  }

  update() {
    /* If Rapier is loaded and the ball component is not initialized, initialize it. */
    if ((this.rapierBody.initialized && this.rapierCollider.initialized) && !this.initialized) {
      this.init();
    }
  }

  onCollisionStart(info: RapierCollisionInfo) {
    let otherBodyObject3D = info.otherBody.object3d;
    let otherBodyName = otherBodyObject3D.name;
    
    RE.Debug.log(`[${this.object3d.name}] collided with ${otherBodyName}`);
  }
}
