var iota = core.composeAPI({
  provider: 'https://nodes.thetangle.org:443'
});

let urltag = window.location.pathname.slice(1, 10)
if (urltag.length != 9) {
  console.log("No shorturl found, proceed...")
} else
  iota.findTransactionObjects({ tags: [urltag] })
    .then(tags => {
      console.log(`ADDRESS FOUND: ${tags[0].address}`)
      document.getElementById("urldata").innerHTML = tags[0].address;
    })
    .catch(err => {
    });

async function sendTag(address) {
  try {
    var address = address
    if (address.length != 90) {
      console.log("Invalid address length")
      document.getElementById("error").innerHTML = "Your address is not invalid";
      return
    }
    var tag = address.slice(81, 90)
    console.log("Tag: " + tag);
    if (address.slice(81, 90) != checksum.addChecksum(address.slice(0, 81)).slice(81, 90)) {
      console.log("Invalid checksum");
      document.getElementById("error").innerHTML = "The checksum does not match";
      return
    }
    var transfers = [{
      address: address,
      value: 0,
      tag: tag,
    }]

    let trytes = await iota.prepareTransfers((seed = '9'.repeat(81)), transfers)
    let bundle = await iota.sendTrytes(trytes, (depth = 3), (minWeightMagnitude = 14))
    console.log(`Transaction: ${bundle[0].hash}`)
  }
  catch (err) {
    console.log(err)
  }
}

async function getAddressWithTag(tag) {
  try {
    if (!tag.match(/^[A-Z9]{9}$/)) {
      console.error("Invalid tag")
      document.getElementById("error").innerHTML = "This shorturl is not valid";
      return
    }
    let hashesWithTag = await iota.findTransactions({ tags: [tag] })
    let txObjects = await iota.getTransactionObjects(hashesWithTag)
    let results = []
    txObjects.forEach(tx => {
      let addressWithChecksum = checksum.addChecksum(tx.address)
      if (addressWithChecksum.slice(81, 90) == tag) {
        results.push(addressWithChecksum)
      }
    })
    if (results.length == 0) {
      console.log("No matching tx found with tag: " + tag)
      Swal.fire(
        `No matching tx found with tag:`,
        tag,
        'error'
      )
      return
    }
    let equal = results.every((val, i, arr) => val === arr[0])
    if (equal == true) {
      console.log("Address found: " + results[0]);
      drawQR(results[0])
    } else {
      console.error("Different addresses found: " + array)
      document.getElementById("error").innerHTML = "Different addresses found: " + array;
    }
  }
  catch (err) {
    console.error(err)
  }
}


async function runApp() {
  try {
    let address = document.getElementById("UserAddress").value;
    if (address.slice(81, 90) != checksum.addChecksum(address.slice(0, 81)).slice(81, 90)) {
      document.getElementById("error").innerHTML = "Your address is invalid";
      return
    } else
      var element = document.getElementById("AddressInput");
    element.classList.add("hide");
    var link = document.createElement('a');
    link.textContent = 'https://miota.me/' + address.slice(81, 90);
    link.href = address.slice(81, 90);
    document.getElementById('urldata').appendChild(link);
    await sendTag(address)
    await new Promise(resolve => setTimeout(resolve, 1000))
    await getAddressWithTag(address.slice(81, 90))
  }
  catch (e) {
    console.log(e)
  }
}

function drawQR(address) {
  var canvas = document.getElementById("qrcode-canvas");
  canvas.style.display = "block";

  var ecl = qrcodegen.QrCode.Ecc.QUARTILE;
  var segs = qrcodegen.QrSegment.makeSegments(address);
  var minVer = 1
  var maxVer = 10
  var mask = -1
  var boostEcc = true;
  var qr = qrcodegen.QrCode.encodeSegments(segs, ecl, minVer, maxVer, mask, boostEcc);

  //draw qr code
  var border = 1;
  var scale = 4
  qr.drawCanvas(scale, border, canvas);
}