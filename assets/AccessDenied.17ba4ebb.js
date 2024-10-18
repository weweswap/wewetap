import { _ as _export_sfc, u as useI18n, r as reactive, a as resolveComponent, o as openBlock, b as createElementBlock, e as createVNode, s as unref, p as pushScopeId, k as popScopeId, d as createBaseVNode } from './index.ab82c011.js';
import { E as EmptyLabel } from './EmptyLabel.24b90b18.js';

const AccessDenied_vue_vue_type_style_index_0_scoped_277b3fba_lang = '';

const _withScopeId = n => (pushScopeId("data-v-277b3fba"),n=n(),popScopeId(),n);
const _hoisted_1 = { class: "page-container" };
const _hoisted_2 = /*#__PURE__*/ _withScopeId(() => /*#__PURE__*/createBaseVNode("label", { class: "hashtag" }, "#wewetap ", -1 /* HOISTED */));
    
const _sfc_main = {
  __name: 'AccessDenied',
  setup(__props) {

    const { t, tm, rt } = useI18n();
    const description = tm('pages.access-denied.descriptions').map(item => rt(item));
    const data = reactive({
        description: description[Math.min(parseInt(Math.random() * description.length), description.length - 1)] 
    });

return (_ctx, _cache) => {
  const _component_Icon = resolveComponent("Icon");

  return (openBlock(), createElementBlock("div", _hoisted_1, [
    createVNode(_component_Icon, { icon: "loki" }),
    _hoisted_2,
    createVNode(EmptyLabel, {
      title: unref(t)('pages.access-denied.title'),
      description: data.description
    }, null, 8 /* PROPS */, ["title", "description"])
  ]))
}
}

};
const AccessDenied = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-277b3fba"],['__file',"/home/runner/work/wewetap-front/wewetap-front/src/pages/AccessDenied.vue"]]);

export { AccessDenied as default };
