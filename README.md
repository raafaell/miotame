# miota.me

[MIOTA.me](https://miota.me/) is a decentralized IOTA Address Shortener. 

This tool uses the Tangle to retrieve data from an address and its tag. When a user inputs their address, miota.me takes the checksum from the address (last 9 trytes) and uses it as a unique tag, a zero value transaction is then sent to the address owner thus giving miota.me the ability to retrieve the address at a later time. The tag must be unique and match the addresses checksum.

[Github Page](https://raafaell.github.io/miotame/)

**ALWAYS CHECK IF THE CHECKSUM MATCHES THE ADDRESS!**

## Setup

`npm i`

`npm run build`

## TO DO:


```bash
1. Add animated transition between the form and the addresses information page.
2. Add Trinity deep link. (DONE)
3. Add QR code generator. (DONE)
4. Add footer and header.
5. Add function to retrieve addresses (received) status and alert the sender tx was sent.
```

## Contributing
Pull requests are welcome (and encouraged). For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
