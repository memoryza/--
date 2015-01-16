以下是在看seajs源代码个人的一点认知观念，仅作为学习和研究的分析成果。个人能力有限，包含错误地方请谅解。

seajs代码整体流程思路

4—16声明seajs对象，给出版本号和挂载data及events属性…

23-37声明类型识别函数及内部唯一自增cid

44-96为data挂载events并利用pubsub模式实现了一个的事件订阅机制。

102-152根据四个正则实现辨别路径，获取真实路径(包含类似shell的文件路径寻找)和为文件添加js尾巴。

155-204从根据别名，路径，变量，map中找寻id对应的资源文件路径(这里的节点找从data下的alias, paths, vars,maps寻找)

207-238 添加绝对路径和系统跟路径正则，根据条件为资源添加前缀，1:依次为验证绝对路径，2:验证相对路径，添加refuri 或data. cwd. 3.验证是否是根路径【主要是针对于l系统路径识别，估计是在npm这类包管理中用】是的话添加data.cwd  4.直接data.base +id。最后判断一下是不是返回的 cdn 地址，如果是的话加上当前页面的协议。 最后获取真是地址

240-256 根据资源id获取统一资源名称（但是内部的parse***的调用顺序不知道是否可变）

262-270 分别获取是否webworker使用、过滤掉about:*** 和blob:XXX这种资源分析的情况、获取cwd（如果是浏览器则是他的host地址，否则是空）

272-326 如果是webworker则通过抛出异常（会包含文件路径，行号，列号），根据stack返回的堆栈一步一步的匹配出根目录，然后设置loaderpath和loaderDir，最后判断cwd是否存在而决定是否反过来赋值一次

328-344如果不支持webworker 则通过获取id为seajsnode或是最后一个js 的全路径分析复制给loaderpath和loaderDir）

350-436 构建了一个加载js的接口，依旧是如果是支持webworker使用该方式，不支持根据各个浏览器的差异性插入js，然后监听onload和onreadystatechange

437-462 获取ie6-9下load事件触发不正确的js,在977貌似没有处理

470-642 是把define参数中的factory 变成string进行语法分析获取依赖信息（好多，看着头大大的。）

647 cacheMods 透过这个对象可以查看到当前页面包含n个use加载过来的js，n个async过来的js，还有n个模块。每个uri中都包含各自dependencies、exports、id、status、uri信息。

648-670  包含请求模块url，已经请求模块url，回掉列表及状态


【未完】



