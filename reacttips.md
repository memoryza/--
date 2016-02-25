react 
input元素设置onchange事件handleFunc以后，通过handleFunc获取e.target.value 可以获取到，如果设置了setTimeout(function() {}, 0)以后无法获取，原因是target会被释放,不能异步获取