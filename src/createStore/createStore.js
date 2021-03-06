import { createStore, compose, applyMiddleware } from 'redux'
import reduxFactory from './reduxFactory'
import toContext from './toContext'
import combine from './combine'
import listenFactory from './listenFactory'

const getListen = (options) => {
  const { listeners, enhancer } = options

  if (listeners) {
    const listen = listenFactory(listeners)

    // add this middleware to enhancer
    const middleware = applyMiddleware(listen.middleware)
    if (enhancer) return { enhancer: compose(middleware, enhancer), listen }

    return { enhancer: middleware, listen }
  }

  return { enhancer }
}

const defaultOptions = {
  hideRedux: true,
  enhancer: undefined,
  init: {},
  listeners: undefined,
}

export default (definition, options = defaultOptions) => {
  // options
  const innerOptions = { ...defaultOptions, ...options }
  const { init, hideRedux } = innerOptions

  // this is reducer exports (action/selectors)
  let reducerTree = reduxFactory(definition)

  // instanciate the listen middleware
  const { enhancer, listen } = getListen(innerOptions)

  // this is the redux store
  const reduxStore = createStore(
    combine(reducerTree),
    init,
    enhancer,
  )

  // convert to a contextualized version
  if (hideRedux) {
    reducerTree = toContext(reducerTree, reduxStore)
  }

  // exported store (our own)
  const store = {
    ...reducerTree,
    ...reduxStore,
    getStore: () => reduxStore,
  }

  // pass store to listen (after it has be created)
  if (listen) listen.setStore(store)

  return store
}
