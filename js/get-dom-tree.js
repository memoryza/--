/**
 * @file 获取网页dom tree
 * @author memoryza
 */
if (!window.__tree__) {
  var __tree__ = (function (win) {
    if (typeof Object.assign != 'function') {
      // Must be writable: true, enumerable: false, configurable: true
      Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) { // .length of function is 2
          'use strict';
          if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
          }

          var to = Object(target);

          for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
              for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                  to[nextKey] = nextSource[nextKey];
                }
              }
            }
          }
          return to;
        },
        writable: true,
        configurable: true
      });
    }
    function isSpecialElement(element) {
      return [4, 8, 9, 10, 12].indexOf(element.nodeType) !== -1;
    }

    function getElementViewPos(element) {
      if (element) {
        if (typeof element.getBoundingClientRect === 'function') {
          var pos = element.getBoundingClientRect();
          return {
            left: pos.left,
            top: pos.top
          }
        } else {
          var actualLeft = element.offsetLeft;
          var actualTop = element.offsetTop;
          var current = element.offsetParent;
          while (current !== null) {
            actualLeft += current.offsetLeft;
            actualTop += current.offsetTop;
            current = current.offsetParent;
          }
          var elementScrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
          var elementScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
          return {
            left: actualLeft - elementScrollLeft,
            top: actualTop - elementScrollTop
          }
        }
      }
      return {};
    }
    // 页面是否缩放因子
    var viewScale = 1;
    var scaleMeta = document.querySelectorAll('meta[name="viewport"]');
    if (scaleMeta && scaleMeta.length) {
      var meta = document.querySelectorAll('meta[name="viewport"]')[0];
      var initScale = meta.getAttribute('content').match(/initial-scale=([\d\.]*),/);
      if (initScale && initScale.length > 1) {
        viewScale = parseFloat(initScale[1]);
      }
    }
    var screenHeight = window.innerHeight;
    var screenWidth = window.innerWidth;
    var isIos = navigator.userAgent.match(/ipad|iphone/i);
    if (viewScale === 1 && !isIos) {
      viewScale = window.devicePixelRatio || 1;
      screenHeight *= viewScale;
      screenWidth *= viewScale;
    }
    // 如果页面设置了scale=1但是实际物理像素要乘以dpr(经过scale=0.333例子）获取的window.innerWidth 不是实际物理像素
    var dpr = window.devicePixelRatio || 1;
    if (isIos) {
      dpr = viewScale;
    }

    // 缓存的dom树对象
    var domTreeCache = {};
    // 唯一ID
    var viewId = 0;

    // viewport Android设置initScale 影响window.innerWidth（可能是物理像素也可能是设备宽度px）, screen.width不受影响
    if (!isIos && window.innerWidth / screen.width > 1.5) {
      dpr = 1;
    }
    function getElementInfo(element, children, initHeight) {
      // 永远获取跟viewport设置相关的像素，比如像素点是 100* 100；  设备320x568 设置viewport=1  获取的是100*100，如果viewport=0.5 获取是200*200

      var pos = isSpecialElement(element) || element.nodeType === 3 ? null : getElementViewPos(element);
      var props = {
        resourceId: element.id || '',
        viewKey: "_h5_" + (++viewId),
        className: element.nodeName || '',
        accessbilityId: element.className || '',
        parentName: element.parentNode ? element.parentNode.nodeName : null,
        children: children,
        nodeType: element.nodeType,
        text: element.hasChildNodes() ? "" : element.nodeValue // 如果包含子元素则暂时不传递innerText
      };
      if (pos) {
        props.x = pos.left * dpr;
        props.y = pos.top * dpr + initHeight;
        props.width = element.offsetWidth * dpr;
        props.height = element.offsetHeight * dpr;
      }
      try {
        element.setAttribute('data-viewKey', "_h5_" + viewId);
      } catch (e) {

      }
      domTreeCache["_h5_" + viewId] = Object.assign(JSON.parse(JSON.stringify(props)), {
        el: element
      });
      return props;
    }
    // 规则命中则不收集该元素
    function isIgnoreElement(element) {
      if (element) {
        // 文本元素搜集
        if (element.nodeType === 3) {
          return false;
        }
        // 隐藏元素过滤掉
        if (element.style.display === 'none') {
          return true;
        }
        // 如果元素没有子元素并且高或者宽为0则忽略
        if ((element.offsetWidth === 0 || element.offsetHeight === 0) && !element.hasChildNodes()) {
          return true
        }
        // script 忽略
        if (['SCRIPT', 'STYLE'].indexOf(element.nodeName) !== -1) {
          return true;
        }
        // 不在屏幕内则删除
        var pos = isSpecialElement(element) || element.nodeType === 3 ? {} : getElementViewPos(element)
        if ((pos.left < 0 && pos.left + element.offsetWidth < 0) // 超出左侧
          || (pos.top < 0 && pos.top + element.offsetHeight < 0) // 超出顶部
          || (pos.left > screenWidth) // 超出右侧
          || (pos.top > screenHeight) // 超出底部
        ) {
          return true;
        }
        return false;
      }
      return true;
    }

    function getDomTree(element, notClear, initHeight) {
      if (!notClear) {
        domTreeCache = {};
        viewId = 0;
      }
      var children = [];
      if (element.hasChildNodes()) {
        // 忽略元素
        if (isIgnoreElement(element)) {
          return false;
        }
        var len = element.childNodes.length;
        for (var j = 0; j < len; j++) {
          var child = getDomTree(element.childNodes[j], true, initHeight);
          if (child) {
            children.push(child);
          }
        }
        return getElementInfo(element, children, initHeight);
      } else if (isSpecialElement(element)) {
        return false;
      } else if (!(element.nodeType === 3 && (!element.nodeValue
        || !element.nodeValue.trim() || element.nodeValue.trim() === '↵'))) {
        // 忽略元素
        if (isIgnoreElement(element)) {
          return false;
        }
        return getElementInfo(element, [], initHeight);
      }
      return false;
    }

    function dispatch(viewKey, action, value) {
      try {
        var element = domTreeCache[viewKey];
        if (element) {
          switch (true) {
            case action === 'click':
              element.el.click && element.el.click();
              break;
            case action === 'input':
              element.el.value = value;
              break;
            default:
              break;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    function throttle(method, delay, duration) {
      var timer = null, begin = new Date();
      return function () {
        var context = this, args = arguments, current = new Date();
        clearTimeout(timer);
        if (current - begin >= duration) {
          method.apply(context, args);
          begin = current;
        } else {
          timer = setTimeout(function () {
            method.apply(context, args);
          }, delay);
        }
      }
    }
    function pushGpath(tree, actionType, viewKey, actionContent) {
      // 反馈当前网页中html 系列化的tree
      // example
      // sendDomTree({
      //   actionType: actionType,
      //   tree: tree,
      //   viewKey: viewKey,
      //   actionContent: actionType === 'input' ? actionContent : ''
      // });
    }

    var isLisenter = false;
    var timer = +new Date();
    var lastDomKey = null;
    function lisenter(parHeight) {
      if (isLisenter) {
        return;
      }
      isLisenter = true;
      var self = this;
      var tree = getDomTree(document.body, false, parHeight);

      this.clickFunc = function (event) {
        var el = event.target || event.srcElement;
        if ((el.tagName === 'INPUT' && el.type === 'text')
          || el.tagName === 'TEXTAREA') {
          return;
        }
        if (el.getAttribute('data-viewKey') === lastDomKey) {
          // 有些页面频繁的触发click(h5页面有bug)，造成多次调用
          if (timer + 200 < +new Date()) {
            timer = +new Date();
            pushGpath(tree, 'click', el.getAttribute('data-viewKey'));
          }
        } else {
          lastDomKey = el.getAttribute('data-viewKey');
          pushGpath(tree, 'click', el.getAttribute('data-viewKey'));
        }
      }
      this.touchStartFunc = function (event) {
        var el = event.target || event.srcElement;
        if ((el.tagName === 'INPUT' && el.type === 'text')
          || el.tagName === 'TEXTAREA') {
          return;
        }
        tree = getDomTree(document.body, false, parHeight);
      }

      this.inputFunc = throttle(function (e) {
        if (e.target.value) {
          var tree = getDomTree(document.body, false, parHeight);
          var el = e.target || e.srcElement;
          pushGpath(tree, 'input', el.getAttribute('data-viewKey'), e.target.value);
        }
      }, 50, 100);
      if (window.FastClick) {
        FastClick(document.body);
      }
      document.body.addEventListener('click', this.clickFunc, true);
      document.body.addEventListener('touchstart', this.touchStartFunc, false);
      var inputList = document.querySelectorAll('input,textarea');
      for (var i = 0; i < inputList.length; i++) {
        var input = inputList[i];
        input.addEventListener('input', self.inputFunc, false);
      }
    }
    function getMeta(name) {
      var metaList = document.querySelectorAll('meta[name=' + name + ']');
      if (metaList && metaList.length) {
        var meta = metaList[0];
        return meta.getAttribute('content', 4);
      }
      return '';
    }
    function scrollListener() {
      var startPoint = {};
      var endPoint = {};
      document.addEventListener('touchstart', function (e) {
        var touchPoint = e.touches[0];
        startPoint = {
          screenX: touchPoint.screenX,
          screenY: touchPoint.screenY,
          pageX: touchPoint.pageX,
          pageY: touchPoint.pageY,
          clientX: touchPoint.clientX,
          clientY: touchPoint.clientY,
        }
      }, false);
      document.addEventListener('touchend', function (e) {
        var touchPoint = e.changedTouches[0];
        endPoint = {
          screenX: touchPoint.screenX,
          screenY: touchPoint.screenY,
          pageX: touchPoint.pageX,
          pageY: touchPoint.pageY,
          clientX: touchPoint.clientX,
          clientY: touchPoint.clientY,
        };
        var hasMoved = Math.abs(startPoint.pageX - endPoint.pageX) > 40 || Math.abs(startPoint.pageY - endPoint.pageY) > 40;
        let pointData = {
          startPoint: startPoint,
          endPoint: endPoint,
        };
        startPoint = {};
        endPoint = {};
        if (hasMoved) {
          console.log(pointData);
          return pointData;
        }
      }, false);
    }
    return {
      /**
       * @desc 事件触发行为
       * @params {HTMLElement} element dom树根元素
       * @params {Boolean} notClear 是否清理原有dom树
       * @params {Number} parHeight 客户端实际高度（
              因为hybrid中webview获取的top是以webview的起始点开始，但是客户端回溯的时候是点击屏幕，
              起始点是app的左上点，造成点击高度和js记录的高度不一致的问题)

       * @return {Object}
       */
      getDomTree: getDomTree,
      /**
       * @desc 事件触发行为
       * @params {Number} viewKey dom树唯一ID
       * @params {String} action 事件行为 [click, input]
       * @params {String} value 触发值，如果是input内容填充则给值，其他情况不要这个值
       */
      dispatch: dispatch,
      /**
       * @desc 监听页面行为并回调给收集方
       * @params {Number} parHeight 客户端顶部导航占用实际高度（
              因为hybrid中webview获取的top是以webview的起始点开始，但是客户端回溯的时候是点击屏幕，
              起始点是app的左上点，造成点击高度和js记录的高度不一致的问题)

       */
      lisenter: lisenter,
      /**
       * @desc 获取固定媒体标签名称的值
       * @params name
       * @return string
       */
      getMeta: getMeta,
      /**
       * @desc 获取一次滚动的起始终点位置信息
       * @return Object {startPoint: {page, screen, client}, endPoint: {page, screen, client}}
       */
      scrollListener: scrollListener,
    }
  })(window);
  
  // demo
  // var tree = __tree__.getDomTree(document.body, false, parHeight);