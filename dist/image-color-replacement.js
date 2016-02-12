var ImageReplacer, ImageReplacerDirective;

ImageReplacer = (function() {
  var context2d, drawImage, imageToCanvas, isnear, proximity, rgbToHex;

  ImageReplacer.original = null;

  ImageReplacer.canvas = null;

  function ImageReplacer(image) {
    this.original = image;
    this.canvas = imageToCanvas(image);
    this.ctx = context2d(this.canvas);
    this.drawed = drawImage(this.ctx, image);
  }

  rgbToHex = function(RGB) {
    var arr, i, j, len, ref;
    RGB = RGB.replace("#", "");
    arr = [];
    if (RGB.length === 6) {
      ref = [0, 1, 2];
      for (j = 0, len = ref.length; j < len; j++) {
        i = ref[j];
        arr.push(parseInt(RGB.substr(i * 2, 2), 16));
      }
    }
    return arr;
  };

  imageToCanvas = function(image) {
    var c;
    c = document.createElement('canvas');
    c.width = image.width;
    c.height = image.height;
    return c;
  };

  context2d = function(canvas) {
    if (canvas) {
      return canvas.getContext("2d");
    }
  };

  drawImage = function(ctx, image) {
    var imageData;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    imageData = ctx.getImageData(0, 0, image.width, image.height);
    return imageData;
  };

  proximity = function(n1, n2) {
    return Math.abs(n1 - n2);
  };

  isnear = function(n1, n2, tolerance) {
    if (n1 > n2) {
      return n1 < (n2 + tolerance);
    } else {
      return n1 > (n2 - tolerance);
    }
  };

  ImageReplacer.prototype.replaceColors = function(objReplace) {
    var from, i, j, len, r, to;
    if (objReplace) {
      if (objReplace.length > 0) {
        i = 0;
        while (i < this.drawed.data.length) {
          for (j = 0, len = objReplace.length; j < len; j++) {
            r = objReplace[j];
            from = rgbToHex(r.from);
            to = rgbToHex(r.to);
            if (!r.tolerance) {
              r.tolerance = 10;
            }
            if (proximity(this.drawed.data[i + 0], from[0]) <= r.tolerance && proximity(this.drawed.data[i + 1], from[1]) <= r.tolerance && proximity(this.drawed.data[i + 2], from[2]) <= r.tolerance) {
              this.drawed.data[i + 0] = to[0];
              this.drawed.data[i + 1] = to[1];
              this.drawed.data[i + 2] = to[2];
            }
          }
          i += 4;
        }
      }
      this.ctx.putImageData(this.drawed, 0, 0);
    } else {
      false;
    }
    return true;
  };

  ImageReplacer.prototype.replaceHex = function(objReplace) {
    var arr, i, j, len;
    arr = [];
    if (objReplace) {
      for (j = 0, len = objReplace.length; j < len; j++) {
        i = objReplace[j];
        arr.push([rgbToHex(i.from), rgbToHex(i.to)]);
      }
    }
    return arr;
  };

  ImageReplacer.prototype.toDataURL = function(params) {
    var url;
    if (params == null) {
      params = 'image/png';
    }
    url = this.canvas.toDataURL(params);
    this.original = null;
    this.canvas = null;
    this.ctx = null;
    this.drawed = null;
    return url;
  };

  return ImageReplacer;

})();

if (typeof angular !== "undefined" && angular !== null) {
  ImageReplacerDirective = (function() {
    var link, replace;

    link = function(scope, el, attr, ctrl) {
      this.original = new Image();
      this.original.src = el[0].src;
      el[0].style.display = "none";
      replace(this.original, scope.colorReplace, el[0]);
      return scope.$watchCollection('colorReplace', (function(_this) {
        return function(n, o) {
          if (n != null) {
            el[0].style.display = "none";
            return replace(_this.original, n, el[0]);
          }
        };
      })(this));
    };

    replace = function(original, colorReplace, el) {
      var currentImage;
      currentImage = new Image();
      currentImage.onload = (function(_this) {
        return function() {
          var replacer;
          replacer = new ImageReplacer(currentImage);
          replacer.replaceColors(colorReplace);
          el.src = replacer.toDataURL();
          return el.style.display = null;
        };
      })(this);
      return currentImage.src = original.src;
    };

    function ImageReplacerDirective() {
      var directive;
      directive = {
        restrict: "A",
        link: link,
        scope: {
          colorReplace: "="
        }
      };
      return directive;
    }

    return ImageReplacerDirective;

  })();
  ImageReplacerDirective.$inject = [];
  angular.module('color-replace', []);
  angular.module('color-replace').directive('colorReplace', ImageReplacerDirective);
}
