//SPDX-License-Identifier: MIT

pragma solidity 0.8.26;

struct Bet {
    uint amount;
    uint candidate;
    uint timestamp;
    uint claimed;
}

struct Dispute {
    string candidate1;
    string candidate2;
    string candidate3;
    string image1;
    string image2;
    string image3;
    uint total1;
    uint total2;
    uint total3;
    uint winner;
}

contract BetCandidate {

    Dispute public dispute;
    mapping(address => Bet) public allBets;

    address public immutable owner;
    uint immutable fee = 1000;//10% (scale of 4 zeros)
    uint public netPrize;
    uint immutable betEndTime;
    uint immutable finishEndTime;
    uint public totalBettors1;
    uint public totalBettors2;
    uint public totalBettors3;

    constructor(){
        owner = msg.sender;
        dispute = Dispute({
            candidate1: "P. Marçal",
            candidate2: "G. Boulos",
            candidate3: "R. Nunes",
            image1: "https://bit.ly/4ePysay",
            image2: "https://bit.ly/47WGxrq",
            image3: "https://bit.ly/47WGJa8",
            total1: 0,
            total2: 0,
            total3: 0,
            winner: 0
        });
        betEndTime = 1728201600.0.; //06/10/2024 08h00
        finishEndTime = betEndTime + 1730048400.0.;  //27/10/2024 17h00
    }


    modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can perform this action");
    _;
    }

    // Functions for changing candidates' names
    function setCandidateNames(string memory _candidate1, string memory _candidate2, string memory _candidate3) external onlyOwner {
        dispute.candidate1 = _candidate1;
        dispute.candidate2 = _candidate2;
        dispute.candidate3 = _candidate3;
    }

    // Functions for changing candidate images
    function setCandidateImages(string memory _image1, string memory _image2, string memory _image3) external onlyOwner {
        dispute.image1 = _image1;
        dispute.image2 = _image2;
        dispute.image3 = _image3;
    }

    // Function for changing the end date of bets
    function setBetEndTime(uint _betEndTime) external onlyOwner {
        require(block.timestamp < betEndTime, "Betting period already ended");
        betEndTime = _betEndTime;
    }

    // Function to change the end date to finalize
    function setFinishEndTime(uint _finishEndTime) external onlyOwner {
        require(block.timestamp < finishEndTime, "Finish period already ended");
        finishEndTime = _finishEndTime;
    }

    function bet(uint candidate) external payable {
        require(block.timestamp <= betEndTime, "Betting period is over");
        require(candidate == 1 || candidate == 2 || candidate == 3, "Invalid candidate");
        require(msg.value > 0, "Invalid bet");
        require(dispute.winner == 0, "Dispute closed");
        require(allBets[msg.sender].amount == 0, "Already placed a bet");

        Bet memory newBet;
        newBet.amount = msg.value;
        newBet.candidate = candidate;
        newBet.timestamp = block.timestamp;

        allBets[msg.sender] = newBet;

        if(candidate == 1) {
            dispute.total1 += msg.value;
            totalBettors1 += 1;
        }
        else if(candidate == 2){
            dispute.total2 += msg.value;
            totalBettors2 += 1;
        }
        else { 
            dispute.total3 += msg.value;   
            totalBettors3 += 1;
        }
    }

    function finish(uint winner) external {
        require(msg.sender == owner, "Invalid account");
        require(winner == 1 || winner == 2 || winner == 3, "Invalid candidate");
        require(dispute.winner == 0, "Dispute closed");
        require(block.timestamp >= finishEndTime, "Cannot finish before finish end time");

        dispute.winner = winner;

        uint grossPrize = dispute.total1 + dispute.total2 + dispute.total3; // Inclui total3
        uint commission = (grossPrize * fee) / 1e4;
        netPrize = grossPrize - commission;
    }


    bool public commissionWithdrawn;

    function withdrawCommission() external {
        require(msg.sender == owner, "Only owner can withdraw commission");
        require(dispute.winner > 0, "Dispute not finished yet");
        require(!commissionWithdrawn, "Commission already withdrawn"); // Evita múltiplas retiradas

        uint grossPrize = dispute.total1 + dispute.total2 + dispute.total3; // Inclui total3
        uint commission = (grossPrize * fee) / 1e4;
        commissionWithdrawn = true;

        payable(owner).transfer(commission);
    }



    function claim() external {
        Bet storage userBet = allBets[msg.sender];
        require(dispute.winner > 0 && dispute.winner == userBet.candidate && userBet.claimed == 0, "Invalid claim");

        uint winnerAmount;
        if(dispute.winner == 1){
            winnerAmount = dispute.total1;
        }
        else if(dispute.winner == 2){
            winnerAmount = dispute.total2;
        }
        else { // dispute.winner == 3
            winnerAmount = dispute.total3;
        }

        uint ratio = (userBet.amount * 1e4) / winnerAmount;
        uint individualPrize = netPrize * ratio / 1e4;
        userBet.claimed = individualPrize;
        payable(msg.sender).transfer(individualPrize);
    }


}
