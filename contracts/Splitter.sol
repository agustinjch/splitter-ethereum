pragma solidity ^0.4.2;

import "Owned.sol";

contract Splitter is Owned {
  address public bob;
  uint public bobBalance;

  address public carol;
  uint public carolBalance;

  bool private killed;

  event LogBalanceSplit(uint bobValue, uint carolValue);
  event LogSender(address sender, bool killed);

  function Splitter(address _bob, address _carol){
    bob = _bob;
    carol = _carol;
    bobBalance = bob.balance;
    carolBalance = carol.balance;
    killed = false;
  }

  function kill()
    fromOwner
    returns (bool successful){
      if (killed == true) throw;
      killed = true;
      LogSender(msg.sender, killed);
      return true;
  }

  function unkill()
    fromOwner
    returns (bool successful){
      if (killed == false) throw;
      killed = false;
      LogSender(msg.sender, killed);
      return true;
  }

  function isKilled()
    constant
    returns (bool isKilled) {
      LogSender(msg.sender, killed);
      return killed;
    }

  function getBobBalance()
    constant
    returns (uint balance){
      return bobBalance;
    }

  function getCarolBalance()
    constant
    returns (uint balance){
      return carolBalance;
    }


  function split() payable returns (bool successful){
    if (msg.value == 0) throw;
    if (killed == true) throw;
    uint split = msg.value/2;
    if (split + split != msg.value) throw;
    if (!bob.send(msg.value / 2)) throw;
    if (!carol.send(msg.value / 2)) throw;
    bobBalance = bob.balance;
    carolBalance = carol.balance;
    LogBalanceSplit((msg.value/2), (msg.value/2));
    return (true);
  }
}
