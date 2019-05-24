var iota = core.composeAPI({
  provider: 'https://nodes.thetangle.org:443'
});

let urltag = window.location.pathname.slice(1, 10)
if (urltag.length != 9) {
  console.log('No shorturl found, proceed...')
} else {
  getAddressWithChecksum(urltag)
}

async function sendTransaction() {
  try {
    let address = document.getElementById("UserAddress").value;
    //remove spaces
    address = address.replace(/\s/g, '')
    if (address.length != 90) {
      return error('Invalid address length')
    }
    let addressChecksum = checksum.addChecksum(address.slice(0, 81)).slice(81, 90)
    if (address.slice(81, 90) != addressChecksum) {
      return error('Invalid checksum')
    }
    //send transaction with checksum as tag
    let transfers = [{
      address: address,
      value: 0,
      tag: addressChecksum,
      message: converter.asciiToTrytes('https://miota.me/')
    }]
    let trytes = await iota.prepareTransfers((seed = '9'.repeat(81)), transfers)
    let bundle = await iota.sendTrytes(trytes, (depth = 3), (minWeightMagnitude = 14))
    console.log(`Transaction with sent: https://thetangle.org/transaction/${bundle[0].hash}`)

    //update website elements
    let element = document.getElementById("AddressInput");
    element.classList.add("hide");
    let link = document.createElement('a');
    link.textContent = 'https://miota.me/' + address.slice(81, 90);
    link.href = 'https://miota.me/' + address.slice(81, 90);
    document.getElementById('urldata').appendChild(link);
  }
  catch (err) {
    console.log(err)
    error(err)
  }
}

async function getAddressWithChecksum(tag) {
  try {
    await new Promise(resolve => setTimeout(resolve, 1))
    if (!tag.match(/^[A-Z9]{9}$/)) {
      return error('Invalid tag')
    }
    let hashesWithTag = await iota.findTransactions({ tags: [tag] })
    let txObjects = await iota.getTransactionObjects(hashesWithTag)
    let matchingAdresses = []
    //check for correct address
    txObjects.forEach(tx => {
      let addressWithChecksum = checksum.addChecksum(tx.address)
      if (addressWithChecksum.slice(81, 90) == tag) {
        matchingAdresses.push(addressWithChecksum)
      }
    })
    let results = [... new Set(matchingAdresses)]
    if (results.length == 0) {
      return error(`No matching transaction found with tag: ${tag}`)
    } else if (results.length > 1) {
      console.error('Different addresses found: ' + array)
      return error('Different addresses found, ask for a new one!')
    } else if (results.length == 1) {
      console.log('Address found: ' + results[0]);
      drawQR(results[0])
      let deeplink = document.getElementById("deeplink")
      deeplink.href = "iota://" + results[0];
      deeplink.style.display = "block";
    }
  }
  catch (err) {
    console.log(err)
    error(err)
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
  var border = 1;
  var scale = 4
  qr.drawCanvas(scale, border, canvas);
}

function error(errorMessage) {
  Swal.fire(
    errorMessage,
    '',
    'error'
  )
}