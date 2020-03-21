// HTTPサーバーを操作する
let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
// ユーザーを管理するオブジェクト
let login_users = {};
// メッセージを管理する配列
let messages = [];

// app.get が呼び出された時に呼び出される関数を定義
// req, res は get() の中で function に渡される
// Nodeサーバにアクセスがあったときにindex.htmlへ遷移
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// Socketを起動する
// クライアントが接続するたびにイベントハンドラを登録
io.on('connection', function(socket){
    console.log('user connected');
    console.log('id: ' + socket.id);

    // 接続してきたクライアントにのみ送信
    io.to(socket.id).emit('show_messages', messages);
    io.to(socket.id).emit('show_users', login_users);

    // disconnectというイベントが来た時にio.emitが動くようにする
    socket.on('disconnect', function(){
        console.log('user disconnected');
        delete login_users[socket.id];
        io.emit("show_users", login_users);
    });

    // socket.emit で chat messageを受け取ったら動く
    // イベントの検知，送信されたdataを受信
    // chat messageというイベントが来た時にio.emitが動くようにする
    socket.on('chat message', function(msg, nickname_me, atuser){
        // io.emit: 全クライアントに送信
        // クライアント側のイベントを実行
        let date = new Date();
        console.log(date.toLocaleString("ja"));
        messages.push("[" + date.toLocaleString("ja") + "]" + nickname_me + ": " + msg);
        let socketid = getSocketId(login_users, atuser);
        console.log(socketid);
        if (socketid == -1){
            io.emit('chat message', msg, login_users[socket.id], date.toLocaleString("ja"));
        }
        else{
            io.to(socketid).emit('chat message', msg, login_users[socket.id], date.toLocaleString("ja"));
        }
    });

    //set nickname
    socket.on('set nickname', (nickname) => {
        console.log(nickname + ' login');
        // idごとにuser_nameを記録
        login_users[socket.id] = nickname;
        io.emit('add online users', nickname, login_users);
        console.log("login_user: " + login_users[socket.id]);
    });
});

// nodeを立ち上げた時に動く関数
// PORT: 3000 を http server へのアクセスポイントとして作る
http.listen(3000, function(){
    console.log('listening on *:3000');
});

//ニックネームに一致するSocketIdを返す
function getSocketId(login_users, nickname){
    for(let key in login_users){
        if( login_users[key] == nickname ){
            return key;
        }
    }
    return -1;
}