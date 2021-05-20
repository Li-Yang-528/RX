export default function RX(store) {
  const { state, getters = {}, mutations, actions } = store;
  function getter() {
    const getterProxy = {};
    Object.keys(getters).forEach((key) => {
      Object.defineProperty(getterProxy, key, {
        configurable: false,
        enumerable: true,
        get() {
          return getters[key](state, getterProxy);
        },
      });
    });
    Object.assign(state, getterProxy);
  }

  function commit(actionName, payload) {
    mutations[actionName](state, payload);
    getter();
  }
  
  function dispatch(initState = state, option) {
    const { type, payload } = option;
    const commitFun = actions[type];
    if (!commitFun) {
      return initState;
    }
    
    commitFun({ commit, initState }, payload);

    return Object.create(state);
  }

  return dispatch;
}
