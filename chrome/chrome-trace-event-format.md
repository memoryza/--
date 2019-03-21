##chrome trace event format

###介绍
跟踪事件格式是通过跟踪查看器应用处理的跟踪数据，跟踪查看器识别四种样本。

	1、json字符串
	2、json 对象
    3、以#tracer开始ftrace 文本数据
    4、基于Android systrace 的html

 这个文档描述json的数据格式和提供更多信息的links在linux ftrace 执行函数


###JSON格式
   json形式的事件数据提供两种略微不同的数据结构
####JSON数组格式
跟踪查看器提供简单的数据JSON数组格式，实际上就是没有经过时间戳进行排序的，事件对象的数据。
代码格式如下：
		
		[ {"name": "Asub", "cat": "PERF", "ph": "B", "pid": 22630, "tid": 22630, "ts": 829},
  {"name": "Asub", "cat": "PERF", "ph": "E", "pid": 22630, "tid": 22630, "ts": 833} ]
 




When provided as a string to the importer the ] at the end of the JSON Array Format is optional. The Trace Viewer importer will automatically add a ] if needed to turn the string into valid JSON.. This is to support tracing systems that can not cleanly finish writing the trace. For example, when tracing the exit of a program.




###JSON对象格式


json对象的方式给跟踪查看器提供了更灵活的数据格式，除了traceEvents以外，其他都是选填属性。时间不必按照时间戳排序


		{
		  "traceEvents": [
		    {"name": "Asub", "cat": "PERF", "ph": "B", "pid": 22630, "tid": 22630, "ts": 829},
		    {"name": "Asub", "cat": "PERF", "ph": "E", "pid": 22630, "tid": 22630, "ts": 833}
		  ],
		  "displayTimeUnit": "ns",
		  "systemTraceEvents": "SystemTraceData",
		  "otherData": {
		    "version": "My Application v1.0"
		  },
		  "stackFrames": {...}
		  "samples": [...],
		}




displayTimeUnit: [string] 支持ms 和ns 默认ms
systemTraceEvents: [string] 是linux上的 ftrace data 格式或者是Windows ETW trace data。
   数据必须以 # tracer开始


powerTraceAsString： 
If provided, powerTraceAsString is a string of BattOr power data.




If provided, the stackFrames field is a dictionary of stack frames, their ids, and their parents that allows compact representation of stack traces throughout the rest of the trace file. It is optional but sometimes very useful in shrinking file sizes.




The samples array is used to store sampling profiler data from a OS level profiler. It stores samples that are different from trace event samples, and is meant to augment the traceEvent data with lower level information. It is OK to have a trace event file with just sample data, but in that case  traceEvents must still be provided and set to []. For more information on sample data, refer to the global samples section.




If provided, controllerTraceDataKey is a string that specifies which trace data comes from tracing controller. Its value should be the key for that specific trace data. For example, {..., "controllerTraceDataKey": "traceEvents"} means the data for traceEvents comes from the tracing controller. This is mainly for the purpose of clock synchronization.




Any other properties seen in the object, in this case otherData are assumed to be metadata for the trace. They will be collected and stored in an array in the trace model. This metadata is accessible through the Metadata button in Trace Viewer.




###Event Descriptions


There are a common set of fields for each of the events.


	{
	  "name": "myName",
	  "cat": "category,list",
	  "ph": "B",
	  "ts": 12345,
	  "pid": 123,
	  "tid": 456,
	  "args": {
	    "someArg": 1,
	    "anotherArg": {
	      "value": "my value"
	    }
	  }
	}







name: The name of the event, as displayed in Trace Viewer
cat: The event categories. This is a comma separated list of categories for the event. The categories can be used to hide events in the Trace Viewer UI.
ph: The event type. This is a single character which changes depending on the type of event being output. The valid values are listed in the table below. We will discuss each phase type below.
ts: The tracing clock timestamp of the event. The timestamps are provided at microsecond granularity.
tts: Optional. The thread clock timestamp of the event. The timestamps are provided at microsecond granularity.
pid: The process ID for the process that output this event.
tid: The thread ID for the thread that output this event.
args: Any arguments provided for the event. Some of the event types have required argument fields, otherwise, you can put any information you wish in here. The arguments are displayed in Trace Viewer when you view an event in the analysis section.


Optional


cname: A fixed color name to associate with the event. If provided, cname must be one of the names listed in trace-viewer's base color scheme's reserved color names list



The following table lists all event types and their associated phases:
