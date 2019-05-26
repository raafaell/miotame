var nodelist = ['https://nodes.thetangle.org:443', 'https://node02.iotatoken.nl:443', 'https://nutzdoch.einfachiota.de', 'https://wallet2.iota.town:443', 'https://iotanode.us:443']
var iota = core.composeAPI({
  provider: 'https://nodes.thetangle.org:443'
})
tryNode(0)
async function tryNode(pos) {
  try {
    iota = core.composeAPI({
      provider: nodelist[pos]
    })
    await iota.getNodeInfo()
    return
  } catch (e) {
    pos++
    if (pos < nodelist.length) {
      tryNode(pos)
    }
  }
}

if (window.location.href == 'https://miota.me/') {
  let urltag = window.location.pathname.slice(1, window.location.pathname.length)
  if (urltag.match(/^[A-Z9]{6,27}$/)) {
    getAddressWithTag(urltag)
  } else {
    console.log('No shorturl found, proceed...')
  }
}

async function sendTransaction() {
  try {
    let address = document.getElementById("UserAddress").value
    //remove spaces
    address = address.replace(/\s/g, '')
    if (address.length != 90) {
      return error('Invalid address length')
    }
    let addressChecksum = checksum.addChecksum(address.slice(0, 81)).slice(81, 90)
    if (address.slice(81, 90) != addressChecksum) {
      return error('Invalid checksum')
    }
    //update website elements
    document.getElementById("inputs").style.display = "none";
    let sendinfo = document.createElement('span')
    sendinfo.innerHTML = ('Sending transaction...')
    sendinfo.className = "urldata"
    document.getElementById('urldata').style.display = "block";
    document.getElementById('urldata').appendChild(sendinfo)
    //send transaction with checksum as tag
    let transfers = [{
      address: address,
      value: 0,
      tag: addressChecksum,
      message: converter.asciiToTrytes('https://miota.me/')
    }]
    let trytes = await iota.prepareTransfers((seed = '9'.repeat(81)), transfers)
    let bundle = await iota.sendTrytes(trytes, (depth = 3), (minWeightMagnitude = 14))
    console.log(`Transaction sent: https://thetangle.org/transaction/${bundle[0].hash}`)

    //update website elements
    let link = document.createElement('a');
    link.textContent = 'https://miota.me/' + address.slice(81, 90);
    link.href = 'https://miota.me/' + address.slice(81, 90);
    link.rel = "noopener noreferrer"
    link.className = "urldata baffle"
    document.getElementById('urldata').removeChild(sendinfo);
    document.getElementById('urldata').appendChild(link);
    //animate url revelation
    var s = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "9"];
    baffle(".baffle", { characters: s })
      .start()
      .reveal(200, 800)
      .text(() => link.textContent)
    document.getElementById('copybtn').style.display = "block";
  }
  catch (err) {
    console.log(err)
    error(err.message)
  }
}

async function getAddressWithTag(tag) {
  try {
    if (tag.slice(0, 17) == 'https://miota.me/') {
      tag = tag.slice(17, tag.length)
    }
    await new Promise(resolve => setTimeout(resolve, 1))
    if (!tag.match(/^[A-Z9]{6,27}$/)) {
      return error('Invalid tag')
    }
    //hide input field and button
    document.getElementById('AddressInput').style.display = "none";
    document.getElementById('TagInput').style.display = "none";
    document.getElementById('urldata').style.display = "block";
    document.getElementById('urldata').innerHTML = "Search transaction...";

    let hashesWithTag = await iota.findTransactions({ tags: [tag] })
    let txObjects = await iota.getTransactionObjects(hashesWithTag)
    let matchingAdresses = []
    //check for correct address
    txObjects.forEach(tx => {
      let addressWithChecksum = checksum.addChecksum(tx.address)
      if (addressWithChecksum.slice(-tag.length) == tag) {
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
      console.log('Address found: ' + results[0])
      document.getElementById('urldata').style.display = "none";
      drawQR(results[0])

      let deeplink = document.getElementById("deeplink")
      let link = document.createElement('a');
      link.innerHTML = results[0].slice(0, 81).fontcolor("DarkSlateGray") + results[0].slice(81, 90).fontcolor("DeepSkyBlue").bold()
      link.href = "iota://" + results[0];
      link.rel = "noopener noreferrer"
      link.target = "_self"

      let deeplinktitle = document.createElement('span');
      deeplinktitle.className = "deeplinktitle"
      deeplinktitle.innerHTML = "Trinity deep link</br>"
      link.prepend(deeplinktitle)

      deeplink.appendChild(link);
      deeplink.style.display = "block";
      deeplink.className = "deeplink"
    }
  }
  catch (err) {
    console.log(err)
    error(err.message)
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
  var border = 0;
  var scale = 4
  qr.drawCanvas(scale, border, canvas);
}

function error(errorMessage) {
  if (errorMessage == 'Failed to fetch') {
    Swal.fire({
      title: errorMessage,
      text: "Retry?",
      type: 'warning',
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Retry'
    }).then(() => {
      if (urltag.length == 9) {
        getAddressWithChecksum(urltag)
      }
    })
  } else {
    Swal.fire(
      errorMessage,
      '',
      'error'
    )
  }
}

//expand inputfield automatically
$(document)
  .one('focus.autoExpand', 'textarea.autoExpand', function () {
    var savedValue = this.value;
    this.value = '';
    this.baseScrollHeight = this.scrollHeight;
    this.value = savedValue;
  })
  .on('input.autoExpand', 'textarea.autoExpand', function () {
    var minRows = this.getAttribute('data-min-rows') | 0, rows;
    this.rows = minRows;
    rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 13.5);
    this.rows = minRows + rows - 1;
  });

//copy URL
function copyURL() {
  let element = ".baffle"
  var $temp = $("<input>");
  $("body").append($temp);
  console.log()
  $temp.val($(element).attr('href')).select();
  document.execCommand("copy");
  Swal.fire(
    'URL copied:',
    $(element).attr('href'),
    'success'
  )
  $temp.remove();
}
