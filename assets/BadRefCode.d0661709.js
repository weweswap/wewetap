import { _ as _export_sfc, u as useI18n, r as reactive, a as resolveComponent, o as openBlock, b as createElementBlock, e as createVNode, s as unref, p as pushScopeId, k as popScopeId, d as createBaseVNode } from './index.ab82c011.js';
import { E as EmptyLabel } from './EmptyLabel.24b90b18.js';

const BadRefCode_vue_vue_type_style_index_0_scoped_07f04eb1_lang = '';

const _withScopeId = n => (pushScopeId("data-v-07f04eb1"),n=n(),popScopeId(),n);
const _hoisted_1 = { class: "page-container" };
const _hoisted_2 = /*#__PURE__*/ _withScopeId(() => /*#__PURE__*/createBaseVNode("label", { class: "hashtag" }, "#wewetap ", -1 /* HOISTED */));
    
const _sfc_main = {
  __name: 'BadRefCode',
  setup(__props) {

    const { t, tm, rt } = useI18n();
    const description = tm('pages.bad-ref-code.descriptions').map(item => rt(item));
    const data = reactive({
        description: description[Math.min(parseInt(Math.random() * description.length), description.length - 1)] 
    });

return (_ctx, _cache) => {
  const _component_Icon = resolveComponent("Icon");

  return (openBlock(), createElementBlock("div", _hoisted_1, [
    createVNode(_component_Icon, { icon: "loki" }),
    _hoisted_2,
    createVNode(EmptyLabel, {
      title: unref(t)('pages.bad-ref-code.title'),
      description: data.description
    }, null, 8 /* PROPS */, ["title", "description"])
  ]))
}
}

};
const BadRefCode = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-07f04eb1"],['__file',"/home/runner/work/wewetap-front/wewetap-front/src/pages/BadRefCode.vue"]]);

export { BadRefCode as default };
