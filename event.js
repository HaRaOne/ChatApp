// $(function(){}): JQueryの構文
// 関数を予約状態にしてHTMLファイルの読み込みが完了したら実行される
console.log("Hello");

// socket.io のモジュール
let socket = io();
let nickname_me = ""
let latest_message = "";

$(function (){
    // submitされたら動く関数
    //受信したメッセージを送信
    $('form.message').submit(function(e){
        // prevent page reloading
        e.preventDefault();
        // 空白とかだけだったらだめ
        // \S: 空白以外の何かしらの文字
        if (/\S/.test($('#msbox').val()) == false){
            console.log("only space is bad");
            $('#msbox').val('');
            return false;
        }
        // 直前に送ったメッセージと同じだった場合は無効
        if (latest_message ==  $('#msbox').val()){
            console.log("Do not send same message!!");
            return false;
        }

        latest_message = $('#msbox').val();
        
        // イベントの発火，接続している全員にdataを送信
        socket.emit('chat message', $('#msbox').val(), nickname_me);
        $('#msbox').val('');
        return false;
    });

    $('form.nickname').submit(function(e){
        nickname_me = $('#nnbox').val();
        // prevent page reloading
        e.preventDefault();
        // イベントの発火，接続している全員にdataを送信
        socket.emit('set nickname', $('#nnbox').val());
        $('#nnbox').val('');
        return false;
    });

    $('.dropdown-menu .dropdown-item').click(function(){
        console.log("select name");
        let visibleItem = $('.dropdown-toggle', $(this).closest('.dropdown'));
        visibleItem.text($(this).attr('value'));
    });

    //onlineのuserが増えた時
    socket.on('first_connection', function(messages, login_users){
        messages.forEach(element => {
            document.getElementById('exampleFormControlTextarea1').value
            += element + "\n";
        });
        for (let key in login_users){
            addOnlineList(login_users[key]);
        }
    });

    // 受信したメッセージを表示
    // クライアント側の処理
    socket.on('chat message', function(msg, nickname){
        console.log('from: ' + nickname);
        // $('#messages').append($('<li>').text(msg));
        if (nickname_me == nickname){
            addMessageList("I", msg)
        }
        else{
            addMessageList(nickname, msg);
        }
    });

    //onlineのuserが増えた時
    socket.on('add online users', function(nickname){
        // $('#messages').append($('<li>').text(msg));
        addUsersList(nickname);
        addOnlineList(nickname);
    });
});

function addUsersList(nickname){
    const btn_users_list = document.createElement("button");
    btn_users_list.setAttribute("class","dropdown-item");
    btn_users_list.setAttribute("type","button");
    btn_users_list.setAttribute("value",nickname);
    const text = document.createTextNode(nickname);
    btn_users_list.appendChild(text);
    users_list.appendChild(btn_users_list);
}

// リストへの追加関数
function addMessageList(nickname, message){
    document.getElementById('exampleFormControlTextarea1').value
            += nickname + ": " + message + "\n";
}
function addOnlineList(nickname){
    document.getElementById('exampleFormControlTextarea2').value
    += nickname + "\n";
}