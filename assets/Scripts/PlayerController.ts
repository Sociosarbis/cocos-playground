
import { _decorator, Component, Node, systemEvent, SystemEvent, EventMouse, Vec3, Animation, SkeletalAnimation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    // [1]
    private _startJump = false
    private _jumpStep = 0
    private _jumpTime = 0.6
    private _curJumpTime = 0
    private _curJumpSpeed = 0
    private _curPos = new Vec3()
    private _deltaPos = new Vec3()
    private _targetPos = new Vec3()
    private _isMoving = false
    private _curMoveIndex = 0

    // [2]
    // @property
    @property({ type: Animation })
    BodyAnim: Animation | null = null

    @property({ type: SkeletalAnimation })
    CocosAnim: SkeletalAnimation | null = null

    start () {}

    reset() {
        this._curMoveIndex = 0
    }

    setInputActive(active: boolean) {
        if (active) {
            systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this)
        } else {
            systemEvent.off(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this)
        }
    }

    onMouseUp(event: EventMouse) {
        switch (event.getButton()) {
            case 0:
                this.jumpByStep(1)
                break
            case 2:
                this.jumpByStep(2)
                break
            default:
        }
    }

    jumpByStep(step: number) {
        if (this._isMoving) return
        this._startJump = true
        this._jumpStep = step
        this._curJumpTime = 0
        this._curJumpSpeed = this._jumpStep / this._jumpTime
        this.node.getPosition(this._curPos)
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0))
        this._isMoving = true
        if (this.CocosAnim) {
            this.CocosAnim.getState('cocos_anim_jump').speed = 2
            this.CocosAnim.play('cocos_anim_jump')
            this.CocosAnim.once(Animation.EventType.FINISHED, this.onOnceJumpEnd, this)
        }
        if (this.BodyAnim) {
            switch (step) {
                case 2:
                    this.BodyAnim.play('twoStep')
            }
        }
        this._curMoveIndex += step
    }

    onOnceJumpEnd() {
        this._isMoving = false
        if (this.CocosAnim) {
            this.CocosAnim.play('cocos_anim_idle')
        }
        this.node.emit('JumpEnd', this._curMoveIndex)
    }

    update(deltaTime: number) {
        if (this._startJump) {
            this._curJumpTime += deltaTime
            if (this._curJumpTime > this._jumpTime) {
                this.node.setPosition(this._targetPos)
                this._startJump = false
            } else {
                this.node.getPosition(this._curPos)
                this._deltaPos.x = this._curJumpSpeed * deltaTime
                Vec3.add(this._curPos, this._curPos, this._deltaPos)
                this.node.setPosition(this._curPos)
            }
        }
    }
    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
