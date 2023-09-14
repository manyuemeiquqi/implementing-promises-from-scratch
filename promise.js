// possible states
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class APromise {
  constructor(fn) {
    this.value = undefined
    this.state = PENDING
    this.resolveCallbacks = []
    this.rejectCallbacks = []
    try {
      fn(this.resolve.bind(this), this.reject.bind(this))
    }
    catch (e) {
      this.reject(e)
    }
  }

  resolve(value) {
    setTimeout(() => {
      this.state = FULFILLED
      this.value = value
      // 如果 resolve是异步的的，那么cb就需要rsolve出发

      // finale要干的事情，如果队列中有任务要执行
      this.resolveCallbacks.forEach(cb => cb(value))
    },);

  }
  reject(reason) {
    setTimeout(() => {
      this.state = REJECTED
      this.value = reason
      this.rejectCallbacks.forEach(cb => cb(reason))
    },);

  }


  then(onFulfilled, onRejected) {

    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : () => { }
    onRejected = typeof onRejected === 'function' ? onRejected : () => { }
    if (this.state === PENDING) {
      this.resolveCallbacks.push(onFulfilled)
      this.rejectCallbacks.push(onRejected)
    }
    if (this.state === FULFILLED) {
      // 这里就是异步的精髓 为什么不是异步 resovle 二十esolve onfulfilled
      setTimeout(() => {
        onFulfilled(this.value)
      },);
    }
    if (this.state === onRejected) {
      setTimeout(() => {
        onRejected(this.value)

      },);
    }
    return this
  }
}
new APromise((resolve) => {
  console.log('2');
  setTimeout(() => {
    resolve(3)
    console.log('7');

  })
  //   setTimeout(()=)
}).then(res => {
  console.log(res);
}).then(res => {
  console.log('res: ', res);

})
console.log(5);

module.exports = APromise
