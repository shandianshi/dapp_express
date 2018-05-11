/**
 * Created by yzl on 2018/5/11.
 */
function NetaList(table){
    this.tableList=[];
    this.container=table;
    var operationListFormatter=function (value, row, index) {
        return [
            '<button type="button" class="operate-perform btn btn-primary  btn-sm" style="margin-right: 15px;"  >我要看后续内容！</button>'
        ].join("");
    };
    var operateListEvents= {
        'click .operate-perform': function (e, value, row, index) {
            //console.dir(row);
            alert(row);
        }
    };
    tableList.push({field:"author",title:"用户地址"});
    tableList.push({field:"key",title:"主题"});
    tableList.push({field:"privateContent",title:"价格"});
    tableList.push({field:"publicContent",title:"内容"});
    tableList.push({field:"linkLoss",title:"链路损耗"});
    tableList.push({field:"circleId",title:"所属环"})
    tableList.push({
        title:"操作",
        formatter: operationListFormatter,
        events: operateListEvents});
    tableUtil.createTable(table,"",tableList);


}
NetaList.prototype.setData=function (data) {
    this.container.bootstrapTable('load',data);
}

