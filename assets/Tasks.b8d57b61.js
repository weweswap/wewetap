import { _ as _export_sfc, u as useI18n, m as mapState, q as mapMutations, l as mapActions, r as reactive, w as watch, C as onMounted, a as resolveComponent, o as openBlock, g as createBlock, b as createElementBlock, e as createVNode, d as createBaseVNode, t as toDisplayString, s as unref, B as Button, F as Fragment, f as renderList, h as createCommentVNode, j as delay, x as normalizeClass, v as createTextVNode, n as numberWithSpaces, D as withModifiers, z as message, L as Loader } from './index.cfd8383c.js';
import { E as EmptyLabel } from './EmptyLabel.fe693195.js';

const Tasks_vue_vue_type_style_index_0_scoped_938d4297_lang = '';

const _hoisted_1 = {
  key: 1,
  class: "page-container"
};
const _hoisted_2 = { class: "description" };
const _hoisted_3 = {
  key: 1,
  class: "tasks-list"
};
const _hoisted_4 = ["innerHTML"];
const _hoisted_5 = ["onClick"];

    
const _sfc_main = {
  __name: 'Tasks',
  setup(__props) {

    const { t } = useI18n();
    const { pixiClaim, user, settings, ready } = mapState();
    mapMutations();
    const { getMyTasks, getTasks, startTask, endTask, me } = mapActions();

    const data = reactive({
        total: 0,
        tasks: [],
        mytasks: {},
        loading: true
    });

    const openLink = ({ external_url, type }) => {
        if (window.Telegram?.WebApp) {
            if (type === 'telegram') {
                window.Telegram?.WebApp.openTelegramLink(external_url);
            } else {
                window.Telegram?.WebApp.openLink(external_url);
            }
        } else {
            window.open(external_url, '_blank');
        }
    };

    const start = async (task) => {
        openLink(task);


        data.mytasks[task.id] = 'loading';

        const result = await startTask(task.id);
        await delay(12400);

        if (result?.task_id) {
            data.mytasks[result?.task_id] = result.status;
        }
    };

    const claimIt = async (e, task) => {
        data.mytasks[task.id] = 'loading';
        const result = await endTask(task.id);
        await delay(400);

        if (!result?.task_id) {
            return;
        }

        const coins = user.value.profile.coins;
        await me();

        data.mytasks[result?.task_id] = result.status;

        if (pixiClaim?.value) {
            pixiClaim.value({ y : e.pageY, x : e.pageX });
        }

        if (window.navigator?.vibrate) {
            window.navigator.vibrate(200);
        }

        await delay(1000);
        message.blood(`${ t('common.youGet') } ${ (user.value.profile.coins - coins).toFixed(1) } ${ t('common.bloods') }`);
    };

    const openTask = (task) => {
        if (data.mytasks[task?.id] !== 'done') {
            return;
        }

        openLink(task);
    };

    const getTasksList = async () => {
        data.loading = true;
        await delay(400);

        const payload = await getTasks({
            skip: data.tasks.length,
            take: settings.value.TASKS_DEFAULT_TAKE || 30 
        });

        if (payload?.total) {
            data.total = payload.total;
        }

        if (payload?.items) {
            data.tasks = [...data.tasks, ...payload.items];
        }

        data.loading = false;
    };

    const getMyTasksList = async () => {
        data.loading = true;

        data.mytasks = await getMyTasks({
            skip: 0,
            take: settings.value.TASKS_MAX_TAKE || 100 
        });

        data.loading = false;
    };

    watch(
        () => ready.value,
        async () => {
            if (ready.value) {
                await getMyTasksList();
                await getTasksList();
            }
        }
    );

    onMounted(async () => {
        if (ready.value) {
            await getMyTasksList();
            await getTasksList();
        }
    });

return (_ctx, _cache) => {
  const _component_Icon = resolveComponent("Icon");

  return (data.loading && !data.tasks.length)
    ? (openBlock(), createBlock(Loader, {
        key: 0,
        class: "light"
      }))
    : (openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(_component_Icon, { icon: "blood" }),
        createBaseVNode("h1", null, toDisplayString(unref(t)('pages.tasks.title')), 1 /* TEXT */),
        createBaseVNode("label", _hoisted_2, [
          createBaseVNode("span", null, toDisplayString(unref(t)('pages.tasks.description')), 1 /* TEXT */)
        ]),
        (!data.tasks.length)
          ? (openBlock(), createBlock(EmptyLabel, {
              key: 0,
              title: unref(t)('pages.tasks.empty.title'),
              description: unref(t)('pages.tasks.empty.description')
            }, null, 8 /* PROPS */, ["title", "description"]))
          : (openBlock(), createElementBlock("div", _hoisted_3, [
              createBaseVNode("ul", null, [
                createBaseVNode("li", {
                  onClick: _cache[0] || (_cache[0] = $event => (openLink({
                    external_url: 'https://t.me/vultirefbot',
                    type: 'telegram'
                }))),
                  style: {"display":"none"}
                }, [
                  createVNode(_component_Icon, {
                    icon: "vult",
                    class: "vult"
                  }),
                  createBaseVNode("div", null, [
                    createBaseVNode("div", null, [
                      createBaseVNode("span", {
                        innerHTML: unref(t)('pages.tasks.vultisig.name')
                      }, null, 8 /* PROPS */, _hoisted_4)
                    ]),
                    createVNode(Button, {
                      name: unref(t)('common.join'),
                      class: "light vultisig"
                    }, null, 8 /* PROPS */, ["name"])
                  ])
                ]),
                (openBlock(true), createElementBlock(Fragment, null, renderList(data.tasks, (item) => {
                  return (openBlock(), createElementBlock("li", {
                    key: item.name,
                    onClick: $event => (openTask(item))
                  }, [
                    createVNode(_component_Icon, {
                      icon: item.icon || item.type,
                      class: normalizeClass(item.icon || item.type)
                    }, null, 8 /* PROPS */, ["icon", "class"]),
                    createBaseVNode("div", null, [
                      createBaseVNode("div", null, [
                        createBaseVNode("span", null, toDisplayString(item.name), 1 /* TEXT */),
                        createBaseVNode("span", null, [
                          createTextVNode(" +" + toDisplayString(unref(numberWithSpaces)(item.coins)) + " ", 1 /* TEXT */),
                          createVNode(_component_Icon, { icon: "blood" })
                        ])
                      ]),
                      (data.mytasks[item.id] === 'claim_time')
                        ? (openBlock(), createBlock(Button, {
                            key: 0,
                            name: unref(t)('common.claim'),
                            class: "light claim",
                            onClick: withModifiers($event => (claimIt($event, item)), ["stop"])
                          }, null, 8 /* PROPS */, ["name", "onClick"]))
                        : (data.mytasks[item.id] === 'loading')
                          ? (openBlock(), createBlock(Button, {
                              key: 1,
                              class: "light loader",
                              loading: true
                            }))
                          : (!data.mytasks[item.id])
                            ? (openBlock(), createBlock(Button, {
                                key: 2,
                                name: unref(t)('common.start'),
                                class: "light secondary",
                                onClick: withModifiers($event => (start(item)), ["stop"])
                              }, null, 8 /* PROPS */, ["name", "onClick"]))
                            : (openBlock(), createBlock(_component_Icon, {
                                key: 3,
                                icon: "done"
                              }))
                    ])
                  ], 8 /* PROPS */, _hoisted_5))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              (data.total > data.tasks.length && !data.loading)
                ? (openBlock(), createBlock(Button, {
                    key: 0,
                    name: unref(t)('common.more'),
                    class: "light secondary",
                    onClick: getTasksList
                  }, null, 8 /* PROPS */, ["name"]))
                : createCommentVNode("v-if", true),
              (data.loading)
                ? (openBlock(), createBlock(Button, {
                    key: 1,
                    class: "light loader",
                    loading: true
                  }))
                : createCommentVNode("v-if", true)
            ]))
      ]))
}
}

};
const Tasks = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-938d4297"],['__file',"/home/runner/work/wewetap-front/wewetap-front/src/pages/Tasks.vue"]]);

export { Tasks as default };
