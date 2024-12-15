//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }
    modifier onlyseller() {
        require(msg.sender == seller, "Only seller can call this method ");
        _;
    }
    modifier onlyInspector(){
        require(msg.sender == inspector,"only inspector can call this method");
        _;
    }

    //mapping
    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }
    /*listing function 
work to do : MAKE IT ONLYSELLER BY USING MODIFIER */
    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint _escrowAmount
    ) public payable onlyseller {
        // transfer of NFT from seller to this contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);
        //mapping
        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    //put under contract (only buyer - payable escrow)
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID]);
    }


    // updates the inspection status (only inspector)
    function updateInspectionStatus(uint256 _nftID, bool _passed) 
    public onlyInspector {
       inspectionPassed[_nftID] = _passed;
    }

    //receive function
    receive() external payable {}


    // get balance
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
