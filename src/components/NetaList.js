/**
 * Created by yzl on 2018/5/11.
 */
function NetaList(table,methods){
    this.tableList=[];
    this.container=table;
    var operationListFormatter=function (value, row, index) {
        return [
            '<button type="button" class="operate-perform btn btn-primary  btn-sm" style="margin-right: 15px;"  >我要看后续内容！</button>'
        ].join("");
    };
    var operateListEvents= {
        'click .operate-perform': function (e, value, row, index) {
            if(methods)
                methods(row);
            console.dir(row);
            //alert(row);
        }
    };
    var tableList=[]
    tableList.push({field:"author",title:"用户地址"});
    tableList.push({field:"key",title:"主题"});
    tableList.push({field:"price",title:"价格"});
    tableList.push({field:"publicContent",title:"可见内容"});
    tableList.push({
        title:"操作",
        formatter: operationListFormatter,
        events: operateListEvents});
    tableUtil.createTable(table,"",tableList);


}
NetaList.prototype.setData=function (data) {
    this.container.bootstrapTable('load',data);
}

