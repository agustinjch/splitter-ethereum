var app = angular.module('splitterApp', []);

app.config(function ($locationProvider) {
  $locationProvider.html5Mode(true);
});

app.controller("splitterController", [ '$scope', '$location', '$http', '$q', '$window', '$timeout', function($scope , $location, $http, $q, $window, $timeout) {

	$scope.split = function(value) {
		Splitter.deployed()
			.split(
				{},
				{ from: account, gas: 3000000, value: value })
			.then(function (tx) {
        		console.log('ts', tx);
				return web3.eth.getTransactionReceiptMined(tx);
			})
			.then(function (receipt) {
        		console.log("Transaction mined");
        		refreshBalance();
        		console.log(receipt);
			});
	};

  function refreshBalance() {
    console.log('refreshBalance called');
    var splitter = Splitter.deployed();
    splitter.getBobBalance.call({}, {}).then(function(value) {
      var balance_element = document.getElementById("bobBalance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      setStatus("Error getting bob balance; see log.");
    });

    splitter.getCarolBalance.call({}, {}).then(function(value) {
      var balance_element = document.getElementById("carolBalance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      setStatus("Error getting carol balance; see log.");
    });

    splitter.isKilled.call({}, {}).then(function(killed){
      console.log("After call isKilled", killed)
      var killed_element = document.getElementById("killed");
      killed_element.innerHTML = killed;
    }).catch(function(e) {
      console.log(e);
      setStatus("Error getting killed value see log.");
    });

    var balance_element = document.getElementById("aliceBalance");
    balance_element.innerHTML = web3.fromWei(web3.eth.getBalance(account));
  };

  $scope.kill = function() {
		Splitter.deployed()
			.kill(
				{},
				{ from: account, gas: 3000000 })
			.then(function (tx) {
        console.log('tx', tx);
				return web3.eth.getTransactionReceiptMined(tx);
			})
			.then(function (receipt) {
        console.log("Transaction mined", receipt);
        refreshBalance();
			});
	};

  $scope.unkill = function() {
		Splitter.deployed()
			.unkill(
				{},
				{ from: account, gas: 3000000 })
			.then(function (tx) {
        console.log('tx', tx);
				return web3.eth.getTransactionReceiptMined(tx);
			})
			.then(function (receipt) {
        console.log("Transaction mined", receipt);
        refreshBalance();
			});
	};




	// $scope.products = [];

	// $scope.collectProducts = function() {
  //
	// 	Splitter.deployed().getProductCount()
	// 		.then(function (count) {
	// 			if (count.valueOf() > 0) {
	// 				for (var i = 0; i < count.valueOf(); i++) {
	// 					Splitter.deployed().getProductIdAt(i)
	// 						.then(function (id) {
	// 							return Splitter.deployed().getProduct(id.valueOf())
	// 								.then(function (values) {
	// 									$timeout(function () {
	// 										$scope.products.push({
	// 											id: id,
	// 											name: values[0],
	// 											price: values[1]
	// 										});
	// 									});
	// 								})
	// 								.catch(function (e) {
	// 									console.error(e);
	// 								});
	// 						})
	// 						.catch(function (e) {
	// 							console.error(e);
	// 						});
	// 				}
	// 			}
	// 		});
  //
	// };

	$window.onload = function () {

		initUtils(web3);
		web3.eth.getAccounts(function(err, accs) {
			if (err != null) {
			  alert("There was an error fetching your accounts.");
			  return;
			}

			if (accs.length == 0) {
			  alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
			  return;
			}

			accounts = accs;
			account = accounts[0];


      refreshBalance();

		});
	}

}]);
