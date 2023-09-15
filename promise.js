// possible states
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class APromise {
  constructor(fn) {
    this.value = undefined
    this.state = PENDING
    this.callBackQueue = []
    try {
      fn(this.resolve.bind(this), this.reject.bind(this))
    }
    catch (e) {
      this.reject(e)
    }
  }
  executeQueue() {
    const len = this.callBackQueue.length
    for (let i = 0; i < len; i++) {
      const { onFulfilled, onRejected } = this.callBackQueue[i]
      this.then(onFulfilled,
        onRejected)
    }
  }
  resolve(value) {


    if (this.state === PENDING) {
      if (value === this) {
        return this.reject(new TypeError('failed'))
      }
      if (value && (typeof value === 'object' || typeof value === 'function')) {
        let then
        try {
          then = value.then
        } catch (err) {
          return this.reject(err)
        }

        // promise
        if (then === this.then && this instanceof APromise) {
          this.state = FULFILLED
          this.value = value
          return this.executeQueue()
        }

        // thenable
        if (typeof then === 'function') {
          return this.then(then.bind(this))
        }
      }

      this.state = FULFILLED
      this.value = value
      // 如果 resolve是异步的的，那么cb就需要rsolve出发

      // finale要干的事情，如果队列中有任务要执行
      this.executeQueue()
    }
  }
  reject(reason) {
    if (this.state === PENDING) {
      this.state = REJECTED
      this.value = reason
      this.executeQueue()
    }
  }


  then(onFulfilled, onRejected) {
    const promiseThen = new APromise(() => { })
    let that = this
    while (that.value instanceof APromise && that.state !== REJECTED) {
      that = that.value
    }


    if (that.state === PENDING) {
      that.callBackQueue.push({
        onFulfilled,
        onRejected

      })
    }
    if (that.state === FULFILLED) {
      // 这里就是异步的精髓 为什么不是异步 resovle 二十esolve onfulfilled
      setTimeout(() => {
        if (typeof onFulfilled !== 'function') {
          promiseThen.resolve(that.value)
        }
        else {
          try {
            const ret = onFulfilled(that.value)
            promiseThen.resolve(ret)
          } catch (err) {
            promiseThen.reject(err)
          }
        }
      },0);
    }
    if (that.state === REJECTED) {
      setTimeout(() => {
        if (typeof onRejected !== 'function') {
          promiseThen.reject(that.value)
          return
        }
        else {
          try {
            const ret = onRejected(that.value)
            promiseThen.resolve(ret)
          } catch (err) {
            promiseThen.reject(err)
          }
        }
      },0);
    }
    return promiseThen
  }
}


function callbackAggregator(times, ultimateCallback) {
  var soFar = 0;
  return function () {
      if (++soFar === times) {
          ultimateCallback();
      }
  };
}

module.exports = APromise
