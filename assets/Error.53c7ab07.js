import { _ as _export_sfc, u as useI18n, r as reactive, a as resolveComponent, o as openBlock, b as createElementBlock, e as createVNode, s as unref } from './index.ab82c011.js';
import { E as EmptyLabel } from './EmptyLabel.24b90b18.js';

const Error_vue_vue_type_style_index_0_scoped_32e38e1e_lang = '';

const _hoisted_1 = { class: "page-container" };

    
const _sfc_main = {
  __name: 'Error',
  setup(__props) {

    const { t, tm, rt } = useI18n();

    const description = tm('pages.error.descriptions').map(item => rt(item));

    const data = reactive({
        description: description[Math.min(parseInt(Math.random() * description.length), description.length - 1)] 
    });


return (_ctx, _cache) => {
  const _component_Icon = resolveComponent("Icon");

  return (openBlock(), createElementBlock("div", _hoisted_1, [
    createVNode(_component_Icon, { icon: "loki" }),
    createVNode(EmptyLabel, {
      title: unref(t)('pages.error.title'),
      description: data.description
    }, null, 8 /* PROPS */, ["title", "description"])
  ]))
}
}

};
const Error = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-32e38e1e"],['__file',"/home/runner/work/wewetap-front/wewetap-front/src/pages/Error.vue"]]);

export { Error as default };
