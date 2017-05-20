module.exports = (web3) => {
  function sendRpc(method, params) {
    return new Promise((resolve) => {
      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method,
        params: params || [],
        id: new Date().getTime(),
      }, (err, res) => { resolve(res); });
    });
  }
  function waitUntilBlock(seconds, targetBlock) {
    return new Promise((resolve) => {
      const asyncIterator = () => {
        return web3.eth.getBlock('latest', (e, { number }) => {
          if (number >= targetBlock - 1) {
            return sendRpc('evm_increaseTime', [seconds])
            .then(() => sendRpc('evm_mine')).then(resolve);
          }
          return sendRpc('evm_mine').then(asyncIterator);
        });
      };
      asyncIterator();
    });
  }
  function waitUntilBlockTimestamp(targetTimestamp, targetBlock) {
    return new Promise((resolve) => {
      const asyncIterator = () => {
        return web3.eth.getBlock('latest', (e, { number, timestamp }) => {
          const seconds = targetTimestamp - timestamp;
          if (number >= targetBlock - 1) {
            return sendRpc('evm_increaseTime', [seconds])
            .then(() => sendRpc('evm_mine')).then(resolve);
          }
          return sendRpc('evm_mine').then(asyncIterator);
        });
      };
      asyncIterator();
    });
  }
  function wait(seconds = 20, blocks = 1) {
    return new Promise((resolve) => {
      return web3.eth.getBlock('latest', (e, { number }) => {
        resolve(blocks + number);
      });
    })
    .then((targetBlock) => {
      return waitUntilBlock(seconds, targetBlock);
    });
  }
  function goTo(targetTimestamp, blocks = 1) {
    return new Promise((resolve) => {
      return web3.eth.getBlock('latest', (e, { number }) => {
        resolve(blocks + number);
      });
    })
    .then((targetBlock) => {
      return waitUntilBlockTimestamp(targetTimestamp, targetBlock);
    });
  }
  return { wait, waitUntilBlock, goTo };
};
