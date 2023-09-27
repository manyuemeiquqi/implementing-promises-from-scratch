// possible states
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

class APromise {
  constructor(fn) {
    this.status = PENDING; // 初始状态为pending
    this.value = null; // 初始化value

    // 构造函数里面添加两个数组存储成功和失败的回调
    this.callbackQueue = [];

    // this.onFulfilledCallbacks = [];
    // this.onRejectedCallbacks = [];

    // 存一下this,以便resolve和reject里面访问
    // resolve方法参数是value

    try {
      fn(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }
  resolve(value) {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;

      // resolve里面将所有成功的回调拿出来执行
      this.callbackQueue.forEach(({ onFulfilled }) => {
        onFulfilled(this.value);
      });
    }
  }

  // reject方法参数是value
  reject(value) {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.value = value;

      // resolve里面将所有失败的回调拿出来执行
      this.callbackQueue.forEach(({ onRejected }) => {
        onRejected(this.value);
      });
    }
  }
  then(onFulfilled, onRejected) {
    function resolvePromise(p, value) {
 
        if (p === value) {
            return p.reject(
              new TypeError("The promise and the return value are the same"),
            );
          } else if (typeof value === "object" || typeof value === "function") {
            if (value === null) {
              return p.resolve(value);
            }
        
            try {
              var then = value.then;
            } catch (error) {
              return p.reject(error);
            }
        
            if (typeof then === "function") {
              var called = false;
              try {
                then.call(
                  value,
                  function (y) {
                    if (called) return;
                    called = true;
                    resolvePromise(p, y);
                  },
                  function (r) {
                    if (called) return;
                    called = true;
                    p.reject(r);
                  },
                );
              } catch (error) {
                if (called) return;
                p.reject(error);
              }
            } else {
              p.resolve(value);
            }
          } else {
            p.resolve(value);
          }
    }
    var that = this; // 保存一下this

    if (this.status === FULFILLED) {
      var promise2 = new APromise(function (resolve, reject) {
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
      var promise2 = new APromise(function (resolve, reject) {
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
      var promise2 = new APromise(function (resolve, reject) {
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
    // const returnPromise = new Promise(() => { })
    // setTimeout(() => {
    //   if (this.state === PENDING) {

    //   } else {
    //     if (this.state === FULFILLED) {
    //       if (typeof onFulfilled !== 'function') {
    //         returnPromise.resolve(this.value)
    //       } else {
    //         try {
    //           let returnValue = onFulfilled(this.value);
    //           handlePromise(returnPromise, returnValue)
    //         } catch (error) {
    //           returnPromise.reject(error)
    //         }
    //       }
    //     } else {

    //     }
    //   }
    // }, 0);

  }
}
module.exports = APromise;
