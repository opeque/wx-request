function handleInterceptor(interceptor) {
  let _resolve = null
  let _reject = null
  Object.assign(interceptor, {
    lock() {
      if (!_resolve) {
        interceptor.p = new Promise((resolve, reject) => {
          _resolve = resolve
          _reject = reject
        })
      }
    },
    unlock() {
      if (_resolve) {
        _resolve()
        interceptor.p = _resolve = _reject = null
      }
    },
    cancel() {
      if (_reject) {
        _reject('cancel')
        interceptor.p = _resolve = _reject = null
      }
    }
  })
}

function enqueueIfLocked(p, callback) {
  if (p) {
    p.then(callback)
  } else {
    callback()
  }
}

function Request(options) {
  this.options = options
  this.interceptors = {
    request: {
      use(handler) {
        this.handler = handler
      }
    },
    response: {
      use(handler, errorHandler) {
        this.handler = handler
        this.errorHandler = errorHandler
      }
    },
  }
  handleInterceptor(this.interceptors.request)
  handleInterceptor(this.interceptors.response)
}

Request.prototype.request = function (url, options) {
  return new Promise((resolve, reject) => {
    enqueueIfLocked(this.interceptors.request.p, () => {
      console.log('执行业务代码')
      resolve('业务正常流程')
    })
  })
}

export const create = (options) => new Request(options)
export default new Request({})
