<template>
    <div id="pixi-box"></div>
</template>

<script setup>
import { Application, Assets, Sprite  } from 'pixi.js';
import { onMounted, onBeforeMount, reactive } from 'vue';
import { mapMutations } from '@/map-state';

import { delay } from '@/utils/utils';

const emit = defineEmits(['ready']);
const { setPixiClaim, setEnableBG, setDisableBG } = mapMutations();

const data = reactive({
    bgApp: null,
    claimApp: null,

    bgTextures: [
        {
            code: 'line',
            url: `/img/bg/line.svg`,
            width: 52,
            height: 5
        }, {
            code: 'trash-1',
            url: `/img/bg/trash-1.svg`,
            width: 25,
            height: 8
        }, {
            code: 'trash-2',
            url: `/img/bg/trash-2.svg`,
            width: 29,
            height: 53
        }
    ],
    claimTextures: [
        {
            code: 'logo',
            url: `/img/thorchain-logo.svg`,
            width: 38,
            height: 38
        }
    ],
    bgItems: [],
    claimItems: []
});

const addBgTexture = async (item) => {
    const payload = {
        sprite: new Sprite(item.texture)
    }

    data.bgApp.stage.addChild(payload.sprite);
    payload.sprite.anchor.set(0.5);

    const scale = (.5 + Math.random() * 1);

    if (item.width) {
        payload.sprite.width = parseInt(item.width * scale);
    }

    if (item.height) {
        payload.sprite.height = parseInt(item.height * scale);
    }

    payload.sprite.x = parseInt(Math.random() * data.bgApp.screen.width);
    payload.sprite.y = parseInt(Math.random() * data.bgApp.screen.height);

    payload.dir = {
        x: +(((Math.random() > .4 ? 1 : -1) * (Math.random() + .2)).toFixed(1)),
        y: +(((Math.random() > .4 ? 1 : -1) * (Math.random() + .2)).toFixed(1))
    };

    payload.rotate = Math.random() / 20;

    data.bgItems.push(payload);
}

const addClaimTexture = async ({ item, x, y }) => {
    const payload = {
        sprite: new Sprite(item.texture)
    }

    data.claimApp.stage.addChild(payload.sprite);
    payload.sprite.anchor.set(0.5);

    const scale = (.1 + Math.random() * .6);

    if (item.width) {
        payload.sprite.width = parseInt(item.width * scale);
    }

    if (item.height) {
        payload.sprite.height = parseInt(item.height * scale);
    }

    payload.sprite.x = x || parseInt(.5 * data.claimApp.screen.width);
    payload.sprite.y = y || parseInt(.5 * data.claimApp.screen.height);

    payload.dir = {
        x: +(((Math.random() > .4 ? 1 : -1) * (Math.random() * 8)).toFixed(1)),
        y: +(((Math.random() > .4 ? 1 : -1) * (Math.random() * 8)).toFixed(1))
    };

    payload.rotate = Math.random() / 4;

    data.claimItems.push(payload);
}

const enableBG = async () => {
    if (!data.bgApp) {
        await createBG();
    }
    data.bgTextures.forEach(item => {
        addBgTexture(item);   
        addBgTexture(item);   

        if (item.code === 'line') {
            for (let i = 0; i < 5; i++) {
                addBgTexture(item);
            }
        }

        if (item.code === 'trash-1') {
            for (let i = 0; i < 5; i++) {
                addBgTexture(item);
            }
        }

        if (item.code === 'trash-2') {
            for (let i = 0; i < 10; i++) {
                addBgTexture(item);
            }
        }   
    });
}

const disableBG = async () => {
    if (data.bgApp) {
        data.bgApp.canvas.style.display = 'none';
        data.bgApp.canvas.remove();

        setTimeout(() => {
            data.bgApp.destroy();
            data.bgApp = null;
            document.getElementById('pixi-bg').remove();
        }, 10);
    }
}

const createBG = async () => {
    const div = document.createElement('div');
    div.id = 'pixi-bg';
    document.getElementById('pixi-box').appendChild(div);

    data.bgApp = new Application();

    await data.bgApp.init({ backgroundAlpha: 0, resizeTo: window });

    if (!document.getElementById('pixi-bg')) {
        return;
    }

    document.getElementById('pixi-bg').appendChild(data.bgApp.canvas);

    data.bgApp.ticker.add((time) => {
        // Обработаем фон
        data.bgItems.forEach(item => {
            item.sprite.x += item.dir.x;
            item.sprite.y += item.dir.y;

            if (item.sprite.x >= data.bgApp.screen.width) {
                item.dir.x *= -1;
            }

            if (item.sprite.x <= 0) {
                item.dir.x *= -1;
            }

            if (item.sprite.y >= data.bgApp.screen.height) {
                item.dir.y *= -1;
            }

            if (item.sprite.y <= 0) {
                item.dir.y *= -1;
            }

            item.sprite.rotation += item.rotate * time.deltaTime;
        });
    });
}

const pixiClaim = async ({ x, y }) => {
    if (!data.claimApp) {
        await createClaim();
    }

    data.claimTextures.forEach(item => {
        if (item.code === 'logo') {
            for (let i = 0; i < 40; i++) {
                addClaimTexture({ item, x, y });
            }
        }
    });
}

const destroyClaim = async () => {
    if (data.claimApp) {
        data.claimApp.canvas.style.display = 'none';
        data.claimApp.canvas.remove();

        setTimeout(() => {
            data.claimApp.destroy();
            data.claimApp = null;
            document.getElementById('pixi-claim').remove();
        }, 10);
    }
}

const createClaim = async () => {
    const div = document.createElement('div');
    div.id = 'pixi-claim';
    document.getElementById('pixi-box').appendChild(div);

    data.claimApp = new Application();

    await data.claimApp.init({ backgroundAlpha: 0, resizeTo: window });

    document.getElementById('pixi-claim').appendChild(data.claimApp.canvas);

    data.claimApp.ticker.add((time) => {
        // Обработаем фон
        data.claimItems.forEach((item, id) => {
            item.sprite.x += item.dir.x;
            item.sprite.y += item.dir.y;

            let exit = false;

            if (item.sprite.x > data.claimApp.screen.width + 30) {
                exit = true;
            }

            if (item.sprite.x <= -30) {
                exit = true;
            }

            if (item.sprite.y >= data.claimApp.screen.height + 30) {
                exit = true;
            }

            if (item.sprite.y <= -30) {
                exit = true;
            }

            item.sprite.rotation += item.rotate * time.deltaTime;

            if (exit) {
                data.claimApp.stage.removeChild(item.sprite);
                data.claimItems.splice(id, 1);
            }

            if (!data.claimItems.length) {
                destroyClaim();
            }
        });
    });
}

onMounted(async () => {
    // Preload bg
    await Promise.all(data.bgTextures.map(async (item) => {
        item.texture = await Assets.load(item.url);
    }));

    // Preload claims
    await Promise.all(data.claimTextures.map(async (item) => {
        item.texture = await Assets.load(item.url);
    }));
    
    // Создаем фон
    enableBG();

    // Создаем ручки
    setPixiClaim(pixiClaim);
    setEnableBG(enableBG);
    setDisableBG(disableBG);

    emit('ready');
});

onBeforeMount(async () => {
    await destroyClaim();
    await disableBG();
});
</script>


<style lang="scss">
    #pixi-claim,
    #pixi-bg {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        pointer-events: none;
        opacity: .8;
        filter: blur(8px);
    }

    #pixi-claim {
        opacity: 1;
        filter: none;
    }
</style>
