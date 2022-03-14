const fs = require("fs");

function solve(listContracts, givenNumberContainer) {
  if (Array.isArray(listContracts)) {
    listContracts.sort(
      (firstRenter, secondRenter) =>
        firstRenter.container - secondRenter.container
    );

    const sortingContainers = listContracts
      .slice()
      .map((contract) => contract.container);

    let currentSummary = sortingContainers[0];
    let start = 0;
    const listFindingContainers = [];

    for (let index = 1; index <= sortingContainers.length; index++) {
      while (currentSummary > givenNumberContainer && start < index) {
        currentSummary = currentSummary - sortingContainers[start];
        start++;
      }
      if (currentSummary === givenNumberContainer) {
        listFindingContainers.push({
          begin: start,
          end: index - 1,
        });
      }

      if (index < sortingContainers.length) {
        currentSummary += sortingContainers[index];
      }
    }

    let lowestPrice = undefined;
    let groupContracts = undefined;

    listFindingContainers.forEach((value) => {
      let sum = 0;
      for (let i = value.begin; i <= value.end; i++) {
        sum += listContracts[i].totalCost;
      }
      if (lowestPrice === undefined || lowestPrice > sum) {
        lowestPrice = sum;
        groupContracts = value;
      }
    });

    if (groupContracts !== undefined) {
      for (let i = groupContracts.begin; i <= groupContracts.end; i++) {
        console.log(
          `[Contract with] Container renter ${listContracts[i].name} ${listContracts[i].container} container, price: ${listContracts[i].totalCost}`
        );
      }
      console.log(`[Summary] total cost ${lowestPrice}`);
    } else {
      let sum = 0;
      for (let i = 0; i < listContracts.length; i++) {
        console.log(
          `[Contract with] Container renter ${listContracts[i].name} ${listContracts[i].container} container, price: ${listContracts[i].totalCost}`
        );
        sum++;
      }
      console.log("Not enough containers");
      console.log(`[Summary] total cost ${sum}`);

    }
  }
}

fs.readFile("./testcase.json", "utf8", (err, data) => {
  if (err) {
    console.log(`Failed to read data from ${"./testcase.json"} : ${err}`);
  } else {
    const db = JSON.parse(data);
    const tests = db.testcase;
    if (Array.isArray(tests)) {
      tests.forEach((tests, index) => {
        console.log('>>>>>>>> Test case', index + 1);
        const {neededContainer, listings} = tests;
        solve(listings, neededContainer);
        console.log()
      })
    }
  }
});
