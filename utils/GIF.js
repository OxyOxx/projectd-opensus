var Animator, Decoder, Gif, GifReader, Promise, gifler,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
GifReader = require('omggif').GifReader;
Promise = require('bluebird')
const fetch =require('node-fetch');
gifler = async function(url) {
    const buff = await fetch(url).then(resp => resp.arrayBuffer())
  promise = new Promise(function(resolve, reject) {
    resolve(buff);
  });
  return new Gif(promise);
};

Gif = (function() {
  Gif.getCanvasElement = function(selector) {
    var element, ref;
    if (typeof selector === 'string' && ((ref = (element = document.querySelector(selector))) != null ? ref.tagName : void 0) === 'CANVAS') {
      return element;
    } else if ((selector != null ? selector.tagName : void 0) === 'CANVAS') {
      return selector;
    } else {
      throw new Error('Unexpected selector type. Valid types are query-selector-string/canvas-element');
    }
  };

  function Gif(dataPromise) {
    this._animatorPromise = dataPromise.then(function(data) {
      var reader;
      reader = new GifReader(new Uint8Array(data));
      return Decoder.decodeFramesAsync(reader).then(function(frames) {
        return new Animator(reader, frames);
      });
    });
  }
  Gif.prototype.animate = function(selector) {
    var canvas;
    canvas = Gif.getCanvasElement(selector);
    return this._animatorPromise.then(function(animator) {
      return animator.animateInCanvas(canvas);
    });
  };
  Gif.prototype.frames = function(selector, onDrawFrame, setCanvasDimesions) {
    var canvas;
    if (setCanvasDimesions == null) {
      setCanvasDimesions = false;
    }
    canvas = Gif.getCanvasElement(selector);
    return this._animatorPromise.then(function(animator) {
      animator.onDrawFrame = onDrawFrame;
      return animator.animateInCanvas(canvas, setCanvasDimesions);
    });
  };
  Gif.prototype.get = function(callback) {
    return this._animatorPromise;
  };

  return Gif;

})();
Decoder = (function() {
  function Decoder() {}

  Decoder.decodeFramesSync = function(reader) {
    var j, ref, results;
    return (function() {
      results = [];
      for (var j = 0, ref = reader.numFrames(); 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--){ results.push(j); }
      return results;
    }).apply(this).map(function(frameIndex) {
      return Decoder.decodeFrame(reader, frameIndex);
    });
  };

  Decoder.decodeFramesAsync = function(reader) {
    var concurrency, j, ref, results;
    return Promise.map((function() {
      results = [];
      for (var j = 0, ref = reader.numFrames(); 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--){ results.push(j); }
      return results;
    }).apply(this), (function(i) {
      return Decoder.decodeFrame(reader, i);
    }), concurrency = 1);
  };

  Decoder.decodeFrame = function(reader, frameIndex) {
    var frameInfo;
    frameInfo = reader.frameInfo(frameIndex);
    frameInfo.pixels = new Uint8ClampedArray(reader.width * reader.height * 4);
    reader.decodeAndBlitFrameRGBA(frameIndex, frameInfo.pixels);
    return frameInfo;
  };

  return Decoder;

})();

Animator = (function() {
  Animator.createBufferCanvas = function(frame, width, height) {
    var bufferCanvas, bufferContext, imageData;
    bufferCanvas = document.createElement('canvas');
    bufferContext = bufferCanvas.getContext('2d');
    bufferCanvas.width = frame.width;
    bufferCanvas.height = frame.height;
    imageData = bufferContext.createImageData(width, height);
    imageData.data.set(frame.pixels);
    bufferContext.putImageData(imageData, -frame.x, -frame.y);
    return bufferCanvas;
  };

  function Animator(_reader, _frames) {
    var ref;
    this._reader = _reader;
    this._frames = _frames;
    this._advanceFrame = bind(this._advanceFrame, this);
    this._nextFrameRender = bind(this._nextFrameRender, this);
    this._nextFrame = bind(this._nextFrame, this);
    ref = this._reader, this.width = ref.width, this.height = ref.height;
    this._loopCount = this._reader.loopCount();
    this._loops = 0;
    this._frameIndex = 0;
    this._running = false;
  }
  Animator.prototype.running = function() {
    return this._running;
  };
  Animator.prototype._advanceFrame = function() {
    this._frameIndex += 1;
    if (this._frameIndex >= this._frames.length) {
      if (this._loopCount !== 0 && this._loopCount === this._loops) {
        this.stop();
      } else {
        this._frameIndex = 0;
        this._loops += 1;
      }
    }
  };

  Animator.prototype._enqueueNextFrame = function() {
    var actualDelay, delta, frame, frameDelay;
    this._advanceFrame();
    while (this._running) {
      frame = this._frames[this._frameIndex];
      delta = new Date().valueOf() - this._lastTime;
      this._lastTime += delta;
      this._delayCompensation += delta;
      frameDelay = frame.delay * 10;
      actualDelay = frameDelay - this._delayCompensation;
      this._delayCompensation -= frameDelay;
      if (actualDelay < 0) {
        this._advanceFrame();
        continue;
      } else {
        setTimeout(this._nextFrame, actualDelay);
        break;
      }
    }
  };
  Animator.prototype.animateInCanvas = function(canvas, setDimensions) {
    var ctx;
    if (setDimensions == null) {
      setDimensions = true;
    }
    if (setDimensions) {
      canvas.width = this.width;
      canvas.height = this.height;
    }
    ctx = canvas.getContext('2d');
    if (this.onDrawFrame == null) {
      this.onDrawFrame = function(ctx, frame, i) {
        return ctx.drawImage(frame.buffer, frame.x, frame.y);
      };
    }
    if (this.onFrame == null) {
      this.onFrame = (function(_this) {
        return function(frame, i) {
          var ref, saved;
          if (frame.buffer == null) {
            frame.buffer = Animator.createBufferCanvas(frame, _this.width, _this.height);
          }
          if (typeof _this.disposeFrame === "function") {
            _this.disposeFrame();
          }
          switch (frame.disposal) {
            case 2:
              _this.disposeFrame = function() {
                return ctx.clearRect(0, 0, canvas.width, canvas.height);
              };
              break;
            case 3:
              saved = ctx.getImageData(0, 0, canvas.width, canvas.height);
              _this.disposeFrame = function() {
                return ctx.putImageData(saved, 0, 0);
              };
              break;
            default:
              _this.disposeFrame = null;
          }
          return (ref = _this.onDrawFrame) != null ? ref.apply(_this, [ctx, frame, i]) : void 0;
        };
      })(this);
    }
    this.start();
    return this;
  };

  return Animator;

})();

gifler.Gif = Gif;

gifler.Decoder = Decoder;

gifler.Animator = Animator;

if (typeof window !== "undefined" && window !== null) {
  window.gifler = gifler;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = gifler;
}