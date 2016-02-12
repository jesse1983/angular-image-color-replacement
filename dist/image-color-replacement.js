var ImageReplacer,ImageReplacerDirective;ImageReplacer=function(){function e(e){this.original=e,this.canvas=a(e),this.ctx=t(this.canvas),this.drawed=r(this.ctx,e)}var t,r,a,n,i,o;return e.original=null,e.canvas=null,o=function(e){var t,r,a,n,i;if(e=e.replace("#",""),t=[],6===e.length)for(i=[0,1,2],a=0,n=i.length;n>a;a++)r=i[a],t.push(parseInt(e.substr(2*r,2),16));return t},a=function(e){var t;return t=document.createElement("canvas"),t.width=e.width,t.height=e.height,t},t=function(e){return e?e.getContext("2d"):void 0},r=function(e,t){var r;return e.drawImage(t,0,0,t.width,t.height),r=e.getImageData(0,0,t.width,t.height)},i=function(e,t){return Math.abs(e-t)},n=function(e,t,r){return e>t?t+r>e:e>t-r},e.prototype.replaceColors=function(e){var t,r,a,n,l,c;if(e){if(e.length>0)for(r=0;r<this.drawed.data.length;){for(a=0,n=e.length;n>a;a++)l=e[a],t=o(l.from),c=o(l.to),l.tolerance||(l.tolerance=10),i(this.drawed.data[r+0],t[0])<=l.tolerance&&i(this.drawed.data[r+1],t[1])<=l.tolerance&&i(this.drawed.data[r+2],t[2])<=l.tolerance&&(this.drawed.data[r+0]=c[0],this.drawed.data[r+1]=c[1],this.drawed.data[r+2]=c[2]);r+=4}this.ctx.putImageData(this.drawed,0,0)}return!0},e.prototype.replaceHex=function(e){var t,r,a,n;if(t=[],e)for(a=0,n=e.length;n>a;a++)r=e[a],t.push([o(r.from),o(r.to)]);return t},e.prototype.toDataURL=function(e){var t;return null==e&&(e="image/png"),t=this.canvas.toDataURL(e),this.original=null,this.canvas=null,this.ctx=null,this.drawed=null,t},e}(),"undefined"!=typeof angular&&null!==angular&&(ImageReplacerDirective=function(){function e(){var e;return e={restrict:"A",link:t,scope:{colorReplace:"="}}}var t,r;return t=function(e,t,a,n){return this.original=new Image,this.original.src=t[0].src,t[0].style.display="none",r(this.original,e.colorReplace,t[0]),e.$watchCollection("colorReplace",function(e){return function(a,n){return null!=a?(t[0].style.display="none",r(e.original,a,t[0])):void 0}}(this))},r=function(e,t,r){var a;return a=new Image,a.crossOrigin="anonymous",a.onload=function(e){return function(){var e;return e=new ImageReplacer(a),e.replaceColors(t),r.src=e.toDataURL(),r.style.display=null}}(this),a.src=e.src},e}(),ImageReplacerDirective.$inject=[],angular.module("color-replace",[]),angular.module("color-replace").directive("colorReplace",ImageReplacerDirective));