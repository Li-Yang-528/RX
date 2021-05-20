[瞎搞系列之上一篇：vue转react系列-API封装](https://juejin.cn/post/6964316996531929125)

你是否在为reduce各种switch而烦恼，是不是对各种case代码而落泪，想要代码写的优雅，请你继续往下看

又是一个vue转react的娱乐封装，下面展示利用vuex的写法去改造reducer
## vuex温习

- state
- mutations
- actions
- getters

```javascript
const store = {
  state:  {
    list: []
  },
  // 派生
  getters: {
    todoList(state, getter) {
      return state.list.concat(getter.todos)
    },

    todos() {
      return ['玩', '写']
    }
  },
  // 修改state
  mutations: {
    setList(state, payload) {
      state.list.push(payload)
    }
  },

  // 提交修改
  actions({state, commit}, payload) {
    commit('setList', payload)
  }
}
```

你看划分的就很清晰嘛，职责分离，也不用到处case,就喜欢这种vuex的写法，不用到处判断。

## 晒代码
> 看完了vuex的使用，我们结合redux，尝试把switch改变成有一定结构的写法
```javascript
export default function RX(store) {
  const { state, getters = {}, mutations, actions } = store;
  // getter本身是可以聚合自身属性和state属性，所以利用get惰性去求值，以便在每个getter里定义的方法能拿到getters
  function getter() {
    const getterProxy = {};
    Object.keys(getters).forEach((key) => {
      // eslint-disable-next-line no-multi-assign
      Object.defineProperty(getterProxy, key, {
        configurable: false,
        enumerable: true,
        get() {
          return getters[key](state, getterProxy);
        },
      });
    });
    // 这块就是为了把get去掉，不让state带有属性get
    Object.assign(state, getterProxy);
  }

  // 修改state完需要更新一下getter,因为可能存在引用state的数据，保证数据正确
  function commit(actionName, payload) {
    mutations[actionName](state, payload);
    getter();
  }
  // 提交mutations操作，这里先判断下type，因为redux在第一次调用是会传入type=@@redux/init,防止报错
  function dispatch(initState = state, option) {
    const { type, payload } = option;
    const commitFun = actions[type];
    if (!commitFun) {
      return initState;
    }
    // 正式提交mutations
    commitFun({ commit, initState }, payload);
    // 返回新的state,这样redux才能判断俩个reducer出来的不一样才能出发视图更新

    return Object.create(state);
  }

  return dispatch;
}
```
## 使用
```javascript
const reduxStore = createStore(RX({
  state: {
    list: []
  },
  mutations: {
    append(state, item) {
      console.log(state.first)
      state.list.push(item)
    }
  },
  actions: {
    commitAppend({state, commit}, payload) {
        commit('append', payload)
    }
  },
  getters: {
    first(state, getters) {
      return state.list[0] + getters.name
    },
    name() {
      return '岁'
    }
  }
}))
reduxStore.dispatch({
  type: 'commitAppend',
  payload: 2
})

console.log(reduxStore.getState())
{
  list: [2],
  name: '岁',
  first: '2岁'
}
```
## 最后
菜鸟手写，有不恰当的处理请指(轻)教(喷)，欢迎一起讨论！谢(讨)谢(好)！
