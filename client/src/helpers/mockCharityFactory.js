let mockCharityFactory = (function() {
  var storage = {
    charities: []
  };

  return {
    "badge": function () {

    },
    "charities": function (charityId) {

    },
    "createCharity": function (currency, goal, endPeriod, description, beneficiary) {
      storage.charities.push({
        id: storage.charities.length,
        currency:currency,
        goal:goal,
        endPeriod:endPeriod,
        description:description,
        beneficiary:beneficiary,
        status:0,
        ethRaised:0,
        usdcRaised:0
      });
    },
    "donateEth": function(charityId, eth) {
      storage.charities.filter(charity => charity.id == charityId).ethRaised+=eth
    },
    "donateUsdc": function(charityId, usdc) {
      storage.charities.filter(charity => charity.id == charityId).usdcRaised+=usdc
    },
    "getCharities": function(){
      return storage.charities;
    },
    "receiveNtf": function(charityId) {
      // not supported
    },
    "tryCloseCharity": function(charityId) {
      storage.charities.filter(charity => charity.id == charityId).status = 1; // CLOSED_GOAL_MET
    },
    "withdrawContribution": function(charityId) {
      // not supported
    },
  };
})();

export default mockCharityFactory;