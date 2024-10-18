import { _ as _export_sfc, r as reactive, c as computed, w as watch, a as resolveComponent, o as openBlock, b as createElementBlock, d as createBaseVNode, e as createVNode, F as Fragment, f as renderList, g as createBlock, h as createCommentVNode, i as createStaticVNode, n as numberWithSpaces, j as delay, p as pushScopeId, k as popScopeId, u as useI18n, m as mapState, l as mapActions, q as mapMutations, s as unref, t as toDisplayString, v as createTextVNode, x as normalizeClass, B as Button, y as withCtx, z as message, A as router } from './index.ab82c011.js';
import { A as Avatar } from './Avatar.4b7b181b.js';

const BigCounter_vue_vue_type_style_index_0_scoped_46cfe4f1_lang = '';

const _withScopeId = n => (pushScopeId("data-v-46cfe4f1"),n=n(),popScopeId(),n);
const _hoisted_1$1 = { key: 0 };
const _hoisted_2$1 = /*#__PURE__*/createStaticVNode("<svg width=\"2479\" height=\"1080\" viewBox=\"0 0 2479 1080\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" class=\"bg\" data-v-46cfe4f1><path d=\"M1093.83 975.09L1015.43 1247.58\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path><path d=\"M1498.1 988L1591.42 1120.27\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path><path d=\"M1470.9 89.9301L1772.72 -152.65\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path><path d=\"M1258.34 89.9301L1248.96 -152.65\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path><path d=\"M937.03 38.3201L660.97 -186.19\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path><path d=\"M1772.72 975.09L2047.07 1125.82\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path><path d=\"M1853.53 102.84L2031.59 28\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path><path d=\"M799 975.09L745.2 1039.61\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path><path d=\"M474.3 543.78L230.94 561.12\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path><path d=\"M520.03 89.9301L308.02 -64.8999\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path><path d=\"M2047.07 430.51L2823.54 236.03\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path><path d=\"M-161 1111.34L261.34 806.71\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path><path d=\"M-137.34 65.4199L414.03 406.06\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path><path d=\"M2008.14 655.35L2146.67 709.78\" stroke-width=\"25\" stroke-miterlimit=\"10\" data-v-46cfe4f1></path></svg>", 1);
const _hoisted_3$1 = { key: 1 };
const _hoisted_4 = ["width"];
const _hoisted_5 = /*#__PURE__*/ _withScopeId(() => /*#__PURE__*/createBaseVNode("path", { d: "M0.810059 0.140137V72.2501L1387.87 87.7401L1375.25 25.8001L0.810059 0.140137Z" }, null, -1 /* HOISTED */));
const _hoisted_6 = [
  _hoisted_5
];

    
const _sfc_main$1 = {
  __name: 'BigCounter',
  props: {
        value: { type: [Number, null], default: null },
    },
  setup(__props) {

    const props = __props;

    const data = reactive({
        value: props.value,
    });

    const items = computed(() => {
        return numberWithSpaces(parseInt(data.value)).replace(/,/g, ' ').split('');
    });

    watch(
        () => props.value,
        async () => {
            let steps = 14;
            const letters = ((data.value).toString().split('.')[1] || '').length;
            const diff = +((props.value - data.value) / steps).toFixed(letters);

            const doIt = async () => {
                if (!steps) {
                    data.value = props.value;
                    return;
                }

                data.value += diff;
                steps -=1;
                await delay(10);
                doIt();
            };

            doIt();
        }
    );

return (_ctx, _cache) => {
  const _component_Icon = resolveComponent("Icon");

  return (props.value !== null)
    ? (openBlock(), createElementBlock("div", _hoisted_1$1, [
        _hoisted_2$1,
        createBaseVNode("span", null, [
          createVNode(_component_Icon, {
            icon: "blood",
            class: "blood"
          }),
          (openBlock(true), createElementBlock(Fragment, null, renderList(items.value, (item, id) => {
            return (openBlock(), createElementBlock(Fragment, { key: id }, [
              (!!item)
                ? (openBlock(), createBlock(_component_Icon, {
                    key: 0,
                    icon: `l-${item}`
                  }, null, 8 /* PROPS */, ["icon"]))
                : (openBlock(), createElementBlock("span", _hoisted_3$1))
            ], 64 /* STABLE_FRAGMENT */))
          }), 128 /* KEYED_FRAGMENT */))
        ]),
        (openBlock(), createElementBlock("svg", {
          width: items.value.length * 20 + 30,
          viewBox: "0 0 1388 88",
          class: "bottom",
          xmlns: "http://www.w3.org/2000/svg"
        }, [..._hoisted_6], 8 /* PROPS */, _hoisted_4))
      ]))
    : createCommentVNode("v-if", true)
}
}

};
const BigCounter = /*#__PURE__*/_export_sfc(_sfc_main$1, [['__scopeId',"data-v-46cfe4f1"],['__file',"/home/runner/work/wewetap-front/wewetap-front/src/components/forms/BigCounter.vue"]]);

const Home_vue_vue_type_style_index_0_scoped_933e9cdf_lang = '';

const _hoisted_1 = {
  key: 0,
  class: "page-container"
};
const _hoisted_2 = { class: "plane-game-box" };
const _hoisted_3 = { class: "button-box" };

    
const _sfc_main = {
  __name: 'Home',
  setup(__props) {

    const { t } = useI18n();
    const { pixiClaim, user, settings } = mapState();
    const { claim } = mapActions();
    mapMutations();

    const data = reactive({
        claimLoading: false,
    });

    const claimIt = async (e) => {
        data.claimLoading = true;

        const coins = user.value.profile.coins;
        const plane_game_pass_count = user.value.profile.plane_game_pass_count;

        await claim();

        await delay(500);

        if (pixiClaim?.value) {
            pixiClaim.value({ y : e.pageY, x : e.pageX });
        }

        if (window.navigator?.vibrate) {
            window.navigator.vibrate(200);
        }

        data.claimLoading = false;

        await delay(1000);
        message.blood(`${ t('common.youGet') } ${ (user.value.profile.coins - coins).toFixed(1) } ${ t('common.bloods') }`);
        await delay(400);
        message.pass(`${ t('common.youGet') } ${ user.value.profile.plane_game_pass_count - plane_game_pass_count } ${ t('common.playPass') }`);
    };

    const runPlaneGame = () => {
        router.push({ name: 'planegame' });
    };

return (_ctx, _cache) => {
  const _component_Icon = resolveComponent("Icon");

  return (unref(user).profile.id)
    ? (openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(Avatar, {
          name: unref(user).profile.first_name,
          class: "big"
        }, null, 8 /* PROPS */, ["name"]),
        createBaseVNode("h1", null, toDisplayString(unref(user).profile.username), 1 /* TEXT */),
        createVNode(BigCounter, {
          value: unref(user).profile.coins,
          class: "coins"
        }, null, 8 /* PROPS */, ["value"]),
        createBaseVNode("div", _hoisted_2, [
          createVNode(_component_Icon, {
            icon: "angle-1",
            class: "angle-1"
          }),
          createBaseVNode("div", null, [
            createBaseVNode("span", null, toDisplayString(unref(t)('pages.home.planegame.title')), 1 /* TEXT */),
            createBaseVNode("span", null, [
              createVNode(_component_Icon, { icon: "game-pass" }),
              createTextVNode(toDisplayString(unref(user).profile.plane_game_pass_count), 1 /* TEXT */)
            ])
          ]),
          createBaseVNode("div", null, [
            createVNode(_component_Icon, {
              icon: "ship",
              class: "ship"
            })
          ]),
          createBaseVNode("div", null, [
            createVNode(Button, {
              class: normalizeClass(["light", { secondary: !unref(user).profile.plane_game_pass_count }]),
              name: unref(t)('pages.home.planegame.play'),
              disabled: !unref(user).profile.plane_game_pass_count,
              onClick: runPlaneGame
            }, null, 8 /* PROPS */, ["name", "disabled", "class"])
          ]),
          createVNode(_component_Icon, {
            icon: "angle-2",
            class: "angle-2"
          })
        ]),
        createBaseVNode("div", _hoisted_3, [
          (!data.claimLoading)
            ? (openBlock(), createBlock(Button, {
                key: 0,
                class: "claim",
                delay: +unref(settings).DEFAULT_CLAIM_MINUTES_COUNT,
                delayFrom: unref(user).profile?.last_default_claim_datetime,
                onClick: claimIt
              }, {
                delay: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)('pages.home.hunting')) + " ", 1 /* TEXT */),
                  createVNode(_component_Icon, {
                    icon: "blood",
                    class: "blood"
                  })
                ]),
                default: withCtx(() => [
                  createBaseVNode("span", null, toDisplayString(unref(t)('common.claim')), 1 /* TEXT */),
                  createVNode(_component_Icon, {
                    icon: "blood",
                    class: "blood"
                  }),
                  createBaseVNode("span", null, toDisplayString(unref(settings).DEFAULT_CLAIM_COINS_COUNT), 1 /* TEXT */)
                ]),
                _: 1 /* STABLE */
              }, 8 /* PROPS */, ["delay", "delayFrom"]))
            : (data.claimLoading)
              ? (openBlock(), createBlock(Button, {
                  key: 1,
                  class: "loader",
                  loading: true
                }))
              : createCommentVNode("v-if", true)
        ])
      ]))
    : createCommentVNode("v-if", true)
}
}

};
const Home = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-933e9cdf"],['__file',"/home/runner/work/wewetap-front/wewetap-front/src/pages/Home.vue"]]);

export { Home as default };
