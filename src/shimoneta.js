/**
 * Created by yzl on 2018/5/11.
 */

var dappAddress = "n1qQpvKL33EcdYGNhX1kWivCUx8SWDrKFUS";

var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));

$(document).ready(function () {
    init();
})

function refreshNetaList(netaList){
    callRemoteFunc({
        price:"0",
        funcName:"forEach",
        cb:function (result) {
            console.dir(result);
            netaList.setData(JSON.parse(result.result));
            console.log(JSON.parse(result.result))
        }
    },0,100)
}

function getPrivateContent(row){
    var confirmPanel=confirm("确定要支付"+row.price+"NAS给作者吗？");
    if (confirmPanel==true)
    {
        charge(row.author,row.price).then(function (resp) {
            alert("段子内容："+row.publicContent+row.privateContent);
        })
    }
};


function init() {
    if(typeof(webExtensionWallet) === "undefined"){
        alert ("使用前请先安装钱包插件！ 地址：\"https://github.com/ChengOrangeJu/WebExtensionWallet\">")
    }
    var netaList=new NetaList($('#neta_list'),getPrivateContent);
    refreshNetaList(netaList);
    $('#add_tract').on('click',function () {
        $("#modal_add input").val("");
        $('#modal_add').modal('toggle');
    })
    $('.btn-submit').on("click",function () {
        var data=$('.modal-form').serializeArray();
        var jsonData=formUtil.SerializeArrayToJson(data);
        var transferData=[jsonData];
        charge(dappAddress,"0","save",JSON.stringify(transferData)).then(function (result) {
            alert("支付成功,请之后手动刷新页面，钱包query接口查询成功后查询数据依旧为旧数据");
            refreshNetaList(netaList);
            $('#modal_add').modal('toggle');
        })
    });
}
function cbPush(resp) {
    console.log("response of push: " + JSON.stringify(resp))
}

var charge=function (to,price,callFunction,data) {
    serialNumber = callFunction?nebPay.call(to,price, callFunction, data):nebPay.pay(to,price);
    return funcIntervalQuery(serialNumber);

}


async function funcIntervalQuery(serialNumber) {
    var code=1,resp;
    while(code != 0){
        await timeUtil.timeout(5000);
        resp= await  nebPay.queryPayInfo(serialNumber)
        code=JSON.parse(resp).code;
            // .then(function (resp) {
            //     var respObject = JSON.parse(resp);
            //     console.log("respobj");
            //     console.dir(respObject);
            //     if(respObject.code === 0){
            //         if(cb)
            //             cb(resp);
            //         alert("success");
            //         clearInterval(intervalQuery)
            //     }
            // })

    }
    console.dir(resp);
    return JSON.parse(resp);
}


/**
 *
 * @param options,args
 * options contains price\funcName\cb guess funcName is necessary
 */
var callRemoteFunc=function (options) {
    var option=options||{};
    var from = Account.NewAccount().getAddressString();
    var value =option.price|| "0";
    var nonce = "0";
    var gas_price = "200000";
    var gas_limit = "200000";
    var callFunction = option.funcName;
    var callArgs =JSON.stringify(Array.prototype.slice.call(arguments,1));
    console.dir(callArgs);
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    if(option.cb){
        neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
            option.cb(resp)
        }).catch(function (err) {
            //cbSearch(err)
            console.log("error:" + err.message)
        })
    }
    else
        return  neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract);

}

