(function ($) {
    /**
     * 手风琴菜单
     * @param {ele} 菜单容器ID
     * @param {data} 初始化菜单的数组
     * 说明：由于属性及事件绑定在菜单标签属性中，初始化配置值option从标签属性中取得
     * <div id="accordion" idField="id" parentField="pid" nameField="text" childrenField="children" onnodeclick ="clickCallback"
     * onnodemouseenter="mouseEnterCallback" onnodemouseleave="MouseLeaveCallback" onmenurender="renderCallBack"></div>
     * 调用：$("#accordion").accordion(arrData);
     */
    var Accordion = function (ele, data) {
        //菜单容器
        this.$menu = $(ele).addClass("accordionMenu");
        //传入初始化菜单的数组，可以使一维数组ListArray，也可以是数组结构数组TreeArray
        this.data = (data && Array.isArray(data)) ? data : [];
        //初始化配置值可从标签属性中取得即可
        this.option = {
            idField: this.$menu.attr("idField") ? this.$menu.attr("idField") : "id",//字段名,默认值为id
            parentField: this.$menu.attr("parentField") ? this.$menu.attr("parentField") : "pid",//父节点字段名,初始化数据为ListArray结构时需设置，以防出错，TreeArray数据可不设置，默认值位pid
            nameField: this.$menu.attr("nameField") ? this.$menu.attr("nameField") : "name",//节点显示文本
            childrenField: this.$menu.attr("childrenField") ? this.$menu.attr("childrenField") : "children",//子节点集，初始化数据TreeArray为树结构数据时需设置，以防出错，ListArray数据可不设置，默认值是children
            nodeClickEvent: this.$menu.attr("onnodeclick") ? eval(this.$menu.attr("onnodeclick")) : null,//菜单节点点击事件
            nodeMouseEnterEvent: this.$menu.attr("onnodemouseenter") ? eval(this.$menu.attr("onnodemouseenter")) : null,//鼠标进入节点事件
            nodeMouseLeaveEvent: this.$menu.attr("onnodemouseleave") ? eval(this.$menu.attr("onnodemouseleave")) : null,//鼠标离开节点事件
            renderCallBack:this.$menu.attr("onmenurender") ? eval(this.$menu.attr("onmenurender")) : null//菜单加载渲染完后事件
        };
        this.initAccordion();
    };
    Accordion.prototype = {
        constructor: Accordion,
        /**
         * 初始化手风琴菜单
         */
        initAccordion: function () {
            this.renderMenu();
            this.bindEvent();
        },
        /**
         * 渲染生成菜单
         */
        renderMenu: function () {
            var _this = this,
                container = _this.$menu,
                option = _this.option,
                data = _this.getTreeData(_this.data);
            var ulhtml = $('<ul class="lev"></ul>');
            $(data).each(function (index, item) {
                var lihtml = $('<li><a class="menuitem" id="menu_'+item[option.idField]+'">' + item[option.nameField] + '</a></li>');
                //赋值当前节点数据，并将该数据绑定到该节点标签中
                var sender={
                    $menu:_this.$menu,
                    $target:lihtml.find("a.menuitem"),
                    data:_this.copyObject(_this.data),
                    option:_this.option,
                    node:_this.copyObject(item),//当前项
                    isLeaf:false//是否叶子节点
                };
                //删除该节点的子节点数组数据，只保留自身数据
                if(option.childrenField in sender.node)delete sender.node[option.childrenField];
                //绑定数据到标签中
                lihtml.find("a.menuitem").data("sender",sender);
                if (item[option.childrenField] && item[option.childrenField].length > 0) {
                    lihtml.find("a").addClass("submenu");
                    //创建子菜单
                    _this.createSubMenu(_this, item[option.childrenField],item[option.idField], lihtml);
                }else{
                    sender.isLeaf=true;
                }
                $(ulhtml).append(lihtml);
            });
            $(container).html("").append(ulhtml);
            //菜单渲染完回调函数
            option.renderCallBack && $.isFunction(eval(option.renderCallBack)) && eval(option.renderCallBack)(_this);
            // 处理菜单层级缩进
            _this.levelIndent(ulhtml);
        },
        /**
         * 创建子菜单
         * @param {accordion} 菜单对象
         * @param {array} 子菜单
         * @param {pid} 父节点ID
         * @param {lihtml} li项
         */
        createSubMenu: function (accordion, submenu,pid, lihtml) {
            var _this = accordion,
                option = _this.option;
            var subUl = $('<ul></ul>'),
                subLi;
            $(submenu).each(function (index, item) {
                var url = item.url || 'javascript:void(0)';
                subLi = $('<li><a class="menuitem" id="menu_'+item[option.idField]+'" href="' + url + '">' + item[option.nameField] + '</a></li>');
                //赋值当前节点数据，并将该数据绑定到该节点标签中
                var sender={
                    $menu:_this.$menu,
                    $target:subLi.find("a.menuitem"),
                    data:_this.copyObject(_this.data),
                    option:_this.option,
                    node:_this.copyObject(item),//当前项
                    isLeaf:false//是否叶子节点
                };
                //删除该节点的子节点数组数据，只保留自身数据
                if(option.childrenField in sender.node)delete sender.node[option.childrenField];
                //绑定数据到标签中
                sender.node[option.parentField]=pid;
                subLi.find("a.menuitem").data("sender",sender);
                if (item[option.childrenField] && item[option.childrenField].length > 0) {
                    $(subLi).children('a').addClass("submenu");
                    //收缩折叠三角图标，在a标签内文本右侧插入该图标，图片通过unfold控制展叠效果
                    //$(subLi).children('a').append('<img src="images/blank.gif" alt=""/>');
                    //递归调用，生成各级子菜单
                    _this.createSubMenu(accordion, item[option.childrenField],item[option.idField], subLi);
                }else{
                    sender.isLeaf=true;
                }
                $(subUl).append(subLi);
            });
            $(lihtml).append(subUl);
        },
/*
        renderMenuByListData:function(){
            var _this = this,
                container = _this.$menu,
                option = _this.option,
                data = _this.getListData("");
            var ulhtml=$('<ul class="lev"></ul>');
            $(data).each(function(index,item){
                var isRoot=true;
                for(var i=0;i<data.length;i++){
                    if(item[option.parentField]==data[i][option.idField]){
                        isRoot=false;
                    }
                }
                if(isRoot){
                    var lihtml = $('<li><a class="menuitem" id="'+item[option.idField]+'">' + item[option.nameField] + '</a></li>');
                    //赋值当前节点数据，并将该数据绑定到该节点标签中
                    var node=_this.copyObject(item);
                    //删除该节点的子节点数组数据，只保留自身数据
                    if(option.childrenField in node)delete node[option.childrenField];
                    //绑定数据到标签中
                    lihtml.find("a").data("node",node);
                    var hasSub=false;
                    for(var j=0;j<data.length;j++){
                        if(data[j][option.parentField]==item[option.idField]){
                            hasSub=true;
                            break;
                        }
                    }
                    if(hasSub){
                        lihtml.find("a").addClass("submenu");
                        _this.createSubMenu1(_this,item[option.idField],lihtml)
                    }
                    $(ulhtml).append(lihtml);
                }
            });
            $(container).html("").append(ulhtml);
            //菜单渲染完回调函数
            option.renderCallBack && $.isFunction(eval(option.renderCallBack)) && eval(option.renderCallBack)(_this);
            // 处理菜单层级缩进
            _this.levelIndent(ulhtml);
        },
        createSubMenuByListData:function(accordion,pid, lihtml){
            var _this = accordion,
                option = _this.option,
                data=_this.getListData();
            var subUl = $('<ul></ul>'),
                subLi;
            $(data).each(function (index, item) {
                if(item[option.parentField]==pid){
                    var url = item.url || 'javascript:void(0)';
                    subLi = $('<li><a class="menuitem" href="' + url + '">' + item[option.nameField] + '</a></li>');
                    //赋值当前节点数据，并将该数据绑定到该节点标签中
                    var node=_this.copyObject(item);
                    //删除该节点的子节点数组数据，只保留自身数据
                    if(option.childrenField in node)delete node[option.childrenField];
                    //绑定数据到标签中
                    node[option.parentField]=pid;
                    subLi.find("a.menuitem").data("node",node);
                    var hasSub=false;
                    for(var i=0;i<data.length;i++){
                        if(data[i][option.parentField]==item[option.idField]){
                            hasSub=true;
                            break;
                        }
                    }
                    if (hasSub) {
                        $(subLi).children('a').addClass("submenu");
                        //收缩折叠三角图标，在a标签内文本右侧插入该图标，图片通过unfold控制展叠效果
                        //$(subLi).children('a').append('<img src="images/blank.gif" alt=""/>');
                        //递归调用，生成各级子菜单
                        _this.createSubMenu1(accordion,item[option.idField], subLi);
                    }
                    $(subUl).append(subLi);
                }
            });
            $(lihtml).append(subUl);
        },
*/
        /**
         * 处理层级缩进
         */
        levelIndent: function (ulList) {
            var initTextIndent = 1,
                lev = 1,
                $oUl = $(ulList);
            while ($oUl.find('ul').length > 0) {
                initTextIndent = parseFloat(initTextIndent, 10) + 0.7 + 'em';
                $oUl.children().children('ul').addClass('lev-' + lev)
                    .children('li').css('text-indent', initTextIndent);
                $oUl = $oUl.children().children('ul');
                lev++;
            }
            $(ulList).find('ul').hide();
        },
        /**
         * 绑定事件
         */
        bindEvent: function () {
            var _this = this,
                container=_this.$menu,
                option = _this.option;
            //解绑hover和click事件
            $('a.menuitem', container).unbind("mouseenter").unbind("mouseleave").unbind("click");
            //绑定事件 event
            $('a.menuitem', container).bind({
                click: function(e){//点击事件
                    if ($(this).hasClass("submenu")) {//有子菜单，则展开或折叠
                        if ($(this).hasClass("iconopen")) {
                            //已经打开的菜单关闭
                            $(this).removeClass("iconopen").siblings("ul").slideUp("slow")
                        } else {
                            //关闭的子菜单打开，同级其它菜单的子菜单关闭
                            $(this).addClass("iconopen").siblings("ul").slideDown("slow").end().parent("li").siblings().find("a.menuitem").removeClass("iconopen").siblings("ul").slideUp("slow")
                        }
                    }
                    $('a.menuitem').removeClass("activeitem");
                    //标注当前活动项菜单颜色
                    $(this).addClass("activeitem");
                    /**
                     * 菜单节点点击事件回调函数
                     * @param1  菜单控件对象
                     * @param2  当前点击节点jQuery对象
                     * @param3  当前点击节点数据
                     */
                    option.nodeClickEvent && $.isFunction(eval(option.nodeClickEvent)) && eval(option.nodeClickEvent)($(this).data("sender"));
                },
                mouseenter: function(e){//鼠标进入事件
                    $(this).attr("title",$(this).text());
                    option.nodeMouseEnterEvent && $.isFunction(eval(option.nodeMouseEnterEvent)) && eval(option.nodeMouseEnterEvent)($(this).data("sender"));
                },
                mouseleave: function(e){//鼠标离开事件
                    $(this).removeAttr("title");
                    option.nodeMouseEnterEvent && $.isFunction(eval(option.nodeMouseEnterEvent)) && eval(option.nodeMouseEnterEvent)($(this).data("sender"));
                }
            });
        },
        /**
         * 将数组数据转为一维数组结构数据。rootPidValue为根节点pid的默认值，自行定义
         * @param {treeData} 树状结构数据，为空则默认将初始传入数据转为List结构数据
         * @param {rootPidValue} 转化时如果根目录pid没设值，可传值作为默认值，默认为空字符串
         */
        //

        getListData: function (treeArr) {
            var data = treeArr?this.copyObject(treeArr):this.copyObject(this.data);
            var arr = [];
            var _this = this;
            function fn(data, arr, pid) {
                for (var i = 0; i < data.length; i++) {
                    //赋值对象值并进行修改而不影响被复制对象的值
                    var obj = _this.copyObject(data[i]);
                    obj[_this.option.parentField] = _this.option.parentField in data[i]?data[i][_this.option.parentField]:pid;
                    //删除子节点数组属性
                    if (_this.option.childrenField in obj) delete obj[_this.option.childrenField];
                    arr.push(obj);
                    //对有子节点数组属性的节点递归
                    if (_this.option.childrenField in data[i]) fn(data[i][_this.option.childrenField], arr, data[i][_this.option.idField]);
                }
            }
            //默认根目录ID为""字符串
            fn(data, arr, "");
            return arr;
        },
        /**
         * 将一维数组数据转树状数组数据
         * @param {listData} List结构数据,为空则默认将初始传入数据转为树状结构数据
         */
        getTreeData: function (listArr) {
            var data = listArr?this.copyObject(listArr):this.copyObject(this.data);
            for (var i = 0; i < data.length; i++) {
                //是否叶子节点，从叶子节点开始到跟节点逐步构建TreeData格式数据
                var isLeaf = true;
                for (var k = 0; k < data.length; k++) {
                    //节点id是其它节点pid，不是叶子节点
                    if (data[i][this.option.idField] == data[k][this.option.parentField]) isLeaf = false;
                }
                //如果是叶子节点，将叶子节点加到父节点的children数组内
                if (isLeaf) {
                    for (var j = 0; j < data.length; j++) {
                        if (data[j][this.option.idField] == data[i][this.option.parentField]) {
                            //若children属性不存在或不是数组，则默认设置为空数组
                            if (!this.option.childrenField in data[j] || !Array.isArray(data[j][this.option.childrenField])) data[j][this.option.childrenField] = [];
                            //删除其pid属性
                            if (this.option.parentField in data[i]) delete data[i][this.option.parentField];
                            data[j][this.option.childrenField].push(data[i]);
                            //添加到父项后删除原数组该项，并重新遍历数组
                            data.splice(i, 1);
                            i = 0;
                            break;
                        }
                    }
                }
            }
            //删除第一维数组各项的pid属性
            for (var i = 0; i < data.length; i++) {
                if (this.option.parentField in data[i]) delete data[i][this.option.parentField];
            }
            return data;
        },
        /**
         * 获取初始传入数据
         */
        getData:function() {
            return this.data;
        },
        /**
         * 获取当前选择的节点
         */
        getSelectNode:function(){
            return this.$menu.find("a.activeitem").data("sender").node;
        },
        /**
         * 获取父节点
         * @param {node} 目标节点
         */
        getParentNode:function(node){
            return this.getNode(node[this.idField])
        },
        /**
         * 获取直接下级子节点
         * @param {node} 目标节点
         */
        getChildNodes:function(node){
            var arr=[];
            var data=this.getListData();
            for(var i=0;i<data.length;i++){
                if(data[i][this.option.parentField]==node[this.option.idField])arr.push(data[i]);
            }
            return arr;
        },
        /**
         * 获取该节点下所有层级级子节点
         * @param {node} 目标节点
         */
        getAllChildNodes:function(node){
            var data=this.copyObject(this.getListData());
            var option=this.option;
            function getSub(arr,data,pid){
                for(var i=0;i<data.length;i++){
                    if(data[i][option.parentField]==pid){
                        arr.push(data[i]);
                        getSub(arr,data,data[i][option.idField]);
                        data.splice(i,1);
                        i=0;
                    }
                }
                return arr;
            }
            return getSub([],data,node[option.idField]);
        },
        /**
         * 根据节点ID获取节点
         * @param {id} 要获取节点的id
         */
        getNode(id){
            var data=this.getListData();
            var option=this.option;
            for(var i=0;i<data.length;i++){
                if(data[i][option.idField]==id){
                    return data[i];
                }
            }
            return null;
        },
        /**
         * 复制对象，防止修改原对象值
         * @param {obj} 原对象
         */
        copyObject:function(obj){
            //Object.assign()无法深度复制
            return JSON.parse(JSON.stringify(obj));
        }
    };
    $.fn.accordion = function () {
        //初始化数据为空时，默认赋值空数组
        if (arguments.length === 0) {
            arguments[0] == [];
        }
        if (!Array.isArray(arguments[0])) {
            try {
                arguments[0] = Array.isArray(JSON.parse(arguments[0])) ? JSON.parse(arguments[0]) : [];
            } catch (e) {
                arguments[0] = [];
            }
        }
        var data = this.removeData("accordion"),
            options = $.extend(true, [], $.fn.accordion.data, arguments[0]);
        data = new Accordion(this, options);
        this.data("accordion", data);
        return $.extend(true, this, data);
    };
    $.fn.accordion.Constructor = Accordion;
})(jQuery);
