(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var oldArrayProtoMethods = Array.prototype; // 不能直接改写数组原有方法 不可靠，因为只有被vue控制的数组才需要改写

  var arrayMethods = Object.create(Array.prototype);
  var methods = ["push", "pop", "shift", "unshift", "splice", "reverse", "sort"];
  methods.forEach(function (method) {
    // AOP切片编程
    arrayMethods[method] = function () {
      var _oldArrayProtoMethods;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 重写数组方法
      // todo ...
      // 有可能用户新增的数据时对象格式 也需要进行拦截
      var result = (_oldArrayProtoMethods = oldArrayProtoMethods[method]).call.apply(_oldArrayProtoMethods, [this].concat(args));

      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          // splice(0,1,xxxx)
          inserted = args.slice(2);
      }

      if (inserted) ob.observeArray(inserted);
      return result;
    };
  });

  function observe(data) {
    //只对对象类型进行观测  非对象类型无法观测
    if (_typeof(data) !== "object" || data == null) {
      console.error("请将data写成函数形式，并return一个对象");
      return;
    } //通过类来实现对象数据的观测，类可以方便扩展，会产生实例


    return new Observer(data);
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(value) {
      _classCallCheck(this, Observer);

      // 需要对这个value属性重新定义
      // value可能是对象 可能是数组，分类来处理
      // value.__ob__ = this;
      Object.defineProperty(value, "__ob__", {
        value: this,
        enumerable: false,
        // 不能被枚举表示 不能被循环
        configurable: false // 不能删除此属性

      });

      if (Array.isArray(value)) {
        // 数组不用defineProperty来进行代理 性能不好
        // push shift reverse sort  我要重写这些方法增加更新逻辑
        Object.setPrototypeOf(value, arrayMethods); // 循环将属性赋予上去

        this.observeArray(value); // 原有数组中的对象  Object.freeze()
      } else {
        this.walk(value);
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(value) {
        for (var i = 0; i < value.length; i++) {
          observe(value[i]);
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        for (var key in data) {
          defineReactive(data, key, data[key]);
        }
      }
    }]);

    return Observer;
  }();

  function defineReactive(data, key, value) {
    if (_typeof(value) === "object") {
      observe(value);
    }

    Object.defineProperty(data, key, {
      get: function get() {
        //收集依赖待写
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        observe(newValue);
        value = newValue;
      }
    });
  }

  function initState(vm) {
    //将所有数据都定义在vm属性上，并且后续更新 需要触发视图更新
    var opts = vm.$options; //获取用户属性

    if (opts.data) {
      initData(vm);
    }
  }

  function initData(vm) {
    var data = vm.$options.data;

    if (typeof data !== "function") {
      console.error("请将data写成函数形式，并return一个对象");
      return;
    }

    data = vm._data = data.call(vm); //通过vm._data 做个代理，后边用户就可以取到this.xx

    for (var key in data) {
      Proxy(vm, "_data", key);
    } //监听data里的属性，定义setter,getter


    observe(data);
  }

  function Proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
    });
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // aa-aa

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //aa:aa

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 可以匹配到标签名  [1]

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //[0] 标签的结束名字
  //    style="xxx"   style='xxx'  style=xxx

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var startTagClose = /^\s*(\/?)>/;
  function parseHTML(html) {
    //<
    function createASTElement(tag, attrs) {
      // vue3里面支持多个根元素 (外层加了一个空元素) vue2中只有一个根节点
      return {
        tag: tag,
        type: 1,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    var root = null;
    var currentParent;
    var stack = []; //栈结构记录标签关系，start push， end取出最后一个元素后，stack的最后一个就是取出来的父元素
    //   <div id="app" a=1 b=2 style="color:green">
    //   <ul>
    //       <li>{{name}}</li>
    //       <li>{{age}}</li>
    //   </ul>
    // </div>
    //根据开始标签 结束标签 文本内容 生成一个ast语法树

    function start(tagName, attrs) {
      var element = createASTElement(tagName, attrs);

      if (!root) {
        root = element;
      }

      currentParent = element; // div>ul>li li

      stack.push(element);
    }

    function end(tagName) {
      var element = stack.pop();
      currentParent = stack[stack.length - 1];

      if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    }

    function chars(text) {
      text = text.replace(/\s/g, "");

      if (text) {
        currentParent.children.push({
          type: 3,
          text: text
        });
      }
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      //解析类似开始标签<div id="1" a="2">  结果为{tagName:"div",attrs:[{name:"id",value:"1"},{name:"a",value:"2"}]}
      var start = html.match(startTagOpen); //start =['<div','div']

      if (start) {
        var match = {
          tagName: start[1],
          //div
          attrs: []
        };
        advance(start[0].length); //"<div".length 删去html字符串开始标签的<div
        // 查找属性

        var _end, attr; //不是开头标签结尾就一直解析


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length); // a=1 a="1" a='1'

          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }

        if (_end) {
          advance(_end[0].length);
          return match;
        }
      }
    }

    while (html) {
      var textEnd = html.indexOf("<");

      if (textEnd == 0) {
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          // 开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } // 结束标签


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      var text = void 0;

      if (textEnd > 0) {
        // 开始解析文本
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length);
        chars(text);
      }
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i]; // name,value

      if (attr.name === 'style') {
        (function () {
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj; // {style:{color:red}}
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); // {a:'aaa',a:1,b:2,}
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function genChildren(el) {
    var children = el.children;

    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
  }

  function gen(node) {
    //childrenk可能是元素也可能是文本，要区分写两个方法 
    if (node.type == 1) {
      return generate(node); //如果是元素，直接调用构造元素render的方法
    } else {
      //文本 逻辑不能用 _c来处理
      // 有{{}} 普通文本  混合文本 {{aa}} aaa {{bbb}} ccc
      var text = node.text;

      if (defaultTagRE.test(text)) {
        // _v(_s(name) + 'aa' + _s(age) + '哈哈'）
        var tokens = [];
        var match;
        var index = 0;
        var lastIndex = defaultTagRE.lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          // aa {{ age }} haha 
          index = match.index;

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")"); // 是带有{{}}
      } else {
        return "_v(".concat(JSON.stringify(text), ")");
      }
    }
  }

  function generate(el) {
    //结果 _c(tag,attrs.join(","),...children_c)
    // console.log(el); // 转换成render代码
    var children = genChildren(el);
    var code = "_c('".concat(el.tag, "',").concat(el.attrs.length ? genProps(el.attrs) : 'undefined', " ").concat(children ? ',' + children : '', ")"); // => js代码 html=> js代码  字符串拼接

    return code;
  }
  /* 
  <div id="app" a=1 b=2>
      <span style"=color:red">{{name}} <a>hello</a></span>
  </div> 
   _c(
      'div',{id:'app',a:1,b:2}
      ,_c(
          'span',
          {style:{color:'red'}}
          ,_s(_v(name)),
          _c(a,undefined,_v('hello'))
          )
  )
  */

  function compileToFunctions(template) {
    var ast = parseHTML(template); //生成ast语法树

    console.log("ast语法树", ast);
    var code = generate(ast); //生成render代码字符串

    console.log("render 函数", code);
    var render = "with(this){return ".concat(code, "}"); //还是一个字符串

    var fn = new Function(render); //可以让字符串变成一个函数

    return fn;
  }

  var id = 0;

  var Watcher = function Watcher(vm, fn, cb, options) {
    _classCallCheck(this, Watcher);

    this.vm = vm;
    this.fn = fn;
    this.cb = cb;
    this.options = options;
    this.id = id++;
    this.fn(); // 调用传入的函数
  };

  function patch(oldVnode, vnode) {
    // oldVnode 是一个真实的元素
    var isRealElement = oldVnode.nodeType;

    if (isRealElement) {
      // 初次渲染
      var oldElm = oldVnode; // id="app"

      var parentElm = oldElm.parentNode; // body

      var el = createElm(vnode);
      console.log("真实DOM", el);
      parentElm.insertBefore(el, oldElm.nextSibling); // 将创建的节点查到原有的节点的下一个

      parentElm.removeChild(oldElm);
      return el; // vm.$el
    }
  }

  function createElm(vnode) {
    // 根据虚拟节点创建真实的节点
    var tag = vnode.tag,
        children = vnode.children,
        key = vnode.key,
        data = vnode.data,
        text = vnode.text,
        vm = vnode.vm;

    if (typeof tag === 'string') {
      console.log(tag); // 可能是组件

      vnode.el = document.createElement(tag); // 用vue的指令时 可以通过vnode拿到真实dom

      updateProperties(vnode);
      children.forEach(function (child) {
        // 如果有儿子节点，就进行递归操作
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function updateProperties(vnode) {
    var newProps = vnode.data || {}; // 属性

    var el = vnode.el; // dom元素

    for (var key in newProps) {
      if (key == 'style') {
        for (var styleName in newProps.style) {
          el.style[styleName] = newProps.style[styleName];
        }
      } else if (key === 'class') {
        el.className = newProps["class"];
      } else {
        el.setAttribute(key, newProps[key]);
      }
    }
  }

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      // 将虚拟节点转换成真实的dom
      var vm = this; // 首次渲染 需要用虚拟节点 来更新真实的dom元素

      vm.$el = patch(vm.$options.el, vnode);
    };
  }
  function mountComponent(vm, el) {
    // 默认vue是通过watcher来进行渲染  = 渲染watcher （每一个组件都有一个渲染watcher）
    var updateComponent = function updateComponent() {
      vm._update(vm._render()); //vm._render执行后返回的是虚拟dom 方法再render.js里，就是让$options.render==》render函数执行

    };

    new Watcher(vm, updateComponent, function () {}, true); // updateComponent();
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; //实例上有个属性$options 表示的是用户传入的所有属性
      //初始化状态

      initState(vm);

      if (vm.$options.el) {
        //数据可以挂载到页面上了
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      el = document.querySelector(el);
      var vm = this;
      var options = vm.$options;
      vm.$options.el = el;

      if (!options.render) {
        //如果不是new Vue({render(){}})的写法
        var template = options.template; //在options上写template的写法

        if (!template && el) {
          template = el.outerHTML; // 火狐不兼容 document.createElement('div').appendChild('app').innerHTMl
        }

        var render = compileToFunctions(template); //把模板编译成render函数

        options.render = render; //挂载到options上render函数
      }

      mountComponent(vm); //两个步骤 ：vm_render()执行返回虚拟DOM vnode===>vm._update(vnode)执行，调用patch(vm.$options.el,vnode)执行，形成真实dom一次性挂载在根节点上
    };
  }

  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, data, data.key, children, undefined);
  }
  function createTextVnode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, data, key, children, text) {
    return {
      vm: vm,
      tag: tag,
      children: children,
      data: data,
      key: key,
      text: text
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._c = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 创建元素的虚拟节点
      return createElement.apply(void 0, [this].concat(args));
    };

    Vue.prototype._v = function (text) {
      // 创建文本的虚拟节点
      return createTextVnode(this, text);
    };

    Vue.prototype._s = function (val) {
      // 转化成字符串
      return val == null ? '' : _typeof(val) == 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._render = function () {
      // render
      var vm = this;
      var render = vm.$options.render; // 获取编译后的render方法
      // 调用render方法产生虚拟节点

      var vnode = render.call(vm); // _c(xxx,xx,xxx,xxx) 调用时会自动将变量进行取值，将实例结果进行渲染相当于 with(vm){age,name},这里render函数里是变量，即vm下的变量，这样从花括号里取值

      console.log("虚拟节点", vnode);
      return vnode; // 虚拟节点
      // _c('div',{},_c())
    };
  }

  function Vue(options) {
    this._init(options); //当用户new Vue时，就调用init方法进行Vue的初始方法

  } //可以拆分逻辑到不同的文件中，更利于代码维护 模块化的概念


  initMixin(Vue); //扩展初始化方法

  lifecycleMixin(Vue);
  renderMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
