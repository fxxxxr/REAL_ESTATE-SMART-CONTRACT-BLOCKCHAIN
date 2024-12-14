const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, inspector, lender
    let realEstate , escrow

beforeEach( async () =>{
    // setup account
    [buyer, seller, inspector, lender] = await ethers.getSigners()
    //deploy real state 
    const RealEstate = await ethers.getContractFactory('RealEstate')
    realEstate = await RealEstate.deploy()
   
    //mint 
    let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/1.json")
    await transaction.wait();
    // escrow deploy
 const Escrow = await ethers.getContractFactory('Escrow')
 escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
 )

 //approve property
 transaction = await realEstate.connect(seller).approve(escrow.address, 1)
 await transaction.wait()

 // List property
transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5))
await transaction.wait()
})
describe('Deployment', () =>{

    it('Returns NFT Address', async () => {
        const result = await escrow.nftAddress()
        expect(result).to.equal(realEstate.address)
          
    })

    it('Returns seller', async () => {
       const result = await escrow.seller()
        expect(result).to.equal(seller.address)
    })
    
    it('Returns Inspector', async () => {
        const result = await escrow.inspector()
        expect(result).to.equal(inspector.address)
   
    })

    it('Returns lender', async () => {
        const result = await escrow.lender()
        expect(result).to.equal(lender.address)
    
    })
})    


//listing test


describe('Listing', () =>{
    it('Updates as listed ', async () => {
        const result = await escrow.isListed(1)
        expect(result).to.be.equal(true)   
     })


    it('Updates ownership', async () => {
       expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)   
    })

    it('Returns buyer', async () => {
        const result = await escrow.buyer(1)
        expect(result).to.be.equal(buyer.address)
    
    })
    it('Returns purchase price', async () => {
        const result = await escrow.purchasePrice(1)
        expect(result).to.be.equal(tokens(10))
    })
 
    it('Returns escrow amount', async () => {
        const result = await escrow.escrowAmount(1)
        expect(result).to.be.equal(tokens(5))
    })   
}) 
})
