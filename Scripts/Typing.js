// © 2022 Tokain University Takanawa Project Basics 2rd Half Group 1

// ================
// 定数の定義
// ================

// ゲームステート列挙
const GS = {
    WaitForStart    : 0,
    Playing         : 1,
    Result          : 2
};

const TimeLimit     = 60;           // 制限時間


// ================
// グローバル変数
// ================

let Time            = TimeLimit;    // 現在の残り時間
let Timer;                          // タイマーのID
let Themes          = [];           // お題
let NextTheme       = "";           // 次のお題
let WordsRemaing    = "";           // 未入力の文字列
let WordsTyped      = "";           // 入力済み文字列
let CountMiss       = 0;            // 入力ミス数
let CountTyped      = 0;            // 入力数

let GameState;                      // 現在のゲームステート
SetGameState(GS.WaitForStart);      // WaitForStartステートに移行


// ================
// キー入力イベント
// ================

// キー入力イベントの定義と紐づけ
document.addEventListener('keypress', OnKeyPressed);
function OnKeyPressed(Evt)
{
    // 現在のゲームステートで分岐
    switch(GameState)
    {
        // タイピング開始前
        case GS.WaitForStart:
            OnKeyPressed_WaitForStart(Evt.key);

            // Memo: スタートと同時にタイピングを始めたいので
            //       breakをつけづに続けてcase GS.Playingの処理を実行

        // タイピング中
        case GS.Playing:
            OnKeyPressed_Playing(Evt.key);
            break

        // リザルト画面
        case GS.Result:
            OnKeyPressed_Result(Evt.key);
            break;
    }
}


// キーイベント: タイピング開始前
function OnKeyPressed_WaitForStart(Key)
{
    SetGameState(GS.Playing);   // 押したキーに関わらず
                                // Playingステートに移行
}

// キーイベント: タイピング中
function OnKeyPressed_Playing(Key)
{
    // 入力した文字があっていた場合
    if(Key.toLocaleUpperCase() == WordsRemaing.charAt(0).toLocaleUpperCase())
    {
        // 入力した文字をWordsTypedに移動
        WordsTyped += WordsRemaing.charAt(0);
        WordsRemaing = WordsRemaing.slice(1);

        // スペースを飛ばす
        while(WordsRemaing.charAt(0) == " ")
        {
            // 入力した文字をWordsTypedに移動
            WordsTyped += "&nbsp;";
            WordsRemaing = WordsRemaing.slice(1);
        }

        CountTyped++;       // 入力数を増やす

        // WordsRemainingが空かどうか判定
        if(WordsRemaing == "")
        {
            NewTheme();     // 新しいお題を設定
        }

        // UI更新
        UIUpdate_Count();
        UIUpdate_NextTheme();
        UIUpdate_Typing();
    }

    // 入力した文字が間違っていた場合
    else
    {
        CountMiss++;
        UIUpdate_Count();
    }
}

// キーイベント: リザルト画面
function OnKeyPressed_Result(Key)
{
    if(Key == "Enter")
    {
        SetGameState(GS.WaitForStart);
    }
}


// =====================
// ゲームステートイベント
// =====================

// ゲームステートの変更
function SetGameState(NewState)
{
    // ゲームステート設定
    GameState = NewState;

    // ゲームステートで分岐
    switch(GameState)
    {
        // タイピング開始前
        case GS.WaitForStart:
            OnGameStateChanged_WaitForStart();
            break;

        // タイピング中
        case GS.Playing:
            OnGameStateChanged_Playing();
            break

        // リザルト画面
        case GS.Result:
            OnGameStateChanged_Result();
            break;
    }
}


// ゲームステートがWaitForStatになったとき
function OnGameStateChanged_WaitForStart()
{
    // お題を初期化
    LoadThemes();
    NewTheme();

    // カウントを初期化
    CountMiss = 0;
    CountTyped = 0;
    UIUpdate_Count();
}


// ゲームステートがPlayingになったとき
function OnGameStateChanged_Playing()
{
    TimerStart();       //タイマーを開始
}


// ゲームステートがResultになったとき
function OnGameStateChanged_Result()
{
    UIUpdate_Result();  // リザルト画面の更新
    UIUpdate_Timer();
}


// =====================
//  お題イベント
// =====================

// HTML本文からお題集を取得する
function LoadThemes()
{
    let LoadedThemes = document.getElementById("Words").textContent;    // HTMLから単語一覧を取得
    LoadedThemes = LoadedThemes.trim();                                 // 不必要部分をトリミング

    let SplitedThemes = LoadedThemes.split("\n");                       // 改行で分割し配列に変換
    for(let i = 0; i < SplitedThemes.length; i++)                       // すべての文字列配列をトリミング
    {
        SplitedThemes[i] = SplitedThemes[i].trim();
    }

    Themes = SplitedThemes;                                             //お題集として設定

    console.log(Themes);                                                // DEBUG: お題集の配列をログに表示
}

// お題集からお題を取得して設定する
function NewTheme()
{
    WordsTyped = "";                                            // 入力済みの文字列を空にする

    // NextThemeが空だったら
    if(NextTheme == "")
    {
        Rnd = Math.floor( Math.random() * Themes.length );      // 配列wordのサイズの範囲で乱数を生成
        WordsRemaing = Themes[Rnd];                             // ランダムな単語を代入
    }
    // NextThemeが設定されているとき
    else
    {
        WordsRemaing = NextTheme;                               // NextThemeを現在入力すべき文字に設定
    }

    Rnd = Math.floor( Math.random() * Themes.length );          // 配列wordのサイズの範囲で乱数を生成
    NextTheme = Themes[Rnd];                                    // ランダムな単語を代入

    UIUpdate_Typing();                                          // タイピング状況のUIを更新する
    UIUpdate_NextTheme();                                       // 次のお題のUIを更新
}


// =====================
//  タイマーイベント
// =====================

// タイマーを初めから開始する
function TimerStart()
{
    Time = TimeLimit;                               // 残り時間をリセット
    Timer = setInterval("TimerUpdate()", 1000);     // 一秒毎にタイマーを更新する
    UIUpdate_Timer();                               // UIのタイマーを更新
}

// タイマーを更新
function TimerUpdate()
{
    Time--;                             // 残り時間を減らす
    UIUpdate_Timer();                   // UIのタイマーの更新

    if(Time <= 0)                       // 時間が0以下になったら
    {
        TimerStop();                    // タイマーを止める
    }
}

// タイマーの停止
function TimerStop()
{
    clearInterval(Timer);               // タイマーを止める
    SetGameState(GS.Result);            // リザルト画面に移動
}


// =====================
//  UI更新イベント
// =====================

// UI更新: タイマー
function UIUpdate_Timer()
{
    // ゲームステートで分岐
    switch(GameState)
    {
        // タイピング開始前
        case GS.WaitForStart:
            document.getElementById("Timer").innerHTML = "入力待ち";
            break;

        // タイピング中
        case GS.Playing:
            document.getElementById("Timer").innerHTML = "残り " + Time + " 秒";
            break

        // リザルト画面
        case GS.Result:
            document.getElementById("Timer").innerHTML = "終了";
            break;
    }
}

// UI更新: 入力カウント
function UIUpdate_Count()
{
    document.getElementById("Count").innerHTML = CountTyped;
    document.getElementById("Miss").innerHTML = CountMiss;
}

// UI更新: 入力状況
function UIUpdate_Typing()
{
    document.getElementById("Typed").innerHTML = WordsTyped;
    document.getElementById("NotTyped").innerHTML = WordsRemaing;
}

// UI更新: 次のお題
function UIUpdate_NextTheme()
{
    document.getElementById("NextTheme").innerHTML = NextTheme;
}

// UI更新: リザルト
function UIUpdate_Result()
{
    document.getElementById("Typed").innerHTML = "";

    document.getElementById("NotTyped").innerHTML =
    "タイプ数: " + CountTyped +
    "   ミス数: " + CountMiss +
    "<br> Enterでリスタート";
}
