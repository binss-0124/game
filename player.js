import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/GLTFLoader.js';

export const player = (() => {
    class Player {
        constructor(params) {
            this.position_ = new THREE.Vector3(0, 0, 0);
            this.velocity_ = new THREE.Vector3(0, 0, 0);
            this.speed_ = 5;
            this.params_ = params;
            this.mesh_ = null;
            this.mixer_ = null;
            this.animations_ = {};
            this.currentAction_ = null;
            this.hp_ = 100;
            this.isDead_ = false;
            this.keys_ = {
                forward: false,
                backward: false,
                left: false,
                right: false,
                shift: false,
            };
            this.jumpPower_ = 12;
            this.gravity_ = -30;
            this.isJumping_ = false;
            this.velocityY_ = 0;
            this.jumpSpeed_ = 0.5;
            this.isRolling_ = false;
            this.rollDuration_ = 0.5;
            this.rollTimer_ = 0;
            this.rollSpeed_ = 18;
            this.rollDirection_ = new THREE.Vector3(0, 0, 0);
            this.rollCooldown_ = 1.0;
            this.rollCooldownTimer_ = 0;
            this.deathTimer_ = 0; // Timer for Death animation duration

            this.LoadModel_();
            this.InitInput_();
        }

        TakeDamage(amount) {
            if (this.isDead_) return;
            this.hp_ -= amount;
            if (this.hp_ <= 0) {
                this.hp_ = 0;
                this.isDead_ = true;
                this.deathTimer_ = 5.0; // 5초 유지
                this.SetAnimation_('Death');
            }
        }

        Revive() {
            this.hp_ = 100;
            this.isDead_ = false;
            this.deathTimer_ = 0;
            this.position_.set(0, 0, 0);
            this.velocity_.set(0, 0, 0);
            this.velocityY_ = 0;
            this.isJumping_ = false;
            this.isRolling_ = false;
            this.rollCooldownTimer_ = 0;
            this.SetAnimation_('Idle');
        }

        InitInput_() {
            window.addEventListener('keydown', (e) => this.OnKeyDown_(e), false);
            window.addEventListener('keyup', (e) => this.OnKeyUp_(e), false);
        }

        OnKeyDown_(event) {
            if (this.isDead_) return;
            switch (event.code) {
                case 'KeyW': this.keys_.forward = true; break;
                case 'KeyS': this.keys_.backward = true; break;
                case 'KeyA': this.keys_.left = true; break;
                case 'KeyD': this.keys_.right = true; break;
                case 'ShiftLeft':
                case 'ShiftRight': this.keys_.shift = true; break;
                case 'KeyK':
                    if (!this.isJumping_ && !this.isRolling_) {
                        this.isJumping_ = true;
                        this.velocityY_ = this.jumpPower_;
                        this.SetAnimation_('Jump');
                    }
                    break;
                case 'KeyL':
                    if (
                        !this.isJumping_ &&
                        !this.isRolling_ &&
                        this.animations_['Roll'] &&
                        this.rollCooldownTimer_ <= 0
                    ) {
                        this.isRolling_ = true;
                        this.rollTimer_ = this.rollDuration_;
                        const moveDir = new THREE.Vector3();
                        if (this.keys_.forward) moveDir.z -= 1;
                        if (this.keys_.backward) moveDir.z += 1;
                        if (this.keys_.left) moveDir.x -= 1;
                        if (this.keys_.right) moveDir.x += 1;
                        if (moveDir.lengthSq() === 0) {
                            this.mesh_.getWorldDirection(moveDir);
                            moveDir.y = 0;
                            moveDir.normalize();
                        } else {
                            moveDir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.lastRotationAngle_ || 0);
                        }
                        this.rollDirection_.copy(moveDir);
                        this.SetAnimation_('Roll');
                        this.rollCooldownTimer_ = this.rollCooldown_;
                    }
                    break;
                case 'ControlLeft':
                case 'ControlRight':
                    this.TakeDamage(10);
                    break;
            }
        }

        OnKeyUp_(event) {
            if (this.isDead_) return;
            switch (event.code) {
                case 'KeyW': this.keys_.forward = false; break;
                case 'KeyS': this.keys_.backward = false; break;
                case 'KeyA': this.keys_.left = false; break;
                case 'KeyD': this.keys_.right = false; break;
                case 'ShiftLeft':
                case 'ShiftRight': this.keys_.shift = false; break;
            }
        }

        LoadModel_() {
            const loader = new GLTFLoader();
            loader.setPath('./resources/char/glTF/');
            loader.load('Cow.gltf', (gltf) => {
                const model = gltf.scene;
                model.scale.setScalar(1);
                model.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
                this.mesh_ = model;
                this.params_.scene.add(model);
                model.traverse((c) => {
                    if (c.isMesh) {
                        c.castShadow = true;
                        c.receiveShadow = true;
                        if (c.material) {
                            c.material.color.offsetHSL(0, 0, 0.25);
                        }
                    }
                });
                this.mixer_ = new THREE.AnimationMixer(model);
                for (const clip of gltf.animations) {
                    this.animations_[clip.name] = this.mixer_.clipAction(clip);
                }
                this.SetAnimation_('Idle');
                console.log("Available animations:", Object.keys(this.animations_));
            }, undefined, (error) => {
                console.error("Error loading model:", error);
            });
        }

        SetAnimation_(name) {
            if (this.currentAction_ === this.animations_[name]) return;
            if (!this.animations_[name]) {
                console.warn(`Animation ${name} not found!`);
                return;
            }
            if (this.currentAction_) {
                this.currentAction_.fadeOut(0.3);
            }
            this.currentAction_ = this.animations_[name];
            this.currentAction_.reset().fadeIn(0.3).play();
            if (name === 'Jump') {
                this.currentAction_.setLoop(THREE.LoopOnce);
                this.currentAction_.clampWhenFinished = true;
                this.currentAction_.time = 0.25;
                this.currentAction_.timeScale = this.jumpSpeed_;
            } else if (name === 'Roll') {
                this.currentAction_.setLoop(THREE.LoopOnce);
                this.currentAction_.clampWhenFinished = true;
                this.currentAction_.time = 0.0;
                this.currentAction_.timeScale = 1.2;
            } else if (name === 'Death') {
                this.currentAction_.setLoop(THREE.LoopOnce);
                this.currentAction_.clampWhenFinished = true;
                this.currentAction_.time = 0.0;
                this.currentAction_.timeScale = 1.0;
            } else {
                this.currentAction_.timeScale = 1.0;
            }
        }

        Update(timeElapsed, rotationAngle = 0) {
            if (!this.mesh_) return;
            this.lastRotationAngle_ = rotationAngle;

            // Death 상태일 때 5초간 마지막 프레임 유지, 이후 Idle로 전환
            if (this.isDead_) {
                if (this.deathTimer_ > 0) {
                    this.deathTimer_ -= timeElapsed;
                    if (this.deathTimer_ <= 0) {
                        this.deathTimer_ = 0;
                        this.isDead_ = false;
                        this.SetAnimation_('Idle'); // 5초 뒤 Idle로 전환
                    }
                }
                if (this.mixer_) {
                    this.mixer_.update(timeElapsed);
                }
                return;
            }

            // Roll 쿨타임 관리
            if (this.rollCooldownTimer_ > 0) {
                this.rollCooldownTimer_ -= timeElapsed;
                if (this.rollCooldownTimer_ < 0) this.rollCooldownTimer_ = 0;
            }

            if (this.isRolling_) {
                this.rollTimer_ -= timeElapsed;
                const rollMove = this.rollDirection_.clone().multiplyScalar(this.rollSpeed_ * timeElapsed);
                this.position_.add(rollMove);
                if (this.rollTimer_ <= 0) {
                    this.isRolling_ = false;
                    const isMoving = this.keys_.forward || this.keys_.backward || this.keys_.left || this.keys_.right;
                    const isRunning = isMoving && this.keys_.shift;
                    if (isMoving) {
                        this.SetAnimation_(isRunning ? 'Run' : 'Walk');
                    } else {
                        this.SetAnimation_('Idle');
                    }
                }
            } else {
                const velocity = new THREE.Vector3();
                const forward = new THREE.Vector3(0, 0, -1);
                const right = new THREE.Vector3(1, 0, 0);
                if (this.keys_.forward) velocity.add(forward);
                if (this.keys_.backward) velocity.sub(forward);
                if (this.keys_.left) velocity.sub(right);
                if (this.keys_.right) velocity.add(right);
                velocity.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
                const isMoving = this.keys_.forward || this.keys_.backward || this.keys_.left || this.keys_.right;
                const isRunning = isMoving && this.keys_.shift;
                const moveSpeed = isRunning ? this.speed_ * 2 : this.speed_;
                velocity.normalize().multiplyScalar(moveSpeed * timeElapsed);
                this.position_.add(velocity);
                this.velocityY_ += this.gravity_ * timeElapsed;
                this.position_.y += this.velocityY_ * timeElapsed;
                if (this.position_.y <= 0) {
                    this.position_.y = 0;
                    this.velocityY_ = 0;
                    if (isMoving) {
                        this.SetAnimation_(isRunning ? 'Run' : 'Walk');
                    } else {
                        this.SetAnimation_('Idle');
                    }
                    this.isJumping_ = false;
                }
                if (this.position_.y > 0 && this.isJumping_) {
                    this.SetAnimation_('Jump');
                }
                if (velocity.length() > 0.01) {
                    const angle = Math.atan2(velocity.x, velocity.z);
                    const targetQuaternion = new THREE.Quaternion().setFromAxisAngle(
                        new THREE.Vector3(0, 1, 0), angle
                    );
                    this.mesh_.quaternion.slerp(targetQuaternion, 0.3);
                }
            }

            this.mesh_.position.copy(this.position_);
            if (this.mixer_) {
                this.mixer_.update(timeElapsed);
            }
        }
    }

    return {
        Player,
    };
})();
