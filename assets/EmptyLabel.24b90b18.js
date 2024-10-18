import { _ as _export_sfc, o as openBlock, b as createElementBlock, t as toDisplayString, h as createCommentVNode } from './index.ab82c011.js';

const EmptyLabel_vue_vue_type_style_index_0_scoped_fc14ccf6_lang = '';

const _hoisted_1 = { key: 0 };
const _hoisted_2 = {
  key: 1,
  class: "description"
};


const _sfc_main = {
  __name: 'EmptyLabel',
  props: {
    title: { type: String, default: '' },
    description: { type: String, default: '' }
},
  setup(__props) {

const props = __props;

return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", null, [
    (props.title)
      ? (openBlock(), createElementBlock("span", _hoisted_1, toDisplayString(props.title), 1 /* TEXT */))
      : createCommentVNode("v-if", true),
    (props.description)
      ? (openBlock(), createElementBlock("span", _hoisted_2, toDisplayString(props.description), 1 /* TEXT */))
      : createCommentVNode("v-if", true)
  ]))
}
}

};
const EmptyLabel = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-fc14ccf6"],['__file',"/home/runner/work/wewetap-front/wewetap-front/src/components/forms/EmptyLabel.vue"]]);

export { EmptyLabel as E };
