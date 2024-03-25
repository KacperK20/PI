import {Client} from 'minio'

const minioClient = new Client({
  endPoint: '10.11.6.150',
  port: 9768,
  useSSL: false,
  accessKey: 'WKnKn38wJcu8jHoHFbJZ',
  secretKey: 'rbG60hpYHy4oucrsM5fpcNaTgVaGN9aHZNWmGigD',
})

async function getFile(filename: string) {
  if(minioClient){
    let dataStream = await minioClient.getObject('magazyn-app', filename);
    let chunks: any[] = [];
    let fileBuffer: Buffer = Buffer.from('');

    await new Promise((resolve, reject) => {
      dataStream.on('data', function (chunk) {
        chunks.push(chunk);
        fileBuffer = Buffer.concat([fileBuffer, chunk]);
      });

      dataStream.on('end', function () {
        resolve(true);
      });

      dataStream.on('error', function (err) {
        reject(err);
      });
    });

    return fileBuffer;
  }
  else return null
}

async function saveFile(filename: string, fileBuffer: Buffer, metadata : any = null) {
  if(minioClient){
    if (filename.endsWith('.pdf') && !metadata) {
      metadata = {
        'Content-Type': 'application/pdf'
      }
    }

    await minioClient.putObject('magazyn-app', filename, fileBuffer, metadata ?? {});
  }
  else return null
}

export default {
  getFile,
  saveFile
};
