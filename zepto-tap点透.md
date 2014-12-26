#zepto tap点击穿透分析而fastclick 不会点击穿透

  
  【个人总结】
  首先要明确dom-events是不支持tap事件的，
  
  那么tap是怎么来的呢？

  zepto的tap事件是通过touchstart,touchend(android 4.0.x不支持touchend，通过touchmove 设置定时器触发touched)模拟出来的，事件是绑定在document上，大体思路是在touchstart的时候向对象附加点击的x,y；（其中还包含很多细节，比如设置最后点击时间，设置长按定时器等）；touchmove的过程动态的计算手势在view上的偏移点，最后touchend 根据偏移点确定是否是点击，如果是点击动态的构建一个event然后根据设置的状态获取是单机、双击。
  原则上根据上边的步骤可以在m版本上做到事件的响应等，但是点穿又是如何发生的（在我们手写的业务代码中都习惯event.preventDefault();return false 等组织事件冒泡），
  	   
          if (deltaX < 30 && deltaY < 30) {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function() {

              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              var event = $.Event('tap')
              event.cancelTouch = cancelAll
              touch.el.trigger(event)

              // trigger double tap immediately
              if (touch.isDoubleTap) {
                if (touch.el) touch.el.trigger('doubleTap')
                touch = {}
              }

              // trigger single tap after 250ms of inactivity
              else {
                touchTimeout = setTimeout(function(){
                  touchTimeout = null
                  if (touch.el) touch.el.trigger('singleTap')
                  touch = {}
                }, 250)
              }
            }, 0)
          } else {
            touch = {}
          }
          deltaX = deltaY = 0
   
 看到如下代码，你会发现，tap是通过setTimeout ，定时器的代码在js引擎执行的优先级低，会等待当前没有在执行的时候才会触发，这样算是我们阻止冒泡依旧会造成点透的问题。
 
 
 那么fastClick又是怎么做到的呢？
 今天头疼脑大的读了一下fastClick的代码，大概看了一下它的流程（当然理解也会存在偏差），大致分析一下fastClick的流程，状态什么的设定就不说了，fastClick事件绑定在*初始化设定的dom*上，初始化流程
 
    FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};
 然后内部绑定touch\*, click,mouse\* 相关的事件，判断是否有stopImmediatePropagation（如果这个函数会取消dom绑定函数*队列*中在其后绑定事件执行）函数进行事件监听重写
  dom的click事件是通过touchend的去触发（原生的click会比touch事件晚200-300ms），这样就然让click的事件响应提快，那么touchend又如何防止点透呢（内部包含很多平台差异的处理不说了，有些我也遇见过），因为事件绑定到*初始化设定的dom*，在touchend的时候获取到它的触发目标，内部在sendClik的时候判断冒泡的元素是否可以[focus，click],然后每一个可点击的目标对应触发sendClick（内部判断是不是触发源，如果是就创建一个mouseEvent事件然后手动触发）；不是的话就return false；（在我看来内部绑定的onclick除了在touchend不触发的设备上会响应，其他的时候都应该是通过touchend去触发的）。【总觉得写的很乱，一句话说明zepto可点透跟设置定时器去触发有关，就算是阻止默认行为也没不行，fastClick 则是通过touchend触发click，然后内部确定是否是触发源，如果不是blur，如果是则创建event手动触发】，当然内部的触发界定（例如时间，像素这类的）没有说。