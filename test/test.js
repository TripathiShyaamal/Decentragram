const { assert } = require('chai')

/* eslint-disable no-undef */
const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Decentragram', ([deployer, author, tipper]) => { // This is basically mocha in action
    let decentragram

    before(async() => {
        decentragram = await Decentragram.deployed()
    })

    describe('deployment', async() => {
        it('deploys successfully', async() => {
            const address = await decentragram.address
            assert.notEqual(address, 0x0) // Here and in the next three lines we are checking that the address is not equal to the specified values
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a name', async() => {
            const name = await decentragram.name()
            assert.equal(name, 'Decentragram') // Checking that the name is decentragram only
        })
    })
    describe('images', async() => {
        let result, imageCount
        const hash = 'abc123'
        before(async() => {
            result = await decentragram.uploadImage(hash, 'Image Description', { from: author })
            imageCount = await decentragram.imageCount()
        })

        it('create images', async() => {
            assert.equal(imageCount, 1)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
            assert.equal(event.hash, hash, 'Hash is correct')
            assert.equal(event.description, 'Image Description', 'Description is correct')
            assert.equal(event.tipAmount, '0', 'Tip Amount is correct')
            assert.equal(event.author, author, 'author is correct')

            //Testing without giving a hash 
            await decentragram.uploadImage('', 'Image Description', { from: author }).should.be.rejected;
        })

        it('lists images', async() => {

            //Checking from struct
            const image = await decentragram.images(imageCount)
            assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is correct')
            assert.equal(image.hash, hash, 'Hash is correct')
            assert.equal(image.description, 'Image Description', 'Description is correct')
            assert.equal(image.tipAmount, '0', 'Tip Amount is correct')
            assert.equal(image.author, author, 'author is correct')
        })

        it('allows users to tip images', async() => {
            let oldAuthorBalance

            //Tracking the author balance before purchase
            oldAuthorBalance = await web3.eth.getBalance(author)
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance) //Converting into BN.js instance
                //to handle big numbers

            //Sending the author 1 Ethereum that is 1 cryprtocurrency 
            result = await decentragram.tipImageOwner(imageCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

            //Success
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
            assert.equal(event.hash, hash, 'Hash is correct')
            assert.equal(event.description, 'Image Description', 'Description is correct')
            assert.equal(event.tipAmount, '1000000000000000000', 'Tip amount is correct ')
            assert.equal(event.author, author, 'author is correct')

            //Checking whether the author received funds or not
            let newAuthorBalance
            newAuthorBalance = await web3.eth.getBalance(author)
            newAuthorBalance = new web3.utils.BN(newAuthorBalance)

            let tipImageOwner
            tipImageOwner = web3.utils.toWei('1', 'Ether')
            tipImageOwner = new web3.utils.BN(tipImageOwner)

            const expectedBalance = oldAuthorBalance.add(tipImageOwner)
            assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

            //Trying to tip the image that does not exist
            await decentragram.tipImageOwner(99, { from: tipper, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;

        })

    })
})