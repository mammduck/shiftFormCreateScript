function createShiftForm(){
  
  //パス予想の情報を特定のスプレッドシートから拾ってくる
  //参照先のスプレッドシートを更新するプログラムはpythonで書いてあるので，それを先に実行する
  //shiftDaysListは手入力の必要あり

  //参照先のスプレッドシートからAOS(Acquisition Of Signal)の時刻データを拾ってくる
  //今のところ行の選択は手動
  var ss = SpreadsheetApp.openByUrl(" "); //sheet url
  var sheet = ss.getSheetByName("参照");
  var aosTimeRange = sheet.getRange(32,1,51,1)  //該当のパス群の行を指定する必要あり 
  passListUnformated = aosTimeRange.getValues();
  passList =[];
  tmp = [];
  var j=0;
  for(var i=0; i<passListUnformated.length; i++){
      tmp.push(Utilities.formatDate(passListUnformated[i][0], "JST", "HH:mm"));

    if(i==passListUnformated.length-1){
      passList.push(tmp);
      continue;
    }
    j++;

    if(passListUnformated[i+1][0].getTime()-passListUnformated[i][0].getTime()>36000000){//unit [ms];over 10 hour
      passList.push(tmp);
      tmp = [];
      j=0;
    }

  }
  

  const form = FormApp.create('運用担当者シフト6/14~6/20'); //フォームのインスタンスの作成　//フォームのタイトル

  form.setDescription('担当の時間の回答については，希望の時間ではなく，担当可能な時間を回答してください．\nなお，パスの時間の10分前には衛星部屋に到着できるかで参加の可否を判断してください．');
  form.setCollectEmail(true); //メールアドレスを収集する
  form.setAllowResponseEdits(true); //回答の編集を許可
  
  item1 = form.addTextItem();
  item1.setTitle('氏名(漢字で)');
  item1.setRequired(true);

  item2 = form.addMultipleChoiceItem();
  item2.setTitle('通学方法');
  item2.setChoices([
    item2.createChoice('下宿'),
    item2.createChoice('通い')
  ])
  item2.setRequired(true);

  item3 = form.addMultipleChoiceItem();
  item3.setTitle('運用責任者ですか');
  item3.setChoices([
    item3.createChoice('はい'),
    item3.createChoice('いいえ')
  ])
  item3.showOtherOption(true);
  item3.setRequired(true);

  item4 = form.addCheckboxItem();
  item4.setTitle('コロナが怖い等の理由により運用に参加したくない人は☑を入れてください。');
  item4.setChoices([
    item4.createChoice('運用に参加したくない')
  ])

  item5 = form.addSectionHeaderItem();
  item5.setTitle('参加可能な時間帯にすべてチェックを入れて下さい')


  var helpTextList = []
  var ShiftDayItem =new Array(7);//パス群が合計7つあると想定
  var choiceList = []; //チェックボックスの選択肢を格納する配列の宣言
  var numStringList = ['①', '②', '③', '④', '➄', '⑥', '⑦', '⑧']; //そのパス群で何番目のパスかを示す数字
  var shiftDaysList = ['6/14(月)', '6/15(火)', '6/16(水)', '6/17(木)', '6/18(金)', '6/19(土)', '6/20(日)']; //パス群が日をまたぐときは日またぎ //手入力

  for(var i=0; i<7; i++ ){//assume 7days
    ShiftDayItem[i] = form.addCheckboxItem(); //チェックボックスセクションの作成
    ShiftDayItem[i].setTitle(shiftDaysList[i]); //チェックボックスセクションのタイトル

    //チェックボックスセクションの説明にパス群を示す
    //passListはパス群単位の中に各パスが要素として入った多次元配列 passList[パス群][各パス時刻]
    //各パス時刻の前にそのパス群で何番目のパスかを示す数字(numStringList)を付ける
    for(var j=0; j<passList[i].length; j++){
      passList[i][j] = numStringList[j] + " " +  passList[i][j];
    }
    helpTextList.push(passList[i].join(",   ")); 
    ShiftDayItem[i].setHelpText(helpTextList[i]); //チェックボックスセクションの説明


    choiceList = [] //initialization //あるパス群におけるパスの数は7~8で変動するため
    for(var j=0; j<passList[i].length; j++){
      choiceList.push(ShiftDayItem[i].createChoice(String(j+1))); //回答のとりまとめプログラムのために数字の選択肢
    }
    choiceList.push(ShiftDayItem[i].createChoice('なし'));　//回答必須項目なのでどのパスも参加できない人のための選択肢
  
    ShiftDayItem[i].setChoices(choiceList); //choiceListで作成していた選択肢をフォーム上に構成
    ShiftDayItem[i].showOtherOption(true); //その他の回答を許可
    ShiftDayItem[i].setRequired(true); //回答必須

  }


  item5 = form.addMultipleChoiceItem();
  item5.setTitle('アンケート: 担当の仕方について希望があれば回答してください．パス単位になってからの所感も踏まえて回答してください．');
  item5.setChoices([
    item5.createChoice('細かく分けてほしい'),
    item5.createChoice('3~5個まとめて(連続で)担当したい'),
    item5.createChoice('5~8個まとめて(連続で)担当したい'),
    item5.createChoice('とりまとめにおまかせ')
  ])
  item5.showOtherOption(true);

  item6 = form.addParagraphTextItem();
  item6.setTitle('運用体制に対する個々の思いやモチベーション，苦言，提案，その他関係ないことでも何かありましたら吐いていただけるとシフト作成や運用方針の参考にします．(例．しんどいけどまだやれる，授業課題がきつい，プライベートで抱えていることがあるので苦しい時期にある等)');

  item7 = form.addSectionHeaderItem();
  item7.setTitle('以上です．記入ありがとうございます．')

}
