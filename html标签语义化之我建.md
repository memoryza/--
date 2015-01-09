

 ##html标签语义化
  ------
    
    
    
   今天无意中看见了一篇<a href="http://html5doctor.com/the-main-element/?utm_source=feedburner&utm_medium=feed&utm_campaign=Feed%3A+html5doctor+%28HTML5doctor%29">文章</a>，讲到关于main标签被提上日程并在html5.1的规范特性，究其根源大概就是有了header、footer、nav等
标签以后，为啥没有main这样的标签呢？ 看到这个如果是按照语义化的思路来说我们是应该有一个表示主页面的标签（很多地方都看到各种分析语义化带来的好处）。

   可是反过来想一下？以前的div+css布局需要无论从辅助设备上（屏幕阅读器等等），还是从阅读上还是class命名上等等的劣势也被语义化的标签替换。然后会有很多语义化标签。然后html标签如雨后春笋般出现，article,
aside,details,figcaption,figure,footer,header,hgroup,main,menu,nav,section,summary等等。但是很多东西就是事多必反。如果反复思考如此种类繁多的标签难道不能满足我们构建页面的各种需求嘛？
还会不会继续增加新标签，遇到某一种场景我会不会纠结是用a还是用b，是不是div就该死呢？使用什么标签，才是“语义化”。选择标签就成了一件很痛苦的事。
 
  如此多的标签让刚刚开始了解html的开发者看来是如此的头疼，因为在还没有完全搞明白这些标签之前我就知道了语义化，然后我就会反复纠结，我不应该用div，我应该用section，header，footer替换，然后就会造成各种
