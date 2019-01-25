angular.module('walletApp', []).controller('walletCtrl', function ($scope, $http) {
    $scope.transfer = function () {
        if (!$scope.tokenID) {
            layer.alert('token标识或ID不能为空!');
            return;
        }
        var valid = wallet.isValidAddress($scope.fromAddress);
        if (!valid) {
            layer.alert('钱包地址不合规范!');
            return;
        }
        valid = wallet.isValidAddress($scope.toAddress);
        if (!valid) {
            layer.alert('钱包地址不合规范!');
            return;
        }
        var pubKey = wallet.getPubKeyFromPrivateKey($scope.privateKey);
        var origin = { tokenID: $scope.tokenID,fromAddress: $scope.fromAddress, toAddress: $scope.toAddress, number: $scope.number, nonce: $scope.nonce, pubKey: pubKey };
        var jsonStr = JSON.stringify(origin);
        $scope.origin = jsonStr;
        var signaturestr = wallet.generateSign(jsonStr, $scope.privateKey);
        var sendData = { origin: jsonStr, signature: signaturestr};

        var layerIndex = layer.msg('正在处理，请耐心等待....', { icon: 16, shade: [0.6, '#393D49'], scrollbar: false, time: 20000 });
        $http({
            headers: {
                Accept: "application/json; charset=utf-8",
                language: $scope.lang
            },
            method: 'POST',
            data: sendData,
            url: './v1/wallet/sendRawTransaction'
        }).then(function successCallback(response) {
            layer.close(layerIndex);
            var data = response.data;
            $scope.result = JSON.stringify(data);
            if(data.status) {
                layer.msg('转账成功。' + data.txId, { icon: 6, shade: [0.6, '#393D49'], scrollbar: false, time: 5000 });
            } else {
                layer.alert(data.msg);
            }
        }, function errorCallback(response) {
            // 请求失败执行代码
            layer.close(layerIndex);
            layer.alert('服务端出错!');
        });
    }
});