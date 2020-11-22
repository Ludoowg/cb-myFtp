//GERAN Ludovic
const net = require('net');
const readLine = require('readline');
const fs = require('fs');

// Duplex Stream 
const client = new net.Socket();


const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
})

client.connect(5000, '127.0.0.1', () => {
    console.log("connected");
    handleUserInput()
})

client.on('data', (data) => {  
  const dataSplit = data.toString().split('\n')

  if (dataSplit[0] === 'RETR_FILE_CONTENT') {
    const filePath = 'FTP_' + dataSplit[1]
    const fileData = dataSplit.slice(2).join('\n')
 
    fs.writeFile(filePath, fileData, error => {
      if (error) {
        console.error(error)
      } else {
        console.log('File saved as ' + filePath)
      }
    })
  } else {
    console.log('ftp>', data.toString())
  }
  handleUserInput()
})


function handleUserInput() {
  rl.question('>', (input) => {
    const [command, parameter] = input.split(' ')

    if (command === 'STOR') {
      console.log('input', input)
      const fileData = fs.readFileSync(parameter)
      client.write(input + '\n' + fileData.toString())
    } else {
      client.write(input);
    }
  })
}


client.on('close', () => {
  console.log('Connection to FTP server closed')
  process.exit(0)
})