import * as RE from 'rogue-engine';
import * as THREE from 'three';
import RapierBody, { RapierCollisionInfo } from '@RE/RogueEngine/rogue-rapier/Components/RapierBody.re';
import RapierCuboidCollider from '@RE/RogueEngine/rogue-rapier/Components/Colliders/RapierCuboid.re';

@RE.registerComponent
export default class Block extends RE.Component {
  @RE.props.num() points = 1;
  /* Since Rapier is loaded as a WASM module, we need to do a few things to ensure
     it is loaded before the block component is initialized. */
  @RapierBody.require() rapierBody: RapierBody;
  @RapierCuboidCollider.require() rapierCollider: RapierCuboidCollider;

  // Whether the block component has been initialized.
  initialized = false;

  init() {
    this.rapierBody.onCollisionStart = (info) => this.onCollisionStart(info);
    this.rapierBody.onCollisionEnd = (info) => this.onCollisionEnd(info);
    // Set the restitution and friction of the block to ensure it allows the ball to continue moving.
    this.rapierCollider.collider.setRestitution(1);
    this.rapierCollider.collider.setFriction(0);
    // Set the block component as initialized.
    this.initialized = true;
  }

  update() {
    /* If Rapier is loaded and the block component is not initialized, initialize it. */
    if ((this.rapierBody.initialized && this.rapierCollider.initialized) && !this.initialized) {
      this.init();
    }
  }

  onCollisionStart(info: RapierCollisionInfo) {
    let otherBodyObject3D = info.otherBody.object3d;
    let otherBodyName = otherBodyObject3D.name;

    RE.Debug.log(`[${this.object3d.name}] collided with ${otherBodyName}`);
  }

  onCollisionEnd(info: RapierCollisionInfo) {
    // Remove the block from the scene only after the collision has ended.
    this.object3d.parent?.remove(this.object3d);
  }
}
