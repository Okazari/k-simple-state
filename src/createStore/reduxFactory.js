import factory from 'k-redux-factory'

export default (root) => {
  const subtree = (name, path) => {
    // first run
    if (name === undefined) {
      return Object
        .keys(root)
        .map(key => ({ [key]: subtree(key, '') }))
        .reduce(
          (acc, next) => ({ ...acc, ...next }),
          {},
        )
    }

    // other runs
    const nextPath = `${path ? `${path}.` : ''}${name}`
    const fullpath = `root.${nextPath}`
    const options = eval(fullpath) // eslint-disable-line no-eval
    const { type } = options

    // - leaf
    if (type) { // k-redux-factory
      return factory({ name, path, ...options })
    } else if (typeof options === 'function') { // custom reducer
      return options
    }

    // - branch
    return Object
      .keys(options)
      .map(key => ({ [key]: subtree(key, nextPath) }))
      .reduce(
        (acc, next) => ({ ...acc, ...next }),
        {},
      )
  }

  return subtree()
}
