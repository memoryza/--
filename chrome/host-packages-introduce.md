##host模块分析（/front_end/host/）

1、platform 包含一堆全局的公用方法（例如runOnWindowLoad）和js api的扩展（例如promise和map的扩展）， 无外部依赖 ,按理来说他应该叫util

2、host
	
	|-- Platform  这个向全局生命一个Host对象，涵盖机器平台、字体，为了防止反复走函数调用和判断逻辑，对应函数一旦调用会后都会向Host挂载一个_${method}的变量
			platform（method） 获取系统
			isMac|isWin 判断是那个系统
			isCustomDevtoolsFrontend(method) 判断是否是devtools的页面
			fontFamily 获取系统字体
    |--InspectorFrontendHost 将InspectorFrontendHostStub 和 InspectorFrontendAPIImpl类挂载到Host下，
    
    向全局抛出InspectorFrontendHost 对象（new Host.InspectorFrontendHostStub()）
##Host.InspectorFrontendHostStub类
	constructor中定义keydown 当按按下Ctrl+/Ctrl-  的时候阻止冒泡，实例方法包含获取平台、devtools右键save相关，判断被调试的页面时候在前台，以及更改tab标题、copy文本、新开窗口以及需要保存到ls相关操作的函数，当然也包含一些空方法和写死返回的方法，不一一说明了，具体方法名称
![类结构]()
    
    