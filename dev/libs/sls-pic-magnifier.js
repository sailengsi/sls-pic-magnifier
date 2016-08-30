(function(field, factory, context) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        context[field] = factory();
    }
})("SlsPicMagnifier", function() {

    /**
     * SlsPicMagnifier类，用原生javascript实现的图片放大镜效果
     * @class SlsPicMagnifier
     * @constructor
     * @author 赛冷思
     */
    var SlsPicMagnifier = function() {};

    SlsPicMagnifier.prototype = {

        constructor: SlsPicMagnifier,

        /**
         * 版本号
         * @property {String} version
         */
        version: "1.0.0",

        /**
         * 是否开启debug模式。true开启;false关闭
         * @property {Boolean} debug
         */
        debug: true,

        /*
         * 打印日志
         * @method lg
         * @param  {All} data [打印数据类型]
         * @return {Object}      [当前路由对象]
         */
        lg: function(data, type) {
            this.debug && console[type ? type : "log"](data);
            return this;
        },


        extend: function(target, source) {
            if (source && source.constructor === Object) {
                for (var k in source) {
                    target[k] = source[k];
                }
            };

            return target;
        },


        /**
         * 检测一个对象是否是DOM对象
         * 首先要对HTMLElement进行类型检查，因为即使在支持HTMLElement的浏览器中，类型却是有差别的，
         *     在Chrome,Opera中HTMLElement的类型为function，此时就不能用它来判断了
         * @method isDOM
         * @param  {[type]}  obj dom对象
         * @return {Boolean}     是返回true，不是返回false
         */
        isDom: function(obj) {
            return (typeof HTMLElement === 'object') ? obj instanceof HTMLElement : obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
        },

        /**
         * 转换成DOM对象
         * @method toDOM    
         * @param  {Object or String} ele [对象或者字符串]
         * @return {Object}     [如果对象是DOM对象或者选择器，就返回DOM对象，否则返回null]
         */
        toDom: function(ele) {
            return (typeof ele === "string") ? document.querySelector(ele) : (this.isDom(ele) ? ele : null);
        },


        /**
         * 设置css
         * @param {DOMObject} ele     DOM对象
         * @param {Object} options css对象
         */
        setCss: function(ele, options) {
            for (var attr in options) {
                ele.style[attr] = options[attr];
            }
            return this;
        },


        /**
         * 获取元素大小
         * @param  {DOMObject} ele DOM对象
         * @return {Object}     当前元素的width,height
         */
        getSize: function(ele) {
            return {
                width: ele.offsetWidth,
                height: ele.offsetHeight
            }
        },


        /**
         * 获取元素距离距离浏览器窗口的坐标
         * @param  {DOMObject} elem DOM对象
         * @return {Object}      坐标对象或者null
         */
        getOffset: function(elem) {
            return elem.getBoundingClientRect ? this.getOffsetRect(elem) : this.getOffsetSum(elem);
        },


        /**
         * 土鳖方式获取元素距离浏览器窗口的坐标
         * @param  {DOMObject} elem DOM对象
         * @return {Object}      坐标对象
         */
        getOffsetSum: function(elem) {
            var top = 0,
                left = 0
            while (elem) {
                top = top + parseInt(elem.offsetTop)
                left = left + parseInt(elem.offsetLeft)
                elem = elem.offsetParent
            }
            return {
                top: top,
                left: left
            }
        },


        /**
         * 最新方式获取元素距离浏览器窗口的坐标
         * @param  {DOMObject} elem DOM对象
         * @return {Object}      坐标对象
         */
        getOffsetRect: function(elem) {
            var box = elem.getBoundingClientRect(),
                body = document.body,
                docElem = document.documentElement,
                scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop,
                scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft,
                clientTop = docElem.clientTop || body.clientTop || 0,
                clientLeft = docElem.clientLeft || body.clientLeft || 0,
                top = box.top + scrollTop - clientTop,
                left = box.left + scrollLeft - clientLeft;
            return {
                top: Math.round(top),
                left: Math.round(left)
            }
        },


        /**
         * 获取鼠标坐标
         * @param  {Object} event event对象   
         * @return {Object}       坐标对象
         */
        getMousePoint: function(event) {
            var e = event || window.event;
            var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
            var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
            var x = e.pageX || e.clientX + scrollX;
            var y = e.pageY || e.clientY + scrollY;
            return {
                'left': x,
                'top': y
            };
        },


        /**
         * 阻止事件默认行为
         * @param {Object} event event对象
         */
        setDefault: function(event) {
            var event = event || window.event;
            event.stopPropagation();
            event.preventDefault();

            return this;
        },


        /**
         * [allCss 初始化DOM样式]
         * @type {Object}
         */
        allCss: {
            sourceImgContainerCss: {
                width: "260px",
                position: "relative",
                float: "left",
                padding: "0px"
            },
            sourImgCss: {
                display: "block",
                width: "100%"
            },
            focusPointContainerCss: {
                width: "50px",
                height: "50px",
                display: "block",
                position: "absolute",
                top: "0px",
                left: "0px",
                filter: "alpha(opacity=50)",
                mozOpacity: "0.5",
                opacity: "0.5",
                cursor: "move",
                zIndex: "101",
                background: "#000"
            },
            showImgContainerCss: {
                width: "200px",
                height: "200px",
                background: "#000",
                float: "left",
                overflow: "hidden",
                position: "relative",
                left: "20px"
            },
            maxImgCss: {
                position: "absolute",
                left: "0px",
                top: "0px"
            }
        },

        /**
         * 合并自定义css到默认css中
         * @param  {Object} css 自定义的css，此对象的属性必须和默认中的属性一一对应
         * @return {Object}     放大镜对象
         */
        mergeCss: function(css) {
            if (css && css.constructor === Object) {
                for (var sel in css) {
                    if (this.allCss[sel]) {
                        this.allCss[sel] = this.extend(this.allCss[sel], css[sel]);
                    };
                }
            };

            return this;
        },


        /**
         * 加载图片，因为动态设置样式，所以必须得图片加载出来后才能算出来大小等属性
         * @param  {String}   src 图片地址
         * @param  {Function} fn  加载完的回调函数
         */
        laodImg: function(src, fn) {
            var self = this;
            var imgObj = new Image();
            imgObj.src = src;
            imgObj.onload = function() {
                fn && fn.call(this);
            };
        },


        /**
         * 初始化css样式
         * @return {Object} [当前放大镜对象]
         */
        updateCss: function() {
            this.setCss(this.soureImgContainerEle, this.allCss.sourceImgContainerCss)
                .setCss(this.sourceImgEle, this.allCss.sourImgCss)
                .setCss(this.focusPointEle, this.allCss.focusPointContainerCss)
                .setCss(this.showImgEle, this.allCss.showImgContainerCss)
                .setCss(this.maxImgEle, this.allCss.maxImgCss);
            return this;
        },


        /**
         * 初始化放大镜DOM结构
         * @param  {String} src  图片地址
         * @param  {Boolean} type 为true,动态更新；为false,第一次初始化
         * @return {Object}      当前放大镜对象
         */
        initDom: function(src, type) {
            if (!type) {
                this.soureImgContainerEle = this.toDom(this.settings.sourceImgSelector);
            };
            this.soureImgContainerEle.innerHTML = '<div class="focusPointContainer"></div> <img class="sourceImg" src="' + src + '">';
            if (!type) {
                this.showImgEle = this.toDom(this.settings.showImgSelector);
            }
            this.showImgEle.innerHTML = '<img class="maxImg" src="' + src + '">';
            this.maxImgEle = this.toDom(".maxImg");
            this.sourceImgEle = this.toDom(".sourceImg");
            this.focusPointEle = this.toDom(".focusPointContainer");

            return this;
        },


        /**
         * 动态更换图片
         * @param  {String} src 图片地址
         * @param  {Boolean} type 当更新的图片和当前图片一样时,根据这个值判断要不要重新渲染。true:重新渲染;false:不渲染。
         * @return {Object}     当前放大镜对象
         */
        updateImg: function(src, repeat) {
            if (src === this.imgSrc && !repeat) {
                return this;
            };
            this.imgSrc = src;
            var self = this;
            this.initDom(src, true)
                .laodImg(src, function() {
                    self.updateCss()
                        .initData()
                        .bindEvent();
                    // console.log(this);
                });
        },


        /**
         * 初始化DOM信息
         * @return {Object} 当前放大镜对象
         */
        initData: function() {
            /**
             * [sourceImgContainer 小图容器元素，即是小图元素]
             * @type {Object}
             */
            this.sourceImgContainer = {
                ele: this.soureImgContainerEle,
                offset: this.getOffset(this.soureImgContainerEle),
                size: this.getSize(this.soureImgContainerEle)
            };

            /**
             * [maxImg 原图]
             * @type {Object}
             */
            this.maxImg = {
                ele: this.maxImgEle,
                offset: this.getOffset(this.maxImgEle),
                size: this.getSize(this.maxImgEle)
            };

            /**
             * [scale 小图和原图的比例,后面会用这个来计算大图需要显示的大小和位移]
             * @type {[type]}
             */
            this.scale = this.sourceImgContainer.size.width / this.maxImg.size.width;

            /**
             * [focusPointContainer 放大镜元素]
             * @type {Object}
             */
            this.focusPointContainer = {
                ele: this.focusPointEle,
                offset: this.getOffset(this.focusPointEle),
                size: this.getSize(this.focusPointEle)
            };

            /**
             * [showImgContainer 装大图的容器，即是和放大镜同步显示的容器]
             * @type {Object}
             */
            this.showImgContainer = {
                ele: this.showImgEle,
                offset: {},
                size: {
                    width: this.focusPointContainer.size.width / this.scale,
                    height: this.focusPointContainer.size.height / this.scale
                }
            };

            /**
             * [focusPointFixed 设置放大镜移动范围]
             * @type {Object}
             */
            this.focusPointFixed = {
                minLeft: this.sourceImgContainer.offset.left + this.focusPointContainer.size.width / 2,
                maxLeft: this.sourceImgContainer.offset.left + this.sourceImgContainer.size.width - this.focusPointContainer.size.width / 2,
                minTop: this.sourceImgContainer.offset.top + this.focusPointContainer.size.height / 2,
                maxTop: this.sourceImgContainer.offset.top + this.sourceImgContainer.size.height - this.focusPointContainer.size.height / 2
            };


            /**
             * 重新设置一下同步放大镜显示的图片大小
             */
            this.setCss(this.showImgContainer.ele, {
                width: this.showImgContainer.size.width + "px",
                height: this.showImgContainer.size.height + "px"
            });

            return this;
        },


        /**
         * 配置参数
         * @method config
         * @param  {Object} options [配置参数]
         * @return {Object}     [SlsPicMagnifier对象]
         */
        renderData: function(options) {
            var self = this;
            this.settings = options;
            this.imgSrc = options.imgSrc;
            this.initDom(this.imgSrc)
                .mergeCss(options.css || {})
                .laodImg(this.imgSrc, function() {
                    self.updateCss()
                        .initData()
                        .bindEvent();
                });
            return this;
        },


        /**
         * 设置事件
         */
        bindEvent: function() {
            var self = this;

            //根据比例算出大图的left,top
            function setMaxImgOffset() {
                maxImgLeft = self.focusPointContainer.offset.left / self.scale;
                maxImgTop = self.focusPointContainer.offset.top / self.scale;

                self.setCss(self.maxImg.ele, {
                    left: -maxImgLeft + "px",
                    top: -maxImgTop + "px"
                });
            }

            // setMaxImgOffset();

            self.sourceImgContainer.ele.onmousemove = function(event) {
                self.setDefault(event);
                var mouseOffset = self.getMousePoint(event);

                var focusPointCss = {
                    left: (mouseOffset.left - self.sourceImgContainer.offset.left - (self.focusPointContainer.size.width / 2)) + "px",
                    top: (mouseOffset.top - self.sourceImgContainer.offset.top - (self.focusPointContainer.size.height / 2)) + "px"
                };
                if (mouseOffset.left < self.focusPointFixed.minLeft) {
                    focusPointCss.left = "0px";
                };
                if (mouseOffset.left > self.focusPointFixed.maxLeft) {
                    focusPointCss.left = (self.sourceImgContainer.size.width - self.focusPointContainer.size.width) + "px";
                };
                if (mouseOffset.top < self.focusPointFixed.minTop) {
                    focusPointCss.top = "0px";
                };
                if (mouseOffset.top > self.focusPointFixed.maxTop) {
                    focusPointCss.top = (self.sourceImgContainer.size.height - self.focusPointContainer.size.height) + "px";
                };
                self.setCss(self.focusPointContainer.ele, focusPointCss).setCss(self.maxImg.ele, {
                    left: -(parseInt(focusPointCss.left) / self.scale) + "px",
                    top: -(parseInt(focusPointCss.top) / self.scale) + "px"
                });
            };

            self.sourceImgContainer.ele.onmousedown = function(event) {
                self.setDefault(event);
            }
        },


        /**
         * 检测传的参数是否合法
         * @param  {Object} options 参数对象
         * @return {Boolean}         true:合法；false:不合法
         */
        checkOptions: function(options) {
            if (!options || options.constructor !== Object) {
                this.lg("必须传入一个对象参数。", "error");
                return false;
            };

            if (!options.sourceImgSelector) {
                this.lg("对象参数必须包含属性sourceImgSelector,可以是选择器或者DOM对象。", "error");
                return false;
            };

            if (!options.showImgSelector) {
                this.lg("对象参数必须包含属性showImgSelector,可以是选择器或者DOM对象。", "error");
                return false;
            };

            if (!options.imgSrc) {
                this.lg("对象参数必须包含属性imgSrc,必须是字符串。", "error");
                return false;
            };

            return true;
        },


        /**
         * 初始化放大镜参数
         * @param  {Object} options 配置参数
         * @param  {String} options.imgSrc 图片地址  require
         * @param  {String or DOMObject} options.sourceImgSelector 装小图和放大镜的容器  require
         * @param  {String or DOMObject} options.showImgSelector 装大图的容器  require
         * @param  {Object} options.css 自定义各个元素的css
         */
        init: function(options) {
            if (!this.checkOptions(options)) {
                return this;
            };
            this.renderData(options);
        }
    };
    return new SlsPicMagnifier();
}, this);