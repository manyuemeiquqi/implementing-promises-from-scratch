// possible statuss
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

class APromise {
  constructor(fn) {
    this.status = PENDING;
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
  changePromiseValue(p, status, value) {
    if (p.status === PENDING) {
      p.status = status;
      p.value = value;
      this.callbackQueue.forEach((cb) => {
        const { onFulfilled, onRejected } = cb;
        if (status === FULFILLED) {
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
    let promise2 = new APromise(() => {});

    if (this.status === FULFILLED) {
      setTimeout(function () {
        try {
          if (typeof onFulfilled !== "function") {
            promise2.resolve(that.value);
          } else {
            var x = onFulfilled(that.value);
            resolvePromise(promise2, x);
          }
        } catch (error) {
          promise2.reject(error);
        }
      }, 0);
    }

    if (this.status === REJECTED) {
      setTimeout(function () {
        try {
          if (typeof onRejected !== "function") {
            promise2.reject(that.value);
          } else {
            var x = onRejected(that.value);
            resolvePromise(promise2, x);
          }
        } catch (error) {
          promise2.reject(error);
        }
      }, 0);
    }

    // 如果还是PENDING状态，将回调保存下来
    if (this.status === PENDING) {
      that.callbackQueue.push({
        onFulfilled: function () {
          setTimeout(function () {
            try {
              if (typeof onFulfilled !== "function") {
                promise2.resolve(that.value);
              } else {
                var x = onFulfilled(that.value);
                resolvePromise(promise2, x);
              }
            } catch (error) {
              promise2.reject(error);
            }
          }, 0);
        },
        onRejected: function () {
          setTimeout(function () {
            try {
              if (typeof onRejected !== "function") {
                promise2.reject(that.value);
              } else {
                var x = onRejected(that.value);
                resolvePromise(promise2, x);
              }
            } catch (error) {
              promise2.reject(error);
            }
          }, 0);
        },
      });
    }

    return promise2;
  }
}
module.exports = APromise;
