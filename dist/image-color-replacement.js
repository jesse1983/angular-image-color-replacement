var ImageReplacer, ImageReplacerDirective;

ImageReplacer = (function() {
  var context2d, drawImage, imageToCanvas, isnear, proximity, rgbToHex, saveMap;

  ImageReplacer.original = null;

  ImageReplacer.canvas = null;

  function ImageReplacer(image, drawMap1) {
    this.drawMap = drawMap1 != null ? drawMap1 : [];
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

  saveMap = function(drawMap, replace, coordinates, to) {
    if (drawMap[replace] == null) {
      drawMap[replace] = [];
    }
    drawMap[replace].push({
      c: coordinates,
      to: to
    });
    return drawMap;
  };

  ImageReplacer.prototype.replaceColors = function(objReplace) {
    var end, start;
    start = new Date().getTime();
    if (objReplace) {
      if (objReplace.length > 0) {
        if (Object.keys(this.drawMap).length === 0) {
          this.replaceWithoutMap(objReplace);
        } else {
          this.replaceWithMap(objReplace);
        }
      }
      this.ctx.putImageData(this.drawed, 0, 0);
    } else {
      false;
    }
    end = new Date().getTime();
    return true;
  };

  ImageReplacer.prototype.replaceWithoutMap = function(objReplace) {
    var from, i, j, len, r, results, to;
    i = 0;
    results = [];
    while (i < this.drawed.data.length) {
      for (j = 0, len = objReplace.length; j < len; j++) {
        r = objReplace[j];
        from = rgbToHex(r.from);
        to = rgbToHex(r.to);
        if (!r.tolerance) {
          r.tolerance = 10;
        }
        if (proximity(this.drawed.data[i + 0], from[0]) <= r.tolerance && proximity(this.drawed.data[i + 1], from[1]) <= r.tolerance && proximity(this.drawed.data[i + 2], from[2]) <= r.tolerance) {
          this.drawMap = saveMap(this.drawMap, r.from, i, objReplace.indexOf(r));
          this.drawed.data[i + 0] = to[0];
          this.drawed.data[i + 1] = to[1];
          this.drawed.data[i + 2] = to[2];
        }
      }
      results.push(i += 4);
    }
    return results;
  };

  ImageReplacer.prototype.replaceWithMap = function(objReplace) {
    var c, color, results, to;
    results = [];
    for (color in this.drawMap) {
      results.push((function() {
        var j, len, ref, results1;
        ref = this.drawMap[color];
        results1 = [];
        for (j = 0, len = ref.length; j < len; j++) {
          c = ref[j];
          to = rgbToHex(objReplace[c.to].to);
          this.drawed.data[c.c + 0] = to[0];
          this.drawed.data[c.c + 1] = to[1];
          results1.push(this.drawed.data[c.c + 2] = to[2]);
        }
        return results1;
      }).call(this));
    }
    return results;
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
    url = null;
    if (this.canvas != null) {
      url = this.canvas.toDataURL(params);
    }
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
    var link;

    link = function(scope, el, attr, ctrl) {
      var replace;
      this.original = new Image();
      this.map = [];
      replace = (function(_this) {
        return function(original, colorReplace, el) {
          var currentImage;
          el.classList.toggle('loading');
          currentImage = new Image();
          currentImage.crossOrigin = "anonymous";
          currentImage.onload = function() {
            var replacer;
            replacer = new ImageReplacer(currentImage, _this.map);
            replacer.replaceColors(colorReplace);
            _this.map = replacer.drawMap;
            el.src = replacer.toDataURL();
            return el.classList.remove('loading');
          };
          return currentImage.src = original.src;
        };
      })(this);
      if (el[0].src != null) {
        this.original.src = el[0].src;
        replace(this.original, scope.colorReplace, el[0]);
      }
      if (scope.ngSrc != null) {
        scope.$watch('ngSrc', (function(_this) {
          return function(n, o) {
            if (n != null) {
              return _this.original.src = scope.ngSrc;
            }
          };
        })(this));
      }
      return scope.$watch('colorReplace', (function(_this) {
        return function(n, o) {
          if (n != null) {
            if (_this.original.src != null) {
              return replace(_this.original, n, el[0]);
            }
          }
        };
      })(this), true);
    };

    function ImageReplacerDirective() {
      var directive;
      directive = {
        restrict: "A",
        link: link,
        scope: {
          colorReplace: "=",
          ngSrc: "@?"
        }
      };
      return directive;
    }

    return ImageReplacerDirective;

  })();
  ImageReplacerDirective.$inject = [];
  angular.module('color-replace', []).directive('colorReplace', ImageReplacerDirective);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImltYWdlLWNvbG9yLXJlcGxhY2VtZW50LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBOztBQUFNO0FBQ0wsTUFBQTs7RUFBQSxhQUFDLENBQUEsUUFBRCxHQUFZOztFQUNaLGFBQUMsQ0FBQSxNQUFELEdBQVU7O0VBRUcsdUJBQUMsS0FBRCxFQUFRLFFBQVI7SUFBUSxJQUFDLENBQUEsNkJBQUQsV0FBVztJQUMvQixJQUFDLENBQUEsUUFBRCxHQUFZO0lBQ1osSUFBQyxDQUFBLE1BQUQsR0FBVSxhQUFBLENBQWMsS0FBZDtJQUNWLElBQUMsQ0FBQSxHQUFELEdBQU8sU0FBQSxDQUFVLElBQUMsQ0FBQSxNQUFYO0lBQ1AsSUFBQyxDQUFBLE1BQUQsR0FBVSxTQUFBLENBQVUsSUFBQyxDQUFBLEdBQVgsRUFBZ0IsS0FBaEI7RUFKRTs7RUFPYixRQUFBLEdBQVcsU0FBQyxHQUFEO0FBQ1YsUUFBQTtJQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsT0FBSixDQUFZLEdBQVosRUFBZ0IsRUFBaEI7SUFDTixHQUFBLEdBQU07SUFDTixJQUFHLEdBQUcsQ0FBQyxNQUFKLEtBQWMsQ0FBakI7QUFDQztBQUFBLFdBQUEscUNBQUE7O1FBQ0MsR0FBRyxDQUFDLElBQUosQ0FBUyxRQUFBLENBQVMsR0FBRyxDQUFDLE1BQUosQ0FBVyxDQUFBLEdBQUUsQ0FBYixFQUFlLENBQWYsQ0FBVCxFQUEyQixFQUEzQixDQUFUO0FBREQsT0FERDs7V0FHQTtFQU5VOztFQU9YLGFBQUEsR0FBZ0IsU0FBQyxLQUFEO0FBQ2YsUUFBQTtJQUFBLENBQUEsR0FBSSxRQUFRLENBQUMsYUFBVCxDQUF1QixRQUF2QjtJQUNKLENBQUMsQ0FBQyxLQUFGLEdBQVUsS0FBSyxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxNQUFGLEdBQVcsS0FBSyxDQUFDO1dBQ2pCO0VBSmU7O0VBS2hCLFNBQUEsR0FBWSxTQUFDLE1BQUQ7SUFDWCxJQUFHLE1BQUg7YUFDQyxNQUFNLENBQUMsVUFB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RUEsS0FBQSxFQUNDO1VBQUEsWUFBQSxFQUFjLEdBQWQ7VUFDQSxLQUFBLEVBQU8sSUFEUDtTQUhEOztBQU1ELGFBQU87SUFSSzs7Ozs7RUFXZCxzQkFBc0IsQ0FBQyxPQUF2QixHQUFpQztFQUdqQyxPQUNDLENBQUMsTUFERixDQUNTLGVBRFQsRUFDeUIsRUFEekIsQ0FFQyxDQUFDLFNBRkYsQ0FFWSxjQUZaLEVBRTRCLHNCQUY1QixFQWhERCIsImZpbGUiOiJpbWFnZS1jb2xvci1yZXBsYWNlbWVudC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEltYWdlUmVwbGFjZXJcblx0QG9yaWdpbmFsID0gbnVsbFxuXHRAY2FudmFzID0gbnVsbFxuXG5cdGNvbnN0cnVjdG9yOiAoaW1hZ2UsIEBkcmF3TWFwID0gW10pLT5cblx0XHRAb3JpZ2luYWwgPSBpbWFnZVxuXHRcdEBjYW52YXMgPSBpbWFnZVRvQ2FudmFzKGltYWdlKVxuXHRcdEBjdHggPSBjb250ZXh0MmQoQGNhbnZhcylcblx0XHRAZHJhd2VkID0gZHJhd0ltYWdlKEBjdHgsIGltYWdlKVxuXG5cdCMgcHJpdmF0ZVxuXHRyZ2JUb0hleCA9IChSR0IpLT5cblx0XHRSR0IgPSBSR0IucmVwbGFjZShcIiNcIixcIlwiKVxuXHRcdGFyciA9IFtdXG5cdFx0aWYgUkdCLmxlbmd0aCA9PSA2XG5cdFx0XHRmb3IgaSBpbiBbMCwxLDJdXG5cdFx0XHRcdGFyci5wdXNoIHBhcnNlSW50KFJHQi5zdWJzdHIoaSoyLDIpLDE2KVxuXHRcdGFyclxuXHRpbWFnZVRvQ2FudmFzID0gKGltYWdlKS0+XG5cdFx0YyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG5cdFx0Yy53aWR0aCA9IGltYWdlLndpZHRoXG5cdFx0Yy5oZWlnaHQgPSBpbWFnZS5oZWlnaHRcblx0XHRjXG5cdGNvbnRleHQyZCA9IChjYW52YXMpLT5cblx0XHRpZiBjYW52YXNcblx0XHRcdGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIilcblx0ZHJhd0ltYWdlID0gKGN0eCwgaW1hZ2UpLT5cblx0XHRjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwLCBpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0KVxuXHRcdGltYWdlRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodClcblx0XHRpbWFnZURhdGFcblx0cHJveGltaXR5ID0gKG4xLCBuMiktPlxuXHRcdE1hdGguYWJzKG4xLW4yKVxuXG5cdGlzbmVhciA9IChuMSxuMix0b2xlcmFuY2UpLT5cblx0XHRpZiBuMSA+IG4yXG5cdFx0XHQobjEgPCAobjIgKyB0b2xlcmFuY2UpKVxuXHRcdGVsc2Vcblx0XHRcdChuMSA+IChuMiAtIHRvbGVyYW5jZSkpXG5cblx0c2F2ZU1hcCA9IChkcmF3TWFwLCByZXBsYWNlLCBjb29yZGluYXRlcywgdG8pLT5cblx0XHR1bmxlc3MgZHJhd01hcFtyZXBsYWNlXT9cblx0XHRcdGRyYXdNYXBbcmVwbGFjZV0gPSBbXVxuXHRcdGRyYXdNYXBbcmVwbGFjZV0ucHVzaCB7YzogY29vcmRpbmF0ZXMsIHRvOiB0b31cblx0XHRyZXR1cm4gZHJhd01hcFxuXG5cdCMgcHVibGljXG5cdHJlcGxhY2VDb2xvcnM6IChvYmpSZXBsYWNlKS0+XG5cdFx0c3RhcnQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuXHRcdGlmIG9ialJlcGxhY2Vcblx0XHRcdGlmIG9ialJlcGxhY2UubGVuZ3RoID4gMFxuXHRcdFx0XHRpZiBPYmplY3Qua2V5cyhAZHJhd01hcCkubGVuZ3RoID09IDBcblx0XHRcdFx0XHRAcmVwbGFjZVdpdGhvdXRNYXAgb2JqUmVwbGFjZVxuXHRcdFx0XHRlbHNlIFxuXHRcdFx0XHRcdEByZXBsYWNlV2l0aE1hcCBvYmpSZXBsYWNlXG5cdFx0XHRAY3R4LnB1dEltYWdlRGF0YShAZHJhd2VkLCAwLCAwKVxuXHRcdGVsc2Vcblx0XHRcdGZhbHNlXG5cdFx0ZW5kID0gbmV3IERhdGUoKS5nZXRUaW1lKClcblx0XHQjIGNvbnNvbGUubG9nIChlbmQgLSBzdGFydClcblx0XHR0cnVlXG5cblx0cmVwbGFjZVdpdGhvdXRNYXA6IChvYmpSZXBsYWNlKS0+XG5cdFx0aSA9IDBcblx0XHR3aGlsZSBpIDwgQGRyYXdlZC5kYXRhLmxlbmd0aFxuXHRcdFx0Zm9yIHIgaW4gb2JqUmVwbGFjZVxuXHRcdFx0XHRmcm9tID0gcmdiVG9IZXgoci5mcm9tKVxuXHRcdFx0XHR0byA9IHJnYlRvSGV4KHIudG8pXG5cdFx0XHRcdHIudG9sZXJhbmNlID0gMTAgdW5sZXNzIHIudG9sZXJhbmNlXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRwcm94aW1pdHkoQGRyYXdlZC5kYXRhW2krMF0sZnJvbVswXSkgPD0gci50b2xlcmFuY2UgYW5kXG5cdFx0XHRcdCAgXHRwcm94aW1pdHkoQGRyYXdlZC5kYXRhW2krMV0sZnJvbVsxXSkgPD0gci50b2xlcmFuY2UgYW5kXG5cdFx0XHRcdCAgXHRwcm94aW1pdHkoQGRyYXdlZC5kYXRhW2krMl0sZnJvbVsyXSkgPD0gci50b2xlcmFuY2Vcblx0XHRcdFx0KVxuXG5cdFx0XHRcdFx0QGRyYXdNYXAgPSBzYXZlTWFwKEBkcmF3TWFwLCByLmZyb20sIGksIG9ialJlcGxhY2UuaW5kZXhPZihyKSlcblx0XHRcdFx0XHRAZHJhd2VkLmRhdGFbaSswXSA9IHRvWzBdXG5cdFx0XHRcdFx0QGRyYXdlZC5kYXRhW2krMV0gPSB0b1sxXVxuXHRcdFx0XHRcdEBkcmF3ZWQuZGF0YVtpKzJdID0gdG9bMl1cblx0XHRcdGkgKz0gNFxuXG5cdHJlcGxhY2VXaXRoTWFwOiAob2JqUmVwbGFjZSktPlxuXHRcdGZvciBjb2xvciBvZiBAZHJhd01hcFxuXHRcdFx0Zm9yIGMgaW4gQGRyYXdNYXBbY29sb3JdXG5cdFx0XHRcdHRvID0gcmdiVG9IZXgob2JqUmVwbGFjZVtjLnRvXS50bykgXG5cdFx0XHRcdEBkcmF3ZWQuZGF0YVtjLmMgKyAwXSA9IHRvWzBdXG5cdFx0XHRcdEBkcmF3ZWQuZGF0YVtjLmMgKyAxXSA9IHRvWzFdXG5cdFx0XHRcdEBkcmF3ZWQuZGF0YVtjLmMgKyAyXSA9IHRvWzJdXG5cblx0cmVwbGFjZUhleDogKG9ialJlcGxhY2UpLT5cblx0XHRhcnIgPSBbXVxuXHRcdGlmIG9ialJlcGxhY2Vcblx0XHRcdGZvciBpIGluIG9ialJlcGxhY2Vcblx0XHRcdFx0YXJyLnB1c2ggW3JnYlRvSGV4KGkuZnJvbSkscmdiVG9IZXgoaS50byldXG5cdFx0YXJyXG5cblx0dG9EYXRhVVJMOiAocGFyYW1zID0gJ2ltYWdlL3BuZycpLT5cblx0XHR1cmwgPSBudWxsXG5cdFx0dXJsID0gQGNhbnZhcy50b0RhdGFVUkwocGFyYW1zKSBpZiBAY2FudmFzP1x0XHRcdFxuXHRcdEBvcmlnaW5hbCA9IG51bGxcblx0XHRAY2FudmFzID0gbnVsbFxuXHRcdEBjdHggPSBudWxsXG5cdFx0QGRyYXdlZCA9IG51bGxcblx0XHR1cmxcblxuXG5cblxuaWYgYW5ndWxhcj9cblx0Y2xhc3MgSW1hZ2VSZXBsYWNlckRpcmVjdGl2ZVxuXHRcdGxpbmsgPSAoc2NvcGUsIGVsLCBhdHRyLCBjdHJsKS0+XG5cdFx0XHRAb3JpZ2luYWwgPSBuZXcgSW1hZ2UoKVxuXHRcdFx0QG1hcCA9IFtdXG5cblx0XHRcdHJlcGxhY2UgPSAob3JpZ2luYWwsIGNvbG9yUmVwbGFjZSwgZWwpPT5cblx0XHRcdFx0ZWwuY2xhc3NMaXN0LnRvZ2dsZSgnbG9hZGluZycpXG5cdFx0XHRcdGN1cnJlbnRJbWFnZSA9IG5ldyBJbWFnZSgpXG5cdFx0XHRcdGN1cnJlbnRJbWFnZS5jcm9zc09yaWdpbiA9IFwiYW5vbnltb3VzXCJcblx0XHRcdFx0Y3VycmVudEltYWdlLm9ubG9hZCA9ID0+XG5cdFx0XHRcdFx0cmVwbGFjZXIgPSBuZXcgSW1hZ2VSZXBsYWNlcihjdXJyZW50SW1hZ2UsIEBtYXApXG5cdFx0XHRcdFx0cmVwbGFjZXIucmVwbGFjZUNvbG9ycyhjb2xvclJlcGxhY2UpXG5cdFx0XHRcdFx0QG1hcCA9IHJlcGxhY2VyLmRyYXdNYXAgXG5cdFx0XHRcdFx0ZWwuc3JjID0gcmVwbGFjZXIudG9EYXRhVVJMKClcblx0XHRcdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKCdsb2FkaW5nJylcblx0XHRcdFx0Y3VycmVudEltYWdlLnNyYyA9IG9yaWdpbmFsLnNyY1x0XHRcdFxuXHRcdFx0XG5cdFx0XHRpZiBlbFswXS5zcmM/XG5cdFx0XHRcdEBvcmlnaW5hbC5zcmMgPSBlbFswXS5zcmNcblx0XHRcdFx0cmVwbGFjZShAb3JpZ2luYWwsc2NvcGUuY29sb3JSZXBsYWNlLCBlbFswXSlcblxuXHRcdFx0aWYgc2NvcGUubmdTcmM/XG5cdFx0XHRcdHNjb3BlLiR3YXRjaCAnbmdTcmMnLCAobiwgbyk9PlxuXHRcdFx0XHRcdGlmIG4/XG5cdFx0XHRcdFx0XHRAb3JpZ2luYWwuc3JjID0gc2NvcGUubmdTcmNcblxuXHRcdFx0c2NvcGUuJHdhdGNoICdjb2xvclJlcGxhY2UnLCAobiwgbyk9PlxuXHRcdFx0XHRpZiBuP1xuXHRcdFx0XHRcdGlmIEBvcmlnaW5hbC5zcmM/XG5cdFx0XHRcdFx0XHRyZXBsYWNlKEBvcmlnaW5hbCxuLCBlbFswXSlcblx0XHRcdCx0cnVlXG5cblxuXHRcdGNvbnN0cnVjdG9yOiAtPlxuXHRcdFx0ZGlyZWN0aXZlID1cblx0XHRcdFx0cmVzdHJpY3Q6IFwiQVwiXG5cdFx0XHRcdGxpbms6IGxpbmtcblx0XHRcdFx0c2NvcGU6XG5cdFx0XHRcdFx0Y29sb3JSZXBsYWNlOiBcIj1cIlxuXHRcdFx0XHRcdG5nU3JjOiBcIkA/XCJcblxuXHRcdFx0cmV0dXJuIGRpcmVjdGl2ZVxuXG5cblx0SW1hZ2VSZXBsYWNlckRpcmVjdGl2ZS4kaW5qZWN0ID0gW11cblxuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdjb2xvci1yZXBsYWNlJyxbXSlcblx0XHQuZGlyZWN0aXZlICdjb2xvclJlcGxhY2UnLCBJbWFnZVJlcGxhY2VyRGlyZWN0aXZlXG4iXX0=
