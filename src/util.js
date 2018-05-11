/**
 * Created by yzl on 2017/6/22.
 * 写的比较早，没封装
 */



var formUtil={
    /**
     * 将表格序列数据转换为json
     * @param data
     * @returns {{}}
     * @constructor
     */
    SerializeArrayToJson:function (data) {
        var Info = {};
        for (var item in data) {
            Info[data[item].name] = data[item].value;
        }
        return Info;
    },
    /**
     * 将json数据填充到form input中
     * @param formElement 表单或含单个表单元素的节点
     * @param jsonData
     */
    fillJsonToForm:function (formElement,jsonData) {
        for(var key in jsonData){
            if($(formElement).find("input[name="+key+"]").length>0)
                $(formElement).find("input[name="+key+"]").val(jsonData[key]);
            else if($(formElement).find("select[name="+key+"]").length>0)
            // $(formElement).find("select[name="+key+"]").find("option[text="+key+"]").attr("selected", true);
                $(formElement).find("select[name="+key+"]").val(jsonData[key]);
            else if($(formElement).find("textarea[name="+key+"]").length>0){
                $(formElement).find("textarea[name="+key+"]").val(jsonData[key]);
            }
        }
    },
    /**
     * 表单验证，返回promise
     * @param elementContainsForm 一个仅含一个验证表单的元素
     * @returns {Promise}
     */
    validateForm:function (elementContainsForm) {
        var errData={};
        return new Promise(function (resolve,reject) {
            // console.log($(elementContainsForm).find(' input[type="text"], select').length);
            /**
             * 非空验证，若以后有添加其他需验证，可以进一步封装
             */
            $(elementContainsForm).find('input[type="text"], select').each(function (index,element) {
                if(!$(element).hasClass("formData-nullValid")){
                    if($(element).val()==null||""){

                        errData.errMsg="表单内存在空项，请检查输入";
                        errData.errElement=$(element);
                        reject(errData);
                        return false;

                    }
                }
            });
            resolve();
        });
    }

};



/**
 * 封装ajax请求，返回一个promise，与async配合使用风味更佳
 * 理论上应该只有一个options，奈何当时傻逼了hhh
 * @type {{newAsyncAjaxRequest: ajaxUtil.newAsyncAjaxRequest, newAsyncTextRequest: ajaxUtil.newAsyncTextRequest}}
 */
var ajaxUtil={
    myDate:new Date(),
    /**
     * 将serializearray类型转为服务端dto对象
     * @param url
     * @param data seralizeArray类型数据
     * @param method ajax方法
     * @param appendArgs 附加值，用于内嵌对象，请用array类型
     * @returns {ajaxUtil.newAsyncAjaxRequest}
     */
    submitResource:function(url,data,method,appendArgs){

        var jsonData=formUtil.SerializeArrayToJson(data);
        if(appendArgs)
            $.extend(true,jsonData,appendArgs);
        console.dir("forminfo:"+JSON.stringify(jsonData));
        return new ajaxUtil.newAsyncAjaxRequest(url,jsonData,method);
    },
    /**
     *
     * @param url
     * @param data
     * @param method
     * @param options 参数，现在可设置强行resolve
     * @returns {Promise}
     */
    newAsyncAjaxRequest:function(url,data,method,options){
        document.body.style.cursor = "wait";
        console.log(ajaxUtil.myDate.toLocaleTimeString()+"url:"+url);
        if(data)
            console.log(JSON.stringify(data));
        return new Promise(function(resolve,reject) {
            $.ajax({
                data:data?JSON.stringify(data):undefined,
                dataType: "json",
                crossDomain:true,
                contentType:"application/json;charset=UTF-8",
                method:!method?undefined:method,
                type:!method?"get":"post",
                url:url,
                success:function(data,status,xhr){
                    if(xhr.status>400){
                        console.dir(data);
                        reject(data);
                    }
                    else
                        resolve(data);
                    document.body.style.cursor = "default";
                },
                error: function (data, status, e) {
                    console.log("responseData:",data);
                    document.body.style.cursor = "default";
                    if(options&&options.forceResolve){
                        resolve(data.responseText);
                    }
                    else
                        reject(data);
                }
            });

        });
    },
};


var UIUtil={
    setAllModalDraggable:function (windowElement) {
        $(windowElement).on("show.bs.modal", ".modal", function(){
            $(this).draggable({
                // containment:"window",
                iframeFix: true,//
            });
            var userAgent = window.navigator.userAgent;
            if (userAgent.indexOf('WOW') < 0 && userAgent.indexOf("Edge") < 0){
                $(this).css({"overflow":"hidden","max-width":"1000px","max-height":"700px"});

                $(this).find(".modal-content").css({"overflow-y":"scroll","overflow-x":"hidden","max-height":"650px"});
            }
            else{
                $(this).css({"overflow":"hidden","max-width":"1000px","max-height":"700px"});

                $(this).find(".modal-content").css({"overflow-y":"scroll","overflow-x":"hidden","max-height":"650px"});
            }

        });
    },
    appendCloseBtn:function (parentElement,fn) {
        var newBtn=$('<div style="text-align: right; padding-right: 10px" > <button class="close " type="button">×</button> </div>');
        $(newBtn).click=fn();
        $(parentElement).prepend(newBtn);
    },
    /**
     * option需传入ajax方法对应值，以及select所需的key，val值
     * @param options
     * @param selectElement
     */
    adaptSelectList:function (options,selectElement) {
        $(selectElement)[0].options.length=0;
        return new ajaxUtil.newAsyncAjaxRequest(options.url,options.data,options.method).then(function (dataList) {
            if(options.blank){
                $(selectElement)[0].options.add(new Option());
            }
            $.each(dataList,function (index,ele) {
                $(selectElement)[0].options.add(options.key?new Option(ele[options.key],ele[options.val]):new Option(ele,ele));
            });
        })

    }
};

//table生成工具，请先引用bootstrap-table
//使用表格导出相关功能时，请使用前先引入tableExport.js、bootstrap-table-export.js
var tableUtil={
    /**
     *
     * @param table 对应table节点
     * @param sourceUrl 连接
     * @param tableAttrList 展示属性键值对，请参照mock接口表匹配所需数据
     * @param options //暂时无用
     */
    createTable:function(table,sourceUrl,tableAttrList,options){
        table.bootstrapTable('destroy');
        table.bootstrapTable({
                url: sourceUrl?sourceUrl:undefined,// 请求后台的URL（*）
                method: 'get', //请求方式（*）
                locale:'zh-CN',
                checkbox:'true',
                singleSelect:options?options.singleSelect: true,
                showPaginationSwitch:options?options.showToolbar:true,
                onClickRow:options?options.Click:undefined,
                onDblClickRow:options?options.doubleClick:null,
                showToggle:options?options.showToolbar:true,
                showRefresh:options?options.showToolbar:true,
                data:options?options.data:undefined,
                //表格导出相关配置
                exportDataType: 'all',  //导出表格方式（默认basic：只导出当前页的表格数据；
                                        // all：导出所有数据；selected：导出选中的数据）
                showExport:options&&'showExport' in  options?options.showExport:false,  //是否显示导出按钮
                buttonsAlign:"right",  //按钮位置
                exportTypes:['excel'],  //导出文件类型
                Icons:'glyphicon-export',
                exportOptions:{
                    ignoreColumn: [],  //忽略某一列的索引
                    worksheetName: 'sheet1',  //表格工作区名称
                    tableName: '导出数据',
                },

                search:options?options.searchBar:true,//搜索
                strictSearch:false,
                striped: true,                      //是否显示行间隔色
                cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
                pagination:options?options.pagination:true,                   //是否显示分页（*）
                sortable: false,                     //是否启用排序
                sortOrder: "asc",                   //排序方式
                //  queryParams: oTableInit.queryParams,//传递参数（*）
                sidePagination: "client",           //分页方式：client客户端分页，server服务端分页（*）好像现在不支持server分页233
                pageNumber:1,                       //初始化加载第一页，默认第一页
                pageSize: 10,                       //每页的记录行数（*）
                pageList: [10, 25, 50, 100,1000,'All'],        //可供选择的每页的行数（*）
                clickToSelect: true,                //是否启用点击选中行
                uniqueId: "id",                     //每一行的唯一标识，一般为主键列
                cardView: false,                    //是否显示详细视图
                detailView: false,                   //是否显示父子表
                columns:tableAttrList,

            }
        );
    }
};


