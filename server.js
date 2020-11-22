//GERAN Ludovic

const net = require('net');
const fs = require('fs');
const readLine = require('readline');
const path = require('path')
const students = require('./id.json');

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const server = net.createServer((socket) => {
  console.log("new connection");

  let user = null 
  let authentificated = false;
  let currentPath = path.resolve('.')
 
  socket.on('data', (data) => {
    const [directive, parameter] = data.toString().split(' ');

    switch (directive) {
      case 'USER':
        const student = students.find(s => {
          return s.username === parameter
        })

        if (student) {
          socket.write('User exists');
          user = student;
        } else {
          socket.write('Impossible to connect');
        }
        break

      case 'PASS':
        if (user !== null) {
          if (user.password === parameter) {
            socket.write('Password ok');
            authentificated = true;
          }
          else {
            socket.write('Wrong password');
          }
        } else {
          socket.write('Use command USER before PASS');
        }
        break

      case 'LIST':
          if (authentificated){
            const files = fs.readdirSync(currentPath).join(' ');
            socket.write(files);
          }
          else {
            socket.write('Forbidden: You need to authentificate');
          }
          break

      case 'CWD': 
          if (authentificated){
            const newPath = path.resolve(currentPath + '/' + parameter) 

            try {
              fs.readdirSync(newPath)
                currentPath = newPath;
                socket.write('Changed to directory ' + parameter)
            } catch {
              socket.write('Directory ' + parameter + ' doesn\'t exists')
            }
          }
          else{
            socket.write('Forbidden: You need to authentificate');
          }
        break

        case 'PWD':
            if(authentificated){
                socket.write('The current path is '+ currentPath);
            }
            else {
                socket.write('Forbidden: You need to authentificate');
            }
            break
            
        case 'HELP':
                const help = 
`LIST OF COMMANDS: \n
-USER {NAME} (Verify that the user exists)
-PASS {PASSWORD} (Verify that the user exists)
-LIST (List the current directory of the server)
-CWD {DIRECTORY} (Change the current directory)
-RETR {filename} (Transfer a copy of the file FILE from the server to the client)
-STOR {filename} (Transfer a copy of the file FILE from the client to the server)
-PWD: (display the name of the current directory of the server)
-QUIT: close the connection and stop the program`
                socket.write(help);
        break

        case 'QUIT':
            socket.destroy();
        break

        case 'RETR':
            if(authentificated){
              try {
                const fileData = fs.readFileSync(currentPath + '/' + parameter)
                socket.write('RETR_FILE_CONTENT\n' + parameter + '\n' + fileData)

              } catch (error) {
                console.log(error)
                socket.write('Error: file doesn\'t exists')
              }
            }
            else {
                socket.write('Forbidden: You need to authentificate');
            }
            break
        case 'STOR':
          if(authentificated){
              const fileData = data.toString().split('\n').slice(1).join('\n')
              const filePath = currentPath + '/CLIENT_' + parameter.split('\n')[0]

              fs.writeFile(filePath, fileData, error => {
                if (error) {
                  console.error(error)
                } else {
                  socket.write('File saved as ' + filePath)
                }
              })
          }
          else {
              socket.write('Forbidden: You need to authentificate');
          }
          break
      default: 
        socket.write('404 Command not found')
    }
  })
})

server.listen(5000, () => {
  console.log("Server started at port 5000")
})