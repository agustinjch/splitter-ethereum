// Found here https://gist.github.com/xavierlepretre/88682e871f4ad07be4534ae560692ee6
web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
  var transactionReceiptAsync;
  interval = interval ? interval : 500;
  transactionReceiptAsync = function(txnHash, resolve, reject) {
    try {
      var receipt = web3.eth.getTransactionReceipt(txnHash);
      if (receipt == null) {
        setTimeout(function () {
          transactionReceiptAsync(txnHash, resolve, reject);
        }, interval);
      } else {
        resolve(receipt);
      }
    } catch(e) {
      reject(e);
    }
  };

  return new Promise(function (resolve, reject) {
      transactionReceiptAsync(txnHash, resolve, reject);
  });
};

// Found here https://gist.github.com/xavierlepretre/afab5a6ca65e0c52eaf902b50b807401
var getEventsPromise = function (myFilter, count) {
  return new Promise(function (resolve, reject) {
    count = count ? count : 1;
    var results = [];
    myFilter.watch(function (error, result) {
      if (error) {
        reject(error);
      } else {
        count--;
        results.push(result);
      }
      if (count <= 0) {
        resolve(results);
        myFilter.stopWatching();
      }
    });
  });
};

// Found here https://gist.github.com/xavierlepretre/d5583222fde52ddfbc58b7cfa0d2d0a9
var expectedExceptionPromise = function (action, gasToUse) {
  return new Promise(function (resolve, reject) {
      try {
        resolve(action());
      } catch(e) {
        reject(e);
      }
    })
    .then(function (txn) {
      return web3.eth.getTransactionReceiptMined(txn);
    })
    .then(function (receipt) {
      // We are in Geth
      assert.equal(receipt.gasUsed, gasToUse, "should have used all the gas");
    })
    .catch(function (e) {
      if ((e + "").indexOf("invalid JUMP") > -1) {
        // We are in TestRPC
      } else {
        throw e;
      }
    });
};

contract('Splitter', function(accounts) {

  it("should start with killed to false", function() {
    var splitter = Splitter.deployed();

    return splitter.isKilled.call()
      .then(function(killed) {
        assert.isFalse(killed, "should be killed = false");
      });
    });

  it("should kill if owner", function() {
    var splitter = Splitter.deployed();
    var blockNumber;

    return splitter.kill.call({}, { from: accounts[0] })
      .then(function(successful) {
        assert.isTrue(successful, "should be possible to kill the contract");
        blockNumber = web3.eth.blockNumber + 1;
        return splitter.kill({}, { from: accounts[0] });
      })
      .then(function(tx) {
        return Promise.all([
          getEventsPromise(splitter.LogSender(
            {},
            { fromBlock: blockNumber, toBlock: "latest" })),
          web3.eth.getTransactionReceiptMined(tx)
        ]);
      })
      .then(function (eventAndReceipt) {
        var eventArgs = eventAndReceipt[0][0].args;
        return splitter.isKilled();
      })
      .then(function(killed) {
        assert.isTrue(killed, "should be killed");
      })

  });

 it("should unkill if owner", function() {
    var splitter = Splitter.deployed();
    var blockNumber;

    return splitter.unkill.call({}, { from: accounts[0] })
      .then(function(successful) {
        assert.isTrue(successful, "should be possible to kill the contract");
        blockNumber = web3.eth.blockNumber + 1;
        return splitter.unkill({}, { from: accounts[0] });
      })
      .then(function(tx) {
        return Promise.all([
          getEventsPromise(splitter.LogSender(
            {},
            { fromBlock: blockNumber, toBlock: "latest" })),
          web3.eth.getTransactionReceiptMined(tx)
        ]);
      })
      .then(function (eventAndReceipt) {
        var eventArgs = eventAndReceipt[0][0].args;
        return splitter.isKilled();
      })
      .then(function(killed) {
        assert.isFalse(killed, "should be killed");
      })

  });

  // it("should be killed ", function() {
  //   var splitter = Splitter.deployed();
  //
  //   return splitter.isKilled.call()
  //     .then(function(killed) {
  //       assert.equal(killed, true, "should be killed = false");
  //     });
  //   });

  it("should get bob balance", function() {
    var splitter = Splitter.deployed();

    return splitter.getBobBalance.call()
      .then(function(balance){
        assert.typeOf(balance, 'object', 'we have an object as balance');
      });
  });

  it("should get carol balance", function() {
    var splitter = Splitter.deployed();

    return splitter.getCarolBalance.call()
      .then(function(balance){
        assert.typeOf(balance, 'object', 'we have an object as balance');
      });
  });

  it("should be possible to send some value divided by 2", function() {
    var splitter = Splitter.deployed();
    var blockNumber;

    return splitter.split.call({}, {from: accounts[0], value: 500} )
      .then(function(successful){
        console.log(successful);
        assert.isTrue(successful, "should be possible to send some balance");
        blockNumber = web3.eth.blockNumber + 1;
        return splitter.split({}, {from: accounts[0], value: 500} )
      })
      .then(function(tx){
        return Promise.all([
	    		getEventsPromise(splitter.LogBalanceSplit(
	    			{},
	    			{ fromBlock: blockNumber, toBlock: "latest" })),
	    		web3.eth.getTransactionReceiptMined(tx)
    		]);
      })
      .then(function (eventAndReceipt) {
	    	var eventArgs = eventAndReceipt[0][0].args;
	    	assert.equal(eventArgs.bobValue.valueOf(), eventArgs.bobValue.valueOf(), "should be the the same value");
	    })
    });

  it("shouldnt be possible to send some value divided by 2", function() {
    var splitter = Splitter.deployed();
    var blockNumber;
    return expectedExceptionPromise(function () {
      return splitter.split.call(
          {}, 
          { from: accounts[0], value: 9, gas: 3000000 });     
        },
        3000000);
    });
});
