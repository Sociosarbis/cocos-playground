
import { _decorator, Component, Node, Prefab, CCInteger, instantiate, Vec3, Label } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

enum BlockType {
    BT_NONE,
    BT_STONE
}

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END
}

@ccclass('GameManager')
export class GameManager extends Component {
    // [1]
    
    private _road: BlockType[] = []
    private _curState = GameState.GS_INIT

    // [2]
    // @property
    @property({ type: Prefab })
    cubePrfb: Prefab | null = null;

    @property({ type: CCInteger })
    roadLength: Number = 50

    @property({ type: PlayerController })
    playerCtrl: PlayerController | null = null

    @property({ type: Node })
    startMenu: Node | null = null;

    @property({ type: Label })
    stepsLabel: Label | null = null

    start () {
        this.curState = GameState.GS_INIT
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this)
    }

    init() {
        if (this.startMenu) {
            this.startMenu.active = true
        }
        this.generateRoad()
        if (this.playerCtrl) {
            this.playerCtrl.reset()
            this.playerCtrl.setInputActive(false)
            this.playerCtrl.node.setPosition(Vec3.ZERO)
        }
    }

    set curState(value: GameState) {
        switch(value) {
            case GameState.GS_INIT:
                this.init()
                break
            case GameState.GS_PLAYING:
                if (this.startMenu) {
                    this.startMenu.active = false
                }

                if (this.stepsLabel) {
                    this.stepsLabel.string = '0'
                }
                
                setTimeout(() => {
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true)
                    }
                }, 0.1)
                break
            default:
        }
        this._curState = value
    }

    onStartButtonClicked() {
        this.curState = GameState.GS_PLAYING
    }

    generateRoad() {
        this.node.removeAllChildren()
        this._road.length = 0
        this._road.push(BlockType.BT_STONE)

        for (let i = 1;i < this.roadLength;i++) {
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE)
            } else {
                this._road.push(Math.floor(Math.random() * 2))
            }
        }

        for (let j = 0;j < this._road.length;j++) {
            const block = this.spawnBlockByType(this._road[j])
            if (block) {
                this.node.addChild(block)
                block.setPosition(j, -1.5, 0)
            }
        }
    }

    spawnBlockByType(type: BlockType) {
        if (!this.cubePrfb) return null
        return type === BlockType.BT_STONE ? instantiate(this.cubePrfb) : null
    }

    checkResult(moveIndex: number) {
        if (moveIndex <= this.roadLength) {
            if (this._road[moveIndex] === BlockType.BT_NONE) {
                this.curState = GameState.GS_INIT
            }
        } else {
            this.curState = GameState.GS_END
        }
    }

    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepsLabel) {
            this.stepsLabel.string = `${moveIndex}`
        }
        this.checkResult(moveIndex)
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
