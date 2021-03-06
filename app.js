// app.get : 가져오기 , app.post : 생성하기,로그인하기
// app.put : 전체수정(통채로 수정) , app.delete : 삭제
// app.patch : 부분수정(닉네임만 수정) , app.patch : 부분수정
// app.option : 찔러보기(서버야 내가 요청보내면 받아줄꺼야?)
// app.head : 헤더만 가져오기

// 하나의 요청에는 하나의 응답만 할 수 있다.

const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Upload Image Path
const path = require('path');

// DB 등록
const db = require('./models');

// PassPort(로그인) 설정
const passport = require('passport');
const passportConfig = require('./passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// 패스포트, .env 사용
passportConfig();
dotenv.config();

// DB연결
db.sequelize
  .sync()
  .then(() => {
    console.log('DB 연결 성공');
  })
  .catch(console.error);

// Upload Image middlewares Setting
// react-nodebird-back + uploads 경로를 합쳐준다.
// localhost:3065/react-nodebird-back/uploads
app.use('/', express.static(path.join(__dirname, 'uploads')));

// 프론트의 데이터를 req.body 에 넣어주는 역할을 한다.
// 라우터 위에 올려야한다. 위에서 아래로 읽기때문이다.
app.use(express.json()); // 프론트정보를 서버에 전달할때 json형태로 req.body 에 넣어준다.
app.use(express.urlencoded({ extended: true })); //form data를 req.body에 넣어준다.
app.use(
  cors({
    // withcredentials true가 되면 origin의 주소는 정확하게
    // 적어주어야한다. *를 쓰면 안된다.
    origin: 'http://localhost:3060',
    // 쿠키도 전달하고 싶다면
    credentials: true,
  })
);
app.use(morgan('dev'));

// Login & Session Middleware
app.use(cookieParser());
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    // 쿠키랑 secret문자를 통해 id를 복원할수 있다.
    // 문자가 노출되면 해킹의 위험이 있다.
    secret: process.env.COOKIE_SECRET,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Import Router
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const userRouter = require('./routes/user');
const hashtagRouter = require('./routes/hashtag');

// Use Router
app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/user', userRouter);
app.use('/hashtag', hashtagRouter);

app.listen(3065, () => {
  console.log('Sever Start!');
});
