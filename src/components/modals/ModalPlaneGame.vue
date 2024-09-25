<template>
    <BaseModal
        name="plane-game"
        @close="close"
        class="full-size light"
    >
        <template v-slot:content>
            <div class="game-container" :class="{ restriction: data.restriction }">
                <div class="game-box"></div>
                <div id="plane-game-box"></div>
                <Icon
                    icon="ship"
                    class="ship"
                    :style="{
                        left: data.shipX + 'px',
                        transform: `skew(0, ${ -4 * parseInt(shipCol - data.cols / 2) }deg)`,
                        filter: `drop-shadow(${parseInt(shipCol - data.cols / 2)}px 3px 2px var(--Color-primary-persian-blue))`
                    }"
                    @mousedown="onTouchStart"
                    @touchstart="onTouchStart"
                />
            </div>

            <span class="coins">
                <Icon icon="blood"/>
                <Counter :value="data.coins" />
            </span>
        </template>
    </BaseModal>
</template>

<script setup>
    import Button from '@/components/forms/Button.vue';
    import Counter from '@/components/forms/Counter.vue';
    import BaseModal from '@/components/modals/BaseModal.vue';
    import { Application, Assets, Sprite, Container, Graphics, MeshRope, Point, Texture, AnimatedSprite  } from 'pixi.js';

    import { mapMutations } from '@/map-state';
    import { onMounted, onBeforeUnmount, computed, reactive } from 'vue';

    const { closeModal, openModal } = mapMutations();

    const data = reactive({
        coins: 0,
        coinsPull: 97,
        gameSeconds: 30 * 1000,

        loading: true,
        app: null,
        coinSize: 33,
        colSize: 33,
        shipSize: 64,

        cols: 10,
        rows: 10,
        shipX: 5,

        memeDelay: parseInt(1.2 * (30 * 1000) / 97),
        shotDelay: 400,

        memeItems: [],
        memes: [],
        shotTexture: null,
        shots: [],
        cybertrucks: [],
        unicorns: []
    });

    // SHIP
    const shipCol = computed(() => {
        return !data.loading && data.app?.screen?.width ? Math.floor(data.cols * data.shipX / (data.app.screen.width || 1)) : 1;
    });

    const onTouchEnd = () => {
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('mousemove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('mouseup', onTouchEnd);
    }

    const min = data.colSize * 2;
    let max = min;

    const onTouchMove = (e) => {
        data.pageX = e.targetTouches?.length ? e.targetTouches[0].pageX : e.pageX;

        if (!data.touchTimeout) {
            data.touchTimeout = setTimeout(() => {
                data.shipX = Math.max(min, Math.min(data.pageX, max));
                data.touchTimeout = null;
            }, 20);
        }
    }

    const onTouchStart = (e) => {
        if (!data.app?.screen?.width) {
            return;
        }

        max = data.app.screen.width - data.colSize * 2;

        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('touchend', onTouchEnd);
        window.addEventListener('mousemove', onTouchMove);
        window.addEventListener('mouseup', onTouchEnd);
    }

    // MEME
    const addMeme = async () => {
        if (!data.app.stage) {
            return;
        }

        const item = data.memes[Math.min(parseInt(Math.random() * data.memes.length), data.memes.length - 1)];

        if (!item || !data.app.stage) {
            return;
        }

        if (!item.texture) {
            item.texture = await Assets.load(item.url);
        }

        const sprite = new Sprite(item.texture);

        const payload = {
            sprite,
            onShot: () => data.coins += 2
        }

        data.app.stage.addChild(payload.sprite);

        sprite.anchor.set(0.5);
        sprite.width = data.coinSize;
        sprite.height = data.coinSize;

        sprite.x = Math.min(
            data.app.screen.width - 2 * data.colSize - parseInt(data.colSize / 2) - 10, 
            Math.max(
                2 * data.colSize + parseInt(data.coinSize / 2) + 10,
                2 * data.colSize + parseInt(Math.random() * (data.app.screen.width - 4 * data.colSize))
            )
        );

        sprite.y = -parseInt(Math.random() * 200) - 100;

        payload.col = Math.floor(sprite.x / data.colSize);

        sprite.x = payload.col * data.colSize + data.colSize / 2;

        payload.dir = {
            y: +((Math.random() + 1.2).toFixed(1))
        };

        payload.rotate = Math.random() / 20;

        data.memeItems.push(payload);
    }

    const runMems = () => {
        if (!data.coinsPull) {
            return;
        }

        if (Math.random() < .08) {
            if (Math.random() >= .4) {
                addCybertruck();
            } else {
                addUni();
            }
        } else {
            data.coinsPull -= 1;
            addMeme();
        }

        data.memeTimeout = setTimeout(() => {
            runMems();
        }, parseInt(data.memeDelay));
    }

    // Shots
    const addShot = async () => {
        if (!data.app.stage) {
            return;
        }

        if (!data.shotTexture) {
            data.shotTexture = await Assets.load('/img/rune.webp');
        }

        const sprite = new Sprite(data.shotTexture);

        const payload = {
            sprite
        }

        data.app.stage.addChild(sprite);

        sprite.anchor.set(0.5);
        sprite.width = 12;
        sprite.height = 12;

        sprite.x = data.shipX;
        sprite.y = data.app.screen.height - 90;


        payload.dir = {
            y: -data.colSize / 2
        };
        payload.col = parseInt(data.shipX / data.colSize); 

        payload.rotate = Math.random() / 4;

        data.shots.push(payload);
    }

    const runShots = () => {
        if (data.shotInterval) {
            clearInterval(data.shotInterval);
        }
        data.shotInterval = setInterval(() => {
            addShot();
        }, data.shotDelay);
    }

    // Cybertruck
    const addCybertruck = async () => {
        if (!data.app.stage) {
            return;
        }

        if (data.cybertrucks?.length) {
            return;
        }

        const sprite = new Sprite(data.cyberTruckTexture);

        const payload = {
            sprite,
            lives: 8,
            type: 'cybertruck',
            onShot: () => {
                addBoom(sprite.x, sprite.y);
                if (window.navigator?.vibrate) {
                    window.navigator.vibrate(300);
                }
            }
        }

        data.app.stage.addChild(sprite);

        sprite.anchor.set(0.5);
        sprite.width = 120;
        sprite.height = 43;
        sprite.rotation = parseInt(Math.random() * 180) * (Math.PI / 180);

        sprite.x = 2 * data.colSize + parseInt(Math.random() * (data.app.screen.width - 4 * data.colSize));
        sprite.y = -100;

        const col = parseInt(sprite.x / data.colSize); 
        payload.cols = [col];
        for (let i = 1; i <= (sprite.width / data.colSize) / 2; i++) {
            payload.cols.unshift(col - i);
            payload.cols.push(col + i);
        }

        data.cybertrucks.push(payload);
    }

    const addBoom = async (x, y) => {
        if (!data.app.stage) {
            return;
        }

        const explosionTextures = [];
        let i;

        for (i = 0; i < 26; i++) {
            const texture = Texture.from(`Explosion_Sequence_A ${i + 1}.png`);

            explosionTextures.push(texture);
        }

        const explosion = new AnimatedSprite(explosionTextures);

        explosion.x = x;
        explosion.y = y;
        explosion.anchor.set(0.5);
        explosion.rotation = Math.random() * Math.PI;
        explosion.scale.set(0.75 + Math.random() * 0.5);
        explosion.gotoAndPlay(0);
        explosion.loop = false;
        explosion.onComplete = () => {
            data.app?.stage?.removeChild(explosion);
        }
        data.app.stage.addChild(explosion);
    }

    // Unicorn
    const addUni = async () => {
        if (!data.app.stage) {
            return;
        }

        if (data.unicorns?.length) {
            return;
        }

        const sprite = new Sprite(data.uniTexture);

        sprite.x = Math.random()  > .4 ? data.app.screen.width : 0;
        sprite.y = parseInt(Math.random() * data.app.screen.height);

        data.uniX = sprite.x;
        data.uniY = sprite.y;

        addUniTail();

        const payload = {
            sprite,
            type: 'unicorn',
            onShot: () => {
                data.restriction = true;

                setTimeout(() => {
                    data.restriction = false;
                }, 3000 + parseInt(Math.random() * 5000))
                if (window.navigator?.vibrate) {
                    window.navigator.vibrate(300);
                }
            }
        }

        payload.rotate = Math.random() / 10;
        payload.dir = {
            x: (sprite.x ? -1 : 1) * +((1.5 + Math.random() * 1).toFixed(1)),
            y: +((1.5 + Math.random() * 1).toFixed(1))
        };

        data.app.stage.addChild(sprite);

        sprite.anchor.set(0.5);
        sprite.width = 40;
        sprite.height = 30;
        sprite.rotation = Math.random();

        const col = parseInt(sprite.x / data.colSize); 
        payload.cols = [col];

        for (let i = 1; i <= 1 + (sprite.width / data.colSize) / 2; i++) {
            payload.cols.unshift(col - i);
            payload.cols.push(col + i);
        }

        data.unicorns.push(payload);

    }

    const addUniTail = async () => {
        if (!data.app.stage) {
            return;
        }

        const historyX = [];
        const historyY = [];
        const historySize = 30;
        const ropeSize = 100;
        const points = [];

        for (let i = 0; i < historySize; i++) {
            historyX.push(data.uniX);
            historyY.push(data.uniY);
        }

        for (let i = 0; i < ropeSize; i++) {
            points.push(new Point(0, 0));
        }

        const rope = new MeshRope({ texture: data.uniTailTexture, points });

        rope.blendmode = 'add';

        data.app.stage.addChild(rope);

        data.app.ticker.add(() => {
            historyX.pop();
            historyX.unshift(data.uniX);

            historyY.pop();
            historyY.unshift(data.uniY);

            for (let i = 0; i < ropeSize; i++) {
                const p = points[i];

                const ix = cubicInterpolation(historyX, (i / ropeSize) * historySize);
                const iy = cubicInterpolation(historyY, (i / ropeSize) * historySize);

                p.x = ix;
                p.y = iy;
            }
        });

        function clipInput(k, arr) {
            if (k < 0) {
                k = 0;
            }

            if (k > arr.length - 1) {
                k = arr.length - 1;
            }

            return arr[k];
        }

        function getTangent(k, factor, array) {
            return (factor * (clipInput(k + 1, array) - clipInput(k - 1, array))) / 2;
        }

        function cubicInterpolation(array, t, tangentFactor = 1) {
            const k = Math.floor(t);
            const m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
            const p = [clipInput(k, array), clipInput(k + 1, array)];

            t -= k;
            const t2 = t * t;
            const t3 = t * t2;

            return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
        }
    }

    // 
    const close = () => {
        closeModal({
            name: 'plane-game',
            data: data.coins
        });
    }

    const createPixi = async () => {
        data.app = new Application();

        await data.app.init({ backgroundAlpha: 0, resizeTo: window });

        document.getElementById('plane-game-box').appendChild(data.app.canvas);

        data.app.ticker.add((time) => {
            const map = {};

            // Обработаем мемы
            data.memeItems.forEach((item, id) => {
                item.sprite.y += item.dir.y;
                item.row = Math.floor(item.sprite.y / data.colSize);

                let exit = false;

                if (item.sprite.y >= data.app.screen.height + data.coinSize) {
                    exit = true;
                }

                item.sprite.rotation += item.rotate * time.deltaTime;

                if (exit) {
                    data.app.stage.removeChild(item.sprite);
                    data.memeItems.splice(id, 1);
                } else {
                    if (!map[item.row]) {
                        map[item.row] = {};
                    }
                    if (!map[item.row][item.col]) {
                        map[item.row][item.col] = [];
                    }
                    map[item.row][item.col].push(item);
                }
            });

            // Обработаем uni
            data.unicorns.forEach((item, id) => {
                item.sprite.x += item.dir.x;
                item.sprite.y += item.dir.y;
                item.row = Math.floor(item.sprite.y / data.colSize);

                const col = parseInt(item.sprite.x / data.colSize); 
                item.cols = [col];

                for (let i = 1; i <= 1 + (item.sprite.width / data.colSize) / 2; i++) {
                    item.cols.unshift(col - i);
                    item.cols.push(col + i);
                }

                data.uniX = item.sprite.x;
                data.uniY = item.sprite.y;

                if (item.sprite.y >= data.app.screen.height) {
                    item.dir.y *= -1;
                }
                if (item.sprite.y <= 0) {
                    item.dir.y *= -1;
                }
                if (item.sprite.x >= data.app.screen.width) {
                    item.dir.x *= -1;
                }
                if (item.sprite.x <= 0) {
                    item.dir.x *= -1;
                }

                item.sprite.rotation += item.rotate * time.deltaTime;

                if (!map[item.row]) {
                    map[item.row] = {};
                }

                item.cols.forEach(col => {
                    if (!map[item.row][col]) {
                        map[item.row][col] = [];
                    }

                    map[item.row][col].push(item);
                });
            });

            // Обработаем cybertruck
            data.cybertrucks.forEach((item, id) => {
                item.sprite.y += .4;
                item.row = Math.floor(item.sprite.y / data.colSize);

                let exit = false;

                if (item.sprite.y >= data.app.screen.height + data.coinSize) {
                    exit = true;
                }

                item.sprite.rotation += 0.001;

                if (exit) {
                    data.app.stage.removeChild(item.sprite);
                    data.cybertrucks.splice(id, 1);
                } else {
                    if (!map[item.row]) {
                        map[item.row] = {};
                    }

                    item.cols.forEach(col => {
                        if (!map[item.row][col]) {
                            map[item.row][col] = [];
                        }
                        map[item.row][col].push(item);
                    });
                }
            });

            const checkMap = (row, col) => {
                if (map[row] && map[row][col]?.length) {
                    map[row][col].forEach(meme => {
                        if (meme.disabled) {
                            return;
                        }

                        if (meme.lives) {
                            meme.lives -= 1;
                            if (window.navigator?.vibrate) {
                                window.navigator.vibrate(20);
                            }
                        } else {
                            meme.disabled = true;
                            if (meme.onShot) {
                                meme.onShot();
                            }

                            if (meme.type === 'unicorn') {
                                data.app.stage.removeChild(meme.sprite);
                                data.unicorns.splice(data.cybertrucks.indexOf(meme), 1);
                            }

                            if (meme.type === 'cybertruck') {
                                for (let r = meme.row - 10; r <= meme.row + 10; r++) {
                                    for (let c = meme.cols[0] - 10; c <= meme.cols[meme.cols.length - 1] + 10; c++) {
                                        checkMap(r, c);
                                    }
                                }

                                data.app.stage.removeChild(meme.sprite);
                                data.cybertrucks.splice(data.cybertrucks.indexOf(meme), 1);
                            } else {
                                data.app.stage.removeChild(meme.sprite);
                                data.memeItems.splice(data.memeItems.indexOf(meme), 1);
                            }
                        }
                    });
                }
            }

            // Обработаем пули
            data.shots.forEach((item, id) => {
                item.sprite.y += item.dir.y;

                let exit = false;

                if (item.sprite.y < -40) {
                    exit = true;
                }

                item.sprite.rotation += item.rotate * time.deltaTime;

                item.row = Math.floor(item.sprite.y / data.colSize);

                if (map[item.row] && map[item.row][item.col]) {
                    checkMap(item.row, item.col);
                    exit = true;
                }

                if (exit) {
                    data.app.stage.removeChild(item.sprite);
                    data.shots.splice(id, 1);
                }
            });

            if (!data.memeItems.length && !data.coinsPull) {
                close();
            } 
        });

        // Определим количество колонок
        data.cols = parseInt(data.app.screen.width / data.colSize);
        if (!data.cols % 2) {
            data.cols -= 1;
        }

        // Определим количество строк
        data.rows = parseInt(data.app.screen.height / data.colSize);
        // Определим начальное положение корабля
        data.shipX = parseInt(data.app.screen.width / 2);
    }

    onMounted(async () => {
        openModal('loader');
        await Assets.load('/img/boom.json');
        data.cyberTruckTexture = await Assets.load('/img/cybertruck.png');
        data.boomTexture = await Assets.load('/img/boom.json');
        data.uniTexture = await Assets.load('/img/unicorn.png');
        data.uniTailTexture = await Assets.load('/img/unitail_small.png');
        data.tailTexture = await Assets.load('/img/trail.png');

        for (let i = 1; i <= 36; i++) {
            data.memes.push({
                url: `/img/memes/${i}.png`
            });
        }
        await createPixi();

        data.loading = false;

        setTimeout(() => {
            closeModal('loader');
            runMems();
            runShots();
        }, 500);
    });

    onBeforeUnmount(() => {
        onTouchEnd();

        if (data.shotInterval) {
            clearInterval(data.shotInterval);
        }

        if (data.memeTimeout) {
            clearTimeout(data.memeTimeout);
        }

        if (data.app?.destroy) {
            data.app.destroy();
        }
    })
</script>

<style lang="scss" scoped>
    .game-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex: 1 1 100%;
        flex-direction: column;
        transform: scaleY(1);
        animation-name: game-box-restriction-out;
        animation-duration: .2s;
        animation-timing-function: linear;
        filter: hue-rotate(0);
        overflow: hidden;

        &.restriction {
            filter: hue-rotate(120deg);
            transform: scaleY(-1);
            animation: game-box-restriction-in .2s, game-box-restriction-hue 2s infinite;
        }

        @keyframes game-box-restriction-hue {
            0% {
                filter: hue-rotate(0deg);
            }
            100% { 
                filter: hue-rotate(360deg);
            }
        }

        @keyframes game-box-restriction-in {
            0% {
                transform: scaleY(1);
                filter: hue-rotate(0deg);
            }
            100% { 
                transform: scaleY(-1);
                filter: hue-rotate(120deg);
            }
        }

        @keyframes game-box-restriction-out {
            0% {
                transform: scaleY(-1);
                filter: hue-rotate(120deg);
            }
            100% { 
                transform: scaleY(1);
                filter: hue-rotate(0deg);
            }
        }
    }

    #plane-game-box {
        width: 100%;
        height: 100%;
        display: flex;
        flex: 1 1 100%;
        flex-direction: column;
        position: fixed;
        left: 0;
        top: 0;
        pointer-events: none;
    }

    .coins {
        position: absolute;
        right: 10px;
        top: 10px;
        @include font-h2;
        color: $white;
        display: flex;
        align-items: center;
        gap: 8px;
        height: 32px;
        pointer-events: none;
        user-select: none;
        svg {
            width: 18px;
            height: 18px;
            fill: $off-red;
        }
    }

    .game-box {
        pointer-events: none;
        &:before {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;

            background: linear-gradient(-45deg, rgba(255, 255, 255, 0) 48%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 52%), linear-gradient(45deg, rgba(255, 255, 255, 0) 48%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 52%);

            background-size: 24px 24px;
            background-color: transparent;
            // animation-name: game-box-2;
            // animation-duration: 20s;
            // animation-timing-function: linear;
            // animation-iteration-count: infinite;

            // @keyframes game-box-2 {
            //     0% {
            //         background-position-y: 0%;
            //     }
            //     100% { 
            //         background-position-y: 100%;
            //     }
            // }
        }
    }

    .game-box {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        flex: 1 1 100%;
        flex-direction: column;
        background: url(/img/jpthor.png);
        background-repeat: no-repeat;
        background-position: center;
        background-size: 300%;
        filter: blur(3px);
        opacity: .4;
        background-size: 250px;
        // animation-name: jpthor-bg;
        // animation-duration: 60s;
        // animation-timing-function: linear;
    }

    @keyframes jpthor-bg {
        0% {
            background-size: 10%;
        }
        100% { 
            background-size: 300%;
        }
    }

    .ship {
        width: 64px;
        height: 64px;
        position: fixed;
        bottom: 20px;
        margin-left: -32px;
    }
</style>
