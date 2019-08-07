# google-home-voicetext-gas
Google Homeをがなり立てる、Google Apps Engine用スクリプトたち

## gcal.gs
Googleカレンダーの内容をお喋り

### 設定項目
設定はスクリプトプロパティに投入します。

アカウントに関わるシークレットな内容はbase64エンコードで入力します。

```
echo -n '{シークレットな内容}' | base64
e+OCt+ODvOOCr+ODrOODg+ODiOOBquWGheWuuX0=
```

#### CALENDAR_ACCOUNTS (JSON)
読み上げたいユーザーとカレンダーIDをJSON形式で指定します。

```
{ "(ユーザー名)": "(カレンダーID)" }
```

#### FIREBASE_IAM_PROJECTID (base64)
FirebaseのプロジェクトIDです。

```
echo -n "voicetext-xx012" | base64
```

#### FIREBASE_IAM_EMAIL (base64)
FirebaseのIAMアカウントです。

```
echo -n firebase-adminsdk-xxxx9@voicetext-xx012.iam.gserviceaccount.com | base64
```

#### FIREBASE_IAM_KEY (base64)
Firebaseで生成した認証鍵です。

```
echo -n "-----BEGIN PRIVATE KEY-----\nMIIEv......................=\n-----END PRIVATE KEY-----\n" | base64
```

#### FIREBASE_DOCPATH (任意)
Cloud Firestoreのドキュメントパスを指定します。

デフォルトは __googlehome/chant__ です。

```
/googlehome/voicetext
```

[google-home-voicetext-firebase](https://github.com/yasu-hide/google-home-voicetext-firebase)の`FIREBASE_DOCPATH`に合わせてください。

#### CALENDAR_TRIGGER_MINS (任意)
定期実行の時間を指定します。

デフォルトは __8__ 時です。

```
7
```

#### CALENDAR_TRIGGER_MINS (任意)
定期実行の分を指定します。

デフォルトは __0__ 分です。

```
30
```

### 定時実行

スクリプトのトリガーを指定すると定時実行ができます。

実行する関数には`setTrigger`を指定してください。

次の例では7時から8時の時間のどこかでトリガーが登録されます。

`setTrigger`関数で読み上げをする時間が設定されて、定期実行のタイミングが確定します。

![gcal_trigger](gcal_trigger.png "トリガーを編集")