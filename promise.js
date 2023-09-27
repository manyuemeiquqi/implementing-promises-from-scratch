// possible states
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

class APromise {
  constructor(fn) {
    this.state = PENDING;
    this.callbackQueue = [];
    this.value = undefined;
    try {
      fn(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }
  resolve(value) {
    this.changePromiseValue(this, FULFILLED, value);
  }
  reject(reason) {
    this.changePromiseValue(this, REJECTED, reason);
  }
  changePromiseValue(p, state, value) {
    if (p.state === PENDING) {
      p.state = state;
      p.value = value;
      this.callbackQueue.forEach((cb) => {
        const { onFulfilled, onRejected } = cb;
        if (state === FULFILLED) {
          onFulfilled(value);
        } else {
          onRejected(value);
        }
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
