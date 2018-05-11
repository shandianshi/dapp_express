/**
 * Created by yzl on 2018/5/11.
 */

var dappAddress = "n1eds3dwG3LxVpS8b6hofn9rFMgkWVdhREt";
var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));

$(document).ready(function () {
    init();
})

function init() {
    callFreeRemoteFunc("forEach",function (result) {
        console.log("foreachres");
        console.dir(result);
    })
    $('#add_tract').on('click',function () {
        $("#modal_add input").val("");
        $('#modal_add').modal('toggle');
    })
    $('.btn-submit').on("click",function () {
        var data=$('.modal-form').serializeArray();
        var jsonData=formUtil.SerializeArrayToJson(data);
        var transferData=[];
         transferData.push(jsonData);
         console.dir(transferData)
       // var transferData="[\"" + 100+ "\"]";
        charge(dappAddress,"0","save",JSON.stringify(transferData))
    });
}
function cbPush(resp) {
    console.log("response of push: " + JSON.stringify(resp))
}

var charge=function (to,price,callFunction,data,args) {

    serialNumber = nebPay.call(to,price, callFunction, data, {    //使用nebpay的call接口去调用合约,
        listener: cbPush        //设置listener, 处理交易返回信息
    });

    // intervalQuery = setInterval(function () {
    //     funcIntervalQuery();
    // }, 5000);

}

var intervalQuery

function funcIntervalQuery() {
    nebPay.queryPayInfo(serialNumber)   //search transaction result from server (result upload to server by app)
        .then(function (resp) {
            console.log("tx result: " + resp)   //resp is a JSON string
            var respObject = JSON.parse(resp)
            if(respObject.code === 0){
                alert("success");
                clearInterval(intervalQuery)
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}


/**
 *
 * @param funcName
 */
var callFreeRemoteFunc=function (funcName,cb) {

    var from = Account.NewAccount().getAddressString();
    var value = "0";
    var nonce = "0"
    var gas_price = "200000"
    var gas_limit = "200000"
    var callFunction = funcName;
    var callArgs = "[\"" + 100 + "\",\"" + 0+ "\"]" //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        cb(resp)
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })
}

