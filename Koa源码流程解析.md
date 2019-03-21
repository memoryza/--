##Koa源码流程解析
koa使用大体可以分为三个阶段
###1、init


 初始化阶段是将context、request、reponse等挂载到对象上下文

    this.proxy = false;
    this.middleware = [];
    this.subdomainOffset = 2;
    this.env = process.env.NODE_ENV || 'development';
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }


context包含一个基础对象原型以及对应代理request和response方法和属性
request 封装了所有跟req有关的方法和属性
       request 封装了所有跟res有关的方法和属性
###2、装载middleware
然后是use
     use主要作用就是讲异步方法放到上下文的middleware中并返回上下文
###3、启动监听并等待请求后执行middleware
然后就是listen

	1、调用http的createServer传递this.callback()
		1-1、调用koa-compose（主要返回一个callback(context,next）函数,然后当请求过来的时候，先dispatch第1个use传递middleware，内部处理判断当是middleware数组的最后一个直接调用next，否则否则确认middleware是一个函数直接用Promise进行包装，middleware函数调用传递(context, dispatch:middleware下一个函数)
		1-2、返回一个接受http.Createserver 调用的函数(接受req,res)
    		1-2-1、生成createContext上下文，这里主要干的事情就是把this.context, req, res, ctx等做引用,并返回context，这里已经把流转过程中的ctx全部关联了
    		1-2-2、调用请求函数this.handlerRequest(ctx, middleware的promise联调函数)
         	1-2-2-1、给出默认反馈的res
         	1-2-2-2、设置默认的onerror处理
         	1-2-2-3、handleResponse函数： 在app.use中各个middleware最后会把返回体携带在ctx中，然后这里会统一根据ctx的情况处理返回数据（比如处理json、处理trunck）
         	1-2-2-4、onFinished 根据res的状态判断执行是否完成，判断决定是否调动setImmediate| process.nextTick 
         	1-2-2-5、middleware经过compose的prommise对象调用.then(1-2-2-3的函数).(1-2-2-2的异常处理函数)

	2、server的listen









