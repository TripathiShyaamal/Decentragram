pragma solidity ^0.5.0;

contract Decentragram
{
  // Code goes here...
  string public name = "Decentragram";

  //Store images
  uint public imageCount=0;
  mapping(uint => Image) public images; //Mapping is an array or an hash table which has an ID like a number.
  //We have kept this public so that we can reference it outside the smart contract too and we will use it as images.

   struct Image // This will go in the above mapping as key
   {
    uint id;
    string hash; // The location of IPFS
    string description; // The description of the post that is the iamge
    uint tipAmount; // The tip in the form of crypto
    address payable author; // The address of the author whom to send the tip
   }

   event ImageCreated  // Creating an event so that whenever the upload function is called, we are notified
   (
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
   );

   event imageTipped
   (
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
   );


  //Create images
  function uploadImage(string memory _imgHash, string memory _description) public
  {
    require(bytes(_imgHash).length>0); // Making sure that the image hash that is the IPFS hash is
    //never empty

    require(bytes(_description).length>0); //Making sure that th image has a description and it
    //it cannot be uploaded without any description.

    require(msg.sender!=address(0x0)); // Making sure that the person who is uploading the image does not
    //have a blank address

    imageCount++; // Changing value of imageCount to generate different set of image
    images[imageCount] = Image(imageCount,_imgHash,_description, 0,msg.sender); //Adding image to contract
    emit ImageCreated(imageCount,_imgHash,_description, 0,msg.sender);
  }

  //Tip images
  function tipImageOwner(uint _id) public payable
  {
    require(_id > 0 && _id <= imageCount);

    Image memory _image = images[_id]; //The _image variable is a memory variable and is wiped after execution
    address payable _author = _image.author;

    address(_author).transfer(msg.value);// Transfering the amount of the tip to the author

    _image.tipAmount = _image.tipAmount + msg.value; //incrementing the tip Amount

    images[_id] = _image; //Updating the image back in the mapping that is putting it back in the blockchain
    emit imageTipped(_id, _image.hash, _image.description, _image.tipAmount, _author);
  }
}