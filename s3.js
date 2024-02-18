//--------------------------------------------------------------------------
// multer 라이브러리 관련 모듈
//  : 사용자가 웹서버에 파일을 업로드하는 기능이 필요할 때, 이를 좀 더 쉽게 구축할 수 있게 도와주는 용도의 라이브러리

const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')

// multer-s3 사용시, S3 연결에 필요한 정보를 받는 객체를 생성
//  -> @aws-sdk/client-s3 라이브러리 관련 기능에 해당
const s3 = new S3Client({
    region : 'ap-northeast-2',
    credentials : {
        accessKeyId : process.env.ACCESS_KEY_ID,
        secretAccessKey : process.env.SERCET_ACCESS_KEY
    }
})

// multer 라이브러리를 통해 업로드한 파일 저장하는 기능 수행을 수행할 시 필요한 속성인 storage의 내용 입력 storage의 속성값을, S3 버킷(저장소이름), 저장명을 짓는 콜백함수를 설정하여 마무리
//  -> s3 : 앞서 생성한 S3 객체의 정보값(region, credentials)을 요구
//  -> bucket : 접속할 S3의 bucket(저장소명)
//  -> key : 저장소에 파일 저장시 새로 설명할 파일명을 만든 콜백함수 설정
//           (원본 파일명은 요청.file을 통해 얻을 수 있음)
const upload = multer({
    storage: multerS3({
        s3: s3,                                   
        bucket: process.env.BUCKET,  
        key: function (요청, file, cb) {
            cb(null, Date.now().toString()) 
        }
    })
})

 // module.exports
 //  : 현재 js 파일을 외부에서 모듈처럼 import하여 불러쓰게 하는 JS모듈 관련 객체의 멤버변수
 //     -> 외부에서 해당 JS파일을 모듈로서 불러왔을 때, exports멤버 안에 저장된 값을 return하게 함
 //        (= s3 연결 모듈로서 보일러플레이트 코드를 보관하고 호출하는 용도라면 s3 정보를 가진 관련 객체를 리턴해야 함)
module.exports = upload;