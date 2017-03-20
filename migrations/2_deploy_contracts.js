module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.autolink();
  deployer.deploy(MetaCoin);
  deployer.deploy(Owned);
  deployer.deploy(Splitter,'0x8c956d3c83f6b15e25d0a5c76c781a77a683c128','0x3bd6bc9912c56a66611ebbdd59389bffab4bb8e1');
};
