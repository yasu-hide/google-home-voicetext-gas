/** @OnlyCurrentDoc */

function setTrigger() {
  var triggerDay = new Date();
  const triggerHours = PropertiesService.getScriptProperties().getProperty("CALENDAR_TRIGGER_HOURS");
  const triggerMins = PropertiesService.getScriptProperties().getProperty("CALENDAR_TRIGGER_MINS");
  triggerDay.setHours(triggerHours);
  triggerDay.setMinutes(triggerMins);
  ScriptApp.newTrigger("main").timeBased().at(triggerDay).create();
}

function deleteTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for(var i=0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == "main") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function getEventsForDay(accs) {
  var ar = [];
  var qkey = {};
  Object.keys(accs).forEach(function(name) {
    var myCals = CalendarApp.getCalendarById(this[name]);
    var myEvents = myCals.getEventsForDay(new Date());
    for(var i=0;i<myEvents.length;i++) {
      var ev = myEvents[i];
      var evtime = ev.isAllDayEvent() ? ' 終日 ' : _HHmm(ev.getStartTime()) + 'から';
      var evtitle = ev.getTitle();
      if(! qkey[evtime]) {
        qkey[evtime] = {};
      }
      if(! qkey[evtime][evtitle]) {
        qkey[evtime][evtitle] = [];
      }
      qkey[evtime][evtitle].push(name);
    }
  }, accs);
  Object.keys(qkey).forEach(function(evtime) {
    Object.keys(this[evtime]).forEach(function(evtitle) {
      name = this[evtitle].join("、");
      ar.push(evtime + name + "の" + evtitle);
    }, this[evtime]);
  }, qkey);
  return (ar.length > 0) ? ar.sort() : [ "ない" ];
}

function _HHmm(str){
  return Utilities.formatDate(str, 'JST', 'HH時mm分');
}

function greeting(strHour) {
  if(4 <= strHour && strHour < 12) {
    return "おはようございます。";
  }
  else if(12<= strHour && strHour < 17) {
    return "こんにちわ。";
  }
  return "こんばんわ。";
}

function _base64_toString(b64str) {
  return Utilities.newBlob(Utilities.base64Decode(b64str)).getDataAsString().replace(/\\n/g, "\n");
}

function main() {
  deleteTrigger();
  
  const acc = PropertiesService.getScriptProperties().getProperty("CALENDAR_ACCOUNTS");
  const iam_email = _base64_toString(PropertiesService.getScriptProperties().getProperty("FIREBASE_IAM_EMAIL"));
  const iam_key = _base64_toString(PropertiesService.getScriptProperties().getProperty("FIREBASE_IAM_KEY"));
  const iam_projectid = _base64_toString(PropertiesService.getScriptProperties().getProperty("FIREBASE_IAM_PROJECTID"));
  const d = new Date();
  const strDate = "　" + greeting(d.getHours()) + _HHmm(d) + "になりました。";
  const ev = getEventsForDay(JSON.parse(acc));
  const strEvent = "今日の予定は、" + ev.join("、") + "です。";
  const firestore = FirestoreApp.getFirestore(iam_email, iam_key, iam_projectid);
  const docpath = PropertiesService.getScriptProperties().getProperty("FIREBASE_DOCPATH") || 'googlehome/chant';
  console.log(strDate + strEvent);
  firestore.updateDocument(docpath, { 'message': strDate + strEvent });
}
