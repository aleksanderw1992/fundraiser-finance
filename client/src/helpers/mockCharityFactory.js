let mockCharityFactory = function(charities, setCharities) {

  return {
    "badge": function () {

    },
    "charities": function (charityId) {

    },
    "createCharity": function (currency, goal, endPeriod, description, beneficiary) {
      setCharities(prev => [...prev, {
        id: prev.length,
        currency:currency,
        goal:goal,
        endPeriod:endPeriod,
        description:description,
        beneficiary:beneficiary,
        status:0,
        ethRaised:0,
        usdcRaised:0
      }]);
    },
    "donateEth": function(charityId, eth) {
      setCharities(prev =>{
        prev.filter(charity => charity.id == charityId).ethRaised+=eth;
        return prev;
      });
    },
    "donateUsdc": function(charityId, usdc) {
      setCharities(prev =>{
        prev.filter(charity => charity.id == charityId).usdcRaised+=usdc
        return prev;
      });
    },
    "getCharities": function(){
      return charities;
    },
    "receiveNtf": function(charityId) {
      // not supported
    },
    "tryCloseCharity": function(charityId) {
      setCharities(prev =>{
        prev.charities.filter(charity => charity.id == charityId).status = 1; // CLOSED_GOAL_MET
        return prev;
      });
    },
    "withdrawContribution": function(charityId) {
      // not supported
    },
  };
};

export default mockCharityFactory;