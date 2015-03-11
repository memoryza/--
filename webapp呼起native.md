	var invoke = {

            config: {
                android: 'bdstock://activity/main',
                ios: 'bdstock://',
                m: 'http://gupiao.baidu.com/jump.php?from=phone'
            },
            call: function () {
            
                var self = this;
                var ua = navigator.userAgent;
                var isChrome= null != ua.match( /Chrome/i ) && null == ua.match( /Version\/\d+\.\d+(\.\d+)?\sChrome\//i );
                
                var sys = this.detectOS();
                var url = this.config[sys];
     
                var body = document.body;
                var iframe = document.createElement('iframe');
                var start = +new Date();
                iframe.id = 'callNativeApp';
                iframe.style.display = 'none';
                
                iframe.src = url;
                window.addEventListener('pagehide', hide, true);
                window.addEventListener('pageshow', hide, true);
                function hide() {
                    clearTimeout(timer);
                    window.removeEventListener('pagehide', hide, true);
                    window.removeEventListener('pageshow', hide, true);
                }
                body.appendChild(iframe);
                var timer = setTimeout(function (){
                        timer = setTimeout(function (){
                            iframe.onload = null;
                            iframe = null;
                            body.removeChild(iframe);
                            var newTime = +new Date();
                            if (newTime - now > 1200){
                                $('#downloadfile').attr('src', invoke.config.m);
                            } else{
                                location.href = invoke.config.m;
                            }
                        }, 1000);
                    }, 60);
                // }
            },
            detectOS: function () {
                var ua = navigator.userAgent;
                var sys = 'NA';
                if (new RegExp('\\b(?:iPhone|CPU|iPh) OS\\/? *([0-9._]*)', 'i').test(ua)) {
                    sys = 'ios';
                } else if (new RegExp('\\b(?:Android|Adr)\\/? *([0-9._+]*)', 'i').test(ua)) {
                    sys = 'android';
                }
                return sys;
            }  
        };