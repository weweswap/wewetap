import { _ as _export_sfc, u as useI18n, m as mapState, l as mapActions, q as mapMutations, r as reactive, a as resolveComponent, s as unref, o as openBlock, b as createElementBlock, e as createVNode, d as createBaseVNode, t as toDisplayString, v as createTextVNode, g as createBlock, G as withDirectives, H as vModelText, B as Button, h as createCommentVNode, j as delay, z as message, p as pushScopeId, k as popScopeId } from './index.9a5db10d.js';
import { E as EmptyLabel } from './EmptyLabel.cb2ef7ae.js';

const Wallet_vue_vue_type_style_index_0_scoped_a4a8822c_lang = '';

const _withScopeId = n => (pushScopeId("data-v-a4a8822c"),n=n(),popScopeId(),n);
const _hoisted_1 = {
  key: 0,
  class: "page-container"
};
const _hoisted_2 = { class: "description" };
const _hoisted_3 = /*#__PURE__*/ _withScopeId(() => /*#__PURE__*/createBaseVNode("b", null, "$WEWE", -1 /* HOISTED */));
const _hoisted_4 = /*#__PURE__*/ _withScopeId(() => /*#__PURE__*/createBaseVNode("b", { class: "meme" }, "$MEME", -1 /* HOISTED */));
const _hoisted_5 = {
  key: 0,
  class: "wallet"
};
const _hoisted_6 = /*#__PURE__*/ _withScopeId(() => /*#__PURE__*/createBaseVNode("b", null, "...", -1 /* HOISTED */));
const _hoisted_7 = { class: "button-box" };

    
const _sfc_main = {
  __name: 'Wallet',
  setup(__props) {

    const { t, tm, rt } = useI18n();
    const { pixiClaim, user } = mapState();
    const { updateWallet } = mapActions();
    mapMutations();
    const description = tm('pages.wallet.empty.description').map(item => rt(item));

    const data = reactive({
        editMode: false,
        walletAddress: null,
        loading: false,
        emptyDescription: description[Math.min(parseInt(Math.random() * description.length), description.length - 1)] 
    });

    const editIt = () => {
        data.walletAddress = user.value?.profile.wallet_address || '';
        data.editMode = true;
    };

    const saveIt = async (e) => {
        data.loading = true;

        await updateWallet(data.walletAddress);

        await delay(500);

        if (pixiClaim?.value) {
            pixiClaim.value({ y : e.pageY, x : e.pageX });
        }

        if (window.navigator?.vibrate) {
            window.navigator.vibrate(200);
        }

        data.editMode = false;
        data.walletAddress = null;
        data.loading = false;

        await delay(1000);
        message.loki(t('pages.wallet.updated'));
    };

return (_ctx, _cache) => {
  const _component_Icon = resolveComponent("Icon");

  return (unref(user).profile.id)
    ? (openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(_component_Icon, { icon: "dude" }),
        createBaseVNode("h1", null, toDisplayString(unref(t)('pages.wallet.title')), 1 /* TEXT */),
        createBaseVNode("label", _hoisted_2, [
          createBaseVNode("span", null, [
            createTextVNode(toDisplayString(unref(t)('pages.wallet.description.one')) + " ", 1 /* TEXT */),
            _hoisted_3,
            createTextVNode(" " + toDisplayString(unref(t)('pages.wallet.description.two')) + " ", 1 /* TEXT */),
            _hoisted_4
          ])
        ]),
        (!data.editMode && unref(user).profile.wallet_address)
          ? (openBlock(), createElementBlock("label", _hoisted_5, [
              createBaseVNode("span", null, toDisplayString(unref(user).profile.wallet_address.substr(0, 10)), 1 /* TEXT */),
              _hoisted_6,
              createBaseVNode("span", null, toDisplayString(unref(user).profile.wallet_address.substr(-10)), 1 /* TEXT */)
            ]))
          : (!data.editMode && !unref(user).profile.wallet_address)
            ? (openBlock(), createBlock(EmptyLabel, {
                key: 1,
                title: unref(t)('pages.wallet.empty.title'),
                description: data.emptyDescription
              }, null, 8 /* PROPS */, ["title", "description"]))
            : withDirectives((openBlock(), createElementBlock("textarea", {
                key: 2,
                "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((data.walletAddress) = $event)),
                placeholder: "Wallet address"
              }, null, 512 /* NEED_PATCH */)), [
                [vModelText, data.walletAddress]
              ]),
        createBaseVNode("div", _hoisted_7, [
          (!data.loading && data.editMode)
            ? (openBlock(), createBlock(Button, {
                key: 0,
                name: unref(t)('common.save'),
                disabled: data.walletAddress?.trim().length < 20,
                onClick: saveIt
              }, null, 8 /* PROPS */, ["name", "disabled"]))
            : createCommentVNode("v-if", true),
          (!data.loading && !data.editMode)
            ? (openBlock(), createBlock(Button, {
                key: 1,
                name: unref(t)('pages.wallet.edit'),
                class: "secondary",
                onClick: editIt
              }, null, 8 /* PROPS */, ["name"]))
            : (data.loading)
              ? (openBlock(), createBlock(Button, {
                  key: 2,
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
const Wallet = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-a4a8822c"],['__file',"/home/runner/work/wewetap-front/wewetap-front/src/pages/Wallet.vue"]]);

export { Wallet as default };
