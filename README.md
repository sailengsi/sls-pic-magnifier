## sls-pic-magnifier.js 一款原生js实现的图片放大镜插件 ##

项目采用fis编写，目录结构如下：
	
- div	#开发源码
- release	#fis编译代码

两个目录的唯一区别就是js文件夹下的sls-pic-magnifier.js，div是源码，release是压缩后的。


此插件使用方法如下：

    <!-- 装小图和放大镜容器 -->
    <div class="sourceImgContainer"></div>

    <!-- 装大图容器 -->
    <div class="showImgContainer"></div>
	
	<!-- 引入插件js -->
	<script src="js/sls-pic-magnifier.js"></script>
	<script>
            window.onload=function(){
                SlsPicMagnifier.init({
                    //图片地址，必须
                    imgSrc:"images/img.jpg",

                    //装小图和放大镜容器，支持选择器或者DOM对象，必须
                    // sourceImgSelector:".sourceImgContainer",
                    sourceImgSelector:document.querySelector(".sourceImgContainer"),
                    
                    //装大图容器，支持选择器或者DOM对象，必须
                    // showImgSelector:".showImgContainer",
                    showImgSelector:document.querySelector(".showImgContainer"),

                    //自定义各个元素css样式，规范按照javascript设置css方式书写，可选
                    css:{
                        //这三个比较常用
                        sourceImgContainerCss:{
                            width:"300px"
                        },
                        focusPointContainerCss:{
                            width:"80px",
                            height:"80px",
                            borderRadius:"80px"
                        },
                        showImgContainerCss:{
                            border:"1px solid #ccc",
                            borderRadius:"5px"
                        },


                        //以下两个虽然可以改，但个人不建议改，没必要
                        sourImgCss:{},
                        maxImgCss:{}
                    }
                });
            };
        </script>

	



先不说上面js的意思，先来说一下上面的代码执行完之后的结果，通过浏览器审查元素可以看出，最后生成的DOM结构变成了这样：
   
 	<!-- 装小图和放大镜容器 -->
    <div class="sourceImgContainer">
		<!-- 放大镜 -->
		<div class="focusPointContainer"></div>
		<!-- 小图，是等比例缩放的 -->
		<img class="sourceImg" src="images/img.jpg" />
	</div>
	
	<!-- 装大图容器 -->
    <div class="showImgContainer">
		<!-- 原图 -->
		<img class="maxImg" src="images/img.jpg" />
	</div>
内联样式在这里就去掉了，那不重要，这里显示的都是关键信息，以便往下看的时候能明白的更清楚一些。

现在再看js部分：首先是插件暴露给外部的全局对象**<big>SlsPicMagnifier</big>**，此对象上有两个方法供使用，一个是init(options),一个是updateImg(picpath)，下面解释一下两个方法的用法。

- init方法接收一个对象参数options,options有以下属性
	- options.imgSrc	//图片路径，必选
	- options.sourceImgSelector	//装小图的dom选择器或者dom对象，必选
	- options.showImgSelector	//装大图的dom选择器或者dom对象，必选
	- options.css	//自定义元素样式,此值为对象，格式如下
		- options.css.sourceImgContainerCss	//class="sourceImgContainer"的元素
		- options.css.focusPointContainerCss	//class="focusPointContainer"的元素
		- options.css.showImgContainerCss	//class="showImgContainer"的元素
		- options.css.sourImgCss	//class="sourceImg"的元素
		- options.css.maxImgCss	//class="maxImg"的元素
		- 以上五个元素的值都为对象，格式遵从js设置css语法，例如：{width:"300px",backgroundColor:"red"},注意，后两个是设置小图和大图本身的，并不常用，不建议设置；前三个可以按照需求自己设置
- updateImg方法接收一个字符串参数picpath
	- 此值是图片路径	


具体详情可查看demo中代码。