import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

export const hp = (() => {

    class HPUI {
        constructor() {
            this.hpBarContainer = document.createElement('div');
            this.hpBarContainer.style.position = 'absolute';
            this.hpBarContainer.style.right = '30px';
            this.hpBarContainer.style.bottom = '30px';
            this.hpBarContainer.style.zIndex = '200';
            this.hpBarContainer.style.display = 'flex';
            this.hpBarContainer.style.flexDirection = 'row';
            this.hpBarContainer.style.alignItems = 'center';
            this.hpBarContainer.style.background = '#235280';
            this.hpBarContainer.style.borderRadius = '12px';
            this.hpBarContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18), 0 0px 8px #2228';
            this.hpBarContainer.style.padding = '6px 16px 6px 6px';
            this.hpBarContainer.style.height = '60px';
            this.hpBarContainer.style.minWidth = '320px';

            this.hpProfile = document.createElement('img');
            this.hpProfile.src = '';
            this.hpProfile.style.width = '48px';
            this.hpProfile.style.height = '48px';
            this.hpProfile.style.borderRadius = '50%';
            this.hpProfile.style.border = '2.5px solid #fff';
            this.hpProfile.style.background = '#222';
            this.hpProfile.style.objectFit = 'cover';
            this.hpProfile.style.marginRight = '12px';
            this.hpProfile.style.boxShadow = '0 1px 4px #0008';

            this.hpBarBg = document.createElement('div');
            this.hpBarBg.style.position = 'relative';
            this.hpBarBg.style.width = '170px';
            this.hpBarBg.style.height = '20px';
            this.hpBarBg.style.background = '#1a2a1a';
            this.hpBarBg.style.border = '2px solid #444';
            this.hpBarBg.style.borderRadius = '10px';
            this.hpBarBg.style.overflow = 'hidden';
            this.hpBarBg.style.marginRight = '12px';

            this.hpBarFill = document.createElement('div');
            this.hpBarFill.style.height = '100%';
            this.hpBarFill.style.width = '100%';
            this.hpBarFill.style.background = 'linear-gradient(90deg, #e22 70%, #f88 100%)';
            this.hpBarFill.style.transition = 'width 0.25s';

            this.hpBarBg.appendChild(this.hpBarFill);

            this.hpName = document.createElement('div');
            this.hpName.innerText = '김기찬';
            this.hpName.style.color = '#bfe8ff';
            this.hpName.style.fontWeight = 'bold';
            this.hpName.style.fontSize = '17px';
            this.hpName.style.textShadow = '1px 1px 3px #222c';
            this.hpName.style.letterSpacing = '1px';
            this.hpName.style.marginBottom = '2px';

            this.hpTextBarWrapper = document.createElement('div');
            this.hpTextBarWrapper.style.display = 'flex';
            this.hpTextBarWrapper.style.flexDirection = 'column';
            this.hpTextBarWrapper.style.justifyContent = 'center';

            this.hpTextBarWrapper.appendChild(this.hpName);
            this.hpTextBarWrapper.appendChild(this.hpBarBg);

            this.hpBarContainer.appendChild(this.hpProfile);
            this.hpBarContainer.appendChild(this.hpTextBarWrapper);
            document.body.appendChild(this.hpBarContainer);

            this.player = null;
            this.isDead = false;
            this.deathTimer = null;
            this._ctrlPressed = false;

            window.addEventListener('keydown', (e) => {
                if ((e.code === 'ControlLeft' || e.code === 'ControlRight') && !this._ctrlPressed && !this.isDead) {
                    this._ctrlPressed = true;
                    if (this.player && typeof this.player.TakeDamage === 'function') {
                        this.player.TakeDamage(10);
                    }
                }
            });

            window.addEventListener('keyup', (e) => {
                if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
                    this._ctrlPressed = false;
                }
            });
        }

        setPlayer(player) {
            this.player = player;
        }

        updateHP(hp) {
            const maxHp = 100;
            const percent = Math.max(0, Math.min(1, hp / maxHp));
            this.hpBarFill.style.width = (percent * 100) + '%';

            if (this.player && hp <= 0 && !this.isDead) {
                this.isDead = true;
                this.playDeathMotion();
                this.deathTimer = setTimeout(() => {
                    this.playIdleMotion();
                    this.player.Revive();
                    this.isDead = false;
                }, 5000);
            }
        }

        playDeathMotion() {
            if (!this.player || !this.player.mixer_ || !this.player.animations_) return;
            const deathAction = this.player.animations_['Death'];
            if (deathAction && this.player.currentAction_ !== deathAction) {
                if (this.player.currentAction_) {
                    this.player.currentAction_.fadeOut(0.3);
                }
                this.player.currentAction_ = deathAction;
                deathAction.setLoop(THREE.LoopOnce, 1);
                deathAction.clampWhenFinished = true;
                this.player.currentAction_.reset().fadeIn(0.3).play();
            }
        }

        playIdleMotion() {
            if (!this.player || !this.player.mixer_ || !this.player.animations_) return;
            const idleAction = this.player.animations_['Idle'];
            if (idleAction && this.player.currentAction_ !== idleAction) {
                if (this.player.currentAction_) {
                    this.player.currentAction_.fadeOut(0.3);
                }
                this.player.currentAction_ = idleAction;
                this.player.currentAction_.reset().fadeIn(0.3).play();
            }
        }

        renderCharacterFaceToProfile(mesh, scene, renderer) {
            const size = 128;
            const renderTarget = new THREE.WebGLRenderTarget(size, size);

            mesh.updateMatrixWorld(true);
            const facePos = new THREE.Vector3(0, 1.7, 1.5);
            const worldFacePos = mesh.localToWorld(facePos.clone());
            const cameraPos = mesh.localToWorld(new THREE.Vector3(0, 1.7, 0.9));
            const faceCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
            faceCamera.position.copy(cameraPos);
            faceCamera.lookAt(worldFacePos);

            renderer.setRenderTarget(renderTarget);
            renderer.render(scene, faceCamera);
            renderer.setRenderTarget(null);

            const buffer = new Uint8Array(size * size * 4);
            renderer.readRenderTargetPixels(renderTarget, 0, 0, size, size, buffer);

            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const imageData = ctx.createImageData(size, size);
            imageData.data.set(buffer);
            ctx.putImageData(imageData, 0, 0);

            const dataURL = canvas.toDataURL();
            this.hpProfile.src = dataURL;

            renderTarget.dispose();
        }
    }

    return { HPUI };
})();