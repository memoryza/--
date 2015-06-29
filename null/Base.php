<?php
	/**
	 * @file H5页面基础类
	 * @author memoryza(jincai.wang@foxmail.com)
	 **/

	class GSTBase {
	 	public $isAjax;
        private $assignVars = array();
	 	public function init() {
	 		$act = $this->gpc('act');
            $this->isAjax = $this->gpc('ajax');
            $this->baseAsset();
            if(method_exists($this, $act)) {
                $this->{$act}();
            }  else {
                // 默认都进入index页面
                $this->index();
            }
	 	}

        // 全局公共变量植入,可以覆盖
        private function baseAsset() {
            $isWeixin = ereg('MicroMessenger', $_SERVER['HTTP_USER_AGENT']);
            $fromlightapp = $this->gpc('bd_source_light') ? true : false;
            $this->assignVars =  array(
                'fromlightapp'    => $fromlightapp,
                'isWeixin'        => $isWeixin,
            );
        }

	 	public function display($tpl, $data=null) {
            $path = dirname(__FILE__) . '/../tpl/';
            $path .= $tpl;
            if ($tpl) {
                if (is_array($data)) {
                    $data = array_merge($this->assignVars, $data);
                    extract($data, EXTR_PREFIX_SAME, 'data');
                } else {
                    extract($this->assignVars, EXTR_PREFIX_SAME, 'data');
                }
                if (file_exists($path)) {
                	require($path);
                } else {
                	$this->error("未能找到模板{$tpl}");
                }
            } else {
                $this->error('请选择要显示的模板');
            }
        }

        public function gpc($str, $def_val='') {
        	$ret = isset($_GET[$str]) ? $_GET[$str] 
        		: (isset($_POST[$str]) ? $_POST[$str] : $def_val);
        	return $ret;
        }

        public function error($msg) {
        	if ($this->isAjax) {
        		exit(json_encode(array(
        			'errorNo' => 1,
        			'msg'     => $msg,
        		)));
        	}
        	exit($msg);
        }
	}
