// 先定义三个常量表示状态
var PENDING = "pending";
var FULFILLED = "fulfilled";
var REJECTED = "rejected";

function MyPromise(fn) {
  this.status = PENDING; // 初始状态为pending
  this.value = null; // 初始化value

  // 构造函数里面添加两个数组存储成功和失败的回调
  this.callbackQueue = [];

  // this.onFulfilledCallbacks = [];
  // this.onRejectedCallbacks = [];

  // 存一下this,以便resolve和reject里面访问
  // resolve方法参数是value
  this.resolve = function (value) {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;

      // resolve里面将所有成功的回调拿出来执行
      this.callbackQueue.forEach(({ onFulfilled }) => {
        onFulfilled(this.value);
      });
    }
  };

  // reject方法参数是value
  this.reject = function (value) {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.value = value;

      // resolve里面将所有失败的回调拿出来执行
      this.callbackQueue.forEach(({ onRejected }) => {
        onRejected(this.value);
      });
    }
  };

  try {
    fn(this.resolve.bind(this), this.reject.bind(this));
  } catch (error) {
    this.reject(error);
  }
}

function resolvePromise(promise, x, resolve, reject) {
  // 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
  // 这是为了防止死循环
  if (promise === x) {
    return promise.reject(
      new TypeError("The promise and the return value are the same"),
    );
  }

  // 如果 x 为对象或者函数
  else if (typeof x === "object" || typeof x === "function") {
    // 这个坑是跑测试的时候发现的，如果x是null，应该直接resolve
    if (x === null) {
      return promise.resolve(x);
    }

    try {
      // 把 x.then 赋值给 then
      var then = x.then;
    } catch (error) {
      // 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
      return reject(error);
    }

    // 如果 then 是函数
    if (typeof then === "function") {
      var called = false;
      // 将 x 作为函数的作用域 this 调用之
      // 传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise
      // 名字重名了，我直接用匿名函数了
      try {
        then.call(
          x,
          // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          function (y) {
            // 如果 resolvePromise 和 rejectPromise 均被调用，
            // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            // 实现这条需要前面加一个变量called
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          function (r) {
            if (called) return;
            called = true;
            reject(r);
          },
        );
      } catch (error) {
        // 如果调用 then 方法抛出了异常 e：
        // 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
        if (called) return;

        // 否则以 e 为据因拒绝 promise
        reject(error);
      }
    } else {
      // 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x);
    }
  } else {
    // 如果 x 不为对象或者函数，以 x 为参数执行 promise
    resolve(x);
  }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  var that = this; // 保存一下this

  if (this.status === FULFILLED) {
    var promise2 = new MyPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          if (typeof onFulfilled !== "function") {
            resolve(that.value);
          } else {
            var x = onFulfilled(that.value);
            resolvePromise(promise2, x, resolve, reject);
          }
        } catch (error) {
          reject(error);
        }
      }, 0);
    });

    return promise2;
  }

  if (this.status === REJECTED) {
    var promise2 = new MyPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          if (typeof onRejected !== "function") {
            reject(that.value);
          } else {
            var x = onRejected(that.value);
            resolvePromise(promise2, x, resolve, reject);
          }
        } catch (error) {
          reject(error);
        }
      }, 0);
    });

    return promise2;
  }

  // 如果还是PENDING状态，将回调保存下来
  if (this.status === PENDING) {
    var promise2 = new MyPromise(function (resolve, reject) {
      that.callbackQueue.push({
        onFulfilled: function () {
          setTimeout(function () {
            try {
              if (typeof onFulfilled !== "function") {
                resolve(that.value);
              } else {
                var x = onFulfilled(that.value);
                resolvePromise(promise2, x, resolve, reject);
              }
            } catch (error) {
              reject(error);
            }
          }, 0);
        },
        onRejected: function () {
          setTimeout(function () {
            try {
              if (typeof onRejected !== "function") {
                reject(that.value);
              } else {
                var x = onRejected(that.value);
                resolvePromise(promise2, x, resolve, reject);
              }
            } catch (error) {
              reject(error);
            }
          }, 0);
        },
      });
    });

    return promise2;
  }
};

module.exports = MyPromise;
