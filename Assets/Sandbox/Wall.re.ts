import * as RE from 'rogue-engine';
import * as THREE from 'three';
import RapierBody, { RapierCollisionInfo } from '@RE/RogueEngine/rogue-rapier/Components/RapierBody.re';
import RapierCuboidCollider from '@RE/RogueEngine/rogue-rapier/Components/Colliders/RapierCuboid.re';

@RE.registerComponent
export default class Wall extends RE.Component {
  /* Since Rapier is loaded as a WASM module, we need to do a few things to ensure  
     it is loaded before the wall component is initialized. */
  @RapierBody.require() private _rapierBody: RapierBody;
  @RapierCuboidCollider.require() private _rapierCollider: RapierCuboidCollider;

  // Whether the wall component has been initialized.
  initialized = false;

  get rapierBody() {
    if (!this._rapierBody) {
      this._rapierBody = RE.getComponent(RapierBody, this.object3d) as RapierBody;
    }
    return this._rapierBody;
  }

  get rapierCollider() {
    if (!this._rapierCollider) {
      this._rapierCollider = RE.getComponent(RapierCuboidCollider, this.object3d) as RapierCuboidCollider;
    }
    return this._rapierCollider;
  }

  /* Initialize the wall component.
     We use this instead of start because we need to ensure Rapier is loaded first. */
  init() {
    this.rapierBody.onCollisionStart = (info) => this.onCollisionStart(info);
    // Set the restitution and friction of the wall to ensure it allows the ball to continue moving.
    this.rapierCollider.collider.setRestitution(1);
    this.rapierCollider.collider.setFriction(0);
    // Set the wall component as initialized.
    this.initialized = true;
  }

  update() {
    /* If Rapier is loaded and the wall component is not initialized, initialize it. */
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
